"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Star,
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle
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
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
}

const mockRecommendations: Task[] = [
  { _id: 'r1', title: 'Medical Aid Dispatch', description: '', status: 'Open', requiredVolunteers: 5, filledVolunteers: 2, location: { address: 'Kurla West, Mumbai' }, createdAt: '2m ago', requiredSkills: ['First Aid', 'Logistics'], urgency: 'Critical' },
  { _id: 'r2', title: 'Flood Relief Coordination', description: '', status: 'Open', requiredVolunteers: 10, filledVolunteers: 4, location: { address: 'Bandra, Mumbai' }, createdAt: '1h ago', requiredSkills: ['Rescue', 'Swimming'], urgency: 'High' },
  { _id: 'r3', title: 'Food Distribution Drive', description: '', status: 'Open', requiredVolunteers: 20, filledVolunteers: 12, location: { address: 'Andheri, Mumbai' }, createdAt: '4h ago', requiredSkills: ['Cooking', 'Distribution'], urgency: 'Medium' },
  { _id: 'r4', title: 'Oxygen Delivery Team', description: '', status: 'Open', requiredVolunteers: 3, filledVolunteers: 1, location: { address: 'Vashi, Navi Mumbai' }, createdAt: '30m ago', requiredSkills: ['Driving', 'Hazmat'], urgency: 'Critical' },
  { _id: 'r5', title: 'Elderly Support Outreach', description: '', status: 'Open', requiredVolunteers: 8, filledVolunteers: 3, location: { address: 'Belapur, Navi Mumbai' }, createdAt: '6h ago', requiredSkills: ['Healthcare', 'Marathi'], urgency: 'Medium' },
  { _id: 'r6', title: 'Debris Clearing Squad', description: '', status: 'Open', requiredVolunteers: 15, filledVolunteers: 7, location: { address: 'Thane, Mumbai' }, createdAt: '8h ago', requiredSkills: ['Operations', 'Physical'], urgency: 'High' },
  { _id: 'r7', title: 'Sanitation Kit Assembly', description: '', status: 'Open', requiredVolunteers: 50, filledVolunteers: 42, location: { address: 'Ghatkopar, Mumbai' }, createdAt: '12h ago', requiredSkills: ['General'], urgency: 'Medium' },
  { _id: 'r8', title: 'Shelter Management Help', description: '', status: 'Open', requiredVolunteers: 12, filledVolunteers: 5, location: { address: 'Malad, Mumbai' }, createdAt: '10h ago', requiredSkills: ['Admin', 'Support'], urgency: 'High' },
  { _id: 'r9', title: 'Community Kitchen Team', description: '', status: 'Open', requiredVolunteers: 25, filledVolunteers: 18, location: { address: 'Colaba, Mumbai' }, createdAt: '1d ago', requiredSkills: ['Kitchen', 'Hygiene'], urgency: 'Medium' },
  { _id: 'r10', title: 'Rescue Logistics Support', description: '', status: 'Open', requiredVolunteers: 6, filledVolunteers: 2, location: { address: 'Mulund, Mumbai' }, createdAt: '2h ago', requiredSkills: ['Planning', 'Inventory'], urgency: 'Critical' },
  { _id: 'r11', title: 'Flash Flood Monitoring', description: '', status: 'Open', requiredVolunteers: 4, filledVolunteers: 1, location: { address: 'Kalina, Mumbai' }, createdAt: '45m ago', requiredSkills: ['Monitoring'], urgency: 'High' },
  { _id: 'r12', title: 'Mobile Clinic Setup', description: '', status: 'Open', requiredVolunteers: 10, filledVolunteers: 3, location: { address: 'Govandi, Mumbai' }, createdAt: '3h ago', requiredSkills: ['Medical'], urgency: 'High' },
  { _id: 'r13', title: 'Crowd Control Support', description: '', status: 'Open', requiredVolunteers: 30, filledVolunteers: 12, location: { address: 'Lower Parel, Mumbai' }, createdAt: '5h ago', requiredSkills: ['Security'], urgency: 'Medium' },
  { _id: 'r14', title: 'Solar Lantern Distribution', description: '', status: 'Open', requiredVolunteers: 6, filledVolunteers: 2, location: { address: 'Kanjurmarg, Mumbai' }, createdAt: '12h ago', requiredSkills: ['Power'], urgency: 'Low' },
  { _id: 'r15', title: 'Medication Delivery', description: '', status: 'Open', requiredVolunteers: 3, filledVolunteers: 1, location: { address: 'Airoli, Navi Mumbai' }, createdAt: '2h ago', requiredSkills: ['Medical'], urgency: 'Medium' },
  { _id: 'r16', title: 'Coastal Flooding Prevention', description: '', status: 'Open', requiredVolunteers: 20, filledVolunteers: 8, location: { address: 'Worli, Mumbai' }, createdAt: '3h ago', requiredSkills: ['Rescue'], urgency: 'High' },
  { _id: 'r17', title: 'Dharavi Sanitation Drive', description: '', status: 'Open', requiredVolunteers: 40, filledVolunteers: 15, location: { address: 'Dharavi, Mumbai' }, createdAt: '1h ago', requiredSkills: ['Health'], urgency: 'High' },
  { _id: 'r18', title: 'Industrial Safety Support', description: '', status: 'Open', requiredVolunteers: 5, filledVolunteers: 0, location: { address: 'Taloja, Navi Mumbai' }, createdAt: '10m ago', requiredSkills: ['Safety'], urgency: 'Critical' },
  { _id: 'r19', title: 'Station Crowd Management', description: '', status: 'Open', requiredVolunteers: 15, filledVolunteers: 4, location: { address: 'Panvel, Navi Mumbai' }, createdAt: '4h ago', requiredSkills: ['Security'], urgency: 'Medium' },
  { _id: 'r20', title: 'Animal Rescue Squad', description: '', status: 'Open', requiredVolunteers: 4, filledVolunteers: 1, location: { address: 'Sanpada, Navi Mumbai' }, createdAt: '12h ago', requiredSkills: ['Animals'], urgency: 'Low' }
];

