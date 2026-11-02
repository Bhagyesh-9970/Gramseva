import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Printer, Download, Eye, X,
  ShoppingBag, CheckCircle2, Calendar
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';

export const TransactionHistoryPage: React.FC = () => {
  const { selectedVillageId } = useVillage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const fetchTransactions = async () => {
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const res = await fetch(`/api/pds/transactions${vId}`);
      if (res.ok) setTransactions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedVillageId]);

  const filtered = transactions.filter(t =>
    t.transaction_code.toLowerCase().includes(search.toLowerCase()) ||
    t.beneficiary_name.toLowerCase().includes(search.toLowerCase()) ||
    t.ration_card_number.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Transaction Code,Date,Beneficiary,Ration Card,Items,Amount,Operator'];
    const rows = filtered.map(t => {
      const itemsStr = t.items.map((i: any) => `${i.commodity_name}: ${i.quantity} ${i.unit}`).join('; ');
      return `"${t.transaction_code}","${t.created_at}","${t.beneficiary_name}","${t.ration_card_number}","${itemsStr}",${t.total_amount},"${t.operator_name}"`;
    });
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${selectedVillageId || 'all'}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Distribution Transaction Ledger
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Complete historical record of food grain dispatches, biometric verifications, and financial receipts.
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger CSV</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search transaction ID, card no, or name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Transaction Code</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Beneficiary</th>
                    <th className="py-3 px-4">Ration Card</th>
                    <th className="py-3 px-4">Commodity Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {t.transaction_code}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {t.beneficiary_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {t.ration_card_number}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {t.items.map((i: any) => `${i.commodity_name} (${i.quantity} ${i.unit})`).join(' • ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                        ₹{t.total_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {t.operator_name}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setActiveReceipt(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt Modal */}
          {activeReceipt && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 print:p-0">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
                  <h3 className="font-bold text-slate-900 dark:text-white">Ration Distribution Slip</h3>
                  <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-xl space-y-3 text-xs bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="font-extrabold text-slate-900 dark:text-white">GOVERNMENT OF MAHARASHTRA</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">Public Distribution System (PDS)</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">TXN: {activeReceipt.transaction_code}</div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary:</span>
                      <span className="font-bold">{activeReceipt.beneficiary_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ration Card:</span>
                      <span className="font-mono font-bold">{activeReceipt.ration_card_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span>{new Date(activeReceipt.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">FPS Operator:</span>
                      <span>{activeReceipt.operator_name}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-[11px] mb-1">Disbursed Commodities:</div>
                    <div className="space-y-1 text-[11px]">
                      {activeReceipt.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.commodity_name} ({it.quantity} {it.unit} @ ₹{it.unit_price})</span>
                          <span className="font-mono font-bold">₹{it.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-300 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-emerald-600">₹{activeReceipt.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
                  <button
                    onClick={() => setActiveReceipt(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
