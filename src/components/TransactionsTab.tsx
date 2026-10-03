import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Search,
  Plus,
  UploadCloud,
  Download,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  CreditCard,
  Building,
  Smartphone,
  Banknote
} from 'lucide-react';
import { categoryLabels } from '../data/initialData';
import { Transaction, TransactionCategory, PaymentMethod } from '../types/finance';

export const TransactionsTab: React.FC = () => {
  const {
    transactions,
    language,
    formatTaka,
    deleteTransaction,
    setEditingTransaction,
    setIsAddModalOpen,
    setIsImportModalOpen
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          t.title.toLowerCase().includes(searchLower) ||
          (t.note && t.note.toLowerCase().includes(searchLower)) ||
          (t.subcategory && t.subcategory.toLowerCase().includes(searchLower));

        // Category
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

        // Type
        const matchesType = selectedType === 'all' || t.type === selectedType;

        // Payment
        const matchesPayment = selectedPayment === 'all' || t.paymentMethod === selectedPayment;

        return matchesSearch && matchesCategory && matchesType && matchesPayment;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, searchTerm, selectedCategory, selectedType, selectedPayment, sortOrder]);

  // Export current list to CSV
  const handleExportCsv = () => {
    const headers = ['Date', 'Title', 'Amount', 'Type', 'Category', 'PaymentMethod', 'Note'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.paymentMethod,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finsathi_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    bKash: <Smartphone className="w-3.5 h-3.5 text-pink-600" />,
    Nagad: <Smartphone className="w-3.5 h-3.5 text-amber-600" />,
    Rocket: <Smartphone className="w-3.5 h-3.5 text-purple-600" />,
    'Bank Transfer': <Building className="w-3.5 h-3.5 text-blue-600" />,
    'Credit Card': <CreditCard className="w-3.5 h-3.5 text-slate-700" />,
    Cash: <Banknote className="w-3.5 h-3.5 text-emerald-600" />
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {language === 'bn' ? 'আয় ও ব্যয় লেনদেন খতিয়ান' : 'Transaction Ledger'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? `মোট ${transactions.length}টি লেনদেন সংরক্ষিত রয়েছে`
              : `Total ${transactions.length} recorded transactions`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            title={language === 'bn' ? 'সিএসভি ডাউনলোড করুন' : 'Export to CSV'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200/80 rounded-md transition-colors shadow-2xs hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'এক্সপোর্ট সিএসভি' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200/80 rounded-md transition-colors shadow-2xs hover:bg-slate-50"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'সিএসভি ইম্পোর্ট' : 'Import CSV'}</span>
          </button>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন লেনদেন লিখুন' : 'New Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'bn' ? 'বিবরণ, নোট বা ট্যাগ দিয়ে খুঁজুন...' : 'Search title, note or subcategory...'}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Type Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সকল' : 'All'}
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'expense'
                  ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'ব্যয়' : 'Expense'}
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'income'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'আয়' : 'Income'}
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {Object.entries(categoryLabels).map(([catKey, val]) => (
              <option key={catKey} value={catKey}>
                {language === 'bn' ? val.bn : val.en}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">{language === 'bn' ? 'পেমেন্ট মেথড' : 'All Payment Methods'}</option>
            <option value="bKash">bKash (বিকাশ)</option>
            <option value="Nagad">Nagad (নগদ)</option>
            <option value="Bank Transfer">Bank Transfer (ব্যাংক)</option>
            <option value="Credit Card">Credit Card (কার্ড)</option>
            <option value="Cash">Cash (নগদ টাকা)</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg ml-auto"
            title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? (language === 'bn' ? 'নতুন আগে' : 'Newest') : (language === 'bn' ? 'পুরাতন আগে' : 'Oldest')}</span>
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">
                      {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'bn' ? 'সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন লেনদেন লিখুন' : 'Try adjusting filters or record a new transaction'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const catMeta = categoryLabels[tx.category] || {
                    bn: tx.category,
                    en: tx.category,
                    color: '#64748b'
                  };

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-tabular text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description / Title & Note */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate">
                            {tx.title}
                          </span>
                          {tx.isUnusual && (
                            <span
                              title={tx.anomalyReason || (language === 'bn' ? 'অস্বাভাবিক ব্যয়' : 'Unusual spend')}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded cursor-help"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              {language === 'bn' ? 'অস্বাভাবিক' : 'Spike'}
                            </span>
                          )}
                        </div>
                        {tx.note && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {tx.note}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catMeta.color }}
                          />
                          <span>{language === 'bn' ? catMeta.bn : catMeta.en}</span>
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          {paymentIcons[tx.paymentMethod] || <CreditCard className="w-3.5 h-3.5" />}
                          <span>{tx.paymentMethod}</span>
                        </span>
                      </td>

                      {/* Amount with Tabular Numerals */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-tabular">
                        <span
                          className={`font-bold ${
                            isExpense ? 'text-slate-900' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatTaka(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsAddModalOpen(true);
                            }}
                            title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit'}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(language === 'bn' ? 'আপনি কি এই লেনদেনটি মুছতে নিশ্চিত?' : 'Delete this transaction?')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
