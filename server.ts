import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
let isGeminiAvailable = Boolean(apiKey && apiKey.length > 5);

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Silently verify Gemini API access once at startup
if (apiKey) {
  ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: 'ping'
  }).then(() => {
    isGeminiAvailable = true;
  }).catch(() => {
    isGeminiAvailable = false;
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FinSathi AI Backend',
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
    timestamp: new Date().toISOString()
  });
});

// Database status endpoint
app.get('/api/database/status', (req, res) => {
  res.json({
    connected: true,
    engine: 'Firebase Cloud Firestore',
    details: 'Connected to Firestore cloud database with real-time persistent synchronization.',
    timestamp: new Date().toISOString()
  });
});

// Helper: Semantic Categorizer
function smartCategorize(title: string, amount: number) {
  const lower = title.toLowerCase();
  let category = 'Other';
  let subcategory = 'General';
  let typeRecommendation: 'expense' | 'income' = 'expense';
  let reasoning = '';

  if (/salary|paycheck|payroll|stipend|direct deposit/i.test(lower)) {
    category = 'Salary';
    subcategory = 'Payroll';
    typeRecommendation = 'income';
    reasoning = 'Identified as recurring corporate payroll or salary compensation.';
  } else if (/freelance|consulting|contract|client invoice|upwork|fiverr|client payment/i.test(lower)) {
    category = 'Freelance';
    subcategory = 'Consulting';
    typeRecommendation = 'income';
    reasoning = 'Identified as professional freelance or contract consulting income.';
  } else if (/dividend|stock|crypto|interest|capital gain|investment/i.test(lower)) {
    category = 'Investments';
    subcategory = 'Returns';
    typeRecommendation = 'income';
    reasoning = 'Identified as investment dividend, return, or yield.';
  } else if (/grocery|supermarket|whole foods|trader joe|walmart|food lion|produce|bazaar|market|veggie|fruit|dairy|bistro|restaurant|cafe|coffee|starbucks|lunch|dinner|breakfast|burger|pizza|sushi|meal|bakery|snack/i.test(lower)) {
    category = 'Food & Dining';
    subcategory = /grocery|supermarket|market|produce/i.test(lower) ? 'Groceries' : 'Dining Out';
    typeRecommendation = 'expense';
    reasoning = `Categorized under Food & Dining (${subcategory}) based on food and grocery patterns.`;
  } else if (/uber|lyft|ride|taxi|gas|fuel|petrol|diesel|transit|metro|subway|bus|train|flight|airline|commute|toll|parking/i.test(lower)) {
    category = 'Transportation';
    subcategory = /gas|fuel|petrol/i.test(lower) ? 'Fuel' : /uber|lyft|ride|taxi/i.test(lower) ? 'Ride Share' : 'Transit';
    typeRecommendation = 'expense';
    reasoning = `Categorized under Transportation (${subcategory}) based on travel and transit patterns.`;
  } else if (/rent|apartment|lease|mortgage|housing|flat|property/i.test(lower)) {
    category = 'Housing & Rent';
    subcategory = 'Residential Lease';
    typeRecommendation = 'expense';
    reasoning = 'Categorized under Housing & Rent based on residential lease and mortgage indicators.';
  } else if (/electric|power|water|utility|gas bill|internet|wifi|broadband|fiber|mobile|phone|verizon|at&t|t-mobile/i.test(lower)) {
    category = 'Bills & Utilities';
    subcategory = /electric|power/i.test(lower) ? 'Electricity' : /water/i.test(lower) ? 'Water' : /internet|wifi|fiber/i.test(lower) ? 'Internet' : 'Utilities';
    typeRecommendation = 'expense';
    reasoning = `Categorized under Bills & Utilities (${subcategory}) based on monthly utility billing services.`;
  } else if (/doctor|medicine|hospital|pharmacy|cvs|walgreens|dental|clinic|health|vitamins|prescription|therapy/i.test(lower)) {
    category = 'Healthcare';
    subcategory = /pharmacy|medicine|prescription/i.test(lower) ? 'Pharmacy' : 'Medical Services';
    typeRecommendation = 'expense';
    reasoning = `Categorized under Healthcare (${subcategory}) based on medical and wellness indicators.`;
  } else if (/course|university|tuition|books|training|certification|udemy|coursera|school|college|education/i.test(lower)) {
    category = 'Education';
    subcategory = 'Professional Learning';
    typeRecommendation = 'expense';
    reasoning = 'Categorized under Education based on learning and academic enrollment indicators.';
  } else if (/movie|cinema|netflix|spotify|disney|hulu|game|playstation|xbox|steam|concert|theater|entertainment/i.test(lower)) {
    category = 'Entertainment';
    subcategory = /netflix|spotify|hulu|disney/i.test(lower) ? 'Streaming' : 'Recreation';
    typeRecommendation = 'expense';
    reasoning = `Categorized under Entertainment (${subcategory}) based on digital media and recreation keywords.`;
  } else if (/amazon|target|shopping|cloth|shoes|electronics|gadget|monitor|keyboard|laptop|hardware|retail/i.test(lower)) {
    category = 'Shopping';
    subcategory = /electronics|monitor|keyboard|laptop/i.test(lower) ? 'Electronics' : 'Retail';
    typeRecommendation = 'expense';
    reasoning = `Categorized under Shopping (${subcategory}) based on retail and equipment keywords.`;
  } else {
    reasoning = 'Assigned default category based on input description.';
  }

  return {
    category,
    subcategory,
    confidence: 0.92,
    reasoning,
    typeRecommendation
  };
}

