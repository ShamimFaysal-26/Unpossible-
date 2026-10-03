import { Transaction, Budget, SavingsGoal, UserProfile, FinancialInsight, TransactionCategory } from '../types/finance';

export const initialUser: UserProfile = {
  id: 'usr_faysal_01',
  name: 'Faysal Ahmed',
  nameBn: 'ফয়সাল আহমেদ',
  email: 'faysal241-15-016@diu.edu.bd',
  occupation: 'Software Engineer & Freelancer',
  monthlyIncome: 95000,
  currency: 'BDT',
  language: 'bn'
};

export const initialTransactions: Transaction[] = [
  // Current Month (October 2026)
  {
    id: 'tx_01',
    title: 'Monthly Salary (মাসিক বেতন)',
    amount: 75000,
    type: 'income',
    category: 'Salary',
    subcategory: 'Tech Solutions Ltd.',
    date: '2026-10-01',
    paymentMethod: 'Bank Transfer',
    note: 'October salary credited via City Bank'
  },
  {
    id: 'tx_02',
    title: 'Upwork Freelance UI Project (ফ্রিল্যান্স আয়)',
    amount: 25000,
    type: 'income',
    category: 'Freelance',
    subcategory: 'Web Design',
    date: '2026-10-02',
    paymentMethod: 'bKash',
    note: 'Payment from international client via Payoneer to bKash'
  },
  {
    id: 'tx_03',
    title: 'House Rent (বাসা ভাড়া)',
    amount: 22000,
    type: 'expense',
    category: 'Housing',
    subcategory: 'Rent',
    date: '2026-10-02',
    paymentMethod: 'Bank Transfer',
    note: 'Mirpur DOHS flat rent for October'
  },
  {
    id: 'tx_04',
    title: 'Agora Superstore Grocery (মাসিক বাজার)',
    amount: 6850,
    type: 'expense',
    category: 'Food',
    subcategory: 'Grocery',
    date: '2026-10-03',
    paymentMethod: 'Credit Card',
    note: 'Rice, oil, spices, dairy & toiletries'
  },
  {
    id: 'tx_05',
    title: 'DESCO Prepaid Electricity (বিদ্যুৎ বিল)',
    amount: 2350,
    type: 'expense',
    category: 'Bills',
    subcategory: 'Electricity',
    date: '2026-10-03',
    paymentMethod: 'bKash',
    note: 'DESCO Smart meter recharge token'
  },
  {
    id: 'tx_06',
    title: 'Carnival Broadband Internet (ইন্টারনেট বিল)',
    amount: 1050,
    type: 'expense',
    category: 'Bills',
    subcategory: 'Internet',
    date: '2026-10-04',
    paymentMethod: 'Nagad',
    note: '50 Mbps monthly fiber connection'
  },
  {
    id: 'tx_07',
    title: 'Pathao & Uber Rides (যাতায়াত ও রাইড)',
    amount: 1450,
    type: 'expense',
    category: 'Transport',
    subcategory: 'Ride Sharing',
    date: '2026-10-04',
    paymentMethod: 'bKash',
    note: 'Banani to Dhanmondi meeting commute'
  },
  {
    id: 'tx_08',
    title: 'Star Kabab Dinner with Colleagues (স্টার কাবাব)',
    amount: 2100,
    type: 'expense',
    category: 'Food',
    subcategory: 'Dining Out',
    date: '2026-10-05',
    paymentMethod: 'Cash',
    note: 'Mutton Kacchi, Kabab and borhani'
  },
  {
    id: 'tx_09',
    title: 'Jamuna Future Park Gadget Purchase (স্মার্ট গ্যাজেট)',
    amount: 16800,
    type: 'expense',
    category: 'Shopping',
    subcategory: 'Electronics',
    date: '2026-10-06',
    paymentMethod: 'Credit Card',
    note: 'Mechanical Keyboard & Noise Cancelling Headphones',
    isUnusual: true,
    anomalyReason: 'Usual monthly shopping average is ৳5,500. This single expense of ৳16,800 is 305% higher than your category average.'
  },
  {
    id: 'tx_10',
    title: 'Labaid Pharmacy Medicine (ওষুধ ও স্বাস্থ্য)',
    amount: 1250,
    type: 'expense',
    category: 'Healthcare',
    subcategory: 'Medicine',
    date: '2026-10-07',
    paymentMethod: 'Nagad',
    note: 'Vitamins and regular prescriptions'
  },
  {
    id: 'tx_11',
    title: 'Carwan Bazar Fresh Fish & Vegetables (কাঁচাবাজার)',
    amount: 2600,
    type: 'expense',
    category: 'Food',
    subcategory: 'Bazar',
    date: '2026-10-08',
    paymentMethod: 'Cash',
    note: 'Hilsa fish, beef and seasonal fresh vegetables'
  },
  {
    id: 'tx_12',
    title: 'WASA Water & Titas Gas (পানি ও গ্যাস বিল)',
    amount: 1800,
    type: 'expense',
    category: 'Bills',
    subcategory: 'Utilities',
    date: '2026-10-09',
    paymentMethod: 'bKash',
    note: 'Monthly gas pipeline & WASA water charge'
  },
  {
    id: 'tx_13',
    title: 'Metro Rail Card Recharge (মেট্রোরেল কার্ড রিচার্জ)',
    amount: 1000,
    type: 'expense',
    category: 'Transport',
    subcategory: 'Public Transit',
    date: '2026-10-10',
    paymentMethod: 'Cash',
    note: 'MRT Rapid Pass top-up at Uttara station'
  },
  {
    id: 'tx_14',
    title: 'Aarong Autumn Kurta & Gift (আড়ং কেনাকাটা)',
    amount: 3400,
    type: 'expense',
    category: 'Shopping',
    subcategory: 'Apparel',
    date: '2026-10-11',
    paymentMethod: 'bKash',
    note: 'Family gift & personal wear'
  },
  {
    id: 'tx_15',
    title: 'Online Coursera Course Subscription (অনলাইন কোর্স)',
    amount: 3200,
    type: 'expense',
    category: 'Education',
    subcategory: 'Professional Course',
    date: '2026-10-12',
    paymentMethod: 'Credit Card',
    note: 'Full-stack AI certification'
  },
  // Previous Month (September 2026) for trend calculation
  {
    id: 'tx_prev_01',
    title: 'September Salary (সেপ্টেম্বর বেতন)',
    amount: 75000,
    type: 'income',
    category: 'Salary',
    date: '2026-09-01',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx_prev_02',
    title: 'Freelance Project Payout (ফ্রিল্যান্স)',
    amount: 18000,
    type: 'income',
    category: 'Freelance',
    date: '2026-09-05',
    paymentMethod: 'bKash'
  },
  {
    id: 'tx_prev_03',
    title: 'House Rent September (বাসা ভাড়া)',
    amount: 22000,
    type: 'expense',
    category: 'Housing',
    date: '2026-09-02',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx_prev_04',
    title: 'September Grocery & Bazar (মাসিক বাজার)',
    amount: 9800,
    type: 'expense',
    category: 'Food',
    date: '2026-09-08',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'tx_prev_05',
    title: 'September Utilities Bills (বিদ্যুৎ, গ্যাস, নেট)',
    amount: 5100,
    type: 'expense',
    category: 'Bills',
    date: '2026-09-10',
    paymentMethod: 'bKash'
  },
  {
    id: 'tx_prev_06',
    title: 'Transport MRT & Rides (যাতায়াত)',
    amount: 3200,
    type: 'expense',
    category: 'Transport',
    date: '2026-09-15',
    paymentMethod: 'Cash'
  },
  {
    id: 'tx_prev_07',
    title: 'Shopping & Shoes (কেনাকাটা)',
    amount: 4200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-20',
    paymentMethod: 'bKash'
  }
];

