import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet, ShoppingBag, Activity, AlertTriangle, Users,
  ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, Radio
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { WaterTankVisual } from '../components/common/WaterTankVisual';
import { PumpCard } from '../components/common/PumpCard';
import { useVillage } from '../context/VillageContext';
import { useTelemetry } from '../context/TelemetryContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const OverviewDashboard: React.FC = () => {
  const { selectedVillageId, selectedVillage } = useVillage();
  const { liveTanks, livePumps, mode, isConnected, lastUpdate } = useTelemetry();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [tanks, setTanks] = useState<any[]>([]);
  const [pumps, setPumps] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const vParam = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const [ovRes, tRes, pRes, sRes, aRes] = await Promise.all([
        fetch(`/api/analytics/overview${vParam}`),
        fetch(`/api/water/tanks${vParam}`),
        fetch(`/api/water/pumps${vParam}`),
        fetch(`/api/pds/stocks${vParam}`),
        fetch(`/api/alerts${vParam ? vParam + '&is_resolved=false' : '?is_resolved=false'}`)
      ]);

      if (ovRes.ok) setOverviewMetrics(await ovRes.json());
      if (tRes.ok) setTanks(await tRes.json());
      if (pRes.ok) setPumps(await pRes.json());
      if (sRes.ok) setStocks(await sRes.json());
      if (aRes.ok) setAlerts(await aRes.json());
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedVillageId]);

  // Merge live telemetry if available
  const displayTanks = tanks.map(t => {
    const live = liveTanks.find(lt => lt.id === t.id);
    return live ? { ...t, current_level_pct: live.pct, current_level_liters: live.current_liters, status: live.status } : t;
  });

  const displayPumps = pumps.map(p => {
    const live = livePumps.find(lp => lp.id === p.id);
    return live ? { ...p, is_running: live.is_running, current_amperes: live.current_amperes, fault_status: live.fault_status } : p;
  });

  const handleTogglePump = async (pumpId: string, newState: boolean) => {
    try {
      await fetch(`/api/water/pumps/${pumpId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_running: newState })
      });
      fetchDashboardData();
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedVillage ? selectedVillage.name : 'Central District Command'}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedVillage?.district || 'Pune'} District
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Integrated Gram Panchayat Operations • Telemetry last received at <span className="font-mono text-slate-700 dark:text-slate-300">{lastUpdate || 'Live'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {/* Water Tanks */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total Tanks</span>
                <Droplet className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {overviewMetrics?.water?.total_tanks || tanks.length}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                {overviewMetrics?.water?.low_water_tanks || 0} below 30% reserve
              </div>
            </div>

            {/* Pumps Running */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pumps Active</span>
                <Activity className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {overviewMetrics?.water?.pumps_running || 0} / {overviewMetrics?.water?.pumps_total || pumps.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                {overviewMetrics?.water?.pump_anomalies ? `${overviewMetrics.water.pump_anomalies} Anomaly Detected` : 'All normal draw'}
              </div>
            </div>

            {/* Beneficiaries */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Beneficiaries</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {overviewMetrics?.pds?.total_beneficiaries || 65}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                100% Aadhaar/Card Seeded
              </div>
            </div>

            {/* Monthly Distributed */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Distributed Stock</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {Math.round(overviewMetrics?.pds?.monthly_distribution_total_qty || 4800).toLocaleString()} <span className="text-xs font-normal text-slate-500">kg/L</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Current month quota
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Low Stock Items</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {overviewMetrics?.pds?.low_stock_count || 1}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                Cooking Oil threshold alert
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Service Score</span>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                98.2%
              </div>
              <div className="text-[11px] text-teal-600 font-semibold mt-1">
                IoT Node Uptime
              </div>
            </div>
          </div>

          {/* WATER INFRASTRUCTURE MONITORING PREVIEW */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-sky-600 fill-sky-600/30" />
                  Live Water Reservoir Storage
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous ultrasonic telemetry with auto-refreshing level visualizers.
                </p>
              </div>

              <Link
                to="/app/water"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
              >
                <span>View All Tanks & Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTanks.slice(0, 3).map(tank => (
                <WaterTankVisual
                  key={tank.id}
                  name={tank.name}
                  levelPct={tank.current_level_pct}
                  currentLiters={tank.current_level_liters}
                  capacityLiters={tank.capacity_liters}
                  status={tank.status}
                  heightMeters={tank.height_meters}
                />
              ))}
            </div>
          </section>

          {/* PUMPS & O&M SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  Pump Stations & Current Telemetry
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Non-invasive CT sensors monitor power draw (amperes) to detect dry running and motor faults.
                </p>
              </div>

              <Link
                to="/app/pumps"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
              >
                <span>View Pump Control Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayPumps.map(pump => (
                <PumpCard
                  key={pump.id}
                  id={pump.id}
                  name={pump.name}
                  hpRating={pump.hp_rating}
                  isRunning={pump.is_running}
                  currentAmperes={pump.current_amperes}
                  normalMin={pump.normal_current_min}
                  normalMax={pump.normal_current_max}
                  dailyRuntimeHours={pump.daily_runtime_hours}
                  startsToday={pump.starts_today}
                  faultStatus={pump.fault_status}
                  onToggle={handleTogglePump}
                />
              ))}
            </div>
          </section>

          {/* PUBLIC DISTRIBUTION SYSTEM (PDS) STOCK PREVIEW */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  Fair Price Shop (PDS) Godown Inventory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Subsidized commodities stock balances, safety threshold tracking, and monthly quota status.
                </p>
              </div>

              <Link
                to="/app/distribution"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Open Distribution Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Commodity</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Distributed This Month</th>
                      <th className="py-3 px-4">Price / Unit</th>
                      <th className="py-3 px-4">Safety Threshold</th>
                      <th className="py-3 px-4">Inventory Status</th>
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
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {s.current_stock.toLocaleString()} {s.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {s.distributed_stock_month.toLocaleString()} {s.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            ₹{s.subsidized_price.toFixed(2)} / {s.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
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
          </section>
        </main>
      </div>
    </div>
  );
};
