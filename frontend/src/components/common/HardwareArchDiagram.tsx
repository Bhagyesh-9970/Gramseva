import React from 'react';
import { Database, Wifi, Server, Cpu, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HardwareArchDiagram: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-water-600" />
          End-to-End System Architecture & Data Flow
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time physical sensor acquisition via ESP32 microcontrollers through MQTT broker to Cloud APIs and responsive dashboards.
        </p>
      </div>

      {/* Water Pipeline Flow */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-water-700 dark:text-water-400 uppercase tracking-wider mb-3">
          1. Water Infrastructure & IoT Telemetry Flow
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-center">
          {/* Step 1 */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              1
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Water Assets</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reservoirs & Pumps</div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              2
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">IoT Sensors</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Ultrasonic, CT, Flow</div>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">ESP32 Nodes</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Edge Sampling & ADC</div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">MQTT Broker</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">QoS-1 Pub/Sub</div>
          </div>

          {/* Step 5 */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              <Server className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">FastAPI Cloud</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Anomaly Engine</div>
          </div>

          {/* Step 6 */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              <Database className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">PostgreSQL</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Persistent Time-Series</div>
          </div>

          {/* Step 7 */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex flex-col items-center col-span-2 md:col-span-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Live Dashboard</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Gram Panchayat UI</div>
          </div>
        </div>
      </div>

      {/* PDS Atomic Workflow */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
          2. Public Distribution System (PDS) Atomic Workflow
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Verification</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Ration Card & Biometric</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Eligibility</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">AAY/PHH Category Rules</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">3. Quota Check</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Remaining Monthly Limit</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">4. Stock Guard</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Prevent Negative Inv.</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">5. Distribution</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Atomic Commit & Slip</div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">6. Reconciliation</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Mismatch Mgt & Audit</div>
          </div>
        </div>
      </div>
    </div>
  );
};
