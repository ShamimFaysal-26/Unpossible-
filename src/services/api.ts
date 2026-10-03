import { Transaction, Budget, SavingsGoal, UserProfile, FinancialInsight, AnomalyReport } from '../types/finance';

export interface CategorizeResult {
  category: string;
  subcategory: string;
  confidence: number;
  reasoning: string;
  typeRecommendation?: 'expense' | 'income';
}

export interface AssistantResponse {
  reply: string;
  suggestedActions?: string[];
}

export interface InsightsResponse {
  insights: FinancialInsight[];
  anomalyReports: AnomalyReport[];
}

export async function categorizeTransactionWithAi(
  title: string,
  amount: number,
  note?: string
): Promise<CategorizeResult> {
  try {
    const res = await fetch('/api/ai/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, note })
    });

    if (!res.ok) {
      throw new Error(`Failed to categorize: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API categorization error:', error);
    return {
      category: 'Food & Dining',
      subcategory: 'General',
      confidence: 0.7,
      reasoning: 'Default category assigned'
    };
  }
}

export async function askAiAssistant(
  message: string,
  history: Array<{ sender: 'user' | 'assistant'; text: string }>,
  context: {
    transactions: Transaction[];
    budgets: Budget[];
    goals: SavingsGoal[];
    userProfile: UserProfile;
  }
): Promise<AssistantResponse> {
  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context })
    });

    if (!res.ok) {
      throw new Error(`Assistant request failed: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API assistant error:', error);
    return {
      reply: 'I am experiencing a temporary connection delay. Please ensure network connectivity and ask again.',
      suggestedActions: ['What is my Food & Dining budget status?', 'Summarize this month cash flow']
    };
  }
}

export async function fetchAiInsights(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): Promise<InsightsResponse> {
  try {
    const res = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, budgets, goals })
    });

    if (!res.ok) {
      throw new Error(`Insights request failed: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API insights error:', error);
    return {
      insights: [],
      anomalyReports: []
    };
  }
}

export async function checkDatabaseStatus(): Promise<{ connected: boolean; engine: string; details: string }> {
  try {
    const res = await fetch('/api/database/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Database status check failed', e);
  }
  return {
    connected: false,
    engine: 'Local Persistent Storage',
    details: 'Browser state active'
  };
}