export const initialBudgets: Budget[] = [
  { id: 'b_01', category: 'Food', monthlyLimit: 14000, month: '2026-10' },
  { id: 'b_02', category: 'Housing', monthlyLimit: 24000, month: '2026-10' },
  { id: 'b_03', category: 'Transport', monthlyLimit: 4500, month: '2026-10' },
  { id: 'b_04', category: 'Shopping', monthlyLimit: 10000, month: '2026-10' },
  { id: 'b_05', category: 'Bills', monthlyLimit: 6000, month: '2026-10' },
  { id: 'b_06', category: 'Education', monthlyLimit: 5000, month: '2026-10' },
  { id: 'b_07', category: 'Healthcare', monthlyLimit: 3000, month: '2026-10' },
  { id: 'b_08', category: 'Entertainment', monthlyLimit: 4000, month: '2026-10' }
];

export const initialGoals: SavingsGoal[] = [
  {
    id: 'goal_01',
    title: 'Emergency 6-Month Fund',
    titleBn: 'জরুরি ৬ মাসের তহবিল (Emergency Fund)',
    targetAmount: 150000,
    currentAmount: 85000,
    targetDate: '2027-02-28',
    category: 'Safety',
    aiRecommendation: 'Saving ৳13,000 every month will comfortably achieve this target 3 weeks ahead of schedule.',
    aiRecommendationBn: 'প্রতি মাসে ৳১৩,০০০ জমালে আপনি নির্ধারিত সময়ের ৩ সপ্তাহ আগেই লক্ষ্য পূরণ করতে পারবেন।'
  },
  {
    id: 'goal_02',
    title: 'M3 MacBook Air for Development',
    titleBn: 'ফ্রিল্যান্সিংয়ের জন্য নতুন ম্যাকবুক (Laptop)',
    targetAmount: 135000,
    currentAmount: 65000,
    targetDate: '2026-12-31',
    category: 'Career',
    aiRecommendation: 'Allocate 60% of your incoming freelance payments directly to this goal.',
    aiRecommendationBn: 'আপনার ফ্রিল্যান্স আয়ের ৬০% সরাসরি এই তহবিলে স্থানান্তর করার পরামর্শ দিচ্ছি।'
  },
  {
    id: 'goal_03',
    title: 'Cox’s Bazar & Sajek Winter Trip',
    titleBn: 'কক্সবাজার ও সাজেক শীতকালীন ভ্রমণ',
    targetAmount: 30000,
    currentAmount: 22500,
    targetDate: '2026-11-20',
    category: 'Travel',
    aiRecommendation: 'You are already at 75%! Only ৳7,500 needed over the next 45 days (৳166/day).',
    aiRecommendationBn: 'আপনি ইতোমধ্যে ৭৫% পূরণ করেছেন! বাকি ৳৭,৫০০ পূরণে প্রতিদিন মাত্র ৳১৬৬ জমালেই চলবে।'
  }
];

