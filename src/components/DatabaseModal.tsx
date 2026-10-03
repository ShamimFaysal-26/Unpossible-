import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Database, X, CheckCircle2, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

export const DatabaseModal: React.FC = () => {
  const { isDbModalOpen, setIsDbModalOpen, dbInfo, checkDb, resetAllDataToEmpty, transactions, goals } = useFinance();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  if (!isDbModalOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await checkDb();
      setTestResult('Firebase Firestore connection verified. Live database synchronization is active.');
    } catch (e: any) {
      setTestResult(`Status check completed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all transactions, goals, and insights from your database? This will give you a completely clean slate.')) {
      setIsClearing(true);
      try {
        await resetAllDataToEmpty();
        setTestResult('All records have been completely wiped. Your database is now a 100% clean canvas.');
      } catch (e: any) {
        setTestResult(`Error clearing data: ${e.message}`);
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Database & Cloud Storage
              </h2>
              <p className="text-xs text-slate-500">
                Firebase Firestore status & data management
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDbModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Active Storage Engine:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {dbInfo.engine}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {dbInfo.details}
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] text-slate-500 font-tabular">
              <span>Recorded Transactions: <strong className="text-slate-900">{transactions.length}</strong></span>
              <span>&middot;</span>
              <span>Active Goals: <strong className="text-slate-900">{goals.length}</strong></span>
            </div>
          </div>

          {/* Clean Slate Action */}
          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Clean Database / Reset to Zero
              </span>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="px-3 py-1 text-xs font-semibold text-rose-700 hover:text-white bg-white hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-lg transition-colors shadow-2xs disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Wipe All Data'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Use this if you want to permanently clear all transaction records and start completely from scratch.
            </p>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Sync'}</span>
          </button>

          <button
            onClick={() => setIsDbModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
