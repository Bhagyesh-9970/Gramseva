import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Droplet, ArrowLeft, Activity, Gauge, Clock, Calendar,
  ShieldCheck, RefreshCw, Cpu
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { WaterTankVisual } from '../components/common/WaterTankVisual';

export const TankDetailsPage: React.FC = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const [tank, setTank] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [hours, setHours] = useState(24);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTankData = async () => {
    if (!tankId) return;
    try {
      const [tRes, hRes] = await Promise.all([
        fetch(`/api/water/tanks/${tankId}`),
        fetch(`/api/water/tanks/${tankId}/history?hours=${hours}`)
      ]);
      if (tRes.ok) setTank(await tRes.json());
      if (hRes.ok) setHistory(await hRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTankData();
  }, [tankId, hours]);

  if (isLoading || !tank) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 p-8 text-center text-xs text-slate-500">Loading reservoir telemetry...</div>
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
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/app/water"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Water Overview</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Time Filter:</span>
              {[12, 24, 48].map(h => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    hours === h
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {h} Hours
                </button>
              ))}
            </div>
          </div>

          {/* Title Header */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {tank.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Location: {tank.location_desc || 'Main Waterworks compound'} • Village: {tank.village_name}
            </p>
          </div>

          {/* Top Tank Visual & Level Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <WaterTankVisual
                name={tank.name}
                levelPct={tank.current_level_pct}
                currentLiters={tank.current_level_liters}
                capacityLiters={tank.capacity_liters}
                status={tank.status}
                heightMeters={tank.height_meters}
              />
            </div>

            {/* Historical Telemetry Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    Water Level Trend ({hours}h Telemetry History)
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Sampled from Ultrasonic Level Sensor JSN-SR04T</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="tankHistGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}%`, 'Level']}
                    />
                    <Area type="monotone" dataKey="level_pct" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#tankHistGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Linked Sensors and Pumps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connected Pumps */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                Linked Inflow / Outflow Pumps
              </h3>
              {tank.pumps && tank.pumps.length > 0 ? (
                <div className="space-y-2">
                  {tank.pumps.map((p: any) => (
                    <div key={p.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">{p.name}</div>
                        <div className="text-[11px] text-slate-500">Current Draw: {p.current_amperes} A</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        p.is_running ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.is_running ? 'RUNNING' : 'IDLE'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No dedicated pumps linked directly to this reservoir.</p>
              )}
            </div>

            {/* Connected Sensors */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Installed IoT Sensing Hardware
              </h3>
              <div className="space-y-2">
                {tank.sensors && tank.sensors.map((s: any) => (
                  <div key={s.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{s.uid}</div>
                      <div className="text-[11px] text-slate-500">Type: {s.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sky-600 dark:text-sky-400">{s.value} {s.unit}</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
