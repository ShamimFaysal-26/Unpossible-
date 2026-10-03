import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  UserProfile,
  FinancialInsight,
  AnomalyReport,
  TransactionCategory
} from '../types/finance';
import {
  initialUser,
  initialBudgets,
  initialGoals,
  initialInsights
} from '../data/initialData';
import { fetchAiInsights } from '../services/api';
import { validateFirestoreConnection } from '../lib/firebase';
import {
  subscribeTransactions,
  subscribeBudgets,
  subscribeGoals,
  saveTransactionToDb,
  deleteTransactionFromDb,
  saveBudgetToDb,
  saveGoalToDb,
  deleteGoalFromDb,
  clearAllDataFromFirestore
} from '../services/dbService';

interface FinanceContextType {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  currency: string;
  setCurrency: (c: string) => void;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  insights: FinancialInsight[];
  anomalyAlerts: AnomalyReport[];
  isGeneratingInsights: boolean;
  refreshInsights: () => Promise<void>;
  resetAllDataToEmpty: () => Promise<void>;
  
  // Transaction CRUD & Quick Interactivity
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<Transaction>;
  quickAddExpense: (title: string, amount: number, category: TransactionCategory) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  importTransactionsFromCsv: (newTxList: Omit<Transaction, 'id'>[]) => Promise<number>;
  
  // Budget operations
  updateBudgetLimit: (category: TransactionCategory, newLimit: number) => Promise<void>;
  adjustBudgetDelta: (category: TransactionCategory, delta: number) => Promise<void>;
  