export default function VolunteerDashboardMain() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Volunteer';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.length > 0 ? [...data, ...mockRecommendations] : mockRecommendations);
    } catch (err) {
      setTasks(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Hours Contributed', value: '124', icon: Clock, color: 'text-primary' },
    { label: 'Lives Impacted', value: '1,250', icon: Heart, color: 'text-secondary' },
    { label: 'Skill Badges', value: '8', icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Reliability', value: '98%', icon: CheckCircle2, color: 'text-primary' },
  ];

  return (
    <div className="space-y-12 pb-24 no-scrollbar">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden group border border-slate-100"
      >
        <div className="absolute -top-24 -right-24 opacity-5 group-hover:opacity-10 transition-all duration-700 blur-3xl text-primary">
           <div className="w-96 h-96 bg-current rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-5 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/10">
                Protocol Active: Optimal
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> +12% Efficiency Boost
              </span>
            </div>
            <h2 className="text-5xl font-bold text-slate-950 mb-6 leading-tight tracking-tight">
              Hello, <span className="text-primary">{firstName}</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed font-medium">
               The system has synchronized 15+ live crisis nodes. <span className="text-primary font-semibold">3 missions</span> match your profile criteria.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
                {user?.skills?.map(skill => (
                    <span key={skill} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors">
                        <Star className="w-3.5 h-3.5 text-secondary fill-secondary" /> {skill}
                    </span>
                ))}
            </div>
          </div>
          <Link href="/volunteer-dashboard/missions" className="bg-primary hover:bg-primary/90 text-white font-black px-12 py-7 rounded-[2.5rem] shadow-[0_30px_60px_rgba(20,184,166,0.25)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap uppercase tracking-[0.3em] text-sm flex items-center gap-4 group">
            DEPLOY SQUAD <Zap className="w-6 h-6 group-hover:animate-pulse" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden ${i % 2 === 0 ? 'bg-white' : 'bg-slate-950'}`}
          >
            <div className="flex justify-between items-center mb-5">
               <div className={`p-3 rounded-2xl border group-hover:scale-105 transition-all shadow-inner ${i % 2 === 0 ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                  <stat.icon className={`w-6 h-6 ${i % 2 === 0 ? stat.color : 'text-primary'}`} />
               </div>
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${i % 2 === 0 ? 'text-slate-400' : 'text-white/60'}`}>{stat.label}</p>
              <h3 className={`text-4xl font-black tracking-tight uppercase ${i % 2 === 0 ? 'text-slate-950' : 'text-white'}`}>{stat.value}</h3>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <stat.icon className={`w-32 h-32 ${i % 2 === 0 ? 'text-slate-900' : 'text-white'}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
         {/* Live Map Preview */}
         <div className="xl:col-span-8 space-y-10">
            <div className="flex justify-between items-end bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
               <div>
                  <h3 className="text-xs font-semibold text-primary mb-2">Tactical Awareness</h3>
                  <h2 className="text-3xl font-bold text-slate-950 tracking-tight">Global Command Hub</h2>
               </div>
               <Link href="/volunteer-dashboard/heatmap" className="bg-primary hover:bg-primary/90 text-[10px] font-black text-white px-8 py-4 rounded-2xl transition-all uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95">
                  Expand Feed
               </Link>
            </div>
            <div className="h-[850px] w-full rounded-[4.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 relative group/map">
                <LiveHeatmap />
                <div className="absolute inset-0 pointer-events-none border-[2rem] border-white/5 rounded-[4.5rem] z-20"></div>
            </div>
         </div>

         {/* Recommended Subscriptions / Tasks */}
         <div className="xl:col-span-4 flex flex-col gap-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-xs font-semibold text-secondary mb-2">Mission Feed</h3>
               <h2 className="text-3xl font-bold text-slate-950 tracking-tight">Top Targets</h2>
            </div>
            
            <div className="space-y-6 overflow-y-auto h-[850px] pr-2 no-scrollbar pb-12">
                {loading ? (
                    [1,2,3,4].map(i => <div key={i} className="h-44 bg-white border border-slate-100 rounded-[3rem] animate-pulse"></div>)
                ) : (
                    tasks.map((task) => (
                        <motion.div 
                          key={task._id}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group border-l-[12px]"
                          style={{ borderLeftColor: task.urgency === 'Critical' ? '#ef4444' : task.urgency === 'High' ? '#f59e0b' : '#10b981' }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                  <h4 className="font-bold text-slate-950 text-2xl group-hover:text-primary transition-colors leading-tight mb-3 tracking-tight">{task.title}</h4>
                                  <div className="flex items-center gap-2 text-slate-400 font-semibold text-[10px] uppercase tracking-widest">
                                    <MapPin className="w-3.5 h-3.5 text-primary" /> {task.location.address}
                                  </div>
                                </div>
                                <span className={`text-[9px] font-black ${
                                  task.urgency === 'Critical' ? 'bg-red-50 text-red-500 border-red-100' : 
                                  task.urgency === 'High' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                                  'bg-emerald-50 text-emerald-500 border-emerald-100'
                                } px-4 py-1.5 rounded-xl border uppercase tracking-[0.2em] ml-4`}>
                                  {task.urgency}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {task.requiredSkills.map(skill => (
                                    <span key={skill} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                               <div className="flex items-center gap-3 text-slate-400">
                                  <Clock className="w-4 h-4 text-slate-300" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">{task.createdAt}</span>
                               </div>
                               <button className="bg-slate-50 hover:bg-primary group-hover:bg-primary text-slate-400 group-hover:text-white border border-slate-100 group-hover:border-primary text-[10px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm group-hover:shadow-xl flex items-center gap-3">
                                  Accept <Zap className="w-4 h-4" />
                               </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[3.5rem] flex items-start gap-6 shadow-sm">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-amber-500">
                  <AlertCircle className="w-8 h-8 shrink-0" />
               </div>
               <div>
                  <p className="text-slate-950 font-bold text-sm uppercase tracking-[0.2em] mb-2">Strategic Warning</p>
                  <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                     Neural metrics suggest a decrease in response efficiency. Complete a critical mission within 24 hours to restore prime status.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>

  );
}
