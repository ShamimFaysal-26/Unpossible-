export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Housing'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Family'
  | 'Other';

export type PaymentMethod =
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank Transfer'
  | 'Cash'
  | 'Credit Card';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // in BDT (৳)
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
  monthlyLimit: number; // BDT
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  title: string;
  titleBn?: string;
  targetAmount: number; // BDT
  currentAmount: number; // BDT
  targetDate: string; // YYYY-MM-DD
  category: string;
  aiRecommendation?: string;
  aiRecommendationBn?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nameBn: string;
  email: string;
  occupation: string;
  monthlyIncome: number;
  currency: string;
  language: 'bn' | 'en';
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'bn' | 'banglish' | 'en';
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
  explanationBn: string;
  explanationEn: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FinancialInsight {
  id: string;
  type: 'alert' | 'tip' | 'praise' | 'prediction';
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  actionBn?: string;
  actionEn?: string;
  category?: TransactionCategory;
  metric?: string;
}
