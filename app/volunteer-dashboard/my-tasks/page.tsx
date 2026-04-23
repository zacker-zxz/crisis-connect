"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Activity,
  CircleX,
  Eye,
  Phone,
  Send,
  User,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  location: { address: string };
  dateTime: string;
  requiredSkills?: string[];
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showSupportFor, setShowSupportFor] = useState<Task | null>(null);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [support, setSupport] = useState({ name: '', phone: '', query: '' });
  const [now, setNow] = useState(() => Date.now());

  const { token, user } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    setSupport((prev) => ({ ...prev, name: user?.name || '' }));
  }, [user?.name]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const reachByKey = (userId: string, taskId: string) => `reachBy:${userId}:${taskId}`;

  const reachCountdown = (taskId: string) => {
    const userId = String(user?.id || user?._id || "");
    if (!userId) return null;
    const raw = localStorage.getItem(reachByKey(userId, taskId));
    if (!raw) return null;
    const reachByTs = Number(raw);
    if (!Number.isFinite(reachByTs)) return null;
    const diff = reachByTs - now;
    if (diff <= 0) return { label: "Overdue", level: "overdue" as const };
    const totalSeconds = Math.floor(diff / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const label =
      h > 0 ? `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s` : `${m}m ${String(s).padStart(2, "0")}s`;
    const level = totalSeconds <= 3600 ? ("soon" as const) : ("ok" as const);
    return { label, level };
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const userId = user?.id || user?._id;
      const assigned = Array.isArray(data)
        ? data.filter((task: any) => task.assignedVolunteers?.includes(userId))
        : [];
      setTasks(assigned);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [user?.id, user?._id]);

  const rejectMission = async (task: Task) => {
    if (!token || !confirm(`Back off from "${task.title}"?`)) return;
    setRejectingId(task._id);
    try {
      const res = await fetch(`/api/tasks/${task._id}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to reject mission');
        return;
      }
      addNotification({
        title: 'Mission Rejected',
        message: `You backed off from "${task.title}".`,
        type: 'alert',
      });
      await fetchMissions();
    } finally {
      setRejectingId(null);
    }
  };

  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitting(true);
    setTimeout(() => {
      setSupportSubmitting(false);
      setShowSupportFor(null);
      addNotification({
        title: 'Support Requested',
        message: 'Support desk has received your query.',
        type: 'join',
      });
      setSupport((s) => ({ ...s, query: '' }));
    }, 600);
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">My Missions</h2>
        <p className="text-slate-500">Track your ongoing missions and manage support requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="h-32 bg-white border border-slate-200 rounded-3xl animate-pulse" />)
        ) : tasks.length === 0 ? (
          <div className="bg-white p-20 rounded-[2rem] text-center border border-slate-200 shadow-sm">
            <Activity className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No active missions</h3>
            <p className="text-slate-500">Jump into the Missions page to accept your next mission.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center gap-8 group shadow-sm"
            >
              {(() => {
                const cd = reachCountdown(task._id);
                return (
                  <>
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border ${
                  task.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-500 border-emerald-200'
                    : 'bg-primary/10 text-primary border-primary/20 animate-pulse-slow'
                }`}
              >
                {task.status === 'Completed' ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{task.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 border ${
                      task.status === 'Completed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-primary border-primary/30 bg-primary/5'
                    }`}
                  >
                    {task.status}
                  </span>
                  {cd && (
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 border text-red-700 border-red-200 bg-red-50 shadow-sm shadow-red-500/10"
                      title="Time remaining to reach mission location"
                    >
                      ⏳ {cd.label} to reach
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-primary" /> {task.location.address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4 text-secondary" /> {new Date(task.dateTime).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid w-full max-w-sm grid-cols-1 gap-3 md:w-auto">
                <button
                  onClick={() => setShowSupportFor(task)}
                  className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Support
                </button>
                <Link
                  href={`/volunteer-dashboard/missions/${task._id}`}
                  className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Details
                </Link>
                <button
                  onClick={() => rejectMission(task)}
                  disabled={rejectingId === task._id}
                  className="px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CircleX className="w-4 h-4" /> {rejectingId === task._id ? 'Rejecting...' : 'Reject Mission'}
                </button>
              </div>
                  </>
                );
              })()}
            </motion.div>
          ))
        )}
      </div>

      {showSupportFor && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Support for {showSupportFor.title}</h3>
              <button onClick={() => setShowSupportFor(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={submitSupport} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Name</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full py-2.5 outline-none"
                    value={support.name}
                    onChange={(e) => setSupport((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full py-2.5 outline-none"
                    value={support.phone}
                    onChange={(e) => setSupport((s) => ({ ...s, phone: e.target.value }))}
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Query</span>
                <textarea
                  className="min-h-[100px] w-full rounded-xl border border-slate-200 p-3 outline-none"
                  value={support.query}
                  onChange={(e) => setSupport((s) => ({ ...s, query: e.target.value }))}
                  required
                />
              </label>
              <button
                type="submit"
                disabled={supportSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {supportSubmitting ? 'Submitting...' : 'Submit Query'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
