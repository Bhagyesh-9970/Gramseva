import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes, Plus, AlertTriangle, CheckCircle2, Download,
  ArrowRight, Scale, X, Save
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';
import { useAuth } from '../context/AuthContext';

export const StockManagementPage: React.FC = () => {
  const { selectedVillageId } = useVillage();
  const { user } = useAuth();

  const [stocks, setStocks] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Stock receipt form
  const [commodityId, setCommodityId] = useState('');
  const [quantity, setQuantity] = useState(500);
  const [challanNo, setChallanNo] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchStocks = async () => {
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? selectedVillageId : 'v-shiva';
      const [sRes, cRes] = await Promise.all([
        fetch(`/api/pds/stocks?village_id=${vId}`),
        fetch(`/api/pds/commodities`)
      ]);
      if (sRes.ok) setStocks(await sRes.json());
      if (cRes.ok) {
        const commData = await cRes.json();
        setCommodities(commData);
        if (commData.length > 0 && !commodityId) {
          setCommodityId(commData[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [selectedVillageId]);

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? selectedVillageId : 'v-shiva';
      const res = await fetch('/api/pds/stocks/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_id: vId,
          commodity_id: commodityId,
          quantity: Number(quantity),
          supplier_challan_no: challanNo || 'FCI-BUFFER-CHALLAN',
          batch_no: batchNo || 'BATCH-2026-NOV',
          received_by: user ? user.full_name : 'Vilas Namdeo Jadhav',
          notes
        })
      });
      if (res.ok) {
        setIsReceiptModalOpen(false);
        fetchStocks();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
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
                  <Boxes className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Stock & Godown Inventory Management
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Food Corporation of India (FCI) grain receipts, safety stock thresholds, and live inventory depletion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/app/reconciliation"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-xs"
              >
                <Scale className="w-4 h-4 text-sky-600" />
                <span>Physical Stock Audit</span>
              </Link>

              <button
                onClick={() => setIsReceiptModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log Incoming Goods Receipt (GRN)</span>
              </button>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stocks.map(s => {
              const isLow = s.current_stock <= s.min_threshold;
              return (
                <div
                  key={s.id}
                  className={`bg-white dark:bg-slate-900 p-4 rounded-xl border transition-all ${
                    isLow
                      ? 'border-amber-400 dark:border-amber-700 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  } shadow-xs`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{s.commodity_name}</span>
                    {isLow && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                  </div>

                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-2">
                    {s.current_stock.toLocaleString()} <span className="text-xs font-normal text-slate-500">{s.unit}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="flex justify-between">
                      <span>Threshold:</span>
                      <span className="font-mono">{s.min_threshold} {s.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distributed:</span>
                      <span className="font-mono text-emerald-600">{s.distributed_stock_month} {s.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Warehouse Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed Commodity Balance Sheet
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">Opening Balance</th>
                    <th className="py-3 px-4">Monthly Inflow (GRN)</th>
                    <th className="py-3 px-4">Disbursed to Cards</th>
                    <th className="py-3 px-4">Closing Available</th>
                    <th className="py-3 px-4">Safety Limit</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stocks.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {s.commodity_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {s.opening_stock} {s.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                        +{s.received_stock_month} {s.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        -{s.distributed_stock_month} {s.unit}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                        {s.current_stock} {s.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {s.min_threshold} {s.unit}
                      </td>
                      <td className="py-3 px-4">
                        {s.is_low_stock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300">
                            Low Stock Indent Needed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300">
                            Sufficient
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incoming Goods Receipt Note Modal */}
          {isReceiptModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Record Incoming Stock (Goods Receipt Note)
                  </h3>
                  <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddReceipt} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Commodity
                    </label>
                    <select
                      value={commodityId}
                      onChange={e => setCommodityId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      {commodities.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Received Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Supplier Challan No.
                      </label>
                      <input
                        type="text"
                        value={challanNo}
                        onChange={e => setChallanNo(e.target.value)}
                        placeholder="e.g. FCI-PUN-9921"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Batch No.
                      </label>
                      <input
                        type="text"
                        value={batchNo}
                        onChange={e => setBatchNo(e.target.value)}
                        placeholder="BATCH-NOV-01"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Inspection Notes / Moisture Cert
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Gunny bags intact, FCI moisture seal certified."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReceiptModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      {isSaving ? 'Logging Receipt...' : 'Confirm Stock Receipt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
