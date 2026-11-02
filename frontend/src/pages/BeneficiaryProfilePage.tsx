import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users, ArrowLeft, ShoppingBag, Send, ShieldCheck,
  Calendar, Phone, MapPin, CheckCircle2, Clock
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';

export const BeneficiaryProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const [bRes, tRes] = await Promise.all([
        fetch(`/api/pds/beneficiaries`),
        fetch(`/api/pds/transactions`)
      ]);
      if (bRes.ok && tRes.ok) {
        const bData = await bRes.json();
        const tData = await tRes.json();
        const found = bData.find((b: any) => b.id === id);
        if (found) {
          setBeneficiary(found);
          const benTxns = tData.filter((t: any) => t.beneficiary_id === id);
          setTransactions(benTxns);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (!beneficiary) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 p-8 text-center text-xs text-slate-500">Loading beneficiary profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Link
            to="/app/beneficiaries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Beneficiaries</span>
          </Link>

          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-xl flex items-center justify-center shadow-xs">
                {beneficiary.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white">
                    {beneficiary.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                    {beneficiary.ration_card_category} Card
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Card No: <strong className="font-mono text-slate-700 dark:text-slate-200">{beneficiary.ration_card_number}</strong> • Code: {beneficiary.beneficiary_code}
                </p>
              </div>
            </div>

            <Link
              to={`/app/distribution?card=${beneficiary.ration_card_number}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Issue Ration to this Card</span>
            </Link>
          </div>

          {/* Details & Monthly Entitlements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Household Info */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Household Information</h3>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Head of Family:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{beneficiary.head_of_family}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Family Members:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{beneficiary.family_members_count}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Village:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{beneficiary.village_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{beneficiary.contact_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Aadhaar Status:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Biometrically Linked
                </span>
              </div>
            </div>

            {/* Monthly Entitlement Quota Cards */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Current Month Grain & Commodity Entitlements
                  </h3>
                  <span className="text-[11px] text-slate-500">Guaranteed quotas under National Food Security Act (NFSA)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {beneficiary.entitlements && beneficiary.entitlements.map((e: any) => {
                  const pct = Math.min(100, Math.round((e.current_month_consumed / e.monthly_quota) * 100));
                  return (
                    <div key={e.commodity_id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{e.commodity_name}</span>
                        <span className="font-mono text-emerald-600 font-bold">₹{e.unit_price}/ {e.unit}</span>
                      </div>

                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Quota: <strong>{e.monthly_quota} {e.unit}</strong></span>
                        <span>Remaining: <strong className="text-emerald-600">{e.remaining_quota} {e.unit}</strong></span>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Past Transactions for this Beneficiary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ration Distribution History for this Card
              </h3>
            </div>

            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4">Transaction Code</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Items Distributed</th>
                      <th className="py-3 px-4">Total Price</th>
                      <th className="py-3 px-4">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-sky-600">
                          {txn.transaction_code}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(txn.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {txn.items.map((i: any) => `${i.commodity_name}: ${i.quantity} ${i.unit}`).join(' • ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                          ₹{txn.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {txn.operator_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No previous distribution transactions found for this month yet.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
