export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Housing & Rent'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Other';

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Mobile Wallet'
  | 'PayPal';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  subcategory?: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
  isUnusual?: boolean;
  anomalyReason?: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  aiRecommendation?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  occupation: string;
  monthlyIncome: number;
  currency: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActions?: string[];
  suggestedAction?: {
    type: 'add_transaction' | 'adjust_budget' | 'view_goal';
    payload?: any;
  };
}

export interface AnomalyReport {
  transactionId: string;
  transactionTitle: string;
  category: TransactionCategory;
  amount: number;
  averageCategoryAmount: number;
  percentageHigher: number;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FinancialInsight {
  id: string;
  type: 'alert' | 'tip' | 'praise' | 'prediction';
  title: string;
  description: string;
  action?: string;
  category?: TransactionCategory;
  metric?: string;
}

export interface DatabaseConfig {
  type: 'cloudsql_postgres' | 'firebase_firestore' | 'browser_indexeddb';
  status: 'connected' | 'setup_required' | 'local_active';
  host?: string;
  database?: string;
  lastSyncedAt?: string;
}
