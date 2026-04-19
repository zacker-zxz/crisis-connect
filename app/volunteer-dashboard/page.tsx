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
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import LiveHeatmap from '@/components/maps/LiveHeatmap';

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
    { label: 'Hours Contributed', value: '124', icon: Clock, color: 'text-primary' },
    { label: 'Lives Impacted', value: '1,250', icon: Heart, color: 'text-secondary' },
    { label: 'Skill Badges', value: '8', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Reliability', value: '98%', icon: CheckCircle2, color: 'text-primary' },
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
           <Zap className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-2 underline decoration-primary decoration-4 underline-offset-8">Hello, {user?.name.split(' ')[0]}!</h2>
            <p className="text-gray-400 text-lg max-w-xl mt-4">
               The orchestration engine has identified <span className="text-secondary font-bold">3 urgent missions</span> near you that match your skills.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
                {user?.skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Star className="w-3 h-3 text-secondary fill-secondary" /> {skill}
                    </span>
                ))}
            </div>
          </div>
          <Link href="/volunteer-dashboard/missions" className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
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
         {/* Live Map Preview */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-bold text-white tracking-tight">Real-time Command Center</h3>
               <Link href="/volunteer-dashboard/heatmap" className="text-sm font-bold text-secondary hover:underline">Full View</Link>
            </div>
            <div className="h-[400px] w-full">
                <LiveHeatmap />
            </div>
         </div>

         {/* Recommended Subscriptions / Tasks */}
         <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">Top Recommendations</h3>
            <div className="space-y-4">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>)
                ) : tasks.filter(t => t.status === 'Open').length === 0 ? (
                    <div className="glass-card p-8 rounded-3xl text-center">
                        <p className="text-gray-400">No open missions currently.</p>
                    </div>
                ) : (
                    tasks.filter(t => t.status === 'Open').slice(0, 3).map((task) => (
                        <motion.div 
                          key={task._id}
                          whileHover={{ x: 5 }}
                          className="glass-card p-6 rounded-3xl border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{task.title}</h4>
                                <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-1 rounded border border-secondary/20 tracking-tighter">NEW</span>
                            </div>
                            <div className="space-y-2 text-xs text-gray-400">
                                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-500" /> {task.location.address}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {task.requiredSkills.map(skill => (
                                        <span key={skill} className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[9px] font-semibold text-gray-500">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button className="w-full mt-6 py-3 rounded-2xl bg-white/5 hover:bg-primary hover:text-white border border-white/10 transition-all font-bold text-sm">
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
