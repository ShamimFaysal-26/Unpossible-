import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { GoalsTab } from './components/GoalsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { AiAssistantTab } from './components/AiAssistantTab';
import { TransactionModal } from './components/TransactionModal';
import { CsvImportModal } from './components/CsvImportModal';
import { Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, language } = useFinance();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'budgets' && <BudgetsTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'assistant' && <AiAssistantTab />}
      </main>

      {/* Floating AI Assistant Trigger (visible when not on assistant tab) */}
      {activeTab !== 'assistant' && (
        <button
          onClick={() => setActiveTab('assistant')}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg border border-slate-700 transition-all hover:scale-105 active:scale-95 text-xs font-semibold"
          title={language === 'bn' ? 'ফিনসাথী এআই সহকারীর সাথে কথা বলুন' : 'Ask FinSathi AI'}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'ফিনসাথী এআই' : 'Ask FinSathi AI'}</span>
        </button>
      )}

      {/* Modals */}
      <TransactionModal />
      <CsvImportModal />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FinSathi AI</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'bn' ? 'বাংলা ভিত্তিক ব্যক্তিগত অর্থ ব্যবস্থাপনা প্ল্যাটফর্ম' : 'Bangla Personal Finance Management'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>{language === 'bn' ? 'মুদ্রা: বাংলাদেশি টাকা (৳ BDT)' : 'Currency: Bangladeshi Taka (৳ BDT)'}</span>
            <span aria-hidden="true">·</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
