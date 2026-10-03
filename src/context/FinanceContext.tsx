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
  getOrCreateDeviceId,
  subscribeTransactions,
  subscribeBudgets,
  subscribeGoals,
  saveTransactionToDb,
  deleteTransactionFromDb,
  saveBudgetToDb,
  saveGoalToDb,
  deleteGoalFromDb,
  clearDeviceDataFromFirestore
} from '../services/dbService';

interface FinanceContextType {
  deviceId: string;
  setCustomDeviceId: (id: string) => void;
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

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Device Identification (Isolated multi-tenant space per device)
  const [deviceId, setDeviceIdState] = useState<string>(() => getOrCreateDeviceId());

  const getStorageKey = (key: string) => `finsathi_${deviceId}_${key}`;

  // State loaded from device-isolated storage
  const [user, setUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(getStorageKey('user'));
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem(getStorageKey('currency')) || '$';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(getStorageKey('transactions'));
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(getStorageKey('budgets'));
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(getStorageKey('goals'));
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [insights, setInsights] = useState<FinancialInsight[]>(() => {
    const saved = localStorage.getItem(getStorageKey('insights'));
    return saved ? JSON.parse(saved) : initialInsights;
  });

  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyReport[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // Database status
  const [dbInfo, setDbInfo] = useState<{ connected: boolean; engine: string; details: string; isSyncing: boolean }>({
    connected: true,
    engine: 'Firebase Cloud Firestore',
    details: `Connected to Firestore. Isolated database active for Device: ${deviceId}`,
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
    localStorage.setItem(getStorageKey('user'), JSON.stringify(u));
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem(getStorageKey('currency'), c);
  };

  const setCustomDeviceId = (newId: string) => {
    const cleaned = newId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleaned.length >= 4) {
      localStorage.setItem('finsathi_device_id', cleaned);
      setDeviceIdState(cleaned);
      // Reload page to re-bind real-time listeners to the new device ID
      window.location.reload();
    }
  };

  // Keep LocalStorage in sync whenever state changes
  useEffect(() => {
    localStorage.setItem(getStorageKey('transactions'), JSON.stringify(transactions));
  }, [transactions, deviceId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('budgets'), JSON.stringify(budgets));
  }, [budgets, deviceId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('goals'), JSON.stringify(goals));
  }, [goals, deviceId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('insights'), JSON.stringify(insights));
  }, [insights, deviceId]);

  // Keep track of whether initial cloud sync has completed for this device
  const hasLoadedRemoteTxs = useRef(false);
  const hasLoadedRemoteBudgets = useRef(false);
  const hasLoadedRemoteGoals = useRef(false);

  // 2. Real-Time Cloud Firestore Sync isolated strictly to this device
  useEffect(() => {
    let unsubTxs: (() => void) | undefined;
    let unsubBudgets: (() => void) | undefined;
    let unsubGoals: (() => void) | undefined;

    async function initDeviceFirestore() {
      try {
        setDbInfo(prev => ({ ...prev, isSyncing: true }));
        const isConnected = await validateFirestoreConnection();

        if (isConnected) {
          setDbInfo({
            connected: true,
            engine: 'Firebase Cloud Firestore',
            details: `Connected to Firestore. Permanent storage isolated to Device: ${deviceId}`,
            isSyncing: false
          });

          // Subscribe to device's Transactions
          unsubTxs = subscribeTransactions(deviceId, (cloudTxs) => {
            if (cloudTxs.length > 0) {
              setTransactions(cloudTxs);
              hasLoadedRemoteTxs.current = true;
            } else if (!hasLoadedRemoteTxs.current) {
              hasLoadedRemoteTxs.current = true;
              const localTxsStr = localStorage.getItem(getStorageKey('transactions'));
              if (localTxsStr) {
                try {
                  const localTxs: Transaction[] = JSON.parse(localTxsStr);
                  if (localTxs.length > 0) {
                    localTxs.forEach(t => saveTransactionToDb(deviceId, t));
                  }
                } catch (e) {
                  console.warn('Failed to parse local transactions:', e);
                }
              }
            } else {
              setTransactions([]);
            }
          });

          // Subscribe to device's Budgets
          unsubBudgets = subscribeBudgets(deviceId, (cloudBudgets) => {
            if (cloudBudgets.length > 0) {
              setBudgets(cloudBudgets);
              hasLoadedRemoteBudgets.current = true;
            } else if (!hasLoadedRemoteBudgets.current) {
              hasLoadedRemoteBudgets.current = true;
              const localBudgetsStr = localStorage.getItem(getStorageKey('budgets'));
              if (localBudgetsStr) {
                try {
                  const localBudgets: Budget[] = JSON.parse(localBudgetsStr);
                  if (localBudgets.length > 0) {
                    localBudgets.forEach(b => saveBudgetToDb(deviceId, b));
                  }
                } catch (e) {
                  console.warn('Failed to parse local budgets:', e);
                }
              }
            }
          });

          // Subscribe to device's Goals
          unsubGoals = subscribeGoals(deviceId, (cloudGoals) => {
            if (cloudGoals.length > 0) {
              setGoals(cloudGoals);
              hasLoadedRemoteGoals.current = true;
            } else if (!hasLoadedRemoteGoals.current) {
              hasLoadedRemoteGoals.current = true;
              const localGoalsStr = localStorage.getItem(getStorageKey('goals'));
              if (localGoalsStr) {
                try {
                  const localGoals: SavingsGoal[] = JSON.parse(localGoalsStr);
                  if (localGoals.length > 0) {
                    localGoals.forEach(g => saveGoalToDb(deviceId, g));
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
        console.warn(`[Device ${deviceId}] Firestore setup warning:`, err);
        setDbInfo(prev => ({ ...prev, isSyncing: false }));
      }
    }

    initDeviceFirestore();

    return () => {
      if (unsubTxs) unsubTxs();
      if (unsubBudgets) unsubBudgets();
      if (unsubGoals) unsubGoals();
    };
  }, [deviceId]);

  const checkDb = async () => {
    setDbInfo(prev => ({ ...prev, isSyncing: true }));
    const isConnected = await validateFirestoreConnection();
    setDbInfo({
      connected: isConnected,
      engine: 'Firebase Cloud Firestore',
      details: isConnected
        ? `Connected to Firestore. All records are permanently stored in private cloud space for Device: ${deviceId}.`
        : 'Connecting to Firestore cloud database...',
      isSyncing: false
    });
  };

  // Full reset / clear database action for THIS device only
  const resetAllDataToEmpty = async () => {
    setDbInfo(prev => ({ ...prev, isSyncing: true }));
    setTransactions([]);
    setGoals([]);
    setInsights([]);
    setAnomalyAlerts([]);
    localStorage.removeItem(getStorageKey('transactions'));
    localStorage.removeItem(getStorageKey('goals'));
    localStorage.removeItem(getStorageKey('insights'));
    await clearDeviceDataFromFirestore(deviceId);
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

  // Add Transaction + Save to Firestore Permanently for this Device
  const addTransaction = async (newTx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    // 1. Immediate optimistic UI & LocalStorage update
    setTransactions(prev => [created, ...prev]);
    const updatedList = [created, ...transactions];
    localStorage.setItem(getStorageKey('transactions'), JSON.stringify(updatedList));

    // 2. Permanent Firestore write under this device's collection
    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      await saveTransactionToDb(deviceId, created);
    } catch (err) {
      console.warn(`[Device ${deviceId}] Firestore write warning:`, err);
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
      localStorage.setItem(getStorageKey('transactions'), JSON.stringify(updated));
      return updated;
    });

    if (updatedTarget) {
      try {
        setDbInfo(prev => ({ ...prev, isSyncing: true }));
        await saveTransactionToDb(deviceId, updatedTarget);
      } catch (err) {
        console.warn(`[Device ${deviceId}] Firestore update warning:`, err);
      } finally {
        setDbInfo(prev => ({ ...prev, isSyncing: false }));
      }
    }
  };

  // Delete Transaction + Remove from Firestore
  const deleteTransaction = async (id: string) => {
    setTransactions(prev => {
      const filtered = prev.filter(tx => tx.id !== id);
      localStorage.setItem(getStorageKey('transactions'), JSON.stringify(filtered));
      return filtered;
    });

    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      await deleteTransactionFromDb(deviceId, id);
    } catch (err) {
      console.warn(`[Device ${deviceId}] Firestore delete warning:`, err);
    } finally {
      setDbInfo(prev => ({ ...prev, isSyncing: false }));
    }
  };

  // Batch CSV Import + Save to Firestore for this Device
  const importTransactionsFromCsv = async (newTxList: Omit<Transaction, 'id'>[]): Promise<number> => {
    const formatted: Transaction[] = newTxList.map((tx, idx) => ({
      ...tx,
      id: `tx_csv_${Date.now()}_${idx}`
    }));

    setTransactions(prev => {
      const merged = [...formatted, ...prev];
      localStorage.setItem(getStorageKey('transactions'), JSON.stringify(merged));
      return merged;
    });

    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      for (const tx of formatted) {
        await saveTransactionToDb(deviceId, tx);
      }
    } catch (err) {
      console.warn(`[Device ${deviceId}] Batch import warning:`, err);
    } finally {
      setDbInfo(prev => ({ ...prev, isSyncing: false }));
    }

    return formatted.length;
  };

  // Update Budget Limit + Save to Firestore for this Device
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
      localStorage.setItem(getStorageKey('budgets'), JSON.stringify(updated));
      return updated;
    });

    if (targetBudget) {
      try {
        await saveBudgetToDb(deviceId, targetBudget);
      } catch (err) {
        console.warn(`[Device ${deviceId}] Budget save warning:`, err);
      }
    }
  };

  // Adjust Budget by delta (+/- 50) + Save to Firestore for this Device
  const adjustBudgetDelta = async (category: TransactionCategory, delta: number) => {
    let targetBudget: Budget | undefined;
    setBudgets(prev => {
      const updated = prev.map(b => (b.category === category ? { ...b, monthlyLimit: Math.max(0, b.monthlyLimit + delta) } : b));
      targetBudget = updated.find(b => b.category === category);
      localStorage.setItem(getStorageKey('budgets'), JSON.stringify(updated));
      return updated;
    });

    if (targetBudget) {
      try {
        await saveBudgetToDb(deviceId, targetBudget);
      } catch (err) {
        console.warn(`[Device ${deviceId}] Budget delta save warning:`, err);
      }
    }
  };

  // Add Goal + Save to Firestore for this Device
  const addSavingsGoal = async (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      currentAmount: 0
    };
    setGoals(prev => {
      const updated = [goal, ...prev];
      localStorage.setItem(getStorageKey('goals'), JSON.stringify(updated));
      return updated;
    });

    try {
      await saveGoalToDb(deviceId, goal);
    } catch (err) {
      console.warn(`[Device ${deviceId}] Goal save warning:`, err);
    }
  };

  // Contribute to Goal + Save to Firestore for this Device
  const contributeToGoal = async (goalId: string, amount: number) => {
    let targetGoal: SavingsGoal | undefined;
    setGoals(prev => {
      const updated = prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g));
      targetGoal = updated.find(g => g.id === goalId);
      localStorage.setItem(getStorageKey('goals'), JSON.stringify(updated));
      return updated;
    });

    if (targetGoal) {
      try {
        await saveGoalToDb(deviceId, targetGoal);
      } catch (err) {
        console.warn(`[Device ${deviceId}] Goal contribute warning:`, err);
      }
    }
  };

  // Withdraw from Goal + Save to Firestore for this Device
  const withdrawFromGoal = async (goalId: string, amount: number) => {
    let targetGoal: SavingsGoal | undefined;
    setGoals(prev => {
      const updated = prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
      targetGoal = updated.find(g => g.id === goalId);
      localStorage.setItem(getStorageKey('goals'), JSON.stringify(updated));
      return updated;
    });

    if (targetGoal) {
      try {
        await saveGoalToDb(deviceId, targetGoal);
      } catch (err) {
        console.warn(`[Device ${deviceId}] Goal withdraw warning:`, err);
      }
    }
  };

  // Delete Goal + Remove from Firestore for this Device
  const deleteGoal = async (goalId: string) => {
    setGoals(prev => {
      const filtered = prev.filter(g => g.id !== goalId);
      localStorage.setItem(getStorageKey('goals'), JSON.stringify(filtered));
      return filtered;
    });

    try {
      await deleteGoalFromDb(deviceId, goalId);
    } catch (err) {
      console.warn(`[Device ${deviceId}] Goal delete warning:`, err);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        deviceId,
        setCustomDeviceId,
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