export const initialInsights: FinancialInsight[] = [
  {
    id: 'ins_01',
    type: 'alert',
    titleBn: 'কেনাকাটা ক্যাটাগরিতে অতিরিক্ত ব্যয় সতর্কবার্তা',
    titleEn: 'High Spending Alert in Shopping Category',
    descriptionBn: 'অক্টোবর মাসে শপিং বাজেট ছিল ৳১০,০০০, কিন্তু মোট খরচ হয়েছে ৳২০,২০০ (বাজেটের ২০২%)। গ্যাজেট ক্রয়ের কারণে এই বৃদ্ধি ঘটেছে।',
    descriptionEn: 'Your shopping limit was ৳10,000, but spending reached ৳20,200 (202% of budget). The Jamuna Future Park gadget purchase caused the spike.',
    actionBn: 'চলতি মাসের বাকি দিনগুলোতে অপ্রয়োজনীয় কেনাকাটা স্থগিত রাখার পরামর্শ দেওয়া হচ্ছে।',
    actionEn: 'Consider postponing non-essential shopping for the rest of October.',
    category: 'Shopping',
    metric: '202% of budget'
  },
  {
    id: 'ins_02',
    type: 'praise',
    titleBn: 'চমৎকার সঞ্চয়ের হার (Savings Rate 38%)',
    titleEn: 'Healthy Savings Rate (38% of Income)',
    descriptionBn: 'এই মাসে মোট আয় ৳১,০০,০০০ এবং মোট খরচ ৳৬২,৩৫০। অবশিষ্ট ৳৩৭,৬৫০ দিয়ে আপনি সঞ্চয় লক্ষ্যমাত্রা দ্রুত অর্জন করতে পারছেন।',
    descriptionEn: 'Total income is ৳100,000 with ৳62,350 total expenses. The remaining ৳37,650 keeps you on track for savings goals.',
    actionBn: 'অবশিষ্ট উদ্বৃত্ত থেকে ৳১৫,০০০ সরাসরি জরুরি তহবিলে যোগ করুন।',
    actionEn: 'Transfer ৳15,000 from current surplus into your Emergency Fund.',
    metric: '37.6% Saved'
  },
  {
    id: 'ins_03',
    type: 'tip',
    titleBn: 'খাবারের ব্যয়ে সাশ্রয় করার সুযোগ',
    titleEn: 'Dining Out Optimization Opportunity',
    descriptionBn: 'এই মাসে রেস্তোরাঁ ও অনলাইনে খাবারে ৳৪,৭০০ খরচ হয়েছে। ঘরোয়া খাবারের অনুপাত বাড়ালে প্রতি মাসে আনুমানিক ৳২,০০০ সাশ্রয় সম্ভব।',
    descriptionEn: 'Restaurant and food delivery accounted for ৳4,700. Packing homemade lunch on weekdays could save ~৳2,000 monthly.',
    actionBn: 'সাপ্তাহিক বাজার আগে থেকেই পরিকল্পনা করে রেস্তোরাঁর ব্যয় কমান।',
    actionEn: 'Plan weekday meals in advance to cut down dining out costs.',
    category: 'Food',
    metric: 'Potential ৳2,000 savings'
  }
];

