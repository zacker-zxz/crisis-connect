"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  MessageSquare, 
  MoreVertical,
  Activity,
  AlertCircle
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  status: string;
  location: { address: string };
  dateTime: string;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking active assignments
    const mockTasks: Task[] = [
      { _id: '1', title: 'Medical Camp Setup', status: 'In Progress', location: { address: 'Sector 4, Navi Mumbai' }, dateTime: '2026-04-20T10:00:00Z' },
      { _id: '2', title: 'Food Distribution', status: 'Completed', location: { address: 'Dharavi Slums' }, dateTime: '2026-04-18T14:00:00Z' },
    ];
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Active Deployments</h2>
        <p className="text-gray-400">Track your ongoing commitments and past contributions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             [1,2].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>)
        ) : tasks.length === 0 ? (
            <div className="glass-card p-20 rounded-[3rem] text-center border-white/5">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">No active assignments.</h3>
                <p className="text-gray-400">Jump into the Missions tab to start making an impact.</p>
            </div>
        ) : (
            tasks.map((task) => (
                <motion.div 
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:bg-white/10 transition-all flex flex-col md:flex-row items-center gap-8 group"
                >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border ${
                        task.status === 'Completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-primary/10 text-primary border-primary/20 animate-pulse-slow'
                    }`}>
                        {task.status === 'Completed' ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{task.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 border ${
                                task.status === 'Completed' ? 'text-emerald-400 border-emerald-400/30' : 'text-primary border-primary/30'
                            }`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                             <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin className="w-4 h-4 text-primary" /> {task.location.address}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Clock className="w-4 h-4 text-secondary" /> {new Date(task.dateTime).toLocaleString()}
                             </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all font-bold text-sm flex items-center gap-2">
                           <MessageSquare className="w-4 h-4" /> Support
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all font-bold text-sm">
                           Details
                        </button>
                    </div>
                </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
