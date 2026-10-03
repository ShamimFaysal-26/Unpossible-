import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Plus,
  UploadCloud,
  Sparkles,
  ChevronRight,
  Target,
  Database,
  ArrowRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { categoryLabels } from '../data/initialData';
import { UnusualSpendingAlert } from './UnusualSpendingAlert';
import heroImg from '../assets/images/finsathi_hero_dashboard_1791045563364.jpg';
import advisorAvatarImg from '../assets/images/avatar_fin_advisor_1791045585813.jpg';

export const OverviewTab: React.FC = () => {
  const {
    currentMonthSummary,
    formatMoney,
    transactions,
    budgets,
    goals,
    insights,
    setActiveTab,
    setIsAddModalOpen,
    setIsImportModalOpen,
    setIsDbModalOpen,
    user
  } = useFinance();

  const { totalIncome, totalExpense, netBalance, savingsRate, categoryTotals } = currentMonthSummary;

  const hasTransactions = transactions.length > 0;
  const recentTransactions = transactions.slice(0, 6);

  const sortedCategories = Object.entries(categoryTotals)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const primaryGoal = goals.length > 0 ? goals[0] : null;

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Summary Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Connected Database &middot; Clean Slate
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {user.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {hasTransactions
                ? 'Your Personal Financial Dashboard & Budget Control'
                : 'Welcome to FinSathi AI — Your Personal Finance Hub'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {hasTransactions
                ? `You have saved ${savingsRate}% of your income with ${formatMoney(netBalance)} in net balance this cycle. Live sync is active with your Firestore database.`
                : 'Your database is completely clean and connected to Firebase Cloud Firestore. Record your first transaction, set category budgets, or import a bank CSV export to begin.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Transaction</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors backdrop-blur-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Import CSV File</span>
              </button>

              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firestore Live</span>
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
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cloud Firestore Sync Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unusual Spending Alert (Anomaly Detection) */}
      <UnusualSpendingAlert />

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Recorded Income
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular">
              {formatMoney(totalIncome)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
              <span>{transactions.filter(t => t.type === 'income').length} income entries</span>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Recorded Expenses
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular">
              {formatMoney(totalExpense)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <span>{transactions.filter(t => t.type === 'expense').length} expense entries</span>
            </div>
          </div>
        </div>

        {/* Net Savings Surplus */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Balance Surplus
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight font-tabular ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatMoney(netBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 font-semibold">
              <span>{netBalance >= 0 ? 'Positive cash flow' : 'Deficit'}</span>
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular">
              {savingsRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
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
                <h2 className="text-base font-bold text-slate-900">
                  Category Expenses & Monthly Budgets
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track spending progress against your target limits
                </p>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Set Budgets</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-700">No expenses recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Log your daily expenses or set category budgets to visualize your spending breakdown here.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record an Expense</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCategories.map(([category, amount]) => {
                  const budgetItem = budgets.find(b => b.category === category);
                  const limit = budgetItem ? budgetItem.monthlyLimit : 0;
                  const percentage = limit > 0 ? Math.round((amount / limit) * 100) : 0;
                  const isOverBudget = percentage >= 100;
                  const isNearLimit = percentage >= 80 && percentage < 100;
                  const catMeta = categoryLabels[category as keyof typeof categoryLabels] || {
                    name: category,
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
                            {catMeta.name}
                          </span>
                          {isOverBudget && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              Exceeded
                            </span>
                          )}
                          {isNearLimit && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Near Limit
                            </span>
                          )}
                        </div>
                        <div className="font-tabular text-slate-600">
                          <span className="font-bold text-slate-900">{formatMoney(amount)}</span>
                          {limit > 0 && (
                            <span className="text-slate-400"> / {formatMoney(limit)} ({percentage}%)</span>
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
            )}
          </div>

          {/* AI-Generated Personalized Insights */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  AI Financial Health Diagnostics
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('assistant')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Ask AI Advisor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {insights.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-700">Awaiting financial inputs</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Once you add transactions or budgets, FinSathi AI will automatically analyze your spending habits, flag anomalies, and provide personalized savings tips.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-slate-900">
                          {insight.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {insight.description}
                        </p>
                        {insight.action && (
                          <p className="text-xs font-semibold text-emerald-700 pt-1 flex items-center gap-1">
                            <span>&rarr;</span>
                            <span>{insight.action}</span>
                          </p>
                        )}
                      </div>
                      {insight.metric && (
                        <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Savings Goal & Recent Transactions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Goal Spotlight */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Savings Goals
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Manage
              </button>
            </div>

            {primaryGoal ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    {primaryGoal.title}
                  </h3>
                  <div className="flex items-baseline justify-between mt-1 text-xs font-tabular">
                    <span className="font-bold text-emerald-600 text-base">
                      {formatMoney(primaryGoal.currentAmount)}
                    </span>
                    <span className="text-slate-400">
                      Target {formatMoney(primaryGoal.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((primaryGoal.currentAmount / (primaryGoal.targetAmount || 1)) * 100))}%`
                    }}
                  />
                </div>

                {primaryGoal.aiRecommendation && (
                  <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                    <p className="font-bold text-[10px] text-indigo-700 uppercase tracking-wider mb-0.5">
                      Strategy
                    </p>
                    {primaryGoal.aiRecommendation}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 px-3 text-center rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-700">No savings targets set</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Plan your emergency fund, equipment, or travel goals.
                </p>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Goal</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">
                Recent Activity
              </h2>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <span>Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-700">Ledger is clean</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ready for your personal entries or CSV import.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Entry</span>
                </button>
              </div>
            ) : (
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
                          <span aria-hidden="true">&middot;</span>
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
                          {formatMoney(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Advisor Preview Widget */}
          <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-white rounded-xl border border-emerald-200/80 p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={advisorAvatarImg}
                alt="FinSathi AI Consultant"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-emerald-300 ring-2 ring-emerald-500/20"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  FinSathi AI Advisor
                </h3>
                <p className="text-[11px] text-slate-600">
                  Ready for your personal financial questions
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('assistant')}
                className="text-left px-2.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200/70 rounded-md transition-colors"
              >
                &ldquo;How should I plan my monthly budget?&rdquo;
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className="text-left px-2.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200/70 rounded-md transition-colors"
              >
                &ldquo;Tips on building an emergency reserve fund?&rdquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
