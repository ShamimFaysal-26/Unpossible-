import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { categoryLabels } from '../data/initialData';
import { TransactionCategory } from '../types/finance';
import { AlertTriangle, CheckCircle2, Edit3, Check, Sparkles, TrendingUp } from 'lucide-react';

export const BudgetsTab: React.FC = () => {
  const {
    budgets,
    updateBudgetLimit,
    currentMonthSummary,
    language,
    formatTaka,
    toBengaliNumber,
    setActiveTab
  } = useFinance();

  const { categoryTotals } = currentMonthSummary;
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  // Total allocated vs total spent in budgeted categories
  let totalAllocatedBudget = 0;
  let totalBudgetedSpend = 0;
  let overBudgetCount = 0;

  budgets.forEach((b) => {
    totalAllocatedBudget += b.monthlyLimit;
    const spent = categoryTotals[b.category] || 0;
    totalBudgetedSpend += spent;
    if (spent > b.monthlyLimit) {
      overBudgetCount += 1;
    }
  });

  const handleStartEdit = (cat: TransactionCategory, currentLimit: number) => {
    setEditingCategory(cat);
    setTempLimit(String(currentLimit));
  };

  const handleSaveEdit = (cat: TransactionCategory) => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      updateBudgetLimit(cat, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {language === 'bn' ? 'ক্যাটাগরিভিত্তিক মাসিক বাজেট পরিকল্পনা' : 'Monthly Category Budgets'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'খরচের সীমা নির্ধারণ করুন এবং বাজেট অতিক্রম রোধে নিয়মিত পর্যবেক্ষণ করুন'
              : 'Set spend ceilings and stay informed before hitting critical limits'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('assistant')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'এআই বাজেট অপ্টিমাইজেশন' : 'AI Budget Advice'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            {language === 'bn' ? 'মোট বাজেট বরাদ্দ' : 'Total Budget Allocated'}
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-tabular">
            {formatTaka(totalAllocatedBudget)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn' ? '৮টি সক্রিয় ক্যাটাগরি' : 'Across 8 active categories'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            {language === 'bn' ? 'মোট বাজেট ব্যয়' : 'Spent Against Budgets'}
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-tabular">
            {formatTaka(totalBudgetedSpend)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-800">
              {language === 'bn'
                ? `${toBengaliNumber(Math.round((totalBudgetedSpend / (totalAllocatedBudget || 1)) * 100))}%`
                : `${Math.round((totalBudgetedSpend / (totalAllocatedBudget || 1)) * 100)}%`}
            </span>
            <span>{language === 'bn' ? 'সামগ্রিক বাজেট ব্যবহৃত' : 'of overall budget consumed'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            {language === 'bn' ? 'বাজেট অতিক্রান্ত ক্যাটাগরি' : 'Over-Budget Categories'}
          </span>
          <div className={`mt-2 text-2xl font-bold tracking-tight font-tabular ${overBudgetCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {language === 'bn' ? `${toBengaliNumber(overBudgetCount)}টি` : `${overBudgetCount} Categories`}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {overBudgetCount > 0
              ? (language === 'bn' ? 'তাৎক্ষণিক সতর্কতা প্রয়োজন' : 'Requires spending restriction')
              : (language === 'bn' ? 'সবগুলো সীমা নিয়ন্ত্রিত' : 'All categories within budget')}
          </p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const spent = categoryTotals[b.category] || 0;
          const limit = b.monthlyLimit;
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const remaining = Math.max(0, limit - spent);
          const isOver = spent > limit;
          const isWarning = percentage >= 80 && !isOver;
          const isEditing = editingCategory === b.category;

          const meta = categoryLabels[b.category] || {
            bn: b.category,
            en: b.category,
            color: '#64748b',
            bg: 'bg-slate-100 text-slate-700'
          };

          return (
            <div
              key={b.id}
              className={`p-5 rounded-xl bg-white border transition-all ${
                isOver
                  ? 'border-rose-300 shadow-xs ring-1 ring-rose-500/10'
                  : isWarning
                  ? 'border-amber-300 shadow-xs'
                  : 'border-slate-200/80 shadow-2xs'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {language === 'bn' ? meta.bn : meta.en}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      {language === 'bn' ? 'চলতি মাস (অক্টোবর ২০২৬)' : 'October 2026'}
                    </span>
                  </div>
                </div>

                {/* Status tag */}
                <div>
                  {isOver ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {language === 'bn' ? 'অতিক্রান্ত' : 'Exceeded'}
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {language === 'bn' ? 'সীমার কাছে' : 'Warning'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {language === 'bn' ? 'নিয়ন্ত্রিত' : 'On Track'}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount stats */}
              <div className="mt-4 flex items-baseline justify-between text-xs font-tabular">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    {language === 'bn' ? 'ব্যয় হয়েছে' : 'Spent'}
                  </span>
                  <span className={`text-base font-bold ${isOver ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatTaka(spent)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">
                    {language === 'bn' ? 'নির্ধারিত বাজেট' : 'Monthly Limit'}
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                        className="w-20 px-1.5 py-0.5 text-xs font-bold font-tabular border border-emerald-500 rounded bg-emerald-50/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(b.category)}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(b.category, limit)}
                      className="text-base font-bold text-slate-700 hover:text-emerald-600 inline-flex items-center gap-1 group"
                      title={language === 'bn' ? 'বাজেট পরিবর্তন করতে ক্লিক করুন' : 'Click to edit limit'}
                    >
                      <span>{formatTaka(limit)}</span>
                      <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isOver
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Bottom footer text */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-tabular">
                <span>
                  {language === 'bn'
                    ? `${toBengaliNumber(percentage)}% ব্যবহৃত`
                    : `${percentage}% consumed`}
                </span>
                <span>
                  {isOver
                    ? (language === 'bn'
                        ? `অতিরিক্ত ব্যয়: ${formatTaka(spent - limit)}`
                        : `Over by: ${formatTaka(spent - limit)}`)
                    : (language === 'bn'
                        ? `অবশিষ্ট: ${formatTaka(remaining)}`
                        : `Remaining: ${formatTaka(remaining)}`)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
