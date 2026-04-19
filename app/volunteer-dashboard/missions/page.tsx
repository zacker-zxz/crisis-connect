"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  ChevronRight, 
  Search,
  Users,
  AlertCircle,
  Zap
} from 'lucide-react';
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

export default function MissionsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

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

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Available Missions</h2>
          <p className="text-gray-400">Discover where your skills are needed most right now.</p>
        </div>
        
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
           <input 
              type="text" 
              placeholder="Search by mission, location, or skill..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>)
         ) : tasks.filter(t => t.status === 'Open').length === 0 ? (
            <div className="lg:col-span-2 glass-card p-20 rounded-[3rem] text-center">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">No missions found.</h3>
                <p className="text-gray-400">Rest easy, the orchestration engine will ping you when a need arises.</p>
            </div>
         ) : (
            tasks.filter(t => t.status === 'Open').map((task) => (
               <motion.div 
                 key={task._id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:bg-white/10 transition-all group flex flex-col justify-between"
               >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                          <Zap className="w-7 h-7" />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Posted</p>
                          <p className="text-xs font-bold text-white">{new Date(task.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{task.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                       {task.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="flex items-center gap-2.5 text-xs text-gray-300">
                          <MapPin className="w-4 h-4 text-primary" /> {task.location.address}
                       </div>
                       <div className="flex items-center gap-2.5 text-xs text-gray-300">
                          <Users className="w-4 h-4 text-primary" /> {task.filledVolunteers}/{task.requiredVolunteers} Needed
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {task.requiredSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                             {skill}
                          </span>
                       ))}
                    </div>
                  </div>

                  <button className="w-full mt-10 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
                     Accept Mission <ChevronRight className="w-5 h-5" />
                  </button>
               </motion.div>
            ))
         )}
      </div>
    </div>
  );
}
