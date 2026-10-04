import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Plus,
  Database,
  Sparkles,
  UploadCloud,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Smartphone,
  ChevronDown
} from 'lucide-react';
import userAvatarImg from '../assets/images/avatar_bangla_user_1791045575293.jpg';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddModalOpen,
    setIsImportModalOpen,
    setIsDbModalOpen,
    setIsAuthModalOpen,
    currentUser,
    logOutUser,
    dbInfo,
    user
  } = useFinance();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {/* Zone 1: Brand Wordmark */}
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

          {/* Zone 2: Navigation Links */}
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

          {/* Zone 3: Actions & Account Status */}
          <div className="flex items-center gap-2">
            {/* Database Status Button */}
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

            {/* Account / Login Section */}
            <div className="relative pl-1 border-l border-slate-200" ref={menuRef}>
              {currentUser ? (
                // Logged In: User Profile Dropdown
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus-visible:outline-none"
                    title={currentUser.email || currentUser.displayName || 'My Account'}
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 ring-1 ring-emerald-500/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-xs z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-slate-900 truncate">
                            {currentUser.displayName || 'Active Account'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                          Cloud Synced Across Devices
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsDbModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                          <Database className="w-3.5 h-3.5 text-slate-400" />
                          <span>Database & Device ID</span>
                        </button>

                        <button
                          onClick={() => {
                            logOutUser();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Not Logged In: Sign In / Sign Up Button
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200/80 hover:border-emerald-200"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between gap-2 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
          <div className="flex items-center gap-1.5">
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

          {!currentUser && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
