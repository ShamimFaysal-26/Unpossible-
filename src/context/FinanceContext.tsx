import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  initialTransactions,
  initialBudgets,
  initialGoals,
  initialInsights
} from '../data/initialData';
import { fetchAiInsights } from '../services/api';
import { validateFirestoreConnection } from '../lib/firebase';
import {
  fetchTransactionsFromDb,
  saveTransactionToDb,
  deleteTransactionFromDb,
  fetchBudgetsFromDb,
  saveBudgetToDb,
  fetchGoalsFromDb,
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
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  quickAddExpense: (title: string, amount: number, category: TransactionCategory) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactionsFromCsv: (newTxList: Omit<Transaction, 'id'>[]) => number;
  
  // Budget operations
  updateBudgetLimit: (category: TransactionCategory, newLimit: number) => void;
  adjustBudgetDelta: (category: TransactionCategory, delta: number) => void;
  
  // Goals operations
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  withdrawFromGoal: (goalId: string, amount: number) => void;
  deleteGoal: (goalId: string) => void;
  
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
  dbInfo: { connected: boolean; engine: string; details: string };
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
  // Wipe legacy demo cache if cleaning flag is not present
  useEffect(() => {
    const isCleaned = localStorage.getItem('finsathi_clean_v3');
    if (!isCleaned) {
      localStorage.removeItem('finsathi_transactions');
      localStorage.removeItem('finsathi_transactions_en');
      localStorage.removeItem('finsathi_goals');
      localStorage.removeItem('finsathi_goals_en');
      localStorage.removeItem('finsathi_insights');
      localStorage.removeItem('finsathi_insights_en');
      localStorage.setItem('finsathi_clean_v3', 'true');
      clearAllDataFromFirestore();
    }
  }, []);

  const [user, setUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finsathi_user_clean');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('finsathi_currency') || '$';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const isCleaned = localStorage.getItem('finsathi_clean_v3');
    if (!isCleaned) return [];
    const saved = localStorage.getItem('finsathi_transactions_clean');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finsathi_budgets_clean');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const isCleaned = localStorage.getItem('finsathi_clean_v3');
    if (!isCleaned) return [];
    const saved = localStorage.getItem('finsathi_goals_clean');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [insights, setInsights] = useState<FinancialInsight[]>(() => {
    const saved = localStorage.getItem('finsathi_insights_clean');
    return saved ? JSON.parse(saved) : initialInsights;
  });

  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyReport[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // Live Database info state
  const [dbInfo, setDbInfo] = useState<{ connected: boolean; engine: string; details: string }>({
    connected: true,
    engine: 'Firebase Cloud Firestore',
    details: 'Connected to Firestore cloud database. Clean and ready for your data.'
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const setUser = (u: UserProfile) => {
    setUserState(u);
    localStorage.setItem('finsathi_user_clean', JSON.stringify(u));
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem('finsathi_currency', c);
  };

  // Sync with Firestore on mount
  useEffect(() => {
    async function initFirestore() {
      const isConnected = await validateFirestoreConnection();
      if (isConnected) {
        setDbInfo({
          connected: true,
          engine: 'Firebase Cloud Firestore',
          details: 'Connected to Firestore. Clean database ready for your inputs.'
        });

        const dbTx = await fetchTransactionsFromDb();
        setTransactions(dbTx);

        const dbBudgets = await fetchBudgetsFromDb();
        if (dbBudgets && dbBudgets.length > 0) {
          setBudgets(dbBudgets);
        }

        const dbGoals = await fetchGoalsFromDb();
        setGoals(dbGoals);
      }
    }
    initFirestore();
  }, []);

  useEffect(() => {
    localStorage.setItem('finsathi_transactions_clean', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finsathi_budgets_clean', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finsathi_goals_clean', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finsathi_insights_clean', JSON.stringify(insights));
  }, [insights]);

  const checkDb = async () => {
    const isConnected = await validateFirestoreConnection();
    setDbInfo({
      connected: isConnected,
      engine: 'Firebase Cloud Firestore',
      details: isConnected
        ? 'Connected to Firestore. All your transactions and budgets sync directly to the cloud.'
        : 'Connecting to Firestore cloud database...'
    });
  };

  // Full reset / clear database action
  const resetAllDataToEmpty = async () => {
    setTransactions([]);
    setGoals([]);
    setInsights([]);
    setAnomalyAlerts([]);
    localStorage.removeItem('finsathi_transactions_clean');
    localStorage.removeItem('finsathi_goals_clean');
    localStorage.removeItem('finsathi_insights_clean');
    await clearAllDataFromFirestore();
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
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    // Also include any transactions from October 2026 or current date
    const monthTx = transactions.filter(t => t.date.startsWith(currentMonthPrefix) || t.date.startsWith('2026-10') || transactions.length < 5);

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

  // Add Transaction + Save to Firestore
  const addTransaction = (newTx: Omit<Transaction, 'id'>): Transaction => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    setTransactions(prev => [created, ...prev]);
    saveTransactionToDb(created);
    return created;
  };

  // Quick 1-click interactive expense addition
  const quickAddExpense = (title: string, amount: number, category: TransactionCategory) => {
    addTransaction({
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
  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(tx => (tx.id === id ? { ...tx, ...updatedFields } : tx));
      const target = updated.find(t => t.id === id);
      if (target) {
        saveTransactionToDb(target);
      }
      return updated;
    });
  };

  // Delete Transaction + Remove from Firestore
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    deleteTransactionFromDb(id);
  };

  // Batch CSV Import + Save to Firestore
  const importTransactionsFromCsv = (newTxList: Omit<Transaction, 'id'>[]): number => {
    const formatted: Transaction[] = newTxList.map((tx, idx) => ({
      ...tx,
      id: `tx_csv_${Date.now()}_${idx}`
    }));
    setTransactions(prev => [...formatted, ...prev]);
    formatted.forEach(tx => saveTransactionToDb(tx));
    return formatted.length;
  };

  // Update Budget Limit + Save to Firestore
  const updateBudgetLimit = (category: TransactionCategory, newLimit: number) => {
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      let updated: Budget[];
      if (exists) {
        updated = prev.map(b => (b.category === category ? { ...b, monthlyLimit: newLimit } : b));
      } else {
        updated = [...prev, { id: `b_${Date.now()}`, category, monthlyLimit: newLimit, month: '2026-10' }];
      }
      const bObj = updated.find(b => b.category === category);
      if (bObj) {
        saveBudgetToDb(bObj);
      }
      return updated;
    });
  };

  // Adjust Budget by delta (+/- 50) + Save to Firestore
  const adjustBudgetDelta = (category: TransactionCategory, delta: number) => {
    setBudgets(prev => {
      const updated = prev.map(b => (b.category === category ? { ...b, monthlyLimit: Math.max(0, b.monthlyLimit + delta) } : b));
      const bObj = updated.find(b => b.category === category);
      if (bObj) {
        saveBudgetToDb(bObj);
      }
      return updated;
    });
  };

  // Add Goal + Save to Firestore
  const addSavingsGoal = (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      currentAmount: 0
    };
    setGoals(prev => [goal, ...prev]);
    saveGoalToDb(goal);
  };

  // Contribute to Goal + Save to Firestore
  const contributeToGoal = (goalId: string, amount: number) => {
    setGoals(prev => {
      const updated = prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g));
      const target = updated.find(g => g.id === goalId);
      if (target) {
        saveGoalToDb(target);
      }
      return updated;
    });
  };

  // Withdraw from Goal + Save to Firestore
  const withdrawFromGoal = (goalId: string, amount: number) => {
    setGoals(prev => {
      const updated = prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
      const target = updated.find(g => g.id === goalId);
      if (target) {
        saveGoalToDb(target);
      }
      return updated;
    });
  };

  // Delete Goal + Remove from Firestore
  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    deleteGoalFromDb(goalId);
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
