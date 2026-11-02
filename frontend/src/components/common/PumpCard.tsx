import React, { useState } from 'react';
import { Activity, Power, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface PumpCardProps {
  id: string;
  name: string;
  hpRating: number;
  isRunning: boolean;
  currentAmperes: number;
  normalMin: number;
  normalMax: number;
  dailyRuntimeHours: number;
  startsToday: number;
  faultStatus: string;
  onToggle?: (pumpId: string, newState: boolean) => Promise<void>;
  readOnly?: boolean;
}

export const PumpCard: React.FC<PumpCardProps> = ({
  id,
  name,
  hpRating,
  isRunning,
  currentAmperes,
  normalMin,
  normalMax,
  dailyRuntimeHours,
  startsToday,
  faultStatus,
  onToggle,
  readOnly = false,
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!onToggle || isToggling || readOnly) return;
    setIsToggling(true);
    try {
      await onToggle(id, !isRunning);
    } finally {
      setIsToggling(false);
    }
  };

  const isDryRunWarning = faultStatus === 'DRY_RUN_WARNING' || (isRunning && currentAmperes > 0 && currentAmperes < normalMin);
  const isOverloadWarning = faultStatus === 'OVERLOAD_WARNING' || (currentAmperes > normalMax);
  const isTripped = faultStatus === 'TRIP';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl p-5 border transition-all ${
      isTripped
        ? 'border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/20'
        : isDryRunWarning
        ? 'border-amber-400 dark:border-amber-800 ring-2 ring-amber-500/20'
        : 'border-slate-200 dark:border-slate-800'
    } shadow-sm hover:shadow-md`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{name}</h4>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-4.5">{hpRating} HP Motor Spec</span>
        </div>

        {!readOnly && (
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isToggling ? 'Switching...' : isRunning ? 'Stop Pump' : 'Start Pump'}
          </button>
        )}
      </div>

      {/* Fault / Anomaly Banner */}
      {isDryRunWarning && (
        <div className="my-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Possible Dry-Run Warning:</strong> Motor draw ({currentAmperes}A) is unusually below normal rating ({normalMin}A - {normalMax}A). Water level in source may be low.
          </div>
        </div>
      )}

      {isTripped && (
        <div className="my-2.5 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Pump Protection Tripped:</strong> Thermal overload or electrical fault detected. Manual inspection required.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-500" /> Current
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
            {isRunning ? `${currentAmperes.toFixed(1)} A` : '0.0 A'}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" /> Runtime
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
            {dailyRuntimeHours.toFixed(1)} hrs
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-purple-500" /> Starts
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
            {startsToday}
          </div>
        </div>
      </div>
    </div>
  );
};
