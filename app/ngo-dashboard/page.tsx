"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  ClipboardCheck,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  location: { address: string };
  createdAt: string;
}

export default function NgoDashboardMain() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

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
    { label: 'Active Missions', value: tasks.filter(t => t.status === 'In Progress').length, icon: Zap, color: 'text-primary' },
    { label: 'Total Volunteers', value: '482', icon: Users, color: 'text-secondary' }, // Mock total for now
    { label: 'Open Requirements', value: tasks.filter(t => t.status === 'Open').length, icon: AlertTriangle, color: 'text-tertiary' },
    { label: 'Tasks Resolved', value: tasks.filter(t => t.status === 'Completed').length, icon: ClipboardCheck, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group border-white/10"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <LayoutDashboard className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-2">Command Center</h2>
          <p className="text-gray-400 text-lg max-w-xl">
             Managing orchestration for <span className="text-primary font-bold">{user?.organizationName || 'Your Organization'}</span>. Real-time impact tracking active.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-[2rem] border-white/5 hover:bg-white/15 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
               <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
               </div>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Tasks */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-bold text-white tracking-tight">Recent Orchestrations</h3>
               <Link href="/ngo-dashboard/tasks" className="text-sm font-bold text-primary hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
               {loading ? (
                  [1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse"></div>)
               ) : tasks.length === 0 ? (
                  <div className="glass-card p-12 rounded-3xl text-center">
                      <p className="text-gray-400">No tasks created yet.</p>
                      <Link href="/ngo-dashboard/create" className="text-primary font-bold mt-2 inline-block">Post your first task</Link>
                  </div>
               ) : (
                  tasks.slice(0, 5).map((task) => (
                    <motion.div 
                      key={task._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 rounded-3xl border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex gap-4 items-center">
                         <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-primary">
                            <MapPin className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-bold text-white text-lg">{task.title}</h4>
                            <div className="flex flex-wrap gap-3 mt-1">
                               <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                  <Clock className="w-3.5 h-3.5" /> {new Date(task.createdAt).toLocaleDateString()}
                               </span>
                               <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                  <Users className="w-3.5 h-3.5" /> {task.filledVolunteers}/{task.requiredVolunteers} Assigned
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            task.status === 'Open' ? 'text-secondary border-secondary/30 bg-secondary/5' : 
                            task.status === 'In Progress' ? 'text-primary border-primary/30 bg-primary/5' : 
                            'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                         }`}>
                            {task.status}
                         </span>
                         <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                         </div>
                      </div>
                    </motion.div>
                  ))
               )}
            </div>
         </div>

         {/* Sidebar Stats / Map Preview */}
         <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2rem] border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Regional Impact</h3>
                <div className="h-64 rounded-2xl overflow-hidden relative group">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                        <Link href="/ngo-dashboard/heatmap" className="bg-primary text-white text-xs font-black px-4 py-2 rounded-lg shadow-xl hover:scale-105 transition-transform inline-block">
                           OPEN HEATMAP
                        </Link>
                    </div>
                </div>
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-400">Efficiency Rate</span>
                        <span className="text-white">92%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-gradient-to-r from-primary to-secondary"></div>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">Targeting optimal deployment within 15 minutes of crisis ping.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
