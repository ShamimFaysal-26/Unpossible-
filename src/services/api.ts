import { Transaction, Budget, SavingsGoal, UserProfile, FinancialInsight, AnomalyReport } from '../types/finance';

export interface CategorizeResult {
  category: string;
  subcategory: string;
  confidence: number;
  reasoningBn: string;
  reasoningEn: string;
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
    // Smart fallback
    return {
      category: 'Food',
      subcategory: 'General',
      confidence: 0.7,
      reasoningBn: 'ডিফল্ট ক্যাটাগরি নির্ধারিত হয়েছে',
      reasoningEn: 'Default category assigned'
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
      reply: 'দুঃখিত, সংযোগে কিছুটা বিলম্ব হচ্ছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় প্রশ্ন করুন।',
      suggestedActions: ['আমার খাদ্য বাজেট কত?', 'এই মাসের মোট আয়-ব্যয় দেখাও']
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
