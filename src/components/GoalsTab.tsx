import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, Plus, Sparkles, TrendingUp, Calendar, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import goalIllustrationImg from '../assets/images/savings_goal_illustration_1791045598440.jpg';

export const GoalsTab: React.FC = () => {
  const {
    goals,
    addSavingsGoal,
    contributeToGoal,
    deleteGoal,
    language,
    formatTaka,
    toBengaliNumber,
    currentMonthSummary
  } = useFinance();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState('2027-01-31');
  const [newCategory, setNewCategory] = useState('Safety');

  // Quick contribute state
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState<string>('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) {
      alert(language === 'bn' ? 'সঠিক শিরোনাম ও টার্গেট টাকার পরিমাণ দিন' : 'Please provide a valid title and target amount');
      return;
    }

    addSavingsGoal({
      title: newTitle.trim(),
      titleBn: newTitleBn.trim() || newTitle.trim(),
      targetAmount: target,
      targetDate: newDate,
      category: newCategory,
      aiRecommendation: `Deposit ৳${Math.round(target / 6).toLocaleString()} monthly to reach target safely.`,
      aiRecommendationBn: `নির্ধারিত সময়ে পৌঁছাতে প্রতি মাসে ৳${toBengaliNumber(Math.round(target / 6).toLocaleString())} সঞ্চয় করার পরামর্শ দেওয়া হচ্ছে।`
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setNewTitleBn('');
    setNewTarget('');
  };

  const handleContribute = (goalId: string) => {
    const amt = parseFloat(contributeAmount);
    if (!isNaN(amt) && amt > 0) {
      contributeToGoal(goalId, amt);
      setContributeGoalId(null);
      setContributeAmount('');
    }
  };

  const totalSavedAcrossGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAcrossGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Visual Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                {language === 'bn' ? 'স্মার্ট লক্ষ্যমাত্রা ট্র্যাকার' : 'Smart Goal Planner'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {language === 'bn'
                ? 'স্বপ্ন ও ভবিষ্যতের জন্য নিয়মিত সঞ্চয় পরিকল্পনা'
                : 'Turn Ambitions into Concrete Savings Milestones'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              {language === 'bn'
                ? 'জরুরি তহবিল, ল্যাপটপ ক্রয় বা ভ্রমণ—ফিনসাথী এআই আপনার আয়ের সাথে সামঞ্জস্য রেখে নিয়মিত সঞ্চয়ের পরামর্শ প্রদান করে।'
                : 'Set targets for emergency funds, tech gear, or travel. FinSathi AI computes monthly savings runway based on your cash flow.'}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নতুন সঞ্চয় লক্ষ্য যোগ করুন' : 'Create New Goal'}</span>
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
          <span className="text-xs font-medium text-slate-500">
            {language === 'bn' ? 'মোট লক্ষ্যমাত্রা' : 'Cumulative Target'}
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-tabular">
            {formatTaka(totalTargetAcrossGoals)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn' ? `${toBengaliNumber(goals.length)}টি সক্রিয় পরিকল্পনা` : `${goals.length} active targets`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            {language === 'bn' ? 'বর্তমানে জমাকৃত অর্থ' : 'Currently Saved Amount'}
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-tabular">
            {formatTaka(totalSavedAcrossGoals)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? `সামগ্রিক অগ্রগতির ${toBengaliNumber(Math.round((totalSavedAcrossGoals / (totalTargetAcrossGoals || 1)) * 100))}%`
              : `${Math.round((totalSavedAcrossGoals / (totalTargetAcrossGoals || 1)) * 100)}% overall completion`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            {language === 'bn' ? 'চলতি মাসের উদ্বৃত্ত থেকে যোগ করুন' : 'Monthly Surplus Available'}
          </span>
          <div className="mt-2 text-2xl font-bold text-indigo-600 font-tabular">
            {formatTaka(currentMonthSummary.netBalance)}
          </div>
          <p className="text-xs text-indigo-600 font-medium mt-1">
            {language === 'bn' ? 'লক্ষ্যমাত্রায় সহজে স্থানান্তরযোগ্য' : 'Directly allocatable to goals'}
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const percentage = Math.round((g.currentAmount / g.targetAmount) * 100);
          const isComplete = g.currentAmount >= g.targetAmount;
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);

          return (
            <div
              key={g.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {g.category}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1.5">
                      {language === 'bn' ? (g.titleBn || g.title) : g.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(language === 'bn' ? 'এই সঞ্চয় লক্ষ্য মুছে ফেলতে চান?' : 'Delete this savings goal?')) {
                        deleteGoal(g.id);
                      }
                    }}
                    title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount display */}
                <div className="mt-4 flex items-baseline justify-between font-tabular">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {language === 'bn' ? 'জমা হয়েছে' : 'Saved'}
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatTaka(g.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">
                      {language === 'bn' ? 'টার্গেট' : 'Target'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatTaka(g.targetAmount)}
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
                    {language === 'bn' ? `${toBengaliNumber(percentage)}% সম্পন্ন` : `${percentage}% Achieved`}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{g.targetDate}</span>
                  </span>
                </div>

                {/* AI Recommendation Box */}
                {(g.aiRecommendation || g.aiRecommendationBn) && (
                  <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-950 leading-relaxed">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'bn' ? 'এআই পরামর্শ' : 'AI Recommendation'}</span>
                    </div>
                    {language === 'bn' ? (g.aiRecommendationBn || g.aiRecommendation) : g.aiRecommendation}
                  </div>
                )}
              </div>

              {/* Action: Quick Contribute */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {contributeGoalId === g.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="টাকার পরিমাণ..."
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-tabular font-bold border border-emerald-500 rounded bg-emerald-50/30"
                      autoFocus
                    />
                    <button
                      onClick={() => handleContribute(g.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 whitespace-nowrap"
                    >
                      {language === 'bn' ? 'জমা' : 'Add'}
                    </button>
                    <button
                      onClick={() => setContributeGoalId(null)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setContributeGoalId(g.id)}
                    className="w-full py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'টাকা যোগ করুন' : 'Contribute Funds'}</span>
                  </button>
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
              {language === 'bn' ? 'নতুন সঞ্চয় লক্ষ্যমাত্রা নির্ধারণ' : 'Create New Savings Goal'}
            </h2>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'লক্ষ্যের নাম (ইংরেজি)' : 'Goal Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Laptop, Umrah Trip"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'লক্ষ্যের নাম (বাংলা)' : 'Goal Title in Bangla (Optional)'}
                </label>
                <input
                  type="text"
                  value={newTitleBn}
                  onChange={(e) => setNewTitleBn(e.target.value)}
                  placeholder="যেমন: জরুরি ৬ মাসের তহবিল, নতুন বাইক"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'টার্গেট টাকা (৳ BDT)' : 'Target Amount (BDT ৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="50000"
                    className="w-full p-2 font-tabular font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'টার্গেট তারিখ' : 'Target Date'}
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
                  {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Safety">Safety & Emergency (নিরাপত্তা ও জরুরি)</option>
                  <option value="Career">Career & Education (ক্যারিয়ার ও শিক্ষা)</option>
                  <option value="Travel">Travel & Vacation (ভ্রমণ ও ট্যুর)</option>
                  <option value="Asset">Asset & Electronics (সম্পদ ও গ্যাজেট)</option>
                  <option value="Family">Family & Celebration (পরিবার ও উৎসব)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg font-medium"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg shadow-2xs"
                >
                  {language === 'bn' ? 'লক্ষ্য তৈরি করুন' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
