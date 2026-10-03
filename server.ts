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
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FinSathi AI Backend',
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
    timestamp: new Date().toISOString()
  });
});

// Endpoint: AI Transaction Categorization
app.post('/api/ai/categorize', async (req, res) => {
  try {
    const { title, amount, note } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!apiKey) {
      // Fallback rule-based categorization if key not configured
      const lower = title.toLowerCase();
      let cat = 'Other';
      if (/bazar|bazaar|bajaar|চাল|ডাল|বাজার|food|lunch|dinner|breakfast|restaurant|kabab|biryani|grocery|shwapno|agora|chaldal/i.test(lower)) cat = 'Food';
      else if (/pathao|uber|ride|bus|train|metro|cng|rickshaw|ভাড়া|যাতায়াত|গাড়ি/i.test(lower)) cat = 'Transport';
      else if (/bill|desco|wasa|titas|electric|electricity|net|internet|wifi|পানি|বিদ্যুৎ|গ্যাস|বিল/i.test(lower)) cat = 'Bills';
      else if (/aarong|daraz|cloth|dress|shoe|pant|shirt|shopping|বাজার|কেনাকাটা|শপিং/i.test(lower)) cat = 'Shopping';
      else if (/salary|বেতন|মাসিক/i.test(lower)) cat = 'Salary';
      else if (/upwork|fiverr|freelance|ফ্রিল্যান্স/i.test(lower)) cat = 'Freelance';
      else if (/rent|flat|house|বাসা/i.test(lower)) cat = 'Housing';
      else if (/doctor|medicine|hospital|pharmacy|ঔষধ|ওষুধ|ডাক্তার/i.test(lower)) cat = 'Healthcare';
      else if (/tuition|school|college|university|exam|course|বই|শিক্ষা/i.test(lower)) cat = 'Education';

      return res.json({
        category: cat,
        subcategory: 'General',
        confidence: 0.85,
        reasoningBn: `শব্দ বিশ্লেষণের মাধ্যমে '${cat}' ক্যাটাগরি নির্ধারিত হয়েছে।`,
        reasoningEn: `Categorized as '${cat}' based on pattern matching.`
      });
    }

    const prompt = `You are the AI Transaction Categorizer for "FinSathi AI", a Bangladeshi personal finance platform.
Analyze this transaction title and amount, supporting both Bangla and Banglish / English text:
Transaction Title: "${title}"
Amount: ৳${amount || 0}
Note: "${note || ''}"

Allowed Categories:
- Food (Groceries, restaurants, snacks, raw market/কাঁচাবাজার, Star Kabab, Chaldal, Agora, Shwapno)
- Transport (Pathao, Uber, MRT/Metrorail, Rickshaw, Greenline bus, fuel, CNG)
- Shopping (Aarong, clothing, electronics, gadgets, Daraz, footwear)
- Bills (DESCO electricity, Dhaka WASA water, Titas gas, Carnival/Amber internet, mobile recharge)
- Housing (House rent, flat maintenance, service charges)
- Education (University semester fees, school tuition, courses, books)
- Healthcare (Doctor consultancy, Labaid pharmacy, diagnostics, medicine)
- Entertainment (Cineplex movie, Netflix, streaming, concerts, games)
- Salary (Monthly salary, bonus, company stipend)
- Freelance (Upwork, Fiverr, client project payouts, bKash remittance)
- Investment (Stock market, FDR, DPS, gold, savings certificates)
- Family (Parents allowance, eid salami, siblings expense)
- Other (Uncategorized expenses or adjustments)

Determine the category, subcategory, confidence score (0.0 to 1.0), and short reasoning in Bangla and English.
Return strictly valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'One of the allowed categories: Food, Transport, Shopping, Bills, Housing, Education, Healthcare, Entertainment, Salary, Freelance, Investment, Family, Other'
            },
            subcategory: {
              type: Type.STRING,
              description: 'Specific subcategory like Groceries, Ride-sharing, Electricity, etc.'
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score from 0.0 to 1.0'
            },
            reasoningBn: {
              type: Type.STRING,
              description: 'Brief explanation in Bengali of why this category was selected'
            },
            reasoningEn: {
              type: Type.STRING,
              description: 'Brief explanation in English of why this category was selected'
            },
            typeRecommendation: {
              type: Type.STRING,
              description: 'expense or income'
            }
          },
          required: ['category', 'subcategory', 'confidence', 'reasoningBn', 'reasoningEn']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Categorize error:', error);
    res.status(500).json({ error: error.message || 'Failed to categorize transaction' });
  }
});

// Endpoint: AI Financial Assistant in Bangla/Banglish/English
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      // Local intelligent response if no API key
      const lower = message.toLowerCase();
      let replyBn = '';
      if (lower.includes('খাবার') || lower.includes('food') || lower.includes('khabar')) {
        replyBn = 'চলতি অক্টোবর মাসে খাবারের পেছনে আপনার মোট খরচ হয়েছে প্রায় ৳১১,৫৫০। এর মধ্যে কাঁচাবাজার ও গ্রোসারি ছিল প্রধান, তবে স্টার কাবাবে ডিনার ছিল ৳২,১০০। আপনার নির্ধারিত খাদ্য বাজেট ৳১৪,০০০ এর মধ্যে আপনি এখনো নিরাপদে আছেন (৮২% ব্যবহৃত)।';
      } else if (lower.includes('budget') || lower.includes('বাজেট')) {
        replyBn = 'আপনার মোট ৮টি ক্যাটাগরির বাজেট ট্র্যাক করা হচ্ছে। সবচেয়ে বেশি চাপ পড়েছে "Shopping" ক্যাটাগরিতে (৳১০,০০০ বাজেটে খরচ হয়েছে ৳২০,২০০, ২০২%)। অন্যান্য ক্যাটাগরি যেমন Food (৮২%) ও Transport (৫৫%) এখনো স্বাভাবিক সীমার মধ্যে রয়েছে।';
      } else if (lower.includes('unusual') || lower.includes('অস্বাভাবিক') || lower.includes('beshi')) {
        replyBn = 'হ্যাঁ! অক্টোবর ৬ তারিখে যমুনা ফিউচার পার্ক থেকে গ্যাজেট কেনাকাটায় ৳১৬,৮০০ খরচ শনাক্ত হয়েছে, যা আপনার সাধারণ মাসিক শপিং গড়ের চেয়ে প্রায় ৩ গুণ বেশি। এটি একটি অস্বাভাবিক বড় ব্যয়।';
      } else {
        replyBn = `আমি ফিনসাথী এআই (FinSathi AI)। আপনার বর্তমান মোট আয় ৳১,০০,০০০ এবং মোট খরচ ৳৬২,৩৫০। অবশিষ্ট ৳৩৭,৬৫০ এর মধ্যে সঞ্চয় তহবিলে জমা করার চমৎকার সুযোগ রয়েছে। আপনার নির্দিষ্ট কোনো প্রশ্ন থাকলে নির্দ্বিধায় বাংলায় বা বাংলিশে জানান!`;
      }

      return res.json({
        reply: replyBn,
        suggestedActions: [
          'খাবারের খরচের বিস্তারিত দেখান',
          'শপিং বাজেট কিভাবে নিয়ন্ত্রণ করব?',
          'জরুরি তহবিলে কত টাকা জমানো উচিত?'
        ]
      });
    }

    // Format context for Gemini
    const { transactions = [], budgets = [], goals = [], userProfile = {} } = context;

    // Calculate quick metrics to feed into prompt
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

    const systemPrompt = `You are "FinSathi AI" (ফিনসাথী এআই), an expert personal financial advisor and assistant designed specifically for Bangladeshi users.
Your characteristics:
1. Language Fluency:
   - If the user asks in Bangla (বাংলা লিপি), respond in polite, natural, encouraging Bengali.
   - If the user asks in Banglish (e.g. "ei mashe amar food khoroch koto?"), reply in natural Bangla or friendly Banglish/Bangla with exact Bengali numbers.
   - If the user asks in English, reply in polished English with BDT (৳) references.
2. Local Bangladeshi Context:
   - Understand local payment methods (bKash, Nagad, Rocket, Bank transfer, Cash).
   - Understand local expenses (Carwan Bazar kacha-bazar, rickshaw, Pathao rides, MRT metro, DESCO/WASA utility bills, Biryani/Kacchi, Dhaka flat rent).
   - Currency symbol: ৳ (BDT Taka).
3. Precision:
   - Use the REAL user financial data provided below. Do not make up random numbers if the data contains them.
   - Calculate accurately: Income, Expense, Balance, Budgets, and Savings Goals.
   - Be constructive, respectful, actionable, and encouraging.

CURRENT USER FINANCIAL DATA:
User: ${userProfile.name || 'Faysal Ahmed'} (Occupation: ${userProfile.occupation || 'Engineer'})
Total Current Income: ৳${totalIncome.toLocaleString()}
Total Current Expenses: ৳${totalExpense.toLocaleString()}
Net Surplus: ৳${(totalIncome - totalExpense).toLocaleString()}
Savings Rate: ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%

Category Expenses Breakdown:
${Object.entries(categoryBreakdown).map(([cat, amt]) => `- ${cat}: ৳${amt.toLocaleString()}`).join('\n')}

Monthly Budgets:
${budgets.map((b: any) => `- ${b.category}: Limit ৳${b.monthlyLimit.toLocaleString()} (Spent: ৳${(categoryBreakdown[b.category] || 0).toLocaleString()}, Status: ${(categoryBreakdown[b.category] || 0) > b.monthlyLimit ? 'EXCEEDED' : 'Normal'})`).join('\n')}

Savings Goals:
${goals.map((g: any) => `- ${g.title || g.titleBn}: Target ৳${g.targetAmount.toLocaleString()}, Saved ৳${g.currentAmount.toLocaleString()} (${Math.round((g.currentAmount / g.targetAmount) * 100)}%), Target Date: ${g.targetDate}`).join('\n')}

Recent 10 Transactions:
${transactions.slice(0, 10).map((t: any) => `[${t.date}] ${t.title}: ৳${t.amount} (${t.type} - ${t.category}) via ${t.paymentMethod}${t.isUnusual ? ' [UNUSUAL SPEND]' : ''}`).join('\n')}

Format your answer cleanly with bullet points when listing items. Keep it concise, friendly, and directly answering their question.`;

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

    const replyText = response.text || 'দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।';

    // Generate 3 contextual follow-up chips
    const suggestions: string[] = [];
    if (/খাবার|food/i.test(message)) {
      suggestions.push('খাবারের ব্যয়ে সাশ্রয় করার টিপস দিন', 'বাজারের জন্য আদর্শ বাজেট কত?');
    } else if (/budget|বাজেট/i.test(message)) {
      suggestions.push('কোন কোন ক্যাটাগরিতে বাজেট অতিক্রম হয়েছে?', 'পরের মাসের বাজেট পুনর্নির্ধারণ করুন');
    } else {
      suggestions.push('এই মাসে মোট কত টাকা সঞ্চয় করতে পারব?', 'আমার কি কোনো অস্বাভাবিক খরচ আছে?');
    }

    res.json({
      reply: replyText,
      suggestedActions: suggestions
    });
  } catch (error: any) {
    console.error('Assistant error:', error);
    res.status(500).json({ error: error.message || 'Assistant request failed' });
  }
});

// Endpoint: AI Insights & Anomaly Detection
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { transactions = [], budgets = [], goals = [] } = req.body;

    if (!apiKey || transactions.length === 0) {
      return res.json({
        insights: [],
        anomalyReports: []
      });
    }

    const prompt = `You are FinSathi AI's spending analytics and anomaly detection engine for a Bangladeshi user.
Review these transactions and budgets:
Transactions: ${JSON.stringify(transactions.slice(0, 25))}
Budgets: ${JSON.stringify(budgets)}
Goals: ${JSON.stringify(goals)}

Tasks:
1. Identify any "unusual spending" / anomalies (transactions that are drastically higher than typical for their category or that exceed the category monthly budget singlehandedly).
2. Generate 3 to 4 personalized, high-value financial insights (alerts, savings opportunities, praise, recommendations) tailored to Bangladeshi living costs and financial habits.
3. Provide both Bangla and English text.

Return JSON according to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            anomalyReports: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  transactionId: { type: Type.STRING },
                  transactionTitle: { type: Type.STRING },
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  averageCategoryAmount: { type: Type.NUMBER },
                  percentageHigher: { type: Type.NUMBER },
                  explanationBn: { type: Type.STRING },
                  explanationEn: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ['transactionTitle', 'category', 'amount', 'explanationBn', 'explanationEn', 'severity']
              }
            },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  titleBn: { type: Type.STRING },
                  titleEn: { type: Type.STRING },
                  descriptionBn: { type: Type.STRING },
                  descriptionEn: { type: Type.STRING },
                  actionBn: { type: Type.STRING },
                  actionEn: { type: Type.STRING },
                  category: { type: Type.STRING },
                  metric: { type: Type.STRING }
                },
                required: ['type', 'titleBn', 'titleEn', 'descriptionBn', 'descriptionEn']
              }
            }
          },
          required: ['anomalyReports', 'insights']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Insights error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
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
