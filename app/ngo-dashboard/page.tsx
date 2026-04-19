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
    { label: 'Total Missions', value: tasks.length, icon: ClipboardCheck, color: 'text-secondary' },
    { label: 'Open Requirements', value: tasks.filter(t => t.status === 'Open').length, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Filled Slots', value: tasks.reduce((acc, t) => acc + t.filledVolunteers, 0), icon: Users, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <LayoutDashboard className="w-64 h-64 text-slate-400" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-2">Command Center</h2>
          <p className="text-slate-500 text-lg max-w-xl">
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
            className="glass-card p-6 rounded-[2rem] hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
               <div className={`p-4 rounded-2xl bg-slate-50 border border-gray-200 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
               </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-800">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Tasks */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Orchestrations</h3>
               <Link href="/ngo-dashboard/tasks" className="text-sm font-bold text-primary hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
               {loading ? (
                  [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>)
               ) : tasks.length === 0 ? (
                  <div className="glass-card p-12 rounded-3xl text-center">
                      <p className="text-slate-500">No tasks created yet.</p>
                      <Link href="/ngo-dashboard/create" className="text-primary font-bold mt-2 inline-block">Post your first task</Link>
                  </div>
               ) : (
                  tasks.slice(0, 5).map((task) => (
                    <motion.div 
                      key={task._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex gap-4 items-center">
                         <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary">
                            <MapPin className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800 text-lg">{task.title}</h4>
                            <div className="flex flex-wrap gap-3 mt-1">
                               <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="w-3.5 h-3.5" /> {new Date(task.createdAt).toLocaleDateString()}
                               </span>
                               <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Users className="w-3.5 h-3.5" /> {task.filledVolunteers}/{task.requiredVolunteers} Assigned
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            task.status === 'Open' ? 'text-secondary border-secondary/30 bg-secondary/5' : 
                            task.status === 'In Progress' ? 'text-primary border-primary/30 bg-primary/5' : 
                            'text-emerald-600 border-emerald-300 bg-emerald-50'
                         }`}>
                            {task.status}
                         </span>
                         <div className="p-2 rounded-full bg-slate-100 border border-gray-200 group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                         </div>
                      </div>
                    </motion.div>
                  ))
               )}
            </div>
         </div>

         {/* Sidebar Stats / Map Preview */}
         <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Regional Impact</h3>
                <div className="h-64 rounded-2xl overflow-hidden relative group">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                        <Link href="/ngo-dashboard/heatmap" className="bg-primary text-white text-xs font-black px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform inline-block">
                           OPEN HEATMAP
                        </Link>
                    </div>
                </div>
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Efficiency Rate</span>
                        <span className="text-slate-800">92%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">Targeting optimal deployment within 15 minutes of crisis ping.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