  // Goals operations
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
  withdrawFromGoal: (goalId: string, amount: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  // UI Navigation & Modals
  activeTab: 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant';
  setActiveTab: (tab: 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant') => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Formatting helpers
  formatMoney: (amount: number) => string;
  
  // Database status
  dbInfo: { connected: boolean; engine: string; details: string; isSyncing: boolean };
  checkDb: () => Promise<void>;

  // Calculated summaries
  currentMonthSummary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    savingsRate: number;
    categoryTotals: Record<string, number>;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USER: 'finsathi_user_permanent',
  CURRENCY: 'finsathi_currency_permanent',
  TRANSACTIONS: 'finsathi_transactions_permanent',
  BUDGETS: 'finsathi_budgets_permanent',
  GOALS: 'finsathi_goals_permanent',
  INSIGHTS: 'finsathi_insights_permanent'
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from Permanent LocalStorage Cache
  const [user, setUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENCY) || '$';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [insights, setInsights] = useState<FinancialInsight[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INSIGHTS);
    return saved ? JSON.parse(saved) : initialInsights;
  });

  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyReport[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // Database info & status
  const [dbInfo, setDbInfo] = useState<{ connected: boolean; engine: string; details: string; isSyncing: boolean }>({
    connected: true,
    engine: 'Firebase Cloud Firestore',
    details: 'Connected to Firestore. Real-time permanent synchronization active.',
    isSyncing: false
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const setUser = (u: UserProfile) => {
    setUserState(u);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(u));
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENCY, c);
  };

  // Keep LocalStorage in sync whenever state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
  }, [insights]);

  // Keep track of whether initial cloud sync has completed
  const hasLoadedRemoteTxs = useRef(false);
  const hasLoadedRemoteBudgets = useRef(false);
  const hasLoadedRemoteGoals = useRef(false);

  // 2. Real-Time Cloud Firestore Sync with onSnapshot listeners
  useEffect(() => {
    let unsubTxs: (() => void) | undefined;
    let unsubBudgets: (() => void) | undefined;
    let unsubGoals: (() => void) | undefined;

    async function initFirestoreRealtime() {
      try {
        setDbInfo(prev => ({ ...prev, isSyncing: true }));
        const isConnected = await validateFirestoreConnection();

        if (isConnected) {
          setDbInfo({
            connected: true,
            engine: 'Firebase Cloud Firestore',
            details: 'Connected to Firestore cloud database. Permanent real-time sync active.',
            isSyncing: false
          });

          // Subscribe to Transactions
          unsubTxs = subscribeTransactions((cloudTxs) => {
            if (cloudTxs.length > 0) {
              setTransactions(cloudTxs);
              hasLoadedRemoteTxs.current = true;
            } else if (!hasLoadedRemoteTxs.current) {
              // If cloud is empty on first load, check if local storage had user transactions to push to cloud
              hasLoadedRemoteTxs.current = true;
              const localTxsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
              if (localTxsStr) {
                try {
                  const localTxs: Transaction[] = JSON.parse(localTxsStr);
                  if (localTxs.length > 0) {
                    localTxs.forEach(t => saveTransactionToDb(t));
                  }
                } catch (e) {
                  console.warn('Failed to parse local transactions:', e);
                }
              }
            } else {
              setTransactions([]);
            }
          });

          // Subscribe to Budgets
          unsubBudgets = subscribeBudgets((cloudBudgets) => {
            if (cloudBudgets.length > 0) {
              setBudgets(cloudBudgets);
              hasLoadedRemoteBudgets.current = true;
            } else if (!hasLoadedRemoteBudgets.current) {
              hasLoadedRemoteBudgets.current = true;
              const localBudgetsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGETS);
              if (localBudgetsStr) {
                try {
                  const localBudgets: Budget[] = JSON.parse(localBudgetsStr);
                  if (localBudgets.length > 0) {
                    localBudgets.forEach(b => saveBudgetToDb(b));
                  }
                } catch (e) {
                  console.warn('Failed to parse local budgets:', e);
                }
              }
            }
          });

          // Subscribe to Goals
          unsubGoals = subscribeGoals((cloudGoals) => {
            if (cloudGoals.length > 0) {
              setGoals(cloudGoals);
              hasLoadedRemoteGoals.current = true;
            } else if (!hasLoadedRemoteGoals.current) {
              hasLoadedRemoteGoals.current = true;
              const localGoalsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.GOALS);
              if (localGoalsStr) {
                try {
                  const localGoals: SavingsGoal[] = JSON.parse(localGoalsStr);
                  if (localGoals.length > 0) {
                    localGoals.forEach(g => saveGoalToDb(g));
                  }
                } catch (e) {
                  console.warn('Failed to parse local goals:', e);
                }
              }
            } else {
              setGoals([]);
            }
          });
        }
      } catch (err) {
        console.warn('Real-time listener setup error:', err);
        setDbInfo(prev => ({ ...prev, isSyncing: false }));
      }
    }

    initFirestoreRealtime();

    return () => {
      if (unsubTxs) unsubTxs();
      if (unsubBudgets) unsubBudgets();
      if (unsubGoals) unsubGoals();
    };
  }, []);

  const checkDb = async () => {
    setDbInfo(prev => ({ ...prev, isSyncing: true }));
    const isConnected = await validateFirestoreConnection();
    setDbInfo({
      connected: isConnected,
      engine: 'Firebase Cloud Firestore',
      details: isConnected
        ? 'Connected to Firestore. All transactions, budgets, and goals are permanently stored in the cloud.'
        : 'Connecting to Firestore cloud database...',
      isSyncing: false
    });
  };

  // Full reset / clear database action (Only when user explicitly clicks Wipe All Data)
  const resetAllDataToEmpty = async () => {
    setDbInfo(prev => ({ ...prev, isSyncing: true }));
    setTransactions([]);
    setGoals([]);
    setInsights([]);
    setAnomalyAlerts([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.GOALS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.INSIGHTS);
    await clearAllDataFromFirestore();
    setDbInfo(prev => ({ ...prev, isSyncing: false }));
  };

  // Currency Formatter
  const formatMoney = (amount: number): string => {
    const formattedNum = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(Math.round(amount));

    return `${currency}${formattedNum}`;
  };

  // Month calculation
  const currentMonthSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    }

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      categoryTotals
    };
  }, [transactions]);

  // Anomaly calculation
  useEffect(() => {
    if (transactions.length < 3) {
      setAnomalyAlerts([]);
      return;
    }

    const anomalies: AnomalyReport[] = [];
    const categoryAverages: Record<string, { total: number; count: number }> = {};

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        if (!categoryAverages[tx.category]) {
          categoryAverages[tx.category] = { total: 0, count: 0 };
        }
        categoryAverages[tx.category].total += tx.amount;
        categoryAverages[tx.category].count += 1;
      }
    });

    transactions.forEach(tx => {
      if (tx.type === 'expense' && categoryAverages[tx.category]) {
        const avg = categoryAverages[tx.category].total / categoryAverages[tx.category].count;
        if (tx.amount > avg * 2.5 && tx.amount >= 200) {
          const pct = Math.round(((tx.amount - avg) / avg) * 100);
          anomalies.push({
            transactionId: tx.id,
            transactionTitle: tx.title,
            category: tx.category,
            amount: tx.amount,
            averageCategoryAmount: Math.round(avg),
            percentageHigher: pct,
            explanation: `This expense is ${pct}% higher than your average for ${tx.category} ($${Math.round(avg)}).`,
            severity: pct > 200 ? 'high' : 'medium'
          });
        }
      }
    });

    setAnomalyAlerts(anomalies);
  }, [transactions]);

  // Refresh AI Insights
  const refreshInsights = async () => {
    if (transactions.length === 0) {
      setInsights([]);
      return;
    }
    setIsGeneratingInsights(true);
    try {
      const res = await fetchAiInsights(transactions, budgets, goals);
      if (res.insights && res.insights.length > 0) {
        setInsights(res.insights);
      }
      if (res.anomalyReports && res.anomalyReports.length > 0) {
        setAnomalyAlerts(res.anomalyReports);
      }
    } catch (e) {
      console.error('Failed to update insights', e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Add Transaction + Save to Firestore Permanently
  const addTransaction = async (newTx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    // 1. Immediate optimistic UI & LocalStorage update
    setTransactions(prev => [created, ...prev]);
    const updatedList = [created, ...transactions];
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedList));

    // 2. Permanent Firestore write
    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      await saveTransactionToDb(created);
    } catch (err) {
      console.warn('Background Firestore write warning:', err);
    } finally {
      setDbInfo(prev => ({ ...prev, isSyncing: false }));
    }

    return created;
  };

  // Quick 1-click expense addition
  const quickAddExpense = async (title: string, amount: number, category: TransactionCategory) => {
    await addTransaction({
      title,
      amount,
      type: 'expense',
      category,
      paymentMethod: 'Credit Card',
      date: new Date().toISOString().slice(0, 10),
      note: 'Quick entry'
    });
  };

  // Update Transaction + Save to Firestore
  const updateTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    let updatedTarget: Transaction | undefined;
    setTransactions(prev => {
      const updated = prev.map(tx => {
        if (tx.id === id) {
          updatedTarget = { ...tx, ...updatedFields };
          return updatedTarget;
        }
        return tx;
      });
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return updated;
    });

    if (updatedTarget) {
      try {
        setDbInfo(prev => ({ ...prev, isSyncing: true }));
        await saveTransactionToDb(updatedTarget);
      } catch (err) {
        console.warn('Firestore update warning:', err);
      } finally {
        setDbInfo(prev => ({ ...prev, isSyncing: false }));
      }
    }
  };

  // Delete Transaction + Remove from Firestore
  const deleteTransaction = async (id: string) => {
    setTransactions(prev => {
      const filtered = prev.filter(tx => tx.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
      return filtered;
    });

    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      await deleteTransactionFromDb(id);
    } catch (err) {
      console.warn('Firestore delete warning:', err);
    } finally {
      setDbInfo(prev => ({ ...prev, isSyncing: false }));
    }
  };

  // Batch CSV Import + Save to Firestore
  const importTransactionsFromCsv = async (newTxList: Omit<Transaction, 'id'>[]): Promise<number> => {
    const formatted: Transaction[] = newTxList.map((tx, idx) => ({
      ...tx,
      id: `tx_csv_${Date.now()}_${idx}`
    }));

    setTransactions(prev => {
      const merged = [...formatted, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(merged));
      return merged;
    });

    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      for (const tx of formatted) {
        await saveTransactionToDb(tx);
      }
    } catch (err) {
      console.warn('Firestore batch import warning:', err);
    } finally {
      setDbInfo(prev => ({ ...prev, isSyncing: false }));
    }

    return formatted.length;
  };

  // Update Budget Limit + Save to Firestore
  const updateBudgetLimit = async (category: TransactionCategory, newLimit: number) => {
    let targetBudget: Budget | undefined;
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      let updated: Budget[];
      if (exists) {
        updated = prev.map(b => (b.category === category ? { ...b, monthlyLimit: newLimit } : b));
      } else {
        updated = [...prev, { id: `b_${Date.now()}`, category, monthlyLimit: newLimit, month: '2026-10' }];
      }
      targetBudget = updated.find(b => b.category === category);
      localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGETS, JSON.stringify(updated));
      return updated;
    });

    if (targetBudget) {
      try {
        await saveBudgetToDb(targetBudget);
      } catch (err) {
        console.warn('Firestore budget save warning:', err);
      }
    }
  };

  // Adjust Budget by delta (+/- 50) + Save to Firestore
  const adjustBudgetDelta = async (category: TransactionCategory, delta: number) => {
    let targetBudget: Budget | undefined;
    setBudgets(prev => {
      const updated = prev.map(b => (b.category === category ? { ...b, monthlyLimit: Math.max(0, b.monthlyLimit + delta) } : b));
      targetBudget = updated.find(b => b.category === category);
      localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGETS, JSON.stringify(updated));
      return updated;
    });

    if (targetBudget) {
      try {
        await saveBudgetToDb(targetBudget);
      } catch (err) {
        console.warn('Firestore budget delta save warning:', err);
      }
    }
  };

  // Add Goal + Save to Firestore
  const addSavingsGoal = async (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      currentAmount: 0
    };
    setGoals(prev => {
      const updated = [goal, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS, JSON.stringify(updated));
      return updated;
    });

    try {
      await saveGoalToDb(goal);
    } catch (err) {
      console.warn('Firestore goal save warning:', err);
    }
  };

  // Contribute to Goal + Save to Firestore
  const contributeToGoal = async (goalId: string, amount: number) => {
    let targetGoal: SavingsGoal | undefined;
    setGoals(prev => {
      const updated = prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g));
      targetGoal = updated.find(g => g.id === goalId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS, JSON.stringify(updated));
      return updated;
    });

    if (targetGoal) {
      try {
        await saveGoalToDb(targetGoal);
      } catch (err) {
        console.warn('Firestore goal contribute warning:', err);
      }
    }
  };

  // Withdraw from Goal + Save to Firestore
  const withdrawFromGoal = async (goalId: string, amount: number) => {
    let targetGoal: SavingsGoal | undefined;
    setGoals(prev => {
      const updated = prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
      targetGoal = updated.find(g => g.id === goalId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS, JSON.stringify(updated));
      return updated;
    });

    if (targetGoal) {
      try {
        await saveGoalToDb(targetGoal);
      } catch (err) {
        console.warn('Firestore goal withdraw warning:', err);
      }
    }
  };

  // Delete Goal + Remove from Firestore
  const deleteGoal = async (goalId: string) => {
    setGoals(prev => {
      const filtered = prev.filter(g => g.id !== goalId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS, JSON.stringify(filtered));
      return filtered;
    });

    try {
      await deleteGoalFromDb(goalId);
    } catch (err) {
      console.warn('Firestore goal delete warning:', err);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        setUser,
        currency,
        setCurrency,
        transactions,
        budgets,
        goals,
        insights,
        anomalyAlerts,
        isGeneratingInsights,
        refreshInsights,
        resetAllDataToEmpty,
        addTransaction,
        quickAddExpense,
        updateTransaction,
        deleteTransaction,
        importTransactionsFromCsv,
        updateBudgetLimit,
        adjustBudgetDelta,
        addSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        deleteGoal,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        isDbModalOpen,
        setIsDbModalOpen,
        editingTransaction,
        setEditingTransaction,
        formatMoney,
        dbInfo,
        checkDb,
        currentMonthSummary
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
