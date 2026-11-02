import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Droplet, Activity, Cpu, Wrench,
  ShoppingBag, Users, Send, Boxes, Scale, FileText,
  Bell, MessageSquare, BarChart3, BookOpen, Settings,
  ShieldCheck, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const AppSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { user, hasRole } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
      isActive
        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border-l-4 border-sky-600 dark:border-sky-500 shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  const pdsLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
      isActive
        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border-l-4 border-emerald-600 dark:border-emerald-500 shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Core Overview */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Central Command
          </div>
          <div className="space-y-1">
            <NavLink to="/app/overview" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>{t('nav.overview')}</span>
            </NavLink>
          </div>
        </div>

        {/* WATER & DIGITAL O&M (Blue / Teal theme) */}
        <div>
          <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Water & Digital O&M</span>
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          </div>
          <div className="space-y-1">
            <NavLink to="/app/water" className={navLinkClass}>
              <Droplet className="w-4 h-4 text-sky-600" />
              <span>{t('nav.water')}</span>
            </NavLink>
            <NavLink to="/app/pumps" className={navLinkClass}>
              <Activity className="w-4 h-4 text-sky-600" />
              <span>{t('nav.pumps')}</span>
            </NavLink>
            <NavLink to="/app/simulation" className={navLinkClass}>
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>{t('nav.simulation')}</span>
            </NavLink>
            <NavLink to="/app/maintenance" className={navLinkClass}>
              <Wrench className="w-4 h-4 text-sky-600" />
              <span>{t('nav.maintenance')}</span>
            </NavLink>
          </div>
        </div>

        {/* PUBLIC DISTRIBUTION SYSTEM (Green / Amber theme) */}
        <div>
          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Public Distribution (PDS)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="space-y-1">
            <NavLink to="/app/pds" className={pdsLinkClass}>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.pds')}</span>
            </NavLink>
            <NavLink to="/app/beneficiaries" className={pdsLinkClass}>
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.beneficiaries')}</span>
            </NavLink>
            <NavLink to="/app/distribution" className={pdsLinkClass}>
              <Send className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.distribution')}</span>
            </NavLink>
            <NavLink to="/app/stock" className={pdsLinkClass}>
              <Boxes className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.stock')}</span>
            </NavLink>
            <NavLink to="/app/reconciliation" className={pdsLinkClass}>
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.reconciliation')}</span>
            </NavLink>
            <NavLink to="/app/transactions" className={pdsLinkClass}>
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.transactions')}</span>
            </NavLink>
          </div>
        </div>

        {/* GOVERNANCE & SERVICES */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Governance & Reports
          </div>
          <div className="space-y-1">
            <NavLink to="/app/alerts" className={navLinkClass}>
              <Bell className="w-4 h-4 text-amber-500" />
              <span>{t('nav.alerts')}</span>
            </NavLink>
            <NavLink to="/app/complaints" className={navLinkClass}>
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>{t('nav.complaints')}</span>
            </NavLink>
            <NavLink to="/app/reports" className={navLinkClass}>
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>{t('nav.reports')}</span>
            </NavLink>
            <NavLink to="/app/guide" className={navLinkClass}>
              <BookOpen className="w-4 h-4 text-teal-500" />
              <span>{t('nav.guide')}</span>
            </NavLink>
            {hasRole(['SUPER_ADMIN', 'GP_ADMIN', 'DISTRICT_OFFICER']) && (
              <NavLink to="/app/admin" className={navLinkClass}>
                <Settings className="w-4 h-4 text-slate-500" />
                <span>{t('nav.admin')}</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Bottom user capsule */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
            {user ? user.full_name.charAt(0) : 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {user ? user.full_name : 'Guest Visitor'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {user ? user.role : 'Public Access'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
