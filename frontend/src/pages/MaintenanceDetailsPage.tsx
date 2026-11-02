import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Wrench, ArrowLeft, CheckCircle2, Clock, User, Calendar,
  AlertTriangle, Save, FileText
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';

export const MaintenanceDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/maintenance/tasks`);
      if (res.ok) {
        const data = await res.json();
        const found = data.find((t: any) => t.id === taskId);
        if (found) {
          setTask(found);
          setStatus(found.status);
          setNotes(found.inspection_notes || '');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');
    try {
      const res = await fetch(`/api/maintenance/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          inspection_notes: notes
        })
      });
      if (res.ok) {
        setMsg('Maintenance record and audit log updated successfully.');
        fetchTask();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 p-8 text-center text-xs text-slate-500">Loading task record...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Link
            to="/app/maintenance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Maintenance Tasks</span>
          </Link>

          {/* Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400">
                  {task.task_code}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {task.asset_type}
                </span>
                <span className="text-xs font-bold text-amber-600 uppercase">
                  {task.priority} Priority
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {task.title}
              </h1>
            </div>
          </div>

          {msg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Task Info */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Issue Description
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60">
                  {task.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-slate-400 text-[11px]">Assigned Technician</span>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {task.assigned_to_name || 'Ganesh Maruti Shinde'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">Due Date</span>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">Logged On</span>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {new Date(task.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">Completion Status</span>
                  <div className="font-bold text-emerald-600 mt-0.5">
                    {task.completed_at ? new Date(task.completed_at).toLocaleString() : 'Pending Closure'}
                  </div>
                </div>
              </div>
            </div>

            {/* Operator Inspection & Status Form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Update Field Inspection & Status
              </h3>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technician Inspection Notes
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Enter observation findings, parts replaced, or electrical test results..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Updating...' : 'Save Inspection Record'}</span>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
