import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { categoryLabels } from '../data/initialData';
import { TransactionCategory } from '../types/finance';
import { PieChart as PieIcon, BarChart3, CreditCard } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { transactions, formatMoney, currentMonthSummary } = useFinance();
  const [chartTimeframe, setChartTimeframe] = useState<'current' | 'all'>('current');

  // Category Breakdown Data for Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    const relevantTx = chartTimeframe === 'current'
      ? transactions.filter(t => t.date.startsWith('2026-10') && t.type === 'expense')
      : transactions.filter(t => t.type === 'expense');

    relevantTx.forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });

    return Object.entries(map).map(([cat, val]) => {
      const meta = categoryLabels[cat as TransactionCategory] || {
        name: cat,
        color: '#64748b'
      };
      return {
        name: meta.name,
        rawCategory: cat,
        value: val,
        color: meta.color
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, chartTimeframe]);

  // Payment Method Breakdown
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
      });

    return Object.entries(map).map(([method, val]) => ({
      name: method,
      value: val
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Monthly Comparison Data (September vs October)
  const monthlyComparison = [
    {
      month: 'September 2026',
      income: 6300,
      expense: 2710,
      savings: 3590
    },
    {
      month: 'October 2026',
      income: currentMonthSummary.totalIncome,
      expense: currentMonthSummary.totalExpense,
      savings: currentMonthSummary.netBalance
    }
  ];

  const totalExpenseSum = categoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Spending Analytics & Visual Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive visual breakdowns of cash flow, category distributions, and payment channels
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setChartTimeframe('current')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              chartTimeframe === 'current'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Month (October)
          </button>
          <button
            onClick={() => setChartTimeframe('all')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              chartTimeframe === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Row 1: Category Donut & Table Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <PieIcon className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Category Spending Distribution
              </h2>
            </div>
            <span className="text-xs font-tabular font-bold text-slate-900">
              Total {formatMoney(totalExpenseSum)}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatMoney(Number(value)), 'Spend']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
            {categoryData.slice(0, 6).map((c) => (
              <div key={c.rawCategory} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
                <span className="font-tabular font-bold text-slate-900">
                  ({Math.round((c.value / (totalExpenseSum || 1)) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Category Table */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Category Rankings
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">
              Share %
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {categoryData.map((c, i) => {
              const pct = Math.round((c.value / (totalExpenseSum || 1)) * 100);
              return (
                <div key={c.rawCategory} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-tabular w-4 text-[11px]">{i + 1}.</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                  <div className="text-right font-tabular">
                    <span className="font-bold text-slate-900">{formatMoney(c.value)}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-medium">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Cash Flow & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Monthly Cash Flow Comparison
              </h2>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                <Tooltip
                  formatter={(value: any) => [formatMoney(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Distribution */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Spending by Payment Channel
              </h2>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatMoney(Number(val)), 'Expenditure']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
