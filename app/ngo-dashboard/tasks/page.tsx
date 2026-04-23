"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  ClipboardList, 
  Search,
  Users,
  MapPin,
  MoreVertical,
  CheckCircle2,
  PlayCircle,
  Trash2,
  AlertTriangle,
  X,
  Flame
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  location: { address: string };
  createdAt: string;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Critical: { label: 'Critical', color: 'text-red-600',     bg: 'bg-red-50',       border: 'border-red-200' },
  Urgent:   { label: 'Urgent',   color: 'text-orange-600',  bg: 'bg-orange-50',    border: 'border-orange-200' },
  Medium:   { label: 'Medium',   color: 'text-amber-600',   bg: 'bg-amber-50',     border: 'border-amber-200' },
  Low:      { label: 'Low',      color: 'text-emerald-600', bg: 'bg-emerald-50',   border: 'border-emerald-200' },
};

type ToastType = { id: number; message: string; type: 'success' | 'error' | 'info' };

export default function ActiveTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const { token } = useAuthStore();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addToast = (message: string, type: ToastType['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        addToast(`Mission marked as "${newStatus}"`, 'success');
      } else {
        addToast('Failed to update status', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
    setOpenMenuId(null);
  };

  const handleDiscard = (task: Task) => {
    setConfirmDiscard(task);
    setOpenMenuId(null);
  };

  const confirmDiscardTask = async () => {
    if (!confirmDiscard) return;
    try {
      const res = await fetch(`/api/tasks/${confirmDiscard._id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== confirmDiscard._id));
        addToast(`"${confirmDiscard.title}" has been discarded.`, 'info');
      } else {
        addToast('Failed to delete task', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
    setConfirmDiscard(null);
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[200] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold pointer-events-auto ${
                toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                toast.type === 'error'   ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Active Orchestrations</h2>
          <p className="text-slate-500">Monitor and manage your organization's ongoing missions.</p>
        </div>
        
        <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search missions..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
            />
        </div>
      </div>

      <div className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[2rem]">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60 rounded-t-[2rem]" />
        {/* Dot grid bottom-right decoration */}
        <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none overflow-hidden">
          <div className="grid grid-cols-6 gap-2 opacity-[0.04] p-4">
            {Array.from({length: 36}).map((_,i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />)}
          </div>
        </div>
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Mission Name</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Deployment</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Location</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8"><div className="h-6 bg-slate-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-medium">No missions found.</td>
                </tr>
              ) : (
                filtered.map((task) => {
                  const pCfg = PRIORITY_CONFIG[task.priority || ''] || null;
                  return (
                    <tr key={task._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <ClipboardList className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base">{task.title}</p>
                            <p className="text-xs text-slate-500">ID: {task._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {pCfg ? (
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border flex items-center gap-1 w-fit ${pCfg.bg} ${pCfg.color} ${pCfg.border}`}>
                            <Flame className="w-3 h-3" />{pCfg.label}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          task.status === 'Open' ? 'text-secondary border-secondary/30 bg-secondary/10' : 
                          task.status === 'In Progress' ? 'text-primary border-primary/30 bg-primary/10' : 
                          'text-emerald-600 border-emerald-400/30 bg-emerald-100'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-bold">{task.filledVolunteers}</span> 
                          <span className="text-slate-400">/ {task.requiredVolunteers}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-4 h-4 text-primary shrink-0" /> {task.location.address}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        {/* Action Menu */}
                        <div className="relative" ref={openMenuId === task._id ? menuRef : undefined}>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === task._id ? null : task._id)}
                            className="p-2.5 rounded-xl bg-white border border-gray-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === task._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                              >
                                <div className="p-2 space-y-1">
                                    <button
                                      onClick={() => handleStatusChange(task._id, 'In Progress')}
                                      disabled={task.status === 'In Progress'}
                                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                      <PlayCircle className="w-4 h-4" />
                                      Mark In Progress
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(task._id, 'Completed')}
                                      disabled={task.status === 'Completed'}
                                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Mark Completed
                                    </button>
                                    <hr className="border-gray-100" />
                                    <button
                                      onClick={() => window.location.href = `/ngo-dashboard/tasks/edit/${task._id}`}
                                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                                    >
                                      <ClipboardList className="w-4 h-4" />
                                      Edit Mission
                                    </button>
                                    <button
                                      onClick={() => window.location.href = `/ngo-dashboard/volunteers?taskId=${task._id}`}
                                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-secondary hover:bg-secondary/10 transition"
                                    >
                                      <Users className="w-4 h-4" />
                                      View Volunteers
                                    </button>
                                    <hr className="border-gray-100" />
                                  <button
                                    onClick={() => handleDiscard(task)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Discard Task
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      <AnimatePresence>
        {confirmDiscard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-200"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 text-center mb-2">Discard Mission?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                This will remove <span className="font-bold text-slate-700">"{confirmDiscard.title}"</span> from the active list. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDiscard(null)}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDiscardTask}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
