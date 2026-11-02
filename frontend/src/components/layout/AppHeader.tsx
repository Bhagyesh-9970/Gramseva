import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Globe, Moon, Sun, Bell, User, LogOut, Radio,
  Activity, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useVillage } from '../../context/VillageContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { SupportedLanguage } from '../../types';

export const AppHeader: React.FC = () => {
  const { villages, selectedVillageId, setSelectedVillageId } = useVillage();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { mode, isConnected, activeScenario } = useTelemetry();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Village Selector & Live Status Pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Village Selector */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
          <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
          <select
            value={selectedVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            {villages.map(v => (
              <option key={v.id} value={v.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                {language === 'mr' && v.name_mr ? v.name_mr : language === 'hi' && v.name_hi ? v.name_hi : v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Mode Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
          <span>{mode === 'SIMULATION' ? 'SIMULATION' : 'LIVE HARDWARE'}</span>
          {activeScenario !== 'NORMAL' && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">({activeScenario})</span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Language selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden sm:block" />
          {(['en', 'mr', 'hi'] as SupportedLanguage[]).map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                language === l
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'mr' ? 'मराठी' : 'हिंदी'}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Alert Notifications bell */}
        <Link
          to="/app/alerts"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </Link>

        {/* User profile capsule */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Link
              to="/app/profile"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.full_name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user.full_name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                  {user.role.replace('_', ' ')}
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
