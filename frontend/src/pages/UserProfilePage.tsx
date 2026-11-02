import React from 'react';
import {
  User, ShieldCheck, Mail, Phone, MapPin, CheckCircle2,
  Lock, LogOut, Key
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useAuth } from '../context/AuthContext';

export const UserProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: [
      'Universal administrative oversight across all districts',
      'Manage villages, user accounts, and RBAC permission sets',
      'System-wide audit log access and configuration',
      'Full CRUD access to Water Monitoring & PDS Modules'
    ],
    GP_ADMIN: [
      'Local Gram Panchayat infrastructure monitoring',
      'Oversee drinking water distribution and fair price shops',
      'Review and assign citizen complaints and maintenance tasks',
      'Generate official Gram Sabha verification reports'
    ],
    WATER_OPERATOR: [
      'Monitor real-time ultrasonic reservoir storage',
      'Operate pump relays and record CT current readings',
      'Perform field maintenance tasks and document inspection findings',
      'Acknowledge and clear water supply alerts'
    ],
    PDS_OPERATOR: [
      'Search and verify ration cardholders',
      'Execute atomic food grain distribution transactions',
      'Print distribution receipt slips',
      'Perform periodic physical stock reconciliation audits'
    ],
    DISTRICT_OFFICER: [
      'Multi-village comparative health dashboards',
      'Inter-panchayat water supply trend analytics',
      'Audit PDS stock deficits and flagged mismatches'
    ],
    CITIZEN: [
      'Check personal household monthly grain entitlements',
      'View village public drinking water supply schedules',
      'Lodge citizen service grievances and track redressal'
    ]
  };

  const currentRole = user?.role || 'CITIZEN';
  const permissions = rolePermissions[currentRole] || rolePermissions['CITIZEN'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                User Profile & Access Credentials
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Role permissions, jurisdiction assignment, and session security.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* User Bio Card */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {user ? user.full_name.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {user ? user.full_name : 'Guest User'}
                  </h2>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300">
                    {currentRole.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{user?.email || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{user?.phone || '+91 98220 00000'}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{user?.village_name || 'District Jurisdiction'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200 dark:border-rose-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>

            {/* Role Permissions Matrix */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Active Security & Operational Permissions
              </h3>
              <p className="text-xs text-slate-500">
                Enforced by backend JSON Web Token (JWT) authorization policies and row-level database filters.
              </p>

              <div className="space-y-2.5 pt-2">
                {permissions.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{p}</span>
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
