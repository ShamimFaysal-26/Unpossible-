import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { categoryLabels } from '../data/initialData';
import { TransactionCategory } from '../types/finance';
import { AlertTriangle, CheckCircle2, Edit3, Check, Sparkles, Plus, Minus } from 'lucide-react';

export const BudgetsTab: React.FC = () => {
  const {
    budgets,
    updateBudgetLimit,
    adjustBudgetDelta,
    currentMonthSummary,
    formatMoney,
    setActiveTab
  } = useFinance();

  const { categoryTotals } = currentMonthSummary;
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

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
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Monthly Category Budgets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Establish category spend ceilings and adjust limits with 1-click interactive controls
          </p>
        </div>

        <button
          onClick={() => setActiveTab('assistant')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ask AI for Budget Advice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Allocated Budget
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-tabular">
            {formatMoney(totalAllocatedBudget)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {budgets.length} active spending categories
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Spent Against Budget
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-tabular">
            {formatMoney(totalBudgetedSpend)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-800">
              {Math.round((totalBudgetedSpend / (totalAllocatedBudget || 1)) * 100)}%
            </span>
            <span>of overall monthly budget consumed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Over-Budget Categories
          </span>
          <div className={`mt-2 text-2xl font-bold tracking-tight font-tabular ${overBudgetCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {overBudgetCount} {overBudgetCount === 1 ? 'Category' : 'Categories'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {overBudgetCount > 0
              ? 'Discretionary spending cuts recommended'
              : 'All categories safely within limits'}
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
            name: b.category,
            color: '#64748b'
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
                      {meta.name}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      Monthly Cycle
                    </span>
                  </div>
                </div>

                <div>
                  {isOver ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Exceeded
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Warning (80%+)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      On Track
                    </span>
                  )}
                </div>
              </div>

              {/* Amount stats */}
              <div className="mt-4 flex items-baseline justify-between text-xs font-tabular">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    Current Spend
                  </span>
                  <span className={`text-base font-bold ${isOver ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatMoney(spent)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">
                    Monthly Budget Limit
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
                      title="Click to edit limit"
                    >
                      <span>{formatMoney(limit)}</span>
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

              {/* Interactive Quick +/- Stepper Controls */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-tabular font-medium">
                  {percentage}% used &middot; {isOver ? `Over by ${formatMoney(spent - limit)}` : `${formatMoney(remaining)} remaining`}
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 mr-1">Adjust:</span>
                  <button
                    onClick={() => adjustBudgetDelta(b.category, -50)}
                    title="Decrease budget by $50"
                    className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => adjustBudgetDelta(b.category, 50)}
                    title="Increase budget by $50"
                    className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
