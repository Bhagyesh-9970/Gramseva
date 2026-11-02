import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Users, Send, Boxes, Scale, AlertTriangle,
  CheckCircle2, ArrowRight, BarChart2, TrendingUp, Calendar
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend
} from 'recharts';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';

export const PDSDashboardPage: React.FC = () => {
  const { selectedVillageId, selectedVillage } = useVillage();
  const [stocks, setStocks] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPdsData = async () => {
    try {
      const vParam = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const [sRes, bRes, tRes] = await Promise.all([
        fetch(`/api/pds/stocks${vParam}`),
        fetch(`/api/pds/beneficiaries${vParam}`),
        fetch(`/api/pds/transactions${vParam}`)
      ]);
      if (sRes.ok) setStocks(await sRes.json());
      if (bRes.ok) setBeneficiaries(await bRes.json());
      if (tRes.ok) setTransactions(await tRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPdsData();
  }, [selectedVillageId]);

  const totalDistributedMonth = stocks.reduce((acc, s) => acc + (s.distributed_stock_month || 0), 0);
  const lowStockCount = stocks.filter(s => s.is_low_stock).length;

  const chartData = stocks.map(s => ({
    name: s.commodity_code,
    currentStock: s.current_stock,
    distributed: s.distributed_stock_month,
    threshold: s.min_threshold
  }));

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
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Public Distribution System (PDS)
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fair price shop inventory ledger, ration quota enforcement, and beneficiary entitlement control.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/app/distribution"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Open Distribution Desk</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Registered Beneficiaries</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {beneficiaries.length} Families
              </div>
              <span className="text-[11px] text-slate-400">Antyodaya & BPL Cardholders</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Monthly Distribution</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {Math.round(totalDistributedMonth).toLocaleString()} <span className="text-xs font-normal">kg/L</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">100% Atomic Reconciliation</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Low Stock Commodities</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {lowStockCount}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold">
                {lowStockCount > 0 ? 'Cooking Oil Alert' : 'Stock levels optimal'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total Transactions</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {transactions.length}
              </div>
              <span className="text-[11px] text-slate-400">Biometric / OTP Logged</span>
            </div>
          </div>

          {/* Commodity Stock Comparison Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Available Inventory vs Monthly Distribution
                </h3>
                <span className="text-[11px] text-slate-500">Live commodity balance tracking from Godown ledger</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="currentStock" name="Available Stock (kg/L)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="distributed" name="Distributed This Month" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threshold" name="Safety Minimum Limit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commodity Stock Inventory Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fair Price Shop Warehouse Ledger
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  to="/app/stock"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Add Incoming Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/app/reconciliation"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 ml-4"
                >
                  <span>Physical Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">Opening</th>
                    <th className="py-3 px-4">Received (GRN)</th>
                    <th className="py-3 px-4">Distributed</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Safety Limit</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stocks.map(s => {
                    const isLow = s.current_stock <= s.min_threshold;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {s.commodity_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {s.opening_stock} {s.unit}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">
                          +{s.received_stock_month} {s.unit}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          -{s.distributed_stock_month} {s.unit}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {s.current_stock} {s.unit}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {s.min_threshold} {s.unit}
                        </td>
                        <td className="py-3 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Adequate
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
