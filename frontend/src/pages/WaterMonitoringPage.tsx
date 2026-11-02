import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet, Activity, Gauge, AlertTriangle, ArrowRight,
  RefreshCw, CheckCircle2, Radio, Info
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { WaterTankVisual } from '../components/common/WaterTankVisual';
import { useVillage } from '../context/VillageContext';
import { useTelemetry } from '../context/TelemetryContext';

export const WaterMonitoringPage: React.FC = () => {
  const { selectedVillageId, selectedVillage } = useVillage();
  const { liveTanks, liveSensors } = useTelemetry();

  const [tanks, setTanks] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const vParam = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const [tRes, sRes] = await Promise.all([
        fetch(`/api/water/tanks${vParam}`),
        fetch(`/api/water/sensors`)
      ]);
      if (tRes.ok) setTanks(await tRes.json());
      if (sRes.ok) setSensors(await sRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedVillageId]);

  const displayTanks = tanks.map(t => {
    const live = liveTanks.find(lt => lt.id === t.id);
    return live ? { ...t, current_level_pct: live.pct, current_level_liters: live.current_liters, status: live.status } : t;
  });

  const flowSensor = sensors.find(s => s.sensor_type === 'FLOW_PULSE');
  const liveFlow = liveSensors.find(ls => ls.type === 'FLOW_PULSE');
  const flowVal = liveFlow ? liveFlow.value : flowSensor ? flowSensor.current_value : 145.0;

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
                  <Droplet className="w-5 h-5 fill-sky-600/30" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Water Monitoring Dashboard
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time ultrasonic water storage reservoir telemetry & pipeline flow distribution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/app/simulation"
                className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                Simulate Tank Levels
              </Link>
            </div>
          </div>

          {/* Operational Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Reservoirs</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{displayTanks.length} Units</div>
              <span className="text-[11px] text-slate-400">Overhead & Ground sumps</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Potable Reserve</span>
              <div className="text-2xl font-bold text-sky-600 mt-1">
                {Math.round(displayTanks.reduce((acc, t) => acc + (t.current_level_liters || 0), 0)).toLocaleString()} L
              </div>
              <span className="text-[11px] text-slate-400">
                Capacity: {Math.round(displayTanks.reduce((acc, t) => acc + (t.capacity_liters || 0), 0)).toLocaleString()} L
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Distribution Flow Rate</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{flowVal.toFixed(1)} L/min</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Trunk Line In-Spec</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Level Classification</span>
              <div className="flex items-center gap-2 mt-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">&gt;70%</span>
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">30-70%</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">10-30%</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">&lt;10%</span>
              </div>
            </div>
          </div>

          {/* Reservoirs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTanks.map(tank => (
              <div key={tank.id} className="flex flex-col justify-between">
                <WaterTankVisual
                  name={tank.name}
                  levelPct={tank.current_level_pct}
                  currentLiters={tank.current_level_liters}
                  capacityLiters={tank.capacity_liters}
                  status={tank.status}
                  heightMeters={tank.height_meters}
                />
                <Link
                  to={`/app/water/tank/${tank.id}`}
                  className="mt-2 text-center py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Historical 24h Trend & Sensors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
