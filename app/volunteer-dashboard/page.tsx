"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Star,
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Route,
  Search,
  Sparkles,
  BrainCircuit,
  Globe2,
  Share2,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LiveHeatmap from '@/components/maps/LiveHeatmap';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

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
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Urgent';
}

type GuardianResonance = {
  recommendedTaskId: string;
  recommendedTitle?: string;
  reasoning: string;
  impactPotential: number;
};

const mockRecommendations: Task[] = [
  { _id: 'r1', title: 'Medical Aid Dispatch', description: '', status: 'Open', requiredVolunteers: 5, filledVolunteers: 2, location: { address: 'Kurla West, Mumbai' }, createdAt: '2m ago', requiredSkills: ['First Aid', 'Logistics'], priority: 'Critical' },
  { _id: 'r2', title: 'Flood Relief Coordination', description: '', status: 'Open', requiredVolunteers: 10, filledVolunteers: 4, location: { address: 'Bandra, Mumbai' }, createdAt: '1h ago', requiredSkills: ['Rescue', 'Swimming'], priority: 'High' },
  { _id: 'r3', title: 'Food Distribution Drive', description: '', status: 'Open', requiredVolunteers: 20, filledVolunteers: 12, location: { address: 'Andheri, Mumbai' }, createdAt: '4h ago', requiredSkills: ['Cooking', 'Distribution'], priority: 'Medium' },
  { _id: 'r4', title: 'Oxygen Delivery Team', description: '', status: 'Open', requiredVolunteers: 3, filledVolunteers: 1, location: { address: 'Vashi, Navi Mumbai' }, createdAt: '30m ago', requiredSkills: ['Driving', 'Hazmat'], priority: 'Critical' },
  { _id: 'r5', title: 'Elderly Support Outreach', description: '', status: 'Open', requiredVolunteers: 8, filledVolunteers: 3, location: { address: 'Belapur, Navi Mumbai' }, createdAt: '6h ago', requiredSkills: ['Healthcare', 'Marathi'], priority: 'Medium' },
  { _id: 'r6', title: 'Debris Clearing Squad', description: '', status: 'Open', requiredVolunteers: 15, filledVolunteers: 7, location: { address: 'Thane, Mumbai' }, createdAt: '8h ago', requiredSkills: ['Operations', 'Physical'], priority: 'High' },
  { _id: 'r7', title: 'Sanitation Kit Assembly', description: '', status: 'Open', requiredVolunteers: 50, filledVolunteers: 42, location: { address: 'Ghatkopar, Mumbai' }, createdAt: '12h ago', requiredSkills: ['General'], priority: 'Medium' },
  { _id: 'r8', title: 'Shelter Management Help', description: '', status: 'Open', requiredVolunteers: 12, filledVolunteers: 5, location: { address: 'Malad, Mumbai' }, createdAt: '10h ago', requiredSkills: ['Admin', 'Support'], priority: 'High' },
  { _id: 'r9', title: 'Community Kitchen Team', description: '', status: 'Open', requiredVolunteers: 25, filledVolunteers: 18, location: { address: 'Colaba, Mumbai' }, createdAt: '1d ago', requiredSkills: ['Kitchen', 'Hygiene'], priority: 'Medium' },
  { _id: 'r10', title: 'Rescue Logistics Support', description: '', status: 'Open', requiredVolunteers: 6, filledVolunteers: 2, location: { address: 'Mulund, Mumbai' }, createdAt: '2h ago', requiredSkills: ['Planning', 'Inventory'], priority: 'Critical' },
  { _id: 'r11', title: 'Flash Flood Monitoring', description: '', status: 'Open', requiredVolunteers: 4, filledVolunteers: 1, location: { address: 'Kalina, Mumbai' }, createdAt: '45m ago', requiredSkills: ['Monitoring'], priority: 'High' },
  { _id: 'r12', title: 'Mobile Clinic Setup', description: '', status: 'Open', requiredVolunteers: 10, filledVolunteers: 3, location: { address: 'Govandi, Mumbai' }, createdAt: '3h ago', requiredSkills: ['Medical'], priority: 'High' },
  { _id: 'r13', title: 'Crowd Control Support', description: '', status: 'Open', requiredVolunteers: 30, filledVolunteers: 12, location: { address: 'Lower Parel, Mumbai' }, createdAt: '5h ago', requiredSkills: ['Security'], priority: 'Medium' },
  { _id: 'r14', title: 'Solar Lantern Distribution', description: '', status: 'Open', requiredVolunteers: 6, filledVolunteers: 2, location: { address: 'Kanjurmarg, Mumbai' }, createdAt: '12h ago', requiredSkills: ['Power'], priority: 'Low' },
  { _id: 'r15', title: 'Medication Delivery', description: '', status: 'Open', requiredVolunteers: 3, filledVolunteers: 1, location: { address: 'Airoli, Navi Mumbai' }, createdAt: '2h ago', requiredSkills: ['Medical'], priority: 'Medium' },
  { _id: 'r16', title: 'Coastal Flooding Prevention', description: '', status: 'Open', requiredVolunteers: 20, filledVolunteers: 8, location: { address: 'Worli, Mumbai' }, createdAt: '3h ago', requiredSkills: ['Rescue'], priority: 'High' },
  { _id: 'r17', title: 'Dharavi Sanitation Drive', description: '', status: 'Open', requiredVolunteers: 40, filledVolunteers: 15, location: { address: 'Dharavi, Mumbai' }, createdAt: '1h ago', requiredSkills: ['Health'], priority: 'High' },
  { _id: 'r18', title: 'Industrial Safety Support', description: '', status: 'Open', requiredVolunteers: 5, filledVolunteers: 0, location: { address: 'Taloja, Navi Mumbai' }, createdAt: '10m ago', requiredSkills: ['Safety'], priority: 'Critical' },
  { _id: 'r19', title: 'Station Crowd Management', description: '', status: 'Open', requiredVolunteers: 15, filledVolunteers: 4, location: { address: 'Panvel, Navi Mumbai' }, createdAt: '4h ago', requiredSkills: ['Security'], priority: 'Medium' },
  { _id: 'r20', title: 'Animal Rescue Squad', description: '', status: 'Open', requiredVolunteers: 4, filledVolunteers: 1, location: { address: 'Sanpada, Navi Mumbai' }, createdAt: '12h ago', requiredSkills: ['Animals'], priority: 'Low' }
];

