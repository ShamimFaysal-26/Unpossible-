import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Database, Sparkles, UploadCloud } from 'lucide-react';
import userAvatarImg from '../assets/images/avatar_bangla_user_1791045575293.jpg';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddModalOpen,
    setIsImportModalOpen,
    setIsDbModalOpen,
    dbInfo,
    user
  } = useFinance();

  const navLinks: {
    id: 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant';
    label: string;
    highlight?: boolean;
  }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'goals', label: 'Savings Goals' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'assistant', label: 'AI Advisor', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              $
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans block leading-none">
                FinSathi <span className="text-emerald-600">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 block">
                Smart Personal Finance
              </span>
            </div>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap focus-visible:outline-none flex items-center gap-1.5 ${
                    isActive
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.highlight && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2.5">
            {/* Database Setup Button */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              title="Cloud Database Status & Sync Log"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/60"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{dbInfo.isSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* CSV Import */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              title="Import Transactions from CSV"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/60"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Import</span>
            </button>

            {/* Primary Action: Add Transaction */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center pl-1 border-l border-slate-200">
              <img
                src={userAvatarImg}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-1 ring-emerald-500/20"
                title={`${user.name} (${user.occupation})`}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.highlight && <Sparkles className="w-3 h-3" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
