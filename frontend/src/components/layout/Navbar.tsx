import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Sun, Moon, Globe, LogIn, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SupportedLanguage } from '../../types';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                {t('project.title')}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-none mt-1 hidden sm:block">
                Digital Gram Panchayat Governance
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t('nav.home')}</Link>
            <Link to="/app/water" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t('nav.water')}</Link>
            <Link to="/app/maintenance" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t('nav.maintenance')}</Link>
            <Link to="/app/pds" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.pds')}</Link>
            <Link to="/app/simulation" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t('nav.simulation')}</Link>
            <Link to="/app/guide" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t('nav.guide')}</Link>
          </nav>

          {/* Controls: Language, Theme, Login / Dashboard */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-1" />
              {(['en', 'mr', 'hi'] as SupportedLanguage[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    language === l
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'mr' ? 'मराठी' : 'हिंदी'}
                </button>
              ))}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Login or Enter Dashboard */}
            {user ? (
              <Link
                to="/app/overview"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all shadow-sky-600/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
