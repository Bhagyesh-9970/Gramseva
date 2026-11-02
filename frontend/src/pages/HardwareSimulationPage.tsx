import React, { useState } from 'react';
import {
  Cpu, Play, Pause, RotateCcw, Zap, Droplet, Activity,
  Wifi, Server, CheckCircle2, AlertTriangle, ShieldCheck,
  Radio, Sliders, ArrowRight
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { HardwareArchDiagram } from '../components/common/HardwareArchDiagram';
import { useTelemetry } from '../context/TelemetryContext';

export const HardwareSimulationPage: React.FC = () => {
  const {
    isSimRunning, simSpeed, activeScenario, mode,
    hardwarePanel, lastUpdate, controlSim, triggerScenario,
    manualAdjust, toggleMode
  } = useTelemetry();

  const [selectedTankId, setSelectedTankId] = useState('tank-01');
  const [tankManualLevel, setTankManualLevel] = useState(70);
  const [selectedPumpId, setSelectedPumpId] = useState('pump-01');
  const [pumpManualCurrent, setPumpManualCurrent] = useState(13.8);
  const [flowRateManual, setFlowRateManual] = useState(145);

  const scenarios = [
    {
      id: 'NORMAL',
      name: '1. Normal Water Supply',
      desc: 'All reservoir levels normal (>70%), intake pump drawing 13.8A nominal current, pipeline flow stable at 145 L/min.',
      badge: 'Normal State',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
    },
    {
      id: 'TANK_LOW',
      name: '2. Tank Running Low',
      desc: 'Main ESR drops to 18% reserve. Triggers automated low reservoir alarm for water operator.',
      badge: 'Low Reserve Alert',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    },
    {
      id: 'PUMP_ANOMALY',
      name: '3. Pump Abnormal Current',
      desc: 'Pump CT sensor registers 4.1A instead of standard 13.5A. Detects possible well drawdown dry-run condition.',
      badge: 'Dry-Run Warning',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    },
    {
      id: 'PUMP_FAILURE',
      name: '4. Pump Failure (Trip)',
      desc: 'Thermal overload protection trip simulated. Motor shuts down, generating a critical maintenance event.',
      badge: 'Critical Fault',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
    },
    {
      id: 'LEAKAGE',
      name: '5. Pipeline Leakage Suspected',
      desc: 'Flow sensor spikes to 240 L/min without corresponding reservoir rise, indicating distribution trunk burst.',
      badge: 'Burst/Leakage Alert',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
    },
    {
      id: 'SENSOR_OFFLINE',
      name: '6. Sensor Offline / Timeout',
      desc: 'ESP32 heartbeat packets timeout. Simulates damaged sensor cable or power disconnection.',
      badge: 'Offline Warning',
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Hardware Simulation Engine
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Virtual ESP32 microcontroller and MQTT telemetry bench for zero-hardware field demonstrations.
              </p>
            </div>

            {/* Mode Switch Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">Mode:</span>
              <button
                onClick={() => toggleMode('SIMULATION')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'SIMULATION'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                SIMULATION
              </button>
              <button
                onClick={() => toggleMode('LIVE_HARDWARE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'LIVE_HARDWARE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                LIVE HARDWARE
              </button>
            </div>
          </div>

          {/* Master Simulator Controls */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isSimRunning ? (
                  <button
                    onClick={() => controlSim('PAUSE')}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={() => controlSim('START')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume Simulation</span>
                  </button>
                )}

                <button
                  onClick={() => controlSim('RESET')}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Sensors</span>
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Simulation Speed:</span>
                {[0.5, 1.0, 2.0, 5.0].map(s => (
                  <button
                    key={s}
                    onClick={() => controlSim(isSimRunning ? 'START' : 'PAUSE', s)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      simSpeed === s
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6 PREDEFINED SCENARIOS */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Predefined Field Scenarios (One-Click Injection)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(sc => {
                const isSelected = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => triggerScenario(sc.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 ring-2 ring-sky-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    } shadow-xs`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{sc.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badgeColor}`}>
                        {sc.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {sc.desc}
                    </p>
                    <div className="mt-3 text-[11px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <span>{isSelected ? 'Currently Active' : 'Inject Scenario'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MANUAL SENSOR CALIBRATION / OVERRIDE BENCH */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Manual Sensor Calibration Controls
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level Sensor Slider */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Water Level Sensor</span>
                  <span className="font-mono font-bold text-sky-600">{tankManualLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tankManualLevel}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setTankManualLevel(val);
                    manualAdjust('WATER_LEVEL', selectedTankId, val);
                  }}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (Empty)</span>
                  <span>50%</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              {/* CT Current Sensor Slider */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Pump Current Draw</span>
                  <span className="font-mono font-bold text-amber-600">{pumpManualCurrent} A</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.1"
                  value={pumpManualCurrent}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setPumpManualCurrent(val);
                    manualAdjust('CURRENT', selectedPumpId, val);
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0A (Off)</span>
                  <span>4A (Dry Run)</span>
                  <span>14A (Nominal)</span>
                  <span>22A (Overload)</span>
                </div>
              </div>

              {/* Flow Sensor Slider */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Pipeline Flow Sensor</span>
                  <span className="font-mono font-bold text-emerald-600">{flowRateManual} L/min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={flowRateManual}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFlowRateManual(val);
                    manualAdjust('FLOW', 'sens-flow-01', val);
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 L/min</span>
                  <span>145 (Normal)</span>
                  <span>250 (Leakage)</span>
                </div>
              </div>
            </div>
          </div>

          {/* HARDWARE STATUS & MQTT PANEL */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              ESP32 Controller & MQTT Telemetry Bus
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-500 text-[11px]">ESP32 Device Node</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {hardwarePanel?.esp32_device_id || 'ESP32-NODE-01-SHIVA'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-500 text-[11px]">IP Address</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {hardwarePanel?.ip_address || '192.168.1.101'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-500 text-[11px]">MQTT Broker</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {hardwarePanel?.mqtt_broker || 'broker.hivemq.com:1883'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-500 text-[11px]">MQTT Telemetry Topic</span>
                <div className="font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5 truncate">
                  {hardwarePanel?.active_topic || 'smartpanchayat/v1/shiva/node1/telemetry'}
                </div>
              </div>
            </div>
          </div>

          {/* Architecture diagram */}
          <HardwareArchDiagram />
        </main>
      </div>
    </div>
  );
};