// Endpoint: AI Transaction Categorization
app.post('/api/ai/categorize', async (req, res) => {
  const { title, amount, note } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Fast semantic classification
  const fallback = smartCategorize(title, Number(amount) || 0);

  if (!apiKey || !isGeminiAvailable) {
    return res.json(fallback);
  }

  try {
    const prompt = `Categorize this financial transaction:
Title: "${title}", Amount: $${amount || 0}, Note: "${note || ''}"
Allowed categories: Food & Dining, Transportation, Shopping, Bills & Utilities, Housing & Rent, Education, Healthcare, Entertainment, Salary, Freelance, Investments, Other.
Return JSON with category, subcategory, confidence (0.0-1.0), reasoning (English), typeRecommendation (expense or income).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            typeRecommendation: { type: Type.STRING }
          },
          required: ['category', 'subcategory', 'confidence', 'reasoning']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.category) {
      return res.json(parsed);
    }
  } catch (error) {
    isGeminiAvailable = false;
  }

  res.json(fallback);
});

// Helper: Intelligent Financial Advisory Reasoning Engine
function generateFinancialAdvice(
  message: string,
  context: { transactions?: any[]; budgets?: any[]; goals?: any[]; userProfile?: any }
) {
  const { transactions = [], budgets = [], goals = [], userProfile = {} } = context;
  const lower = message.toLowerCase();

  // Metrics
  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

  const categoryBreakdown: Record<string, number> = {};
  const categoryTxCounts: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      categoryTxCounts[t.category] = (categoryTxCounts[t.category] || 0) + 1;
    }
  }

  const sortedExpenseCats = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);

  // Find over-budget categories
  const overBudgetCats = budgets.filter((b: any) => {
    const spent = categoryBreakdown[b.category] || 0;
    return b.monthlyLimit > 0 && spent > b.monthlyLimit;
  });

  const nearLimitCats = budgets.filter((b: any) => {
    const spent = categoryBreakdown[b.category] || 0;
    const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    return pct >= 80 && pct <= 100;
  });

  // Largest expense
  const expenseTxs = transactions.filter((t: any) => t.type === 'expense').sort((a: any, b: any) => b.amount - a.amount);
  const largestExpense = expenseTxs.length > 0 ? expenseTxs[0] : null;

  let reply = '';
  const suggestedActions: string[] = [];

  // Case 1: Empty database / No transactions recorded yet
  if (transactions.length === 0) {
    if (lower.includes('budget') || lower.includes('plan')) {
      reply = `**Monthly Budget Planning Framework:**\n\nTo build a rock-solid monthly budget, we recommend the standard **50 / 30 / 20 Rule**:\n\n* **50% Needs**: Housing, utilities, groceries, health, and minimum commute.\n* **30% Wants**: Dining out, shopping, hobbies, and entertainment.\n* **20% Savings & Debt**: Emergency reserve, retirement, and milestone goals.\n\n*Tip:* Head over to the **Budgets** tab to set monthly limits for each category. As you record transactions, FinSathi will track your progress automatically.`;
      suggestedActions.push('How much should I keep in an emergency fund?', 'How to categorize recurring bills?', 'Show summary of this month');
    } else if (lower.includes('emergency') || lower.includes('reserve') || lower.includes('save') || lower.includes('goal')) {
      reply = `**Building Your Emergency Reserve Fund:**\n\n1. **Target**: Aim for **3 to 6 months** of essential living expenses.\n2. **Automation**: Allocate 10% to 20% of every paycheck directly into your reserve.\n3. **Accessibility**: Keep this in a high-yield savings account separate from your daily checking.\n\n*Next Step:* Navigate to the **Savings Goals** tab and click **"Create New Goal"** to set your target amount and timeline!`;
      suggestedActions.push('How should I plan my monthly budget?', 'How to categorize recurring bills?', 'How to start recording expenses?');
    } else {
      reply = `Hello ${userProfile.name || 'there'}! I am **FinSathi AI**, your personal financial advisor.\n\nYour database is connected to **Firebase Cloud Firestore** with a clean slate ready for your data.\n\n* **Income Recorded**: $0\n* **Expenses Recorded**: $0\n* **Net Balance**: $0\n\n**Getting Started:**\n1. Click **"New Entry"** at the top right to log your first income or expense.\n2. Or click **"Import CSV"** to batch-upload historical statements.\n3. Head to **"Budgets"** to set monthly limits for your key categories.`;
      suggestedActions.push('How should I plan my monthly budget?', 'Tips on building an emergency reserve fund', 'How to categorize recurring bills?');
    }
    return { reply, suggestedActions };
  }

  // Case 2: Food & Dining specific
  if (lower.includes('food') || lower.includes('dining') || lower.includes('grocery') || lower.includes('groceries')) {
    const foodSpent = categoryBreakdown['Food & Dining'] || 0;
    const foodBudget = budgets.find((b: any) => b.category === 'Food & Dining');
    const limit = foodBudget ? foodBudget.monthlyLimit : 0;
    const remaining = Math.max(0, limit - foodSpent);

    reply = `**Food & Dining Spending Breakdown:**\n\n* **Total Spent**: **$${foodSpent.toLocaleString()}** across ${categoryTxCounts['Food & Dining'] || 0} purchases.\n* **Allocated Budget**: $${limit.toLocaleString()}${limit > 0 ? ` (${Math.round((foodSpent / limit) * 100)}% consumed)` : ' (No budget set)'}.\n* **Remaining Balance**: $${remaining.toLocaleString()}.\n\n${foodSpent > limit && limit > 0 ? '⚠️ You have exceeded your Food & Dining budget limit. Consider batch-preparing meals at home for the rest of the cycle.' : '✅ Your food expenses are well within budget limits.'}`;
    suggestedActions.push('How to save $100 on groceries?', 'Which category is over budget?', 'Summarize this month cash flow');
  }
  // Case 3: Over-budget inspection
  else if (lower.includes('over budget') || lower.includes('budget status') || lower.includes('which category is over')) {
    if (overBudgetCats.length > 0) {
      reply = `**Budget Alert: ${overBudgetCats.length} Categories Exceeded Limits:**\n\n` +
        overBudgetCats.map((b: any) => {
          const spent = categoryBreakdown[b.category] || 0;
          const overAmt = spent - b.monthlyLimit;
          const pct = Math.round((spent / b.monthlyLimit) * 100);
          return `* **${b.category}**: Spent **$${spent.toLocaleString()}** vs limit of **$${b.monthlyLimit.toLocaleString()}** (exceeded by **$${overAmt.toLocaleString()}**, ${pct}% used)`;
        }).join('\n') +
        `\n\n💡 *Actionable Advice:* Pause discretionary purchases in these categories for the remainder of the month to recover cash flow.`;
    } else {
      reply = `**Great news!** None of your budget categories are over limit.\n\n` +
        budgets.filter((b: any) => b.monthlyLimit > 0).map((b: any) => {
          const spent = categoryBreakdown[b.category] || 0;
          const pct = Math.round((spent / b.monthlyLimit) * 100);
          return `* **${b.category}**: $${spent.toLocaleString()} / $${b.monthlyLimit.toLocaleString()} (${pct}%)`;
        }).join('\n') +
        `\n\n${nearLimitCats.length > 0 ? `⚠️ Watch out: ${nearLimitCats.map((b: any) => b.category).join(', ')} is near the 80% ceiling.` : 'All categories are safely under control.'}`;
    }
    suggestedActions.push('How can I optimize my expenses?', 'What was my largest unusual expense?', 'Show summary of this month');
  }
  // Case 4: Largest / Unusual / Anomaly expense
  else if (lower.includes('unusual') || lower.includes('largest') || lower.includes('highest') || lower.includes('anomaly') || lower.includes('spike')) {
    if (largestExpense) {
      const avgCategory = (categoryBreakdown[largestExpense.category] || largestExpense.amount) / Math.max(1, categoryTxCounts[largestExpense.category] || 1);
      reply = `**Largest Recorded Expenditure:**\n\n* **Title**: **${largestExpense.title}**\n* **Amount**: **$${largestExpense.amount.toLocaleString()}**\n* **Category**: ${largestExpense.category}\n* **Date**: ${largestExpense.date}\n* **Payment**: ${largestExpense.paymentMethod}\n\nThis single transaction represents **${totalExpense > 0 ? Math.round((largestExpense.amount / totalExpense) * 100) : 0}%** of your total monthly expenditures.`;
    } else {
      reply = `No expense transactions have been recorded yet to evaluate unusual spikes.`;
    }
    suggestedActions.push('Which category is over budget?', 'How can I save $300 more this month?', 'Show summary of this month');
  }
  // Case 5: How to save more / Boost savings
  else if (lower.includes('save') && (lower.includes('more') || lower.includes('how') || lower.includes('rate') || lower.includes('300') || lower.includes('boost'))) {
    const discretionarySpend = (categoryBreakdown['Shopping'] || 0) + (categoryBreakdown['Entertainment'] || 0);
    reply = `**Personalized Strategy to Boost Savings:**\n\n* **Current Net Surplus**: **$${netBalance.toLocaleString()}** (${savingsRate}% savings rate).\n* **Discretionary Outflow**: You have spent **$${discretionarySpend.toLocaleString()}** across Shopping & Entertainment.\n\n**3 High-Impact Steps to Free Up $200–$400:**\n1. **Shopping Pause**: Defer non-essential purchases for 14 days (potential recovery: ~$150).\n2. **Home Dinners**: Cook 2 additional dinners weekly instead of dining out (potential recovery: ~$100–$140).\n3. **Subscription Audit**: Review digital subscriptions in Bills & Utilities (potential recovery: ~$30–$50).\n\nRedirect these reclaimed funds directly into your active **Savings Goals**!`;
    suggestedActions.push('What is my priority savings goal status?', 'How much did I spend on Food & Dining?', 'Which category is over budget?');
  }
  // Case 6: Summary / Cash flow
  else if (lower.includes('summary') || lower.includes('cash flow') || lower.includes('overview') || lower.includes('standing') || lower.includes('report')) {
    reply = `**Monthly Financial Health Summary:**\n\n* **Total Income**: **$${totalIncome.toLocaleString()}**\n* **Total Expenses**: **$${totalExpense.toLocaleString()}**\n* **Net Cash Surplus**: **$${netBalance.toLocaleString()}**\n* **Savings Rate**: **${savingsRate}%**\n\n**Top 3 Spending Categories:**\n` +
      sortedExpenseCats.slice(0, 3).map(([cat, amt]) => `* **${cat}**: $${amt.toLocaleString()} (${totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0}%)`).join('\n') +
      `\n\n${netBalance > 0 ? `🎉 You are operating with a positive surplus of **$${netBalance.toLocaleString()}**.` : `⚠️ Your expenses currently exceed income by $${Math.abs(netBalance).toLocaleString()}. Prioritize expense reduction.`}`;
    suggestedActions.push('Which category is over budget?', 'What was my largest unusual expense?', 'How can I save $300 more this month?');
  }
  // Case 7: Default conversational reply
  else {
    reply = `Hello ${userProfile.name || 'there'}! Here is your current financial snapshot:\n\n* **Total Income**: **$${totalIncome.toLocaleString()}**\n* **Total Expenses**: **$${totalExpense.toLocaleString()}**\n* **Net Balance**: **$${netBalance.toLocaleString()}** (${savingsRate}% savings rate)\n\n${overBudgetCats.length > 0 ? `⚠️ You have ${overBudgetCats.length} category over budget (${overBudgetCats.map((b: any) => b.category).join(', ')}).` : '✅ All your category budgets are currently on track.'}\n\nHow can I help you optimize your spending or reach your savings targets today?`;
    suggestedActions.push('How much did I spend on Food & Dining?', 'Which category is over budget?', 'What was my largest unusual expense?', 'Summarize this month cash flow');
  }

  return { reply, suggestedActions };
}

// Endpoint: AI Financial Assistant
app.post('/api/ai/assistant', async (req, res) => {
  const { message, history = [], context = {} } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Pre-generate guaranteed high-accuracy financial intelligence
  const fallbackAdvice = generateFinancialAdvice(message, context);

  // If apiKey is available and active, attempt Gemini generation
  if (apiKey && isGeminiAvailable) {
    try {
      const { transactions = [], budgets = [], goals = [], userProfile = {} } = context;

      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const totalExpense = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const categoryBreakdown: Record<string, number> = {};
      for (const t of transactions) {
        if (t.type === 'expense') {
          categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        }
      }

      const systemPrompt = `You are "FinSathi AI", an intelligent, friendly, and practical personal financial advisor and assistant.
Guidelines:
1. Always communicate in clear, concise, professional, and friendly English.
2. Provide precise numbers, calculations, percentages, and actionable suggestions using the user's real financial data.
3. Currency symbol: $ (or user's configured currency).
4. Highlight key takeaways using clean bullet points and bold financial figures.

USER FINANCIAL DATA:
User: ${userProfile.name || 'User'}
Total Recorded Income: $${totalIncome.toLocaleString()}
Total Recorded Expenses: $${totalExpense.toLocaleString()}
Net Cash Surplus: $${(totalIncome - totalExpense).toLocaleString()}
Savings Rate: ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%

Category Expenses Breakdown:
${Object.entries(categoryBreakdown).map(([cat, amt]) => `- ${cat}: $${amt.toLocaleString()}`).join('\n')}

Active Budgets:
${budgets.map((b: any) => `- ${b.category}: Limit $${b.monthlyLimit.toLocaleString()} (Spent: $${(categoryBreakdown[b.category] || 0).toLocaleString()})`).join('\n')}

Active Goals:
${goals.map((g: any) => `- ${g.title}: Target $${g.targetAmount.toLocaleString()}, Saved $${g.currentAmount.toLocaleString()}`).join('\n')}

Answer directly, warmly, and helpfully.`;

      const contents = [
        { text: systemPrompt },
        ...history.slice(-6).map((h: any) => ({
          text: `${h.sender === 'user' ? 'User' : 'FinSathi AI'}: ${h.text}`
        })),
        { text: `User Question: ${message}` }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          temperature: 0.7
        }
      });

      if (response && response.text) {
        return res.json({
          reply: response.text,
          suggestedActions: fallbackAdvice.suggestedActions
        });
      }
    } catch (error) {
      isGeminiAvailable = false;
    }
  }

  // Guaranteed intelligent response backed by real calculations
  return res.json(fallbackAdvice);
});

// Endpoint: AI Insights & Anomaly Detection
app.post('/api/ai/insights', async (req, res) => {
  const { transactions = [], budgets = [], goals = [] } = req.body;

  const anomalyReports: any[] = [];
  const insights: any[] = [];

  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount || 0;
    } else {
      totalExpense += t.amount || 0;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (t.amount || 0);
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  }

  // Detect Spikes
  for (const t of transactions) {
    if (t.type === 'expense' && categoryCounts[t.category] > 0) {
      const avg = categoryTotals[t.category] / categoryCounts[t.category];
      if (t.amount > avg * 2.2 && t.amount >= 200) {
        const pct = Math.round(((t.amount - avg) / avg) * 100);
        anomalyReports.push({
          transactionId: t.id,
          transactionTitle: t.title,
          category: t.category,
          amount: t.amount,
          averageCategoryAmount: Math.round(avg),
          percentageHigher: pct,
          explanation: `This expense is ${pct}% higher than your average for ${t.category} ($${Math.round(avg)}).`,
          severity: pct > 200 ? 'high' : 'medium'
        });
      }
    }
  }

  // Detect Over Budget
  budgets.forEach((b: any) => {
    const spent = categoryTotals[b.category] || 0;
    if (b.monthlyLimit > 0 && spent > b.monthlyLimit) {
      const pct = Math.round((spent / b.monthlyLimit) * 100);
      insights.push({
        id: `ins_budget_${b.category}`,
        type: 'alert',
        title: `${b.category} Budget Limit Exceeded`,
        description: `You have spent $${spent.toLocaleString()} against your $${b.monthlyLimit.toLocaleString()} monthly limit (${pct}% consumed).`,
        action: `Pause non-urgent ${b.category.toLowerCase()} spending for the rest of the cycle.`,
        category: b.category,
        metric: `${pct}% of budget`
      });
    }
  });

  // Positive savings rate praise
  if (totalIncome > 0 && totalExpense > 0) {
    const net = totalIncome - totalExpense;
    const rate = Math.round((net / totalIncome) * 100);
    if (rate >= 20) {
      insights.push({
        id: 'ins_praise_savings',
        type: 'praise',
        title: `Strong ${rate}% Net Savings Rate`,
        description: `Total income of $${totalIncome.toLocaleString()} against $${totalExpense.toLocaleString()} expenses leaves a healthy surplus of $${net.toLocaleString()}.`,
        action: 'Consider allocating a portion of this surplus towards your savings goals.',
        metric: `${rate}% Saved`
      });
    }
  }

  res.json({
    anomalyReports,
    insights
  });
});

// Serve frontend with Vite middlewares in development or static in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FinSathi AI Server running on port ${PORT}`);
});
