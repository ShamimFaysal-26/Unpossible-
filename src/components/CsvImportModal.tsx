import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, UploadCloud, FileText, Download, Check, AlertCircle } from 'lucide-react';
import { sampleCsvData } from '../data/initialData';
import { Transaction, TransactionCategory, PaymentMethod, TransactionType } from '../types/finance';

export const CsvImportModal: React.FC = () => {
  const { isImportModalOpen, setIsImportModalOpen, importTransactionsFromCsv, formatMoney } = useFinance();
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Omit<Transaction, 'id'>[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isImportModalOpen) return null;

  const handleParse = (text: string) => {
    try {
      setErrorMessage(null);
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setErrorMessage('CSV file must contain a header row and at least one transaction row.');
        setParsedRows([]);
        return;
      }

      const rows: Omit<Transaction, 'id'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
          const date = parts[0] || new Date().toISOString().slice(0, 10);
          const title = parts[1] || 'Unlabeled Expense';
          const amount = parseFloat(parts[2]) || 0;
          const type = (parts[3]?.toLowerCase() === 'income' ? 'income' : 'expense') as TransactionType;
          const category = (parts[4] || 'Other') as TransactionCategory;
          const paymentMethod = (parts[5] || 'Credit Card') as PaymentMethod;
          const note = parts[6] || '';

          if (amount > 0) {
            rows.push({
              title,
              amount,
              type,
              category,
              paymentMethod,
              date,
              note
            });
          }
        }
      }

      if (rows.length === 0) {
        setErrorMessage('No valid transaction rows found. Please check column format.');
      } else {
        setParsedRows(rows);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to parse CSV file');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(sampleCsvData);
    handleParse(sampleCsvData);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finsathi_sample_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = () => {
    if (parsedRows.length === 0) return;
    const count = importTransactionsFromCsv(parsedRows);
    alert(`Successfully imported ${count} transactions into your ledger!`);
    setIsImportModalOpen(false);
    setParsedRows([]);
    setCsvText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Import Transactions via CSV
            </h2>
            <p className="text-xs text-slate-500">
              Bulk upload transaction history from bank exports or spreadsheets
            </p>
          </div>
          <button
            onClick={() => setIsImportModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-semibold rounded-lg shadow-2xs hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span>Upload CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Sample Data</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Paste or view text */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Or paste raw CSV text directly:
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder="Date,Title,Amount,Type,Category,PaymentMethod,Note&#10;2026-10-01,Salary,5200,income,Salary,Bank Transfer,..."
              className="w-full p-2.5 font-tabular text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Parsed Records: {parsedRows.length}
                </span>
                <span className="text-slate-400">
                  Verify before committing to ledger
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 font-tabular text-slate-500">{r.date}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-800 truncate max-w-[150px]">{r.title}</td>
                        <td className="py-1.5 px-3 text-slate-600">{r.category}</td>
                        <td className="py-1.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${r.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right font-tabular font-bold text-slate-900">
                          {formatMoney(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleImportSubmit}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs active:scale-95"
          >
            Confirm Import ({parsedRows.length} Rows)
          </button>
        </div>
      </div>
    </div>
  );
};
