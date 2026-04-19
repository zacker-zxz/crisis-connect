"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Award, 
  MapPin, 
  Calendar, 
  Star,
  Activity,
  ShieldCheck,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VolunteerProfilePage() {
  const { user } = useAuthStore();

  const achievements = [
    { title: 'First Responder', date: 'April 2026', icon: ShieldCheck, color: 'text-primary' },
    { title: 'Community Hero', date: 'March 2026', icon: Heart, color: 'text-secondary' },
    { title: 'Logistics Pro', date: 'Feb 2026', icon: Star, color: 'text-emerald-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[3rem] border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
           <div className="relative">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-primary to-secondary p-1">
                 <div className="w-full h-full bg-slate-900 rounded-[2.8rem] flex items-center justify-center font-black text-5xl text-white">
                    {user?.name[0]}
                 </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-2xl border-4 border-slate-900 shadow-xl">
                 <ShieldCheck className="w-6 h-6 text-white" />
              </div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                  <h2 className="text-4xl font-black text-white tracking-tight">{user?.name}</h2>
                  <p className="text-primary font-bold tracking-widest uppercase text-sm mt-1 italic">Certified Social Orchestrator</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                 <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <MapPin className="w-4 h-4 text-primary" /> <span>Mumbai, India</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Calendar className="w-4 h-4 text-secondary" /> <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                 </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
                 {user?.skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-300 uppercase tracking-widest">
                       {skill}
                    </span>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="glass-card p-6 rounded-3xl border-white/5 text-center px-8">
                 <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Impact Score</p>
                 <p className="text-3xl font-black text-secondary">2,450</p>
              </div>
              <div className="glass-card p-6 rounded-3xl border-white/5 text-center px-8">
                 <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Missions</p>
                 <p className="text-3xl font-black text-primary">12</p>
              </div>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Stats and Activity */}
         <div className="md:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
               <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" /> Mission Performance
               </h3>
               <div className="h-64 flex items-end justify-between gap-4 px-4">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 space-y-2">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-xl"
                        ></motion.div>
                        <p className="text-[10px] font-black text-gray-600 text-center">W{i+1}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-secondary" /> Impact Milestones
                </h3>
                <div className="space-y-6">
                    {achievements.map((item, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all group">
                            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-all ${item.color}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">Awarded on {item.date}</p>
                            </div>
                            <Award className="w-6 h-6 text-gray-700 group-hover:text-secondary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* Neighborhood Coverage */}
         <div className="space-y-8">
             <div className="glass-card p-8 rounded-[2.5rem] border-white/5 h-full">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <MapIcon className="w-5 h-5 text-primary" /> Service Radius
                </h3>
                <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 opacity-20 grayscale">
                        {/* Mock map pattern */}
                        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                    </div>
                    <div className="text-center relative z-10 px-6">
                        <p className="text-5xl font-black text-white mb-2">15km</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Response Zone</p>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs font-bold text-gray-500 mb-1">Primary Base</p>
                        <p className="text-sm font-bold text-white">South Mumbai Cluster</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs font-bold text-gray-500 mb-1">Avg Response Time</p>
                        <p className="text-sm font-bold text-emerald-400">18 Minutes</p>
                    </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
