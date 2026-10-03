import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  UploadCloud,
  Sparkles,
  ChevronRight,
  Target,
  AlertCircle
} from 'lucide-react';
import { categoryLabels } from '../data/initialData';
import { UnusualSpendingAlert } from './UnusualSpendingAlert';
import heroImg from '../assets/images/finsathi_hero_dashboard_1791045563364.jpg';
import advisorAvatarImg from '../assets/images/avatar_fin_advisor_1791045585813.jpg';

export const OverviewTab: React.FC = () => {
  const {
    currentMonthSummary,
    language,
    formatTaka,
    toBengaliNumber,
    transactions,
    budgets,
    goals,
    insights,
    setActiveTab,
    setIsAddModalOpen,
    setIsImportModalOpen,
    user
  } = useFinance();

  const { totalIncome, totalExpense, netBalance, savingsRate, categoryTotals } = currentMonthSummary;

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Top 4 categories by spend
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Primary active goal
  const primaryGoal = goals[0];

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Financial Snapshot Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                {language === 'bn' ? 'অক্টোবর ২০২৬ অর্থ সেশন' : 'October 2026 Financial Cycle'}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {language === 'bn' ? `স্বাগতম, ${user.nameBn}` : `Welcome back, ${user.name}`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'bn'
                ? 'আপনার আর্থিক লক্ষ্য অর্জনে ফিনসাথী পাশে আছে'
                : 'Intelligent Financial Control Tailored for Bangladesh'}
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? `এই মাসে আপনার সঞ্চয়ের হার ${toBengaliNumber(savingsRate)}%। নির্ধারিত বাজেটের মধ্যে খরচ রেখে সঞ্চয় তহবিলে নিয়মিত অবদান রাখুন।`
                : `Your monthly savings rate is currently at ${savingsRate}%. Track your daily bKash, card, and cash spends with real-time AI guidance.`}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন খরচ যোগ করুন' : 'Record Transaction'}</span>
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg border border-white/20 transition-colors backdrop-blur-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>{language === 'bn' ? 'এআই সহকারীর সাথে কথা বলুন' : 'Ask AI Assistant'}</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{language === 'bn' ? 'সিএসভি ফাইল আপলোড' : 'Import CSV'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/20 shadow-lg">
              <img
                src={heroImg}
                alt="FinSathi Dashboard Preview"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'বাংলা ও বাংলিশ এনএলপি সংযুক্ত' : 'Bangla & Banglish NLP active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unusual Spending Alert (Anomaly Detection) */}
      <UnusualSpendingAlert />

      {/* 4 Primary Financial KPI Cards with Tabular Numerals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'মোট আয় (চলতি মাস)' : 'Total Monthly Income'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular">
              {formatTaka(totalIncome)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বেতন ও ফ্রিল্যান্স জমা' : 'Salary & Freelance verified'}</span>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'মোট ব্যয় (চলতি মাস)' : 'Total Monthly Expense'}
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular">
              {formatTaka(totalExpense)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <span>{language === 'bn' ? '১৫টি লেনদেন রেকর্ডকৃত' : '15 logged transactions'}</span>
            </div>
          </div>
        </div>

        {/* Net Savings Surplus */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'অবশিষ্ট উদ্বৃত্ত স্থিতি' : 'Net Surplus Balance'}
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight font-tabular ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatTaka(netBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 font-medium">
              <span>{language === 'bn' ? 'বাজেট ও লক্ষ্যমাত্রায় ব্যবহারযোগ্য' : 'Available for allocation'}</span>
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'সঞ্চয়ের হার' : 'Savings Rate'}
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular">
              {language === 'bn' ? `${toBengaliNumber(savingsRate)}%` : `${savingsRate}%`}
            </div>
            {/* Small progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spending Breakdown & AI Insights */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Spending Categories with Budgets */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {language === 'bn' ? 'শীর্ষ ব্যয় ক্যাটাগরি ও বাজেট' : 'Top Spending Categories & Budget Limits'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn' ? 'বর্তমান মাসের ক্যাটাগরিভিত্তিক খরচের অগ্রগতি' : 'Monthly expense consumption per category'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>{language === 'bn' ? 'সকল বাজেট দেখুন' : 'Manage Budgets'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {sortedCategories.map(([category, amount]) => {
                const budgetItem = budgets.find(b => b.category === category);
                const limit = budgetItem ? budgetItem.monthlyLimit : 0;
                const percentage = limit > 0 ? Math.round((amount / limit) * 100) : 0;
                const isOverBudget = percentage >= 100;
                const isNearLimit = percentage >= 80 && percentage < 100;
                const catMeta = categoryLabels[category as keyof typeof categoryLabels] || {
                  bn: category,
                  en: category,
                  color: '#64748b'
                };

                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: catMeta.color }}
                        />
                        <span className="font-semibold text-slate-800">
                          {language === 'bn' ? catMeta.bn : catMeta.en}
                        </span>
                        {isOverBudget && (
                          <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            {language === 'bn' ? 'বাজেট অতিক্রান্ত' : 'Exceeded'}
                          </span>
                        )}
                        {isNearLimit && (
                          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            {language === 'bn' ? 'সীমার সন্নিকটে' : 'Near Limit'}
                          </span>
                        )}
                      </div>
                      <div className="font-tabular text-slate-600">
                        <span className="font-bold text-slate-900">{formatTaka(amount)}</span>
                        {limit > 0 && (
                          <span className="text-slate-400"> / {formatTaka(limit)} ({language === 'bn' ? toBengaliNumber(percentage) : percentage}%)</span>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : isNearLimit
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI-Generated Personalized Insights */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  {language === 'bn' ? 'এআই আর্থিক মূল্যায়ন ও পর্যবেক্ষণ' : 'AI Financial Health Insights'}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('assistant')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>{language === 'bn' ? 'সহকারীকে জিজ্ঞেস করুন' : 'Chat with AI'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-900">
                        {language === 'bn' ? insight.titleBn : insight.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {language === 'bn' ? insight.descriptionBn : insight.descriptionEn}
                      </p>
                      {insight.actionBn && (
                        <p className="text-xs font-medium text-emerald-700 pt-1 flex items-center gap-1">
                          <span>→</span>
                          <span>{language === 'bn' ? insight.actionBn : insight.actionEn}</span>
                        </p>
                      )}
                    </div>
                    {insight.metric && (
                      <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Savings Goal & Recent Transactions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Goal Spotlight */}
          {primaryGoal && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {language === 'bn' ? 'সঞ্চয় লক্ষ্যমাত্রা' : 'Savings Priority Goal'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  {language === 'bn' ? 'সব লক্ষ্য' : 'View all'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    {language === 'bn' ? (primaryGoal.titleBn || primaryGoal.title) : primaryGoal.title}
                  </h3>
                  <div className="flex items-baseline justify-between mt-1 text-xs">
                    <span className="font-tabular font-bold text-emerald-600 text-base">
                      {formatTaka(primaryGoal.currentAmount)}
                    </span>
                    <span className="font-tabular text-slate-400">
                      {language === 'bn' ? 'লক্ষ্য ' : 'Target '} {formatTaka(primaryGoal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100))}%`
                    }}
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                  <p className="font-medium text-[11px] text-indigo-700 uppercase tracking-wider mb-0.5">
                    {language === 'bn' ? 'এআই পরামর্শ' : 'AI Strategy'}
                  </p>
                  {language === 'bn' ? primaryGoal.aiRecommendationBn : primaryGoal.aiRecommendation}
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions List */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
              </h2>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <span>{language === 'bn' ? 'সবগুলো' : 'View all'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{tx.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-tabular ${
                          isExpense ? 'text-slate-900' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatTaka(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick AI Advisor Assistant Widget */}
          <div className="bg-linear-to-br from-emerald-50 via-slate-50 to-white rounded-xl border border-emerald-200/80 p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={advisorAvatarImg}
                alt="FinSathi AI Consultant"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-emerald-300 ring-2 ring-emerald-500/20"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {language === 'bn' ? 'ফিনসাথী ব্যক্তিগত পরামর্শক' : 'FinSathi AI Advisor'}
                </h3>
                <p className="text-[11px] text-slate-600">
                  {language === 'bn' ? 'বাংলা বা বাংলিশে আর্থিক প্রশ্ন করুন' : 'Ask any financial question in Bangla'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('assistant')}
                className="text-left px-2.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200/70 rounded-md transition-colors"
              >
                &ldquo;এই মাসে খাবারের পেছনে কত খরচ করেছি?&rdquo;
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className="text-left px-2.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200/70 rounded-md transition-colors"
              >
                &ldquo;আমার শপিং বাজেট কি শেষ হয়ে গেছে?&rdquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
