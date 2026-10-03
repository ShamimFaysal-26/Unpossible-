import { Transaction, Budget, SavingsGoal, UserProfile, FinancialInsight, TransactionCategory } from '../types/finance';

export const initialUser: UserProfile = {
  id: 'usr_default',
  name: 'My Workspace',
  email: 'user@example.com',
  occupation: 'Personal Account',
  monthlyIncome: 0,
  currency: '$'
};

// Clean empty database - Ready for user's own data
export const initialTransactions: Transaction[] = [];

// Clean default budget categories with $0 limits ready for custom user input
export const initialBudgets: Budget[] = [
  { id: 'b_food', category: 'Food & Dining', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_housing', category: 'Housing & Rent', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_transport', category: 'Transportation', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_shopping', category: 'Shopping', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_bills', category: 'Bills & Utilities', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_education', category: 'Education', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_healthcare', category: 'Healthcare', monthlyLimit: 0, month: '2026-10' },
  { id: 'b_entertainment', category: 'Entertainment', monthlyLimit: 0, month: '2026-10' }
];

export const initialGoals: SavingsGoal[] = [];

export const initialInsights: FinancialInsight[] = [];

export const categoryLabels: Record<TransactionCategory, { name: string; color: string; bg: string }> = {
  'Food & Dining': { name: 'Food & Dining', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700' },
  Transportation: { name: 'Transportation', color: '#0ea5e9', bg: 'bg-sky-50 text-sky-700' },
  Shopping: { name: 'Shopping', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700' },
  'Bills & Utilities': { name: 'Bills & Utilities', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700' },
  'Housing & Rent': { name: 'Housing & Rent', color: '#64748b', bg: 'bg-slate-100 text-slate-700' },
  Education: { name: 'Education', color: '#8b5cf6', bg: 'bg-purple-50 text-purple-700' },
  Healthcare: { name: 'Healthcare', color: '#ef4444', bg: 'bg-rose-50 text-rose-700' },
  Entertainment: { name: 'Entertainment', color: '#ec4899', bg: 'bg-pink-50 text-pink-700' },
  Salary: { name: 'Salary', color: '#059669', bg: 'bg-emerald-100 text-emerald-800' },
  Freelance: { name: 'Freelance', color: '#0284c7', bg: 'bg-sky-100 text-sky-800' },
  Investments: { name: 'Investments', color: '#d97706', bg: 'bg-amber-100 text-amber-800' },
  Other: { name: 'Other', color: '#94a3b8', bg: 'bg-gray-100 text-gray-700' }
};

export const sampleCsvData = `Date,Title,Amount,Type,Category,PaymentMethod,Note
2026-10-01,Sample Salary Payroll,4500,income,Salary,Bank Transfer,Direct deposit
2026-10-02,Sample Apartment Rent,1400,expense,Housing & Rent,Bank Transfer,Monthly lease
2026-10-03,Sample Grocery Market,120,expense,Food & Dining,Credit Card,Weekly groceries`;
