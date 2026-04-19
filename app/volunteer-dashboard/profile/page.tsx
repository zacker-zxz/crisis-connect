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
  Map as MapIcon,
  Zap,
  Target,
  Trophy
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VolunteerProfilePage() {
  const { user } = useAuthStore();
  const availabilitySlots =
    user?.availability?.filter((slot) => slot.enabled).map((slot) => `${slot.day}: ${slot.start} - ${slot.end}`) || [];
  const dispatchMonthlyData = [
    { month: 'JAN', value: 42 },
    { month: 'FEB', value: 58 },
    { month: 'MAR', value: 47 },
    { month: 'APR', value: 71 },
    { month: 'MAY', value: 64 },
    { month: 'JUN', value: 62 },
    { month: 'JUL', value: 53 },
    { month: 'AUG', value: 76 },
    { month: 'SEP', value: 49 },
    { month: 'OCT', value: 83 },
    { month: 'NOV', value: 68 },
    { month: 'DEC', value: 88 },
  ];

  const achievements = [
    { title: 'First Responder', date: 'April 2026', icon: ShieldCheck, color: 'text-primary' },
    { title: 'Community Hero', date: 'March 2026', icon: Heart, color: 'text-rose-500' },
    { title: 'Logistics Pro', date: 'Feb 2026', icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="w-full pb-20 space-y-10">
      {/* Profile Header - Professional White Theme */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[4rem] border border-slate-100 relative overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center gap-12">
           <div className="relative">
              <div className="w-48 h-48 rounded-[3.5rem] bg-gradient-to-tr from-primary via-emerald-400 to-secondary p-1 shadow-[0_20px_50px_rgba(20,184,166,0.1)]">
                 <div className="w-full h-full bg-slate-50 rounded-[3.3rem] flex items-center justify-center font-black text-6xl text-slate-900 overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.[0]
                    )}
                 </div>
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-2 -right-2 bg-primary text-white p-4 rounded-3xl border-8 border-white shadow-xl rotate-12"
              >
                 <ShieldCheck className="w-8 h-8" />
              </motion.div>
           </div>

           <div className="flex-1 text-center lg:text-left space-y-6">
              <div>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-2">
                    <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase">{user?.name}</h2>
                  </div>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-sm mt-1">Certified Crisis Response Architect</p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-2">
                 <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-slate-50 rounded-xl"><MapPin className="w-4 h-4 text-primary" /></div>
                    <span className="font-extrabold text-xs uppercase tracking-widest">Mumbai Hub</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-slate-50 rounded-xl"><Calendar className="w-4 h-4 text-secondary" /></div>
                    <span className="font-extrabold text-xs uppercase tracking-widest">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                 </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                 {user?.skills?.filter(s => s.toLowerCase() !== 'xyz').map(skill => (
                    <span key={skill} className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-primary transition-all cursor-default">
                       {skill}
                    </span>
                 ))}
              </div>
           </div>

           <div className="flex flex-col gap-6 w-full lg:w-72">
              <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 text-center relative group hover:border-secondary transition-all overflow-hidden shadow-2xl">
                 <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-3 relative z-10">Impact Score</p>
                 <p className="text-5xl font-black text-secondary tracking-tighter relative z-10">2.4k</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center relative group hover:border-primary transition-all overflow-hidden shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 relative z-10">Missions</p>
                 <p className="text-5xl font-black text-primary tracking-tighter relative z-10">12</p>
              </div>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-10">
            {/* Mission Performance Chart Section */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-3xl font-black text-slate-950 tracking-tighter mb-1 flex items-center gap-3 uppercase">
                       <Activity className="w-8 h-8 text-primary" /> DISPATCH PERFORMANCE
                    </h3>
                    <p className="text-slate-500 font-bold text-xs tracking-widest uppercase ml-11">Monthly Efficiency Metrics</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-widest uppercase border border-slate-100">12 Months</div>
                  </div>
               </div>
               
               <div className="h-80 flex items-end justify-between gap-6 px-4">
                  {dispatchMonthlyData.map((entry, i) => (
                    <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${entry.value}%` }}
                           transition={{ duration: 1, delay: i * 0.05, ease: "circOut" }}
                           className="w-full bg-blue-500 rounded-2xl transition-all relative overflow-hidden shadow-[0_0_0_rgba(59,130,246,0)] group-hover:shadow-[0_0_22px_rgba(59,130,246,0.55)]"
                        >
                           <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 opacity-0 group-hover:opacity-100"></div>
                        </motion.div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                           {entry.value}%
                        </div>
                        <p className="text-[9px] font-black text-slate-400 text-center mt-4">{entry.month}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Milestones Card */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-3xl font-black text-slate-950 tracking-tighter mb-1 flex items-center gap-4 uppercase">
                            <Trophy className="w-8 h-8 text-secondary" /> CORE MILESTONES
                        </h3>
                        <p className="text-slate-500 font-bold text-xs tracking-widest uppercase ml-12">Decrypted Achievements</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements.map((item, i) => (
                        <motion.div 
                          key={item.title} 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-slate-50 hover:bg-white border border-slate-100 hover:border-primary transition-all group shadow-sm hover:shadow-xl"
                        >
                            <div className={`p-6 rounded-3xl bg-white shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all ${item.color}`}>
                                <item.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-xl text-slate-900 tracking-tight mb-1 uppercase">{item.title}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                            </div>
                            <Award className="w-6 h-6 text-slate-200 group-hover:text-secondary transition-colors" />
                        </motion.div>
                    ))}
                    <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 opacity-50">
                        <div className="p-6 rounded-3xl bg-white shadow-xl text-slate-300">
                           <Target className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-xl text-slate-400 tracking-tight mb-1 uppercase">Locked</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next objective</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Sidebar Content */}
         <div className="space-y-10">
             {/* Operations Radius Card */}
             <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm h-full flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tighter">
                    <MapIcon className="w-6 h-6 text-primary" /> Sector Coverage
                </h3>
                
                <div className="flex-1 flex flex-col items-center justify-center relative my-12">
                   <div className="relative w-full aspect-square flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping"></div>
                      <div className="absolute inset-8 rounded-full border border-primary/20 animate-pulse"></div>
                      <div className="absolute inset-16 rounded-full border border-primary/30"></div>
                      <div className="relative z-10 text-center">
                          <p className="text-7xl font-black text-slate-900 tracking-tighter">25km</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">Maximum Radius</p>
                      </div>
                   </div>
                </div>

                <div className="mt-12 space-y-4">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">My Availability</p>
                        {availabilitySlots.length > 0 ? (
                          <div className="space-y-2">
                            {availabilitySlots.map((slot) => (
                              <p key={slot} className="text-sm font-semibold text-slate-700">{slot}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No availability saved yet. Update it in Settings.</p>
                        )}
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Tactical Base</p>
                        <p className="text-lg font-black text-slate-900">Mumbai South Cluster</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-secondary/30 transition-all group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Combat Response</p>
                        <p className="text-lg font-black text-emerald-600">12 Minutes</p>
                    </div>
                </div>

                <div className="mt-10 p-10 bg-primary/5 rounded-[3rem] border border-primary/10 text-center">
                    <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h5 className="text-slate-900 font-black text-xl mb-2">HIGH ALERT READY</h5>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">System confirms tactical readiness for immediate deployment within active sectors.</p>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
