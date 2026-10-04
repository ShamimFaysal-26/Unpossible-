import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, validateFirestoreConnection } from '../lib/firebase';
import { AuthUserInfo, formatAuthUser, logOut } from '../services/authService';
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
  // Authentication & Workspace
  currentUser: AuthUserInfo | null;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logOutUser: () => Promise<void>;
  
  // Device & Workspace ID
  deviceId: string;
  activeWorkspaceId: string;
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
  // 1. Device and User Authentication State
  const [deviceId, setDeviceIdState] = useState<string>(() => getOrCreateDeviceId());
  const [currentUser, setCurrentUser] = useState<AuthUserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active Workspace: Scoped by Account UID if logged in, or Device ID if Guest
  const activeWorkspaceId = useMemo(() => {
    return currentUser ? `usr_${currentUser.uid}` : deviceId;
  }, [currentUser, deviceId]);

  const getStorageKey = (key: string) => `finsathi_${activeWorkspaceId}_${key}`;

  // State loaded from workspace-isolated storage
  const [user, setUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`finsathi_${deviceId}_user`);
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem(`finsathi_${deviceId}_currency`) || '$';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`finsathi_${deviceId}_transactions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`finsathi_${deviceId}_budgets`);
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(`finsathi_${deviceId}_goals`);
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [insights, setInsights] = useState<FinancialInsight[]>(() => {
    const saved = localStorage.getItem(`finsathi_${deviceId}_insights`);
    return saved ? JSON.parse(saved) : initialInsights;
  });

  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyReport[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // Database status
  const [dbInfo, setDbInfo] = useState<{ connected: boolean; engine: string; details: string; isSyncing: boolean }>({
    connected: true,
    engine: 'Firebase Cloud Firestore',
    details: 'Connected to Firestore. Private partition active.',
    isSyncing: false
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const formatted = formatAuthUser(firebaseUser);
      setCurrentUser(formatted);
      setAuthLoading(false);

      if (formatted) {
        setUserState(prev => ({
          ...prev,
          name: formatted.displayName || prev.name,
          email: formatted.email || prev.email
        }));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Update profile
  const setUser = (u: UserProfile) => {
    setUserState(u);
    localStorage.setItem(getStorageKey('user'), JSON.stringify(u));
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem(getStorageKey('currency'), c);
  };

  const logOutUser = async () => {
    try {
      await logOut();
      setCurrentUser(null);
    } catch (e) {
      console.warn('Error signing out', e);
    }
  };

  const setCustomDeviceId = (newId: string) => {
    const cleaned = newId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleaned.length >= 4) {
      localStorage.setItem('finsathi_device_id', cleaned);
      setDeviceIdState(cleaned);
      window.location.reload();
    }
  };

  // Keep LocalStorage in sync whenever state changes
  useEffect(() => {
    localStorage.setItem(getStorageKey('transactions'), JSON.stringify(transactions));
  }, [transactions, activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('budgets'), JSON.stringify(budgets));
  }, [budgets, activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('goals'), JSON.stringify(goals));
  }, [goals, activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('insights'), JSON.stringify(insights));
  }, [insights, activeWorkspaceId]);

  // Keep track of whether initial cloud sync has completed
  const hasLoadedRemoteTxs = useRef(false);
  const hasLoadedRemoteBudgets = useRef(false);
  const hasLoadedRemoteGoals = useRef(false);

  // Reset flags when workspace switches (e.g. login or logout)
  useEffect(() => {
    hasLoadedRemoteTxs.current = false;
    hasLoadedRemoteBudgets.current = false;
    hasLoadedRemoteGoals.current = false;

    // Load cached local data for this workspace if present
    const savedTxs = localStorage.getItem(getStorageKey('transactions'));
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch (e) {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }

    const savedBudgets = localStorage.getItem(getStorageKey('budgets'));
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch (e) {
        setBudgets(initialBudgets);
      }
    } else {
      setBudgets(initialBudgets);
    }

    const savedGoals = localStorage.getItem(getStorageKey('goals'));
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        setGoals(initialGoals);
      }
    } else {
      setGoals(initialGoals);
    }
  }, [activeWorkspaceId]);

  // Real-Time Cloud Firestore Sync isolated strictly to this workspace (Account or Device)
  useEffect(() => {
    let unsubTxs: (() => void) | undefined;
    let unsubBudgets: (() => void) | undefined;
    let unsubGoals: (() => void) | undefined;

    async function initWorkspaceFirestore() {
      try {
        setDbInfo(prev => ({ ...prev, isSyncing: true }));
        const isConnected = await validateFirestoreConnection();

        if (isConnected) {
          const partitionLabel = currentUser
            ? `Account: ${currentUser.email || currentUser.displayName}`
            : `Device: ${deviceId}`;

          setDbInfo({
            connected: true,
            engine: 'Firebase Cloud Firestore',
            details: `Connected to Firestore. Permanent storage active for ${partitionLabel}.`,
            isSyncing: false
          });

          // Subscribe to workspace Transactions
          unsubTxs = subscribeTransactions(activeWorkspaceId, (cloudTxs) => {
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
                    localTxs.forEach(t => saveTransactionToDb(activeWorkspaceId, t));
                  }
                } catch (e) {
                  // ignore
                }
              }
            } else {
              setTransactions([]);
            }
          });

          // Subscribe to workspace Budgets
          unsubBudgets = subscribeBudgets(activeWorkspaceId, (cloudBudgets) => {
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
                    localBudgets.forEach(b => saveBudgetToDb(activeWorkspaceId, b));
                  }
                } catch (e) {
                  // ignore
                }
              }
            }
          });

          // Subscribe to workspace Goals
          unsubGoals = subscribeGoals(activeWorkspaceId, (cloudGoals) => {
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
                    localGoals.forEach(g => saveGoalToDb(activeWorkspaceId, g));
                  }
                } catch (e) {
                  // ignore
                }
              }
            } else {
              setGoals([]);
            }
          });
        }
      } catch (err) {
        console.warn(`[Workspace ${activeWorkspaceId}] Firestore setup notice:`, err);
        setDbInfo(prev => ({ ...prev, isSyncing: false }));
      }
    }

    initWorkspaceFirestore();

    return () => {
      if (unsubTxs) unsubTxs();
      if (unsubBudgets) unsubBudgets();
      if (unsubGoals) unsubGoals();
    };
  }, [activeWorkspaceId]);

  const checkDb = async () => {
    setDbInfo(prev => ({ ...prev, isSyncing: true }));
    const isConnected = await validateFirestoreConnection();
    const partitionLabel = currentUser
      ? `Account: ${currentUser.email || currentUser.displayName}`
      : `Device: ${deviceId}`;

    setDbInfo({
      connected: isConnected,
      engine: 'Firebase Cloud Firestore',
      details: isConnected
        ? `Connected to Firestore. All records are permanently stored in private cloud space for ${partitionLabel}.`
        : 'Connecting to Firestore cloud database...',
      isSyncing: false
    });
  };

  // Full reset / clear database action for THIS active workspace only
  const resetAllDataToEmpty = async () => {
    setDbInfo(prev => ({ ...prev, isSyncing: true }));
    setTransactions([]);
    setGoals([]);
    setInsights([]);
    setAnomalyAlerts([]);
    localStorage.removeItem(getStorageKey('transactions'));
    localStorage.removeItem(getStorageKey('goals'));
    localStorage.removeItem(getStorageKey('insights'));
    await clearDeviceDataFromFirestore(activeWorkspaceId);
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
      // ignore
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Add Transaction + Save to Firestore Permanently for this Workspace
  const addTransaction = async (newTx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    setTransactions(prev => [created, ...prev]);
    const updatedList = [created, ...transactions];
    localStorage.setItem(getStorageKey('transactions'), JSON.stringify(updatedList));

    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      await saveTransactionToDb(activeWorkspaceId, created);
    } catch (err) {
      // ignore
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
        await saveTransactionToDb(activeWorkspaceId, updatedTarget);
      } catch (err) {
        // ignore
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
      await deleteTransactionFromDb(activeWorkspaceId, id);
    } catch (err) {
      // ignore
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
      localStorage.setItem(getStorageKey('transactions'), JSON.stringify(merged));
      return merged;
    });

    try {
      setDbInfo(prev => ({ ...prev, isSyncing: true }));
      for (const tx of formatted) {
        await saveTransactionToDb(activeWorkspaceId, tx);
      }
    } catch (err) {
      // ignore
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
      localStorage.setItem(getStorageKey('budgets'), JSON.stringify(updated));
      return updated;
    });

    if (targetBudget) {
      try {
        await saveBudgetToDb(activeWorkspaceId, targetBudget);
      } catch (err) {
        // ignore
      }
    }
  };

  // Adjust Budget by delta (+/- 50) + Save to Firestore
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
        await saveBudgetToDb(activeWorkspaceId, targetBudget);
      } catch (err) {
        // ignore
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
      localStorage.setItem(getStorageKey('goals'), JSON.stringify(updated));
      return updated;
    });

    try {
      await saveGoalToDb(activeWorkspaceId, goal);
    } catch (err) {
      // ignore
    }
  };

  // Contribute to Goal + Save to Firestore
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
        await saveGoalToDb(activeWorkspaceId, targetGoal);
      } catch (err) {
        // ignore
      }
    }
  };

  // Withdraw from Goal + Save to Firestore
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
        await saveGoalToDb(activeWorkspaceId, targetGoal);
      } catch (err) {
        // ignore
      }
    }
  };

  // Delete Goal + Remove from Firestore
  const deleteGoal = async (goalId: string) => {
    setGoals(prev => {
      const filtered = prev.filter(g => g.id !== goalId);
      localStorage.setItem(getStorageKey('goals'), JSON.stringify(filtered));
      return filtered;
    });

    try {
      await deleteGoalFromDb(activeWorkspaceId, goalId);
    } catch (err) {
      // ignore
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        authLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logOutUser,
        deviceId,
        activeWorkspaceId,
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
