"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Search,
  Users,
  Clock,
  MapPin,
  MoreVertical,
  CheckCircle2,
  Play
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
}

export default function ActiveTasksPage() {
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
          <h2 className="text-3xl font-black text-white tracking-tight">Active Orchestrations</h2>
          <p className="text-gray-400">Monitor and manage your organization's ongoing missions.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search missions..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                />
            </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Mission Name</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Deployment</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Location</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-6 bg-white/5 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-medium">No missions active.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">{task.title}</p>
                          <p className="text-xs text-gray-500">ID: {task._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        task.status === 'Open' ? 'text-secondary border-secondary/30 bg-secondary/5' : 
                        task.status === 'In Progress' ? 'text-primary border-primary/30 bg-primary/5' : 
                        'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-bold">{task.filledVolunteers}</span> 
                        <span className="text-gray-500">/ {task.requiredVolunteers}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-xs text-gray-400">
                          <MapPin className="w-4 h-4 text-primary" /> {task.location.address}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
