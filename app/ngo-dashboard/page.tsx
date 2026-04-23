"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MapPin, Clock, ChevronRight, AlertTriangle,
  ClipboardCheck, Zap, Flame, PlusCircle, ClipboardList, Heart, Share2, Twitter, Facebook, Instagram
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LiveHeatmap = dynamic(() => import('@/components/maps/LiveHeatmap'), { ssr: false });

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

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Critical: { color: 'text-red-600',     bg: 'bg-red-50',    border: 'border-red-200' },
  Urgent:   { color: 'text-orange-600',  bg: 'bg-orange-50', border: 'border-orange-200' },
  Medium:   { color: 'text-amber-600',   bg: 'bg-amber-50',  border: 'border-amber-200' },
  Low:      { color: 'text-emerald-600', bg: 'bg-emerald-50',border: 'border-emerald-200' },
};

export default function NgoDashboardMain() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [showShareModal, setShowShareModal] = useState(false);

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

  const stats = [
    { label: 'Active Missions',   value: tasks.filter(t => t.status === 'In Progress').length, icon: Zap,           color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20' },
    { label: 'Total Missions',    value: tasks.length,                                           icon: ClipboardCheck, color: 'text-secondary',  bg: 'bg-secondary/10',  border: 'border-secondary/20' },
    { label: 'Impact Score',      value: '5,840',                                               icon: Heart,          color: 'text-red-500',    bg: 'bg-red-50',        border: 'border-red-200', shareable: true },
    { label: 'Filled Slots',      value: tasks.reduce((a, t) => a + t.filledVolunteers, 0),      icon: Users,          color: 'text-emerald-600',bg: 'bg-emerald-50',    border: 'border-emerald-200' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 pb-20">

      {/* ── Greeting Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/10 via-white to-secondary/10 border border-gray-200 shadow-sm p-8"
      >
        {/* Decorative background rings */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/5 border border-primary/10" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-secondary/5 border border-secondary/10" />
        {/* Decorative dots pattern top-left */}
        <div className="absolute top-4 left-4 grid grid-cols-5 gap-1.5 opacity-20">
          {Array.from({length: 20}).map((_,i) => <div key={i} className="w-1 h-1 rounded-full bg-primary" />)}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">{greeting}</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
              {user?.name || 'NGO Admin'} <span className="text-primary">👋</span>
            </h2>
            {user?.organizationName && (
              <p className="text-slate-500 mt-1 text-sm font-medium">{user.organizationName}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              {tasks.length > 0
                ? `You have ${tasks.filter(t => t.status === 'Open').length} open mission${tasks.filter(t => t.status === 'Open').length !== 1 ? 's' : ''} awaiting volunteers.`
                : 'No missions yet. Deploy your first task to get started.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/ngo-dashboard/create"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95 text-sm"
            >
              <PlusCircle className="w-5 h-5" /> Post New Task
            </Link>
            <Link
              href="/ngo-dashboard/tasks"
              className="flex items-center justify-center gap-2 border border-primary/30 bg-white text-primary hover:bg-primary/5 font-bold px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 text-sm shadow-sm"
            >
              <ClipboardList className="w-5 h-5" /> View Tasks
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.button
            key={i}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={stat.shareable ? { scale: 1.02, y: -5 } : {}}
            whileTap={stat.shareable ? { scale: 0.98 } : {}}
            onClick={() => {
              if (stat.shareable) setShowShareModal(true);
            }}
            className={`relative overflow-hidden bg-white border border-gray-200 p-6 rounded-[2rem] hover:shadow-lg transition-all group shadow-sm text-left w-full block ${stat.shareable ? 'cursor-pointer hover:border-primary/50' : 'pointer-events-none'}`}
          >
            {/* Decorative corner arc */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `radial-gradient(circle, var(--tw-gradient-stops))` }}>
            </div>
            <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full border-2 ${stat.border} opacity-20`} />

            <div className="flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.shareable && (
                <div className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">
                  Share Impact
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-800">{stat.value}</h3>
          </motion.button>
        ))}
      </div>

      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Smart Inventory Oracle</h3>
            <p className="text-sm text-slate-500 mt-1">
              Predict supply burn-rate from active missions and get depletion warnings before resources run out.
            </p>
          </div>
          <Link
            href="/ngo-dashboard/resource-predictor"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all w-fit"
          >
            Open Resource Predictor <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
               onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
               <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
                     <Share2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Organization Impact</h3>
                  <p className="text-slate-500 text-sm mb-8">Share your organization's heroic impact and inspire the community.</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { icon: Twitter, color: 'bg-[#1DA1F2]', name: 'Twitter' },
                      { icon: Facebook, color: 'bg-[#4267B2]', name: 'Facebook' },
                      { icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', name: 'Instagram' }
                    ].map(p => (
                      <button key={p.name} className="flex flex-col items-center gap-2 group">
                        <div className={`w-14 h-14 ${p.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all`}>
                          <p.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</span>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
                  >
                    Close
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Recent Orchestrations ── */}
      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6">
        {/* Decorative fade strip along top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60 rounded-t-[2rem]" />
        {/* Background dot grid */}
        <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none">
          <div className="grid grid-cols-6 gap-2 opacity-[0.04] p-4">
            {Array.from({length: 36}).map((_,i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />)}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Orchestrations</h3>
          <Link href="/ngo-dashboard/tasks" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3 relative z-10">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No tasks created yet.</p>
              <Link href="/ngo-dashboard/create" className="text-primary font-bold mt-2 inline-block hover:underline">
                Post your first mission →
              </Link>
            </div>
          ) : (
            tasks.slice(0, 4).map((task, idx) => {
              const pCfg = PRIORITY_CONFIG[task.priority || ''] || null;
              return (
                <Link
                  key={task._id}
                  href={`/ngo-dashboard/tasks/edit/${task._id}`}
                  className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{task.title}</h4>
                      <div className="flex flex-wrap gap-3 mt-0.5 items-center">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> {new Date(task.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5" /> {task.filledVolunteers}/{task.requiredVolunteers} Assigned
                        </span>
                        {pCfg && (
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${pCfg.bg} ${pCfg.color} ${pCfg.border}`}>
                            <Flame className="w-2.5 h-2.5" />{task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      task.status === 'Open' ? 'text-secondary border-secondary/30 bg-secondary/10' :
                      task.status === 'In Progress' ? 'text-primary border-primary/30 bg-primary/10' :
                      'text-emerald-600 border-emerald-300 bg-emerald-50'
                    }`}>
                      {task.status}
                    </span>
                    <div className="p-1.5 rounded-full bg-white border border-gray-200 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </motion.div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* ── Full-Width Live Heatmap ── */}
      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6">
        {/* Decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-60 rounded-t-[2rem]" />

        <div className="flex justify-between items-center mb-5 relative z-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Live Crisis Map</h3>
            <p className="text-slate-500 text-sm">Your missions are highlighted. All others shown by priority.</p>
          </div>
          <Link href="/ngo-dashboard/heatmap" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Fullscreen <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="h-[500px] w-full rounded-[1.5rem] overflow-hidden border border-gray-100">
          <LiveHeatmap variant="ngo" />
        </div>
      </div>

    </div>
  );
}
