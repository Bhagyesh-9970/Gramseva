import React from 'react';

interface WaterTankVisualProps {
  name: string;
  levelPct: number;
  currentLiters: number;
  capacityLiters: number;
  status: 'NORMAL' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  heightMeters?: number;
}

export const WaterTankVisual: React.FC<WaterTankVisualProps> = ({
  name,
  levelPct,
  currentLiters,
  capacityLiters,
  status,
  heightMeters = 5.0,
}) => {
  // Clamp level between 0 and 100
  const clampedLevel = Math.max(0, Math.min(100, levelPct));
  const waterHeight = (clampedLevel / 100) * 140; // 140px is max interior tank height
  const waterY = 160 - waterHeight;

  // Status color mappings
  let statusBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
  let waterFillColor = 'url(#waterGradNormal)';
  let waveColor = '#0284c7';

  if (status === 'CRITICAL' || clampedLevel < 10) {
    statusBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse';
    waterFillColor = 'url(#waterGradCritical)';
    waveColor = '#e11d48';
  } else if (status === 'LOW' || clampedLevel < 30) {
    statusBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800';
    waterFillColor = 'url(#waterGradLow)';
    waveColor = '#d97706';
  } else if (status === 'MEDIUM' || clampedLevel < 70) {
    statusBadgeColor = 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800';
    waterFillColor = 'url(#waterGradNormal)';
    waveColor = '#0284c7';
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">{name}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">Cap: {capacityLiters.toLocaleString()} L</span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-4 my-2">
        {/* SVG Tank Rendering */}
        <div className="relative w-28 h-44 flex-shrink-0">
          <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-sm overflow-visible">
            <defs>
              <linearGradient id="waterGradNormal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="waterGradLow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="waterGradCritical" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.95" />
              </linearGradient>
              <clipPath id={`tankClip-${name.replace(/\s+/g, '')}`}>
                <rect x="15" y="20" width="70" height="140" rx="8" />
              </clipPath>
            </defs>

            {/* Tank structural pillars / staging */}
            <line x1="22" y1="160" x2="16" y2="178" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="78" y1="160" x2="84" y2="178" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="160" x2="50" y2="178" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="12" y1="178" x2="88" y2="178" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />

            {/* Tank Chamber Outer Shell */}
            <rect x="15" y="20" width="70" height="140" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-600" />

            {/* Ultrasonic Sensor Icon on top */}
            <rect x="42" y="14" width="16" height="6" rx="2" fill="#0284c7" />
            <line x1="50" y1="20" x2="50" y2="28" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2 2" />

            {/* Water Fill with Clip Path */}
            <g clipPath={`url(#tankClip-${name.replace(/\s+/g, '')})`}>
              <rect
                x="15"
                y={waterY}
                width="70"
                height={waterHeight}
                fill={waterFillColor}
                className="transition-all duration-700 ease-in-out"
              />
              {/* Wave ripples */}
              {clampedLevel > 3 && (
                <path
                  d={`M 15 ${waterY} Q 32 ${waterY - 3} 50 ${waterY} T 85 ${waterY} L 85 ${waterY + 10} L 15 ${waterY + 10} Z`}
                  fill={waveColor}
                  opacity="0.5"
                  className="animate-water-wave"
                />
              )}
            </g>

            {/* Level markers (25%, 50%, 75%) */}
            <line x1="16" y1="55" x2="22" y2="55" stroke="#94a3b8" strokeWidth="1" />
            <line x1="16" y1="90" x2="24" y2="90" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="16" y1="125" x2="22" y2="125" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        </div>

        {/* Level Stats Breakdown */}
        <div className="flex-1 space-y-2">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {clampedLevel.toFixed(1)}%
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Volume: <strong className="text-slate-800 dark:text-slate-200">{Math.round(currentLiters).toLocaleString()} Litres</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Height:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{heightMeters} m</span>
            </div>
            <div className="flex justify-between">
              <span>Telemetry:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
