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

interface FinanceContextType {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  insights: FinancialInsight[];
  anomalyAlerts: AnomalyReport[];
  isGeneratingInsights: boolean;
  refreshInsights: () => Promise<void>;
  
  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactionsFromCsv: (newTxList: Omit<Transaction, 'id'>[]) => number;
  
  // Budget operations
  updateBudgetLimit: (category: TransactionCategory, newLimit: number) => void;
  
  // Goals operations
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  deleteGoal: (goalId: string) => void;
  
  // UI States
  activeTab: 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant';
  setActiveTab: (tab: 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant') => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Formatting helpers
  formatTaka: (amount: number, forceEnglish?: boolean) => string;
  toBengaliNumber: (num: number | string) => string;
  
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
  // Load initial states with localStorage persistence
  const [user, setUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finsathi_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [language, setLanguageState] = useState<'bn' | 'en'>(() => {
    const saved = localStorage.getItem('finsathi_lang');
    return (saved as 'bn' | 'en') || 'bn';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finsathi_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finsathi_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('finsathi_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [insights, setInsights] = useState<FinancialInsight[]>(() => {
    const saved = localStorage.getItem('finsathi_insights');
    return saved ? JSON.parse(saved) : initialInsights;
  });

  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyReport[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to local storage
  const setUser = (u: UserProfile) => {
    setUserState(u);
    localStorage.setItem('finsathi_user', JSON.stringify(u));
  };

  const setLanguage = (lang: 'bn' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('finsathi_lang', lang);
  };

  useEffect(() => {
    localStorage.setItem('finsathi_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finsathi_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finsathi_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finsathi_insights', JSON.stringify(insights));
  }, [insights]);

  // Bengali numerals converter
  const toBengaliNumber = (num: number | string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
  };

  // Formatter for Bangladeshi Taka (BDT ৳)
  const formatTaka = (amount: number, forceEnglish: boolean = false): string => {
    const formattedNum = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(Math.round(amount));

    if (language === 'bn' && !forceEnglish) {
      return `৳${toBengaliNumber(formattedNum)}`;
    }
    return `৳${formattedNum}`;
  };

  // Current Month Financial Calculations (October 2026 baseline or current)
  const currentMonthSummary = useMemo(() => {
    const currentMonthPrefix = '2026-10'; // Matching baseline dataset
    const monthTx = transactions.filter(t => t.date.startsWith(currentMonthPrefix));

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    for (const tx of monthTx) {
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
        // If a single transaction is > 2.5x the average and > ৳5,000, flag as anomaly
        if (tx.amount > avg * 2.3 && tx.amount >= 5000) {
          const pct = Math.round(((tx.amount - avg) / avg) * 100);
          anomalies.push({
            transactionId: tx.id,
            transactionTitle: tx.title,
            category: tx.category,
            amount: tx.amount,
            averageCategoryAmount: Math.round(avg),
            percentageHigher: pct,
            explanationBn: `এই লেনদেনটি আপনার '${tx.category}' ক্যাটাগরির গড় খরচের চেয়ে ${toBengaliNumber(pct)}% বেশি।`,
            explanationEn: `This expense is ${pct}% higher than your average for ${tx.category}.`,
            severity: pct > 200 ? 'high' : 'medium'
          });
        }
      }
    });

    setAnomalyAlerts(anomalies);
  }, [transactions]);

  // Refresh AI Insights from server
  const refreshInsights = async () => {
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

  // Add Transaction
  const addTransaction = (newTx: Omit<Transaction, 'id'>): Transaction => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    setTransactions(prev => [created, ...prev]);
    return created;
  };

  // Update Transaction
  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Batch CSV Import
  const importTransactionsFromCsv = (newTxList: Omit<Transaction, 'id'>[]): number => {
    const formatted: Transaction[] = newTxList.map((tx, idx) => ({
      ...tx,
      id: `tx_csv_${Date.now()}_${idx}`
    }));
    setTransactions(prev => [...formatted, ...prev]);
    return formatted.length;
  };

  // Update Budget Limit
  const updateBudgetLimit = (category: TransactionCategory, newLimit: number) => {
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      if (exists) {
        return prev.map(b => (b.category === category ? { ...b, monthlyLimit: newLimit } : b));
      }
      return [...prev, { id: `b_${Date.now()}`, category, monthlyLimit: newLimit, month: '2026-10' }];
    });
  };

  // Add Goal
  const addSavingsGoal = (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      currentAmount: 0
    };
    setGoals(prev => [goal, ...prev]);
  };

  // Contribute to Goal
  const contributeToGoal = (goalId: string, amount: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g))
    );
  };

  // Delete Goal
  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage,
        transactions,
        budgets,
        goals,
        insights,
        anomalyAlerts,
        isGeneratingInsights,
        refreshInsights,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactionsFromCsv,
        updateBudgetLimit,
        addSavingsGoal,
        contributeToGoal,
        deleteGoal,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        editingTransaction,
        setEditingTransaction,
        formatTaka,
        toBengaliNumber,
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