export const categoryLabels: Record<TransactionCategory, { bn: string; en: string; color: string; bg: string }> = {
  Food: { bn: 'খাবার ও বাজার', en: 'Food & Dining', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700' },
  Transport: { bn: 'যাতায়াত ও রাইড', en: 'Transport', color: '#0ea5e9', bg: 'bg-sky-50 text-sky-700' },
  Shopping: { bn: 'কেনাকাটা', en: 'Shopping', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700' },
  Bills: { bn: 'ইউটিলিটি ও বিল', en: 'Bills & Utilities', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700' },
  Education: { bn: 'শিক্ষা ও কোর্স', en: 'Education', color: '#8b5cf6', bg: 'bg-purple-50 text-purple-700' },
  Healthcare: { bn: 'স্বাস্থ্য ও চিকিৎসা', en: 'Healthcare', color: '#ef4444', bg: 'bg-rose-50 text-rose-700' },
  Entertainment: { bn: 'বিনোদন ও বিনোদনমূলক', en: 'Entertainment', color: '#ec4899', bg: 'bg-pink-50 text-pink-700' },
  Housing: { bn: 'বাসা ভাড়া ও আবাসন', en: 'Housing & Rent', color: '#64748b', bg: 'bg-slate-100 text-slate-700' },
  Salary: { bn: 'বেতন', en: 'Salary', color: '#059669', bg: 'bg-emerald-100 text-emerald-800' },
  Freelance: { bn: 'ফ্রিল্যান্সিং', en: 'Freelance', color: '#0284c7', bg: 'bg-sky-100 text-sky-800' },
  Investment: { bn: 'বিনিয়োগ ও লাভ', en: 'Investment', color: '#d97706', bg: 'bg-amber-100 text-amber-800' },
  Family: { bn: 'পারিবারিক সহায়তা', en: 'Family Support', color: '#14b8a6', bg: 'bg-teal-50 text-teal-700' },
  Other: { bn: 'অন্যান্য', en: 'Other', color: '#94a3b8', bg: 'bg-gray-100 text-gray-700' }
};

export const sampleCsvData = `Date,Title,Amount,Type,Category,PaymentMethod,Note
2026-10-01,Monthly Salary,75000,income,Salary,Bank Transfer,City Bank monthly deposit
2026-10-02,House Rent Mirpur DOHS,22000,expense,Housing,Bank Transfer,Flat rent for October
2026-10-03,Chaldal Grocery Rice Oil Dal,4200,expense,Food,bKash,Monthly pantry replenishment
2026-10-04,DESCO Electricity Bill,2350,expense,Bills,bKash,Prepaid meter token
2026-10-05,Pathao Rides to Office,1150,expense,Transport,bKash,Weekly commute
2026-10-06,Kacchi Bhai Biryani with Friends,1650,expense,Food,Cash,Dinner outing
2026-10-07,Upwork Freelance UI Payout,20000,income,Freelance,bKash,Mobile app design milestone
2026-10-08,Aarong Panjabi Eid Shopping,3600,expense,Shopping,Credit Card,Festive attire
2026-10-09,Dhaka WASA Water Bill,850,expense,Bills,Nagad,Utility payment
2026-10-10,Prescription Medicine Labaid,1200,expense,Healthcare,Cash,Family medication`;
