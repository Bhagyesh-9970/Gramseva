import React, { useState, useEffect } from 'react';
import {
  Settings, Users, MapPin, ShieldCheck, Database,
  Activity, CheckCircle2, History, RefreshCw
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';

export const AdministrationPage: React.FC = () => {
  const { villages } = useVillage();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/demo-accounts')
      .then(res => res.json())
      .then(d => setUsers(d))
      .catch(e => console.error(e));

    fetch('/api/analytics/audit-logs')
      .then(res => res.json())
      .then(d => setAuditLogs(d))
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Administration & System Controls
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gram Panchayat jurisdictional mapping, Role-Based Access Control (RBAC), and persistent audit trails.
            </p>
          </div>

          {/* Villages Registry */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              Active Village Gram Panchayats
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {villages.map(v => (
                <div key={v.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{v.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{v.name_mr || v.name}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] pt-1">
                    Taluka: <strong>{v.taluka}</strong> • District: <strong>{v.district}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Population: {v.population.toLocaleString()} ({v.households} households)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Role Matrix */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Role-Based Access Control (RBAC) Accounts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Jurisdiction</th>
                    <th className="py-2.5 px-3">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{u.village_name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{u.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Immutable Audit Log */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              Platform Security & Transaction Audit Trail
            </h3>

            <div className="space-y-2">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-purple-600 dark:text-purple-400">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        [{log.module}]
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs">
                      {log.description}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono flex-shrink-0">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="text-slate-500 font-semibold">{log.performed_by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
