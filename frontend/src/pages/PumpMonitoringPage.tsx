import React, { useState, useEffect } from 'react';
import {
  Activity, Power, AlertTriangle, Clock, RefreshCw,
  Zap, Info, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { PumpCard } from '../components/common/PumpCard';
import { useVillage } from '../context/VillageContext';
import { useTelemetry } from '../context/TelemetryContext';

export const PumpMonitoringPage: React.FC = () => {
  const { selectedVillageId } = useVillage();
  const { livePumps } = useTelemetry();

  const [pumps, setPumps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPumps = async () => {
    try {
      const vParam = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const res = await fetch(`/api/water/pumps${vParam}`);
      if (res.ok) setPumps(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPumps();
  }, [selectedVillageId]);

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
      fetchPumps();
    } catch (e) {
      console.error(e);
    }
  };

  // Generate realistic 12-hour current trend data
  const currentChartData = [
    { time: '06:00', pump1: 13.8, pump2: 0.0, pump3: 8.5 },
    { time: '08:00', pump1: 14.1, pump2: 10.2, pump3: 8.4 },
    { time: '10:00', pump1: 13.6, pump2: 0.0, pump3: 4.2 }, // dry run anomaly
    { time: '12:00', pump1: 0.0, pump2: 0.0, pump3: 4.1 },
    { time: '14:00', pump1: 13.9, pump2: 10.4, pump3: 4.2 },
    { time: '16:00', pump1: 14.2, pump2: 0.0, pump3: 4.0 },
    { time: 'Now', pump1: displayPumps[0]?.current_amperes || 13.8, pump2: displayPumps[1]?.current_amperes || 0.0, pump3: displayPumps[2]?.current_amperes || 4.2 }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Pumping Stations & Digital O&M
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Motor current telemetry (CT sensor), electrical fault diagnostics, and dry-run protection.
              </p>
            </div>

            <button
              onClick={fetchPumps}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {/* Fault warning callout */}
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Abnormal Current Detection Logic:</strong> When a pump is ON, if current consumption drops below its baseline minimum (e.g. &lt;6.5A on 5HP unit), the system automatically flags a <em>Possible Dry-Run or Intake Air Suction Warning</em>. Operators are notified to inspect the borehole before motor overheating occurs.
            </div>
          </div>

          {/* Pump Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Motor Current Telemetry Trend */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Real-Time Motor Current (Amperes) History
                </h3>
                <span className="text-[11px] text-slate-500">Non-invasive split-core CT sensors (SCT-013)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="A" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="pump1" name="River Intake (10HP)" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pump2" name="Booster (7.5HP)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pump3" name="Borewell Feeder (5HP)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
