"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Star,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import LiveHeatmap from '@/components/maps/LiveHeatmap';
import { useAuthStore } from '@/store/authStore';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  location: { address: string };
  createdAt: string;
  requiredSkills: string[];
}

export default function VolunteerDashboardMain() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleApply = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply');
      
      alert('Mission Accepted! Thank you for your service.');
      fetchTasks(); // Refresh tasks
    } catch (err: any) {
      alert(err.message);
    }
  };

  const stats = [
    { label: 'Hours Contributed', value: '124', icon: Clock, color: 'text-primary' },
    { label: 'Lives Impacted', value: '1,250', icon: Heart, color: 'text-secondary' },
    { label: 'Skill Badges', value: '8', icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Reliability', value: '98%', icon: CheckCircle2, color: 'text-primary' },
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
           <Zap className="w-64 h-64 text-slate-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 mb-2 underline decoration-primary decoration-4 underline-offset-8">Hello, {user?.name.split(' ')[0]}!</h2>
            <p className="text-slate-500 text-lg max-w-xl mt-4">
               The orchestration engine has identified <span className="text-secondary font-bold">3 urgent missions</span> near you that match your skills.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
                {user?.skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 border border-gray-200 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Star className="w-3 h-3 text-secondary fill-secondary" /> {skill}
                    </span>
                ))}
            </div>
          </div>
          <Link href="/volunteer-dashboard/missions" className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
            VIEW MISSIONS
          </Link>
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
         {/* Live Map Preview */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Real-time Command Center</h3>
               <Link href="/volunteer-dashboard/heatmap" className="text-sm font-bold text-secondary hover:underline">Full View</Link>
            </div>
            <div className="h-[400px] w-full">
                <LiveHeatmap />
            </div>
         </div>

         {/* Recommended Subscriptions / Tasks */}
         <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Top Recommendations</h3>
            <div className="space-y-4">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>)
                ) : tasks.filter(t => t.status === 'Open').length === 0 ? (
                    <div className="glass-card p-8 rounded-3xl text-center">
                        <p className="text-slate-500">No open missions currently.</p>
                    </div>
                ) : (
                    tasks.filter(t => t.status === 'Open').slice(0, 3).map((task) => (
                        <motion.div 
                          key={task._id}
                          whileHover={{ x: 5 }}
                          className="glass-card p-6 rounded-3xl hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{task.title}</h4>
                                <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-1 rounded border border-secondary/20 tracking-tighter">NEW</span>
                            </div>
                            <div className="space-y-2 text-xs text-slate-500">
                                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {task.location.address}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {task.requiredSkills.map(skill => (
                                        <span key={skill} className="px-2 py-0.5 bg-slate-100 rounded border border-gray-200 text-[9px] font-semibold text-slate-500">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                                <button 
                                    onClick={() => handleApply(task._id)}
                                    className="w-full mt-6 py-3 rounded-2xl bg-slate-100 hover:bg-primary hover:text-white border border-gray-200 transition-all font-bold text-sm text-slate-600"
                                >
                                    Accept Mission
                                </button>
                        </motion.div>
                    ))
                )}
            </div>
         </div>
      </div>
    </div>
  );
}
