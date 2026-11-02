import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, Printer, Droplet, ShoppingBag,
  FileText, Calendar, Filter, CheckCircle2
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';

export const ReportsPage: React.FC = () => {
  const { selectedVillageId, selectedVillage } = useVillage();
  const [activeTab, setActiveTab] = useState<'WATER' | 'PDS'>('WATER');
  const [waterReport, setWaterReport] = useState<any>(null);
  const [pdsReport, setPdsReport] = useState<any>(null);

  const fetchReports = async () => {
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const [wRes, pRes] = await Promise.all([
        fetch(`/api/analytics/reports/water${vId}`),
        fetch(`/api/analytics/reports/pds${vId}`)
      ]);
      if (wRes.ok) setWaterReport(await wRes.json());
      if (pRes.ok) setPdsReport(await pRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedVillageId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = '';
    let rows: string[] = [];

    if (activeTab === 'WATER' && waterReport) {
      headers = 'Asset Type,Name,Capacity / Rating,Current Level / Runtime,Status\n';
      rows = waterReport.tanks.map((t: any) => `"Tank","${t.name}",${t.capacity},${t.percentage}%,"${t.status}"`);
      rows = rows.concat(waterReport.pumps.map((p: any) => `"Pump","${p.name}","${p.hp_rating} HP","${p.runtime_hours} hrs","${p.status}"`));
    } else if (pdsReport) {
      headers = 'Commodity,Opening Stock,Received Month,Distributed Month,Closing Stock,Unit,Threshold\n';
      rows = pdsReport.stocks.map((s: any) => `"${s.commodity}",${s.opening_stock},${s.received_month},${s.distributed_month},${s.closing_stock},"${s.unit}",${s.threshold}`);
    }

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gram_panchayat_${activeTab.toLowerCase()}_report.csv`;
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
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Gram Sabha Governance Reports
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official auditable records for Water Supply Operations and Public Distribution Services.
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Report</span>
              </button>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden">
            <button
              onClick={() => setActiveTab('WATER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'WATER'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Droplet className="w-4 h-4" />
              <span>Water Infrastructure Report</span>
            </button>

            <button
              onClick={() => setActiveTab('PDS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'PDS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>PDS Stock & Ration Audit Report</span>
            </button>
          </div>

          {/* WATER REPORT VIEW */}
          {activeTab === 'WATER' && waterReport && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="font-extrabold text-base text-slate-900 dark:text-white">
                  GRAM PANCHAYAT WATER SUPPLY OPERATIONAL AUDIT
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Jurisdiction: {selectedVillage ? selectedVillage.name : 'All Gram Panchayats'} • Generated: {new Date(waterReport.generated_at).toLocaleString()}
                </div>
              </div>

              {/* Water Summary Metrics */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400">Total Storage Capacity</span>
                  <div className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-1">
                    {waterReport.total_capacity_liters.toLocaleString()} Litres
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400">Current Water Volume</span>
                  <div className="font-mono font-bold text-lg text-sky-600 mt-1">
                    {waterReport.total_water_stored_liters.toLocaleString()} Litres
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400">Average Reservoir Level</span>
                  <div className="font-mono font-bold text-lg text-emerald-600 mt-1">
                    {waterReport.average_storage_pct}%
                  </div>
                </div>
              </div>

              {/* Reservoir Status Table */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Overhead & Ground Storage Reservoirs</h4>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Reservoir Name</th>
                      <th className="py-2.5 px-3">Capacity</th>
                      <th className="py-2.5 px-3">Current Volume</th>
                      <th className="py-2.5 px-3">Level %</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {waterReport.tanks.map((t: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold">{t.name}</td>
                        <td className="py-2.5 px-3 font-mono">{t.capacity.toLocaleString()} L</td>
                        <td className="py-2.5 px-3 font-mono">{t.current_level.toLocaleString()} L</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{t.percentage}%</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pump Duty Cycles Table */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Pump Station Telemetry & Electrical Health</h4>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Pump Unit</th>
                      <th className="py-2.5 px-3">Motor Spec</th>
                      <th className="py-2.5 px-3">Current Draw</th>
                      <th className="py-2.5 px-3">Daily Runtime</th>
                      <th className="py-2.5 px-3">Start Cycles</th>
                      <th className="py-2.5 px-3">Fault Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {waterReport.pumps.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono">{p.hp_rating} HP</td>
                        <td className="py-2.5 px-3 font-mono">{p.current_amperes} A</td>
                        <td className="py-2.5 px-3 font-mono">{p.runtime_hours} hrs</td>
                        <td className="py-2.5 px-3 font-mono">{p.starts_today}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.fault === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.fault}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PDS REPORT VIEW */}
          {activeTab === 'PDS' && pdsReport && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="font-extrabold text-base text-slate-900 dark:text-white">
                  PUBLIC DISTRIBUTION SYSTEM GRAIN ALLOCATION & STOCK RECONCILIATION
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Fair Price Shop Godown Record • Generated: {new Date(pdsReport.generated_at).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400">Total Transactions Executed</span>
                  <div className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-1">
                    {pdsReport.total_transactions_count} Beneficiary Receipts
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400">Total Subsidized Turnover</span>
                  <div className="font-mono font-bold text-lg text-emerald-600 mt-1">
                    ₹{pdsReport.total_distributed_value.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Commodity Inventory Balance Sheet</h4>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Commodity</th>
                      <th className="py-2.5 px-3">Opening</th>
                      <th className="py-2.5 px-3">Received</th>
                      <th className="py-2.5 px-3">Distributed</th>
                      <th className="py-2.5 px-3">Closing Stock</th>
                      <th className="py-2.5 px-3">Safety Limit</th>
                      <th className="py-2.5 px-3">Variance Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pdsReport.stocks.map((s: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold">{s.commodity}</td>
                        <td className="py-2.5 px-3 font-mono">{s.opening_stock} {s.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">+{s.received_month}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">-{s.distributed_month}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{s.closing_stock} {s.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{s.threshold} {s.unit}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
