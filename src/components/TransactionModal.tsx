import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { categorizeTransactionWithAi } from '../services/api';
import { TransactionCategory, PaymentMethod, TransactionType } from '../types/finance';
import { categoryLabels } from '../data/initialData';

export const TransactionModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    language
  } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiSuggestionReason, setAiSuggestionReason] = useState<string | null>(null);

  // Populate when editing
  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setAiSuggestionReason(null);
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      setPaymentMethod('bKash');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setAiSuggestionReason(null);
    }
  }, [editingTransaction, isAddModalOpen]);

  // Handle AI Auto-categorization trigger
  const handleAutoCategorize = async () => {
    if (!title.trim()) return;
    setIsCategorizing(true);
    setAiSuggestionReason(null);
    try {
      const res = await categorizeTransactionWithAi(title, Number(amount) || 0, note);
      if (res.category && Object.keys(categoryLabels).includes(res.category)) {
        setCategory(res.category as TransactionCategory);
        setAiSuggestionReason(language === 'bn' ? res.reasoningBn : res.reasoningEn);
        if (res.typeRecommendation) {
          setType(res.typeRecommendation);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCategorizing(false);
    }
  };

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সঠিক শিরোনাম এবং টাকার পরিমাণ লিখুন' : 'Please provide a valid title and amount');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        paymentMethod,
        date,
        note: note.trim()
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        paymentMethod,
        date,
        note: note.trim()
      });
    }

    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingTransaction
                ? (language === 'bn' ? 'লেনদেন সম্পাদনা' : 'Edit Transaction')
                : (language === 'bn' ? 'নতুন লেনদেন লিখুন' : 'New Transaction Entry')}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'বাংলা বা ইংরেজিতে বিস্তারিত লিখুন' : 'Enter amount, type and smart category'}
            </p>
          </div>
          <button
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingTransaction(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type Toggle: Expense vs Income */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              {language === 'bn' ? 'লেনদেনের ধরন' : 'Transaction Type'}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 font-semibold rounded-md transition-colors ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'bn' ? 'ব্যয় (Expense)' : 'Expense (-)'}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 font-semibold rounded-md transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'bn' ? 'আয় (Income)' : 'Income (+)'}
              </button>
            </div>
          </div>

          {/* Title with AI Auto-Categorize Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-semibold">
                {language === 'bn' ? 'বিবরণ বা শিরোনাম' : 'Title / Description'} *
              </label>
              <button
                type="button"
                onClick={handleAutoCategorize}
                disabled={!title.trim() || isCategorizing}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-opacity"
              >
                {isCategorizing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{language === 'bn' ? 'শ্রেণিবিভাগ হচ্ছে...' : 'Classifying...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'bn' ? 'এআই অটো-ক্যাটাগরি' : 'AI Auto-Classify'}</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: চাল ডাল বাজার, পাঠাও রাইড, ডেসকো কারেন্ট বিল' : 'e.g., Grocery shopping, Pathao ride, Electricity bill'}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
            {aiSuggestionReason && (
              <p className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{aiSuggestionReason}</span>
              </p>
            )}
          </div>

          {/* Amount & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                {language === 'bn' ? 'টাকার পরিমাণ (৳ BDT)' : 'Amount (BDT ৳)'} *
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 text-xs font-tabular font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-tabular"
              />
            </div>
          </div>

          {/* Category & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              >
                {Object.entries(categoryLabels).map(([catKey, val]) => (
                  <option key={catKey} value={catKey}>
                    {language === 'bn' ? val.bn : val.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                {language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Rocket">Rocket (রকেট)</option>
                <option value="Bank Transfer">Bank Transfer (ব্যাংক)</option>
                <option value="Credit Card">Credit Card (ক্রেডিট কার্ড)</option>
                <option value="Cash">Cash (নগদ টাকা)</option>
              </select>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              {language === 'bn' ? 'অতিরিক্ত নোট (ঐচ্ছিক)' : 'Note / Memo (Optional)'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'bn' ? 'কোনো বিশেষ তথ্য...' : 'Details, place, bill number...'}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTransaction(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs active:scale-95"
            >
              {editingTransaction
                ? (language === 'bn' ? 'সংরক্ষণ করুন' : 'Update')
                : (language === 'bn' ? 'যোগ করুন' : 'Save Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
