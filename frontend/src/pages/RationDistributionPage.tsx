import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send, Search, CheckCircle2, AlertTriangle, Printer,
  ShieldCheck, ShoppingBag, X, RefreshCw, UserCheck
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';
import { useAuth } from '../context/AuthContext';

export const RationDistributionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedVillageId } = useVillage();
  const { user } = useAuth();

  const [query, setQuery] = useState(searchParams.get('card') || 'MH-27-010042');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<any>(null);

  // Quick verify when card param is in URL or on initial load
  const handleVerify = async (cardNo?: string) => {
    const q = (cardNo || query).trim();
    if (!q) return;
    setIsVerifying(true);
    setErrorMessage('');
    setReceipt(null);
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? selectedVillageId : 'v-shiva';
      const res = await fetch(`/api/pds/verify?query=${encodeURIComponent(q)}&village_id=${vId}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationData(data);
        // Pre-fill quantities with full remaining quota up to available stock
        const initialQtys: Record<string, number> = {};
        data.items.forEach((item: any) => {
          if (item.can_distribute) {
            initialQtys[item.commodity_id] = Math.min(item.remaining_quota, item.available_stock);
          } else {
            initialQtys[item.commodity_id] = 0;
          }
        });
        setQuantities(initialQtys);
      } else {
        const err = await res.json();
        setVerificationData(null);
        setErrorMessage(err.detail || 'No beneficiary matched this card number.');
      }
    } catch {
      setErrorMessage('Failed to connect to verification service.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleVerify(query);
    }
  }, []);

  const handleDistribute = async () => {
    if (!verificationData) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const itemsPayload = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([cId, qty]) => ({ commodity_id: cId, quantity: Number(qty) }));

      if (itemsPayload.length === 0) {
        setErrorMessage('Please specify quantity > 0 for at least one commodity.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/pds/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiary_id: verificationData.beneficiary.id,
          village_id: selectedVillageId && selectedVillageId !== 'ALL' ? selectedVillageId : verificationData.beneficiary.village_id,
          operator_name: user ? user.full_name : 'Vilas Namdeo Jadhav',
          items: itemsPayload
        })
      });

      if (res.ok) {
        const receiptData = await res.json();
        setReceipt(receiptData);
        // re-verify to update remaining quotas
        handleVerify(verificationData.beneficiary.ration_card_number);
      } else {
        const err = await res.json();
        setErrorMessage(err.detail || 'Distribution failed validation.');
      }
    } catch {
      setErrorMessage('Distribution transaction network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
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
                <Send className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Ration Distribution Desk
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rapid beneficiary card verification, monthly quota check, and atomic inventory checkout.
            </p>
          </div>

          {/* Quick Ration Card Search & Presets */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Enter Ration Card Number / Beneficiary ID / Scan Barcode
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="e.g. MH-27-010042 or BEN-SHIVA-0001"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                <span>{isVerifying ? 'Verifying Card...' : 'Verify Entitlements'}</span>
              </button>
            </div>

            {/* Quick Demo Card Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500">
              <span>Quick Test Cards:</span>
              {[
                { no: 'MH-27-010042', label: 'Anandrao Kadam (PHH Yellow)' },
                { no: 'MH-27-000002', label: 'Demo Card #2 (AAY Antyodaya)' },
                { no: 'MH-27-000005', label: 'Demo Card #5 (PHH BPL)' },
              ].map(c => (
                <button
                  key={c.no}
                  onClick={() => {
                    setQuery(c.no);
                    handleVerify(c.no);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 text-slate-700 dark:text-slate-300 font-mono transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {c.no} ({c.label.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verification Result Card */}
          {verificationData && (
            <div className="space-y-6">
              {/* Beneficiary Badge */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-lg">
                    {verificationData.beneficiary.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {verificationData.beneficiary.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                        {verificationData.beneficiary.ration_card_category} Card
                      </span>
                      <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active & Eligible
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Card: <strong className="font-mono text-slate-700 dark:text-slate-200">{verificationData.beneficiary.ration_card_number}</strong> • Family: {verificationData.beneficiary.family_members_count} Members • Village: {verificationData.beneficiary.village_name}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400">Distribution Period</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {verificationData.month_period}
                  </div>
                </div>
              </div>

              {/* Eligible Commodities Table & Quantity Input */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Eligible Commodity Entitlements
                  </h3>
                  <span className="text-xs text-slate-500">Atomic inventory quota protection active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Commodity</th>
                        <th className="py-3 px-4">Subsidized Price</th>
                        <th className="py-3 px-4">Monthly Quota</th>
                        <th className="py-3 px-4">Already Consumed</th>
                        <th className="py-3 px-4">Remaining Quota</th>
                        <th className="py-3 px-4">Godown Stock</th>
                        <th className="py-3 px-4 w-36">Issue Quantity</th>
                        <th className="py-3 px-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {verificationData.items.map((item: any) => {
                        const qty = quantities[item.commodity_id] || 0;
                        const subtotal = roundPrice(qty * item.subsidized_price);
                        const isMaxed = item.remaining_quota <= 0;
                        const isOut = item.available_stock <= 0;

                        return (
                          <tr key={item.commodity_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {item.commodity_name}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                              ₹{item.subsidized_price.toFixed(2)} / {item.unit}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                              {item.monthly_quota} {item.unit}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {item.current_month_consumed} {item.unit}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                              {item.remaining_quota} {item.unit}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                              {item.available_stock} {item.unit}
                            </td>
                            <td className="py-3 px-4">
                              {isMaxed ? (
                                <span className="text-[11px] text-slate-400 italic">Quota Fulfilled</span>
                              ) : isOut ? (
                                <span className="text-[11px] text-rose-500 font-semibold">Stock Exhausted</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  max={Math.min(item.remaining_quota, item.available_stock)}
                                  step="0.5"
                                  value={qty}
                                  onChange={e => {
                                    const val = Math.max(0, Math.min(
                                      Math.min(item.remaining_quota, item.available_stock),
                                      Number(e.target.value)
                                    ));
                                    setQuantities({ ...quantities, [item.commodity_id]: val });
                                  }}
                                  className="w-28 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                              ₹{subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Checkout Footer Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Total Payable at Fair Price Counter:</span>
                    <div className="text-xl font-black text-emerald-600 font-mono">
                      ₹{calculateTotal(verificationData.items, quantities).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={handleDistribute}
                    disabled={isSubmitting || calculateTotal(verificationData.items, quantities) <= 0}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Processing Transaction...' : 'Confirm & Commit Distribution'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRINTABLE TRANSACTION RECEIPT MODAL */}
          {receipt && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 print:p-0 print:border-none">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Transaction Successful</h3>
                  </div>
                  <button onClick={() => setReceipt(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Formal Printable Receipt Card */}
                <div className="border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-xl space-y-3 text-xs bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      GOVERNMENT OF MAHARASHTRA
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Gram Panchayat Public Distribution System
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-1">
                      TXN ID: {receipt.transaction_code}
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{receipt.beneficiary_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ration Card:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{receipt.ration_card_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time:</span>
                      <span className="text-slate-700 dark:text-slate-300">{new Date(receipt.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fair Price Operator:</span>
                      <span className="text-slate-700 dark:text-slate-300">{receipt.operator_name}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-[11px] mb-1.5 text-slate-800 dark:text-slate-200">
                      Disbursed Commodities:
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {receipt.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.commodity_name} ({it.quantity} {it.unit} @ ₹{it.unit_price})</span>
                          <span className="font-mono font-bold">₹{it.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-300 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-emerald-600">₹{receipt.total_amount.toFixed(2)}</span>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-2 italic">
                    Biometrically verified transaction. Automatically reconciled in godown ledger.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
                  <button
                    onClick={() => setReceipt(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={handlePrintSlip}
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Transaction Slip</span>
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

function roundPrice(val: number): number {
  return Math.round(val * 100) / 100;
}

function calculateTotal(items: any[], quantities: Record<string, number>): number {
  let sum = 0;
  for (const item of items) {
    const qty = quantities[item.commodity_id] || 0;
    sum += qty * item.subsidized_price;
  }
  return roundPrice(sum);
}