const ShareModal = ({ isOpen, onClose, score }: { isOpen: boolean, onClose: () => void, score: string }) => {
  const shareText = `I just reached an Impact Score of ${score} on Crisis Connect! 🌍 Honored to be part of the front-line rescue operations. Join the squad! #CrisisConnect #VolunteerImpact`;
  
  const platforms = [
    { 
      name: 'Twitter', 
      icon: Twitter, 
      color: 'bg-[#1DA1F2]', 
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` 
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-[#4267B2]', 
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://crisis-connect.app')}&quote=${encodeURIComponent(shareText)}` 
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', 
      link: `https://www.instagram.com` 
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 pointer-events-auto"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10 text-center">
               <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
                  <Share2 className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Share Your Impact</h3>
               <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                 Heroic efforts deserve to be seen. Share your latest impact score and inspire others to join the mission.
               </p>

               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Preview</p>
                  <p className="text-slate-700 text-xs font-medium italic">"{shareText}"</p>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  {platforms.map(p => (
                    <a 
                      key={p.name}
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className={`w-14 h-14 ${p.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all`}>
                        <p.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</span>
                    </a>
                  ))}
               </div>

               <button 
                 onClick={onClose}
                 className="mt-10 w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
               >
                 Maybe Later
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function VolunteerDashboardMain() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeMissions, setActiveMissions] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<GuardianResonance | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [guardianDeployLoading, setGuardianDeployLoading] = useState(false);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Volunteer';
  const [showShareModal, setShowShareModal] = useState(false);
  const [mapSelectedTaskId, setMapSelectedTaskId] = useState<string | undefined>(undefined);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      
      const userId = user?.id || user?._id;
      const available = data.filter((t: any) => !t.assignedVolunteers?.includes(userId));
      const joined = data.filter((t: any) => t.assignedVolunteers?.includes(userId));
      
      setTasks(available.length > 0 ? available : mockRecommendations);
      setActiveMissions(joined);
    } catch (err) {
      setTasks(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const fetchResonance = useCallback(async () => {
    if (!token) {
      setRecommendation(null);
      return;
    }
    setRecLoading(true);
    try {
      const res = await fetch('/api/volunteer/resonance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: '{}',
      });
      const data = await res.json();
      if (!res.ok) {
        setRecommendation(null);
        return;
      }
      if (!data.recommendedTaskId) {
        setRecommendation(null);
        return;
      }
      setRecommendation({
        recommendedTaskId: data.recommendedTaskId,
        recommendedTitle: data.recommendedTitle,
        reasoning: data.reasoning,
        impactPotential: data.impactPotential,
      });
    } catch (err) {
      console.error('Resonance error', err);
      setRecommendation(null);
    } finally {
      setRecLoading(false);
    }
  }, [token]);

  const handleAcceptMission = async (task: Task) => {
    if (!token) return;
    const minOverlayMs = 2800;
    const startedAt = Date.now();
    setGuardianDeployLoading(true);
    let accepted = false;
    try {
      const res = await fetch(`/api/tasks/${task._id}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (res.ok) {
        accepted = true;
        addNotification({
          title: 'Mission Commenced',
          message: `You have successfully deployed for "${task.title}". HQ is tracking your signal.`,
          type: 'mission'
        });
        try {
          const userId = String(user?.id || user?._id || "");
          if (userId) {
            const etaMinutes = 60;
            const reachByTs = Date.now() + etaMinutes * 60_000;
            localStorage.setItem(`reachBy:${userId}:${task._id}`, String(reachByTs));
          }
        } catch {}
        // send them to the briefing page after accept goes through
      } else {
        const error = await res.json();
        alert(error.error || "Failed to accept mission");
      }
    } catch (err) {
      console.error("Accept error", err);
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minOverlayMs - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      setGuardianDeployLoading(false);
      if (accepted) {
        router.push(`/volunteer-dashboard/missions/${task._id}`);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (!token) {
      setRecommendation(null);
      return;
    }
    fetchResonance();
  }, [token, user?.id, user?._id, fetchResonance]);

  const stats = [
    { label: 'Hours Contributed', value: '124', icon: Clock, color: 'text-primary' },
    { label: 'Impact Score', value: '1,250', icon: Heart, color: 'text-secondary', shareable: true },
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

      {/* Guardian AI Recommendation Section */}
      <AnimatePresence>
        {(recommendation || recLoading) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[3.5rem] overflow-hidden shadow-[0_20px_50px_rgba(20,184,166,0.15)] group"
          >
            <div className="bg-white rounded-[3.4rem] p-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border-4 border-slate-100 shadow-xl relative overflow-hidden">
                <BrainCircuit className="w-10 h-10 text-primary z-10" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-primary"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                    <Sparkles className="w-4 h-4" /> Guardian AI Insight
                  </span>
                  {recommendation && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      {recommendation.impactPotential}% Impact Potential
                    </span>
                  )}
                </div>

                {recLoading ? (
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-16 w-full bg-slate-50 rounded-2xl animate-pulse"></div>
                  </div>
                ) : recommendation && (
                  <>
                    <h3 className="text-3xl font-black text-slate-950 mb-4 tracking-tight leading-none uppercase">
                      Recommended: <span className="text-primary">{recommendation.recommendedTitle || tasks.find(t => t._id === recommendation.recommendedTaskId)?.title || "Special Dispatch"}</span>
                    </h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed italic border-l-4 border-primary pl-6">
                      "{recommendation.reasoning}"
                    </p>
                    <Link
                      href="/volunteer-dashboard/resonance"
                      className="mt-5 inline-flex text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                    >
                      Open full resonance field →
                    </Link>
                  </>
                )}
              </div>

              {!recLoading && recommendation && (
                <button 
                  onClick={() => {
                    const task = tasks.find(t => t._id === recommendation.recommendedTaskId);
                    if (task) handleAcceptMission(task);
                  }}
                  className="bg-slate-950 hover:bg-primary text-white font-black px-12 py-7 rounded-[2rem] transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.3em] text-xs flex items-center gap-4 group shadow-2xl"
                >
                  Confirm Deployment <Globe2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.button 
            key={i}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={stat.shareable ? { scale: 1.02, y: -5 } : {}}
            whileTap={stat.shareable ? { scale: 0.98 } : {}}
            onClick={() => {
              if (stat.shareable) {
                setShowShareModal(true);
              }
            }}
            className={`p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all group relative overflow-hidden text-left w-full block ${stat.shareable ? 'cursor-pointer hover:shadow-xl hover:border-primary/50 ring-offset-2 focus:ring-2 focus:ring-primary' : 'pointer-events-none'} ${i % 2 === 0 ? 'bg-white' : 'bg-slate-950'}`}
          >
            <div className="flex justify-between items-center mb-5">
               <div className={`p-3 rounded-2xl border group-hover:scale-105 transition-all shadow-inner ${i % 2 === 0 ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                  <stat.icon className={`w-6 h-6 ${i % 2 === 0 ? stat.color : 'text-primary'}`} />
               </div>
               {stat.shareable && (
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 border border-primary/20">
                    <Share2 className="w-3 h-3" /> SHARE
                 </div>
               )}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${i % 2 === 0 ? 'text-slate-400' : 'text-white/60'}`}>{stat.label}</p>
              <h3 className={`text-4xl font-black tracking-tight uppercase ${i % 2 === 0 ? 'text-slate-950' : 'text-white'}`}>{stat.value}</h3>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <stat.icon className={`w-32 h-32 ${i % 2 === 0 ? 'text-slate-900' : 'text-white'}`} />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Live Heatmap Feed */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-primary mb-2 uppercase tracking-widest">Tactical Awareness</h3>
              <h2 className="text-2xl font-bold text-slate-900">Global Command Hub</h2>
            </div>
            <Link href="/volunteer-dashboard/heatmap" className="p-3 bg-slate-50 hover:bg-primary text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-primary shadow-sm">
              <Globe2 className="w-6 h-6" />
            </Link>
          </div>
          <div className="h-[750px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 relative group">
            <LiveHeatmap selectedTaskId={mapSelectedTaskId} onAcceptTask={handleAcceptMission} />
            <div className="absolute top-8 left-8 z-10">
              <div className="bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Real-time Node Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Recommendations / Targets */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-secondary mb-2 uppercase tracking-widest">Mission Feed</h3>
                <h2 className="text-2xl font-bold text-slate-900">Top Targets</h2>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
           </div>

           <div className="space-y-5 overflow-y-auto no-scrollbar" style={{ maxHeight: '720px' }}>
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} className="h-44 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-pulse" />)
              ) : (
                tasks.map((task) => (
                  <motion.div 
                    key={task._id}
                    onClick={() => setMapSelectedTaskId(task._id)}
                    whileHover={{ x: 10, scale: 1.02 }}
                    className={`bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-xl transition-all cursor-pointer group border-l-[12px] ${mapSelectedTaskId === task._id ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-slate-100'}`}
                    style={{ borderLeftColor: (task.priority === 'Critical' || task.priority === 'Urgent') ? '#ef4444' : task.priority === 'High' ? '#f59e0b' : '#10b981' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors leading-tight line-clamp-1">{task.title}</h4>
                      <span className={`text-[8px] font-black ${
                        (task.priority === 'Critical' || task.priority === 'Urgent') ? 'bg-red-50 text-red-500 border-red-100' : 
                        task.priority === 'High' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                        'bg-emerald-50 text-emerald-500 border-emerald-100'
                      } px-3 py-1 rounded-lg border uppercase tracking-widest`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-6">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> <span className="line-clamp-1">{task.location.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                       <div className="flex flex-wrap gap-2">
                        {task.requiredSkills.slice(0, 2).map(skill => (
                          <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-500 text-[8px] font-bold rounded-lg uppercase tracking-widest">{skill}</span>
                        ))}
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleAcceptMission(task);
                         }}
                         className="p-3 bg-slate-50 hover:bg-primary text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-primary shadow-sm"
                       >
                         <Zap className="w-4 h-4" />
                       </button>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>

      {/* My Active Missions Section */}
      {activeMissions.length > 0 && (
        <div className="w-full space-y-8 pb-20">
            <div className="flex items-center gap-4">
              <div className="h-2 w-12 bg-primary rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Active Deployments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMissions.map((mission) => (
                <motion.div 
                  key={mission._id}
                  whileHover={{ y: -5 }}
                  className="bg-slate-950 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/40 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-primary">
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-xl border border-emerald-400/20 uppercase tracking-[0.2em]">Live Status</span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2 leading-tight">{mission.title}</h4>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-6">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {mission.location.address}
                    </div>
                    <Link href={`/volunteer-dashboard/missions?id=${mission._id}`} className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-white/10 group-hover/btn:border-transparent">
                        Briefing Center <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      )}

      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        score="1,250" 
      />

      <LoadingScreen
        isVisible={guardianDeployLoading}
        variant="solid"
        headline="Confirming deployment"
        statusLines={[
          'Handshaking with command node…',
          'Allocating mission telemetry…',
          'Sealing deployment clearance…',
        ]}
      />
    </div>
  );
}
