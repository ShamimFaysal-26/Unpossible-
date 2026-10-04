import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Database,
  X,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Smartphone,
  Copy,
  Check,
  ArrowRight,
  UserCheck,
  LogIn
} from 'lucide-react';

export const DatabaseModal: React.FC = () => {
  const {
    isDbModalOpen,
    setIsDbModalOpen,
    setIsAuthModalOpen,
    dbInfo,
    checkDb,
    resetAllDataToEmpty,
    transactions,
    goals,
    deviceId,
    activeWorkspaceId,
    currentUser,
    setCustomDeviceId
  } = useFinance();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputDeviceId, setInputDeviceId] = useState('');
  const [showSwitch, setShowSwitch] = useState(false);

  if (!isDbModalOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await checkDb();
      setTestResult(`Firestore connection verified. Dedicated partition for ${currentUser ? currentUser.email : deviceId} is active.`);
    } catch (e: any) {
      setTestResult(`Status check completed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      setTimeout(() => setConfirmWipe(false), 5000);
      return;
    }

    setIsClearing(true);
    setConfirmWipe(false);
    try {
      await resetAllDataToEmpty();
      setTestResult('Your data has been cleared from Firestore for this active partition.');
    } catch (e: any) {
      setTestResult(`Error clearing data: ${e.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(activeWorkspaceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDeviceId.trim().length >= 4) {
      setCustomDeviceId(inputDeviceId.trim());
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
                Firebase Firestore &middot; Private isolated partition
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
        <div className="p-6 space-y-4 text-xs">
          {/* Active Partition Identifier Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-bold text-slate-100">
                  {currentUser ? 'Authenticated Account Partition' : 'Your Device Identity (Private Space)'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                {currentUser ? 'Account Synced' : 'Guest Device Mode'}
              </span>
            </div>

            {currentUser ? (
              <div className="space-y-1 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="font-semibold text-slate-100">{currentUser.displayName || 'FinSathi Member'}</div>
                <div className="text-emerald-400 font-mono text-[11px]">{currentUser.email}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Workspace UID: <span className="font-mono text-slate-300 select-all">{activeWorkspaceId}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
                  <code className="text-xs font-mono text-emerald-300 flex-1 truncate select-all">
                    {deviceId}
                  </code>
                  <button
                    onClick={handleCopyId}
                    className="p-1 text-slate-300 hover:text-white transition-colors"
                    title="Copy Device ID"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">
                    Want automatic sync across your phone and PC?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDbModalOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign In / Sign Up</span>
                  </button>
                </div>
              </>
            )}

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every user account and device has its own private, isolated database space in Firebase Firestore. Data logged here is permanently saved in the cloud.
            </p>

            {!currentUser && (
              <>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSwitch(!showSwitch)}
                    className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{showSwitch ? 'Cancel' : 'Sync with another device ID'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {showSwitch && (
                  <form onSubmit={handleSwitchDevice} className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste existing Device ID to link..."
                      value={inputDeviceId}
                      onChange={(e) => setInputDeviceId(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs text-white bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={inputDeviceId.trim().length < 4}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Link
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Storage Engine:</span>
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
                Clear Active Partition Data
              </span>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50 ${
                  confirmWipe
                    ? 'text-white bg-rose-600 hover:bg-rose-700 animate-pulse'
                    : 'text-rose-700 hover:text-white bg-white hover:bg-rose-600 border border-rose-200 hover:border-transparent'
                }`}
              >
                {isClearing
                  ? 'Clearing...'
                  : confirmWipe
                  ? 'Click to Confirm Wipe'
                  : 'Clear Active Data'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Wipes only this partition's private records from the database. Other accounts and devices remain completely untouched.
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
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
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
