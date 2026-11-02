import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{t('project.title')}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              {t('project.tagline')}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud Services & IoT Gateways Operational</span>
            </div>
          </div>

          {/* Col 2: Water Modules */}
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Water Monitoring</h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/app/water" className="hover:text-sky-600 dark:hover:text-sky-400">Reservoir Water Levels</Link></li>
              <li><Link to="/app/pumps" className="hover:text-sky-600 dark:hover:text-sky-400">Pump Telemetry & Current Sensing</Link></li>
              <li><Link to="/app/maintenance" className="hover:text-sky-600 dark:hover:text-sky-400">Digital O&M Work Orders</Link></li>
              <li><Link to="/app/simulation" className="hover:text-sky-600 dark:hover:text-sky-400">ESP32 Hardware Simulation</Link></li>
            </ul>
          </div>

          {/* Col 3: PDS Modules */}
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Public Distribution (PDS)</h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/app/beneficiaries" className="hover:text-emerald-600 dark:hover:text-emerald-400">Beneficiary Registration</Link></li>
              <li><Link to="/app/distribution" className="hover:text-emerald-600 dark:hover:text-emerald-400">Ration Distribution Desk</Link></li>
              <li><Link to="/app/stock" className="hover:text-emerald-600 dark:hover:text-emerald-400">Inventory & Goods Receipts</Link></li>
              <li><Link to="/app/reconciliation" className="hover:text-emerald-600 dark:hover:text-emerald-400">Stock Mismatch Reconciliation</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & Guide */}
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Support & Guides</h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/app/guide" className="hover:text-sky-600 dark:hover:text-sky-400">Interactive User Guide (EN / MR / HI)</Link></li>
              <li><Link to="/app/complaints" className="hover:text-sky-600 dark:hover:text-sky-400">Lodge Citizen Grievance</Link></li>
              <li><Link to="/app/reports" className="hover:text-sky-600 dark:hover:text-sky-400">Gram Sabha Audit Reports</Link></li>
              <li><span className="text-slate-400">Toll-Free Gram Helpline: 1800-233-0404</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© 2026 Smart Water & Digital Gram Panchayat Platform. Developed for Rural Digital Governance.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> NIC & MeitY Standards Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
