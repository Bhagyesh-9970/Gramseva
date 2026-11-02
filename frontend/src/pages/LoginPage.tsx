import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Lock, Mail, ArrowRight, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch demo accounts with one-click quick tokens
    fetch('/api/auth/demo-accounts')
      .then(res => res.json())
      .then(data => setDemoAccounts(data))
      .catch(err => console.error('Failed to load demo accounts:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/app/overview');
      } else {
        setError('Invalid email or password. You can also click any demo account below.');
      }
    } catch {
      setError('Connection failed. Please check backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (acc: any) => {
    loginWithToken(acc.quick_token, {
      id: acc.id,
      email: acc.email,
      full_name: acc.full_name,
      role: acc.role,
      phone: acc.phone,
      village_id: acc.village_id,
      village_name: acc.village_name
    });
    navigate('/app/overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portal Sign In</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Smart Water & Digital Gram Panchayat</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. waterop@smartpanchayat.gov.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password (default: password123)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/20"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Credentials'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: One-Click Demo Role Accounts */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Seeded Demonstration Accounts (One-Click Login)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any role card below to instantly sign in and explore permitted role features.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map(acc => {
                let badgeColor = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
                if (acc.role === 'SUPER_ADMIN') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
                if (acc.role === 'PDS_OPERATOR') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                if (acc.role === 'CITIZEN') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';

                return (
                  <button
                    key={acc.id}
                    onClick={() => handleQuickLogin(acc)}
                    className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {acc.full_name}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {acc.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {acc.email}
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                      <span>Jurisdiction: {acc.village_name}</span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Login &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-800 dark:text-sky-300">
              <strong>All demo passwords:</strong> <code className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
