import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, Plus, Minus, Sparkles, Calendar, Trash2 } from 'lucide-react';
import goalIllustrationImg from '../assets/images/savings_goal_illustration_1791045598440.jpg';

export const GoalsTab: React.FC = () => {
  const {
    goals,
    addSavingsGoal,
    contributeToGoal,
    withdrawFromGoal,
    deleteGoal,
    formatMoney,
    currentMonthSummary
  } = useFinance();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState('2027-02-28');
  const [newCategory, setNewCategory] = useState('Safety');

  const [activeGoalAction, setActiveGoalAction] = useState<{ id: string; type: 'deposit' | 'withdraw' } | null>(null);
  const [actionAmount, setActionAmount] = useState<string>('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) {
      alert('Please provide a valid goal title and target amount.');
      return;
    }

    addSavingsGoal({
      title: newTitle.trim(),
      targetAmount: target,
      targetDate: newDate,
      category: newCategory,
      aiRecommendation: `Saving $${Math.round(target / 6).toLocaleString()} monthly will comfortably reach this target on schedule.`
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setNewTarget('');
  };

  const handleExecuteAction = (goalId: string, type: 'deposit' | 'withdraw') => {
    const amt = parseFloat(actionAmount);
    if (!isNaN(amt) && amt > 0) {
      if (type === 'deposit') {
        contributeToGoal(goalId, amt);
      } else {
        withdrawFromGoal(goalId, amt);
      }
      setActiveGoalAction(null);
      setActionAmount('');
    }
  };

  const totalSavedAcrossGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAcrossGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Visual Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                Smart Savings Architecture
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Transform Financial Aspirations into Automated Milestones
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Track multi-target reserves for emergency safety funds, technology gear, or travel. FinSathi AI computes monthly contribution pace dynamically based on your cash flow.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Goal</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-4 hidden md:block">
            <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-xs h-36">
              <img
                src={goalIllustrationImg}
                alt="Savings Goal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cumulative Target
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-tabular">
            {formatMoney(totalTargetAcrossGoals)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {goals.length} active savings targets
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Accumulated Savings
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-tabular">
            {formatMoney(totalSavedAcrossGoals)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round((totalSavedAcrossGoals / (totalTargetAcrossGoals || 1)) * 100)}% overall completion
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Monthly Surplus Available
          </span>
          <div className="mt-2 text-2xl font-bold text-indigo-600 font-tabular">
            {formatMoney(currentMonthSummary.netBalance)}
          </div>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            Ready for goal deposit allocation
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const percentage = Math.round((g.currentAmount / g.targetAmount) * 100);
          const isComplete = g.currentAmount >= g.targetAmount;
          const isActionOpen = activeGoalAction?.id === g.id;

          return (
            <div
              key={g.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {g.category}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1.5">
                      {g.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this savings goal?')) {
                        deleteGoal(g.id);
                      }
                    }}
                    title="Delete Goal"
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount display */}
                <div className="mt-4 flex items-baseline justify-between font-tabular">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      Current Saved
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatMoney(g.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      Target
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatMoney(g.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                {/* Completion & Date Info */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-tabular">
                  <span className="font-semibold text-slate-700">
                    {percentage}% Achieved
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{g.targetDate}</span>
                  </span>
                </div>

                {/* AI Recommendation Box */}
                {g.aiRecommendation && (
                  <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-950 leading-relaxed">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Recommendation</span>
                    </div>
                    {g.aiRecommendation}
                  </div>
                )}
              </div>

              {/* Interactive Deposit/Withdraw Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {isActionOpen ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{activeGoalAction.type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</span>
                      <button
                        onClick={() => setActiveGoalAction(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Amount..."
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-tabular font-bold border border-emerald-500 rounded-lg bg-emerald-50/30"
                        autoFocus
                      />
                      <button
                        onClick={() => handleExecuteAction(g.id, activeGoalAction.type)}
                        className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap shadow-2xs"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveGoalAction({ id: g.id, type: 'deposit' })}
                      className="py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Deposit</span>
                    </button>

                    <button
                      onClick={() => setActiveGoalAction({ id: g.id, type: 'withdraw' })}
                      disabled={g.currentAmount <= 0}
                      className="py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Goal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900">
              Create New Savings Target
            </h2>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Emergency Reserve, Workstation Laptop, Travel"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="2500"
                    className="w-full p-2 font-tabular font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 font-tabular bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="Safety">Safety & Emergency Reserve</option>
                  <option value="Hardware">Hardware & Equipment</option>
                  <option value="Travel">Travel & Vacation</option>
                  <option value="Career">Education & Career</option>
                  <option value="Personal">Personal & Lifestyle</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg shadow-2xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
