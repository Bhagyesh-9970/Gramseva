import React, { useState, useEffect } from 'react';
import {
  Scale, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight,
  Info, History, FileText
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';
import { useAuth } from '../context/AuthContext';

export const StockReconciliationPage: React.FC = () => {
  const { selectedVillageId } = useVillage();
  const { user } = useAuth();

  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [physicalStock, setPhysicalStock] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<any>(null);

  const fetchStocks = async () => {
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? selectedVillageId : 'v-shiva';
      const res = await fetch(`/api/pds/stocks?village_id=${vId}`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
        if (data.length > 0 && !selectedStockId) {
          setSelectedStockId(data[0].id);
          setPhysicalStock(data[0].current_stock);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [selectedVillageId]);

  const activeStock = stocks.find(s => s.id === selectedStockId) || stocks[0];
  const expectedStock = activeStock ? (activeStock.opening_stock + activeStock.received_stock_month - activeStock.distributed_stock_month + activeStock.adjusted_stock_month) : 0;
  const mismatch = physicalStock - expectedStock;
  const hasMismatch = Math.abs(mismatch) > 0.1;

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStock) return;
    if (hasMismatch && !explanation.trim()) {
      alert('A formal explanation is required for any physical stock variance.');
      return;
    }

    setIsSubmitting(true);
    setReconciliationResult(null);
    try {
      const res = await fetch('/api/pds/stocks/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_id: activeStock.village_id,
          commodity_id: activeStock.commodity_id,
          physical_stock: Number(physicalStock),
          explanation: explanation || 'Routine zero-variance physical count verified.',
          operator_name: user ? user.full_name : 'Vilas Namdeo Jadhav'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReconciliationResult(data);
        fetchStocks();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Physical Stock Reconciliation Audit
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated reconciliation formula: Expected Closing = Opening + Received - Distributed - Adjustments.
            </p>
          </div>

          {/* Reconciliation Math Rule Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Reconciliation Rule:</strong> Silent overwriting of Godown inventory is prohibited. Any deviation between physical bag counts and the digital book ledger automatically registers an audit log and alerts the District Collectorate if variance exceeds safety limits.
            </div>
          </div>

          {reconciliationResult && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
              reconciliationResult.has_mismatch
                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {reconciliationResult.has_mismatch ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              <div>
                <strong>{reconciliationResult.has_mismatch ? 'Stock Variance Recorded & Flagged' : 'Physical Verification Confirmed Zero Variance'}</strong>:
                Expected {reconciliationResult.expected_stock} vs Physical {reconciliationResult.physical_stock} (Variance: {reconciliationResult.mismatch > 0 ? `+${reconciliationResult.mismatch}` : reconciliationResult.mismatch}). Audit trail updated.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Reconciliation Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Physical Weighment / Bag Count Input
              </h3>

              <form onSubmit={handleReconcile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Godown Commodity
                  </label>
                  <select
                    value={selectedStockId}
                    onChange={e => {
                      setSelectedStockId(e.target.value);
                      const matched = stocks.find(s => s.id === e.target.value);
                      if (matched) setPhysicalStock(matched.current_stock);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {stocks.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.commodity_name} (Current Digital: {s.current_stock} {s.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {activeStock && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400">Opening</span>
                      <div className="font-mono font-bold">{activeStock.opening_stock} {activeStock.unit}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Received (GRN)</span>
                      <div className="font-mono font-bold text-emerald-600">+{activeStock.received_stock_month}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Disbursed</span>
                      <div className="font-mono font-bold text-slate-600">-{activeStock.distributed_stock_month}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Physical Stock Counted in Warehouse ({activeStock?.unit || 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={physicalStock}
                    onChange={e => setPhysicalStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Variance Display Box */}
                <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  hasMismatch
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}>
                  <div>
                    <span className="text-[11px] text-slate-500">Expected Digital Balance:</span>
                    <div className="text-sm font-bold font-mono">{expectedStock.toFixed(1)} {activeStock?.unit}</div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Calculated Mismatch:</span>
                    <div className={`text-sm font-black font-mono ${mismatch < 0 ? 'text-rose-600' : mismatch > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {mismatch > 0 ? `+${mismatch.toFixed(1)}` : mismatch.toFixed(1)} {activeStock?.unit}
                    </div>
                  </div>
                </div>

                {hasMismatch && (
                  <div>
                    <label className="block text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
                      Mandatory Variance Explanation (Auditor Reason)
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={explanation}
                      onChange={e => setExplanation(e.target.value)}
                      placeholder="e.g. Moisture evaporation during summer storage, spillage during unloading, or bag tare deduction."
                      className="w-full px-3 py-2 bg-rose-50/30 dark:bg-slate-800 border border-rose-300 dark:border-rose-900 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording Audit...' : 'Commit Physical Reconciliation'}</span>
                </button>
              </form>
            </div>

            {/* Reconciliation History / Example Panel */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-600" />
                Audit Trail Example & Standards
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  Sample Mismatch Scenario:
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Expected Stock: 1,100 kg</div>
                  <div>Physical Count: 1,040 kg</div>
                  <div className="text-rose-600 font-bold">Mismatch: -60 kg (5.4% deficit)</div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Upon submission, the platform retains both historical numbers and dispatches an incident flag to the District Supply Officer.
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gram Sabha Verified Ledger Format</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Immutable Blockchain-Style Audit Sequence</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
