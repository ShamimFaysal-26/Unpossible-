import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const UnusualSpendingAlert: React.FC = () => {
  const { anomalyAlerts, language, formatTaka, setActiveTab } = useFinance();

  if (!anomalyAlerts || anomalyAlerts.length === 0) {
    return null;
  }

  const primaryAlert = anomalyAlerts[0];

  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-4 sm:p-5 shadow-xs mb-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                {language === 'bn' ? 'অস্বাভাবিক ব্যয় শনাক্ত' : 'Unusual Spending Detected'}
              </span>
              <span className="text-xs text-amber-700 font-medium">
                {language === 'bn' ? 'এআই অডিট' : 'AI Behavioral Audit'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {primaryAlert.transactionTitle} &mdash; <span className="font-tabular font-bold text-amber-950">{formatTaka(primaryAlert.amount)}</span>
            </p>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {language === 'bn' ? primaryAlert.explanationBn : primaryAlert.explanationEn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <button
            onClick={() => setActiveTab('assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এআই পরামর্শ নিন' : 'Consult AI Advisor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
