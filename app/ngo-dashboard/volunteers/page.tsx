"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Star,
  MapPin,
  Mail,
  MoreVertical,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  location?: { address: string };
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd have an API for this: /api/volunteers
    // For now we'll mock some data based on the User model
    const mockVolunteers: Volunteer[] = [
      { _id: '1', name: 'Sarah Connor', email: 'sarah@example.com', skills: ['First Aid', 'Tactical'], location: { address: 'Los Angeles, sector 5' } },
      { _id: '2', name: 'John Doe', email: 'john@example.com', skills: ['Logistics', 'Driving'], location: { address: 'Mumbai South' } },
      { _id: '3', name: 'Alex Johnson', email: 'alex@example.com', skills: ['Medical', 'Nursing'], location: { address: 'Delhi West' } },
      { _id: '4', name: 'Priya Patel', email: 'priya@example.com', skills: ['Communication', 'Translating'], location: { address: 'Bangalore Central' } },
    ];
    setVolunteers(mockVolunteers);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Personnel Database</h2>
          <p className="text-gray-400">Manage and verify certified responders in your network.</p>
        </div>
        
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
           <input 
              type="text" 
              placeholder="Filter by skill, name or location..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse"></div>)
        ) : (
          volunteers.map((vol, i) => (
            <motion.div 
              key={vol._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-2xl shadow-xl">
                  {vol.name[0]}
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  {vol.name} <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {vol.email}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                 <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-4 h-4 text-primary" /> {vol.location?.address || 'Location Hidden'}
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {vol.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-secondary fill-secondary" /> {skill}
                      </span>
                    ))}
                 </div>
              </div>

              <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                View Credentials
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
