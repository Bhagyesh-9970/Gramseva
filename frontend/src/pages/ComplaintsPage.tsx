import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Plus, Search, Filter, CheckCircle2,
  Clock, AlertCircle, X, Send
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';
import { useAuth } from '../context/AuthContext';

export const ComplaintsPage: React.FC = () => {
  const { selectedVillageId } = useVillage();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New complaint form
  const [category, setCategory] = useState('WATER_SUPPLY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const cParam = categoryFilter !== 'ALL' ? `${vId ? '&' : '?'}category=${categoryFilter}` : vId;
      const res = await fetch(`/api/complaints${cParam}`);
      if (res.ok) setComplaints(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedVillageId, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const vId = selectedVillageId && selectedVillageId !== 'ALL' ? selectedVillageId : 'v-shiva';
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          citizen_name: citizenName || 'Anandrao Kadam',
          citizen_phone: phone || '+91 98225 66778',
          village_id: vId,
          priority
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchComplaints();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Citizen Services & Grievance Redressal
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lodge issues regarding drinking water supply, pipeline leakages, pump outages, and PDS grain distribution.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Lodge New Complaint</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Category:</span>
            {[
              { id: 'ALL', label: 'All Services' },
              { id: 'WATER_SUPPLY', label: 'Water Interruption' },
              { id: 'PUMP_FAILURE', label: 'Pump Failure' },
              { id: 'LEAKAGE', label: 'Pipeline Leakage' },
              { id: 'LOW_PRESSURE', label: 'Low Pressure' },
              { id: 'PDS_DISTRIBUTION', label: 'Ration Shop Service' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  categoryFilter === c.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          <div className="space-y-3">
            {complaints.map(comp => {
              let statusPill = 'bg-slate-100 text-slate-700';
              if (comp.status === 'SUBMITTED') statusPill = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200';
              if (comp.status === 'ACTION_TAKEN') statusPill = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200';
              if (comp.status === 'RESOLVED') statusPill = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200';

              return (
                <div
                  key={comp.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-purple-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                        {comp.complaint_code}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusPill}`}>
                        {comp.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {comp.category.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Filed: {new Date(comp.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {comp.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Citizen: <strong className="text-slate-700 dark:text-slate-200">{comp.citizen_name}</strong></span>
                    {comp.citizen_phone && <span>Phone: <span className="font-mono">{comp.citizen_phone}</span></span>}
                    {comp.resolution_notes && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Action: {comp.resolution_notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Complaint Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lodge Citizen Grievance
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Service Category
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      >
                        <option value="WATER_SUPPLY">Water Interruption</option>
                        <option value="PUMP_FAILURE">Pump Station Breakdown</option>
                        <option value="LEAKAGE">Pipeline / Tap Leakage</option>
                        <option value="LOW_PRESSURE">Low Terminal Pressure</option>
                        <option value="PDS_DISTRIBUTION">Ration Grain Distribution</option>
                        <option value="OTHER">Other Village Utility</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Urgency Priority
                      </label>
                      <select
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH (Drinking water blocked)</option>
                        <option value="CRITICAL">CRITICAL (Main pipeline burst)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Complaint Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. No water supply in Ward 2 since 2 days"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Description & Location
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Specify street name, landmark, or ration card number..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Citizen Name
                      </label>
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={e => setCitizenName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98220 00000"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                    >
                      {isSubmitting ? 'Filing...' : 'Submit Grievance'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
