"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, MapPin, Mail, MoreVertical, ShieldCheck,
  X, Phone, Calendar, Award, ClipboardList, Flame, UserCheck
} from 'lucide-react';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  location?: { address: string };
  phone?: string;
  joinedDate?: string;
  completedMissions?: number;
  rating?: number;
  certifications?: string[];
  availability?: string;
  bio?: string;
}

const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    _id: '1', name: 'Sarah Connor', email: 'sarah@example.com',
    skills: ['First Aid', 'Tactical'], location: { address: 'Los Angeles, sector 5' },
    phone: '+91 98765 43210', joinedDate: '2024-01-15', completedMissions: 12,
    rating: 4.9, certifications: ['CPR Certified', 'Disaster Response Level 2'],
    availability: 'Weekends & Evenings', bio: 'Experienced first responder with 5+ years in emergency medical aid during natural disasters.'
  },
  {
    _id: '2', name: 'John Doe', email: 'john@example.com',
    skills: ['Logistics', 'Driving'], location: { address: 'Mumbai South' },
    phone: '+91 99000 11234', joinedDate: '2024-03-20', completedMissions: 8,
    rating: 4.7, certifications: ['Heavy Vehicle License', 'Supply Chain Mgmt'],
    availability: 'Full-time during emergencies', bio: 'Logistics coordinator specializing in last-mile supply delivery in disaster zones.'
  },
  {
    _id: '3', name: 'Alex Johnson', email: 'alex@example.com',
    skills: ['Medical', 'Nursing'], location: { address: 'Delhi West' },
    phone: '+91 98111 22333', joinedDate: '2023-11-01', completedMissions: 22,
    rating: 5.0, certifications: ['MBBS', 'Emergency Trauma Care', 'Vaccination Drive Certified'],
    availability: 'On-call 24/7', bio: 'Registered nurse and emergency physician with experience in field hospitals during flood relief.'
  },
  {
    _id: '4', name: 'Priya Patel', email: 'priya@example.com',
    skills: ['Communication', 'Translation'], location: { address: 'Bangalore Central' },
    phone: '+91 87654 32109', joinedDate: '2024-06-10', completedMissions: 5,
    rating: 4.6, certifications: ['Language Certification: Hindi/Kannada/English'],
    availability: 'Flexible', bio: 'Multilingual communicator helping bridge language barriers in community outreach programs.'
  },
];

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Volunteer | null>(null);

  useEffect(() => {
    setVolunteers(MOCK_VOLUNTEERS);
    setLoading(false);
  }, []);

  const filtered = volunteers.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Page header with decorative ring accent */}
      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60 rounded-t-[2rem]" />
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full border-2 border-primary/10" />
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full border-2 border-secondary/10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Personnel Database</h2>
            <p className="text-slate-500">Manage and verify certified responders in your network.</p>
          </div>
          <div className="relative w-full md:w-96">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
                type="text" 
                placeholder="Filter by skill, name or location..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
        ) : (
          filtered.map((vol, i) => (
            <motion.div 
              key={vol._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden bg-white border border-gray-200 p-7 rounded-[2.5rem] hover:shadow-lg transition-all group shadow-sm"
            >
              {/* Decorative gradient top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60 rounded-t-[2.5rem]" />
              
              {/* Ring decorations bottom-right */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full border-2 border-primary/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border border-secondary/10 group-hover:scale-110 transition-transform duration-500 delay-75 pointer-events-none" />

              <div className="relative z-10 flex justify-between items-start mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-white text-2xl shadow-xl">
                  {vol.name[0]}
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black text-amber-700">{vol.rating?.toFixed(1)}</span>
                </div>
              </div>

              <div className="relative z-10 mb-5">
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  {vol.name} <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {vol.email}
                </p>
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-4 h-4 text-primary shrink-0" /> {vol.location?.address || 'Location Hidden'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ClipboardList className="w-4 h-4 text-secondary shrink-0" /> {vol.completedMissions} missions completed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {vol.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-50 border border-gray-200 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-secondary fill-secondary" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelected(vol)}
                className="w-full py-3.5 rounded-2xl bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 text-primary font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white"
              >
                <UserCheck className="w-4 h-4" /> View Credentials
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-8 relative">
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center font-black text-white text-3xl shadow-xl border-2 border-white/30">
                      {selected.name[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{selected.name}</h2>
                      <p className="text-white/80 text-sm mt-0.5">{selected.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span className="text-white font-bold text-sm">{selected.rating?.toFixed(1)} · {selected.completedMissions} missions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                  {/* Bio */}
                  {selected.bio && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">About</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{selected.bio}</p>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4">
                    {selected.phone && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" /> {selected.phone}
                        </p>
                      </div>
                    )}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                        {selected.joinedDate ? new Date(selected.joinedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                      <p className="text-sm font-bold text-slate-800">{selected.availability || 'Flexible'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-slate-800">{selected.location?.address || 'Hidden'}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Skill Set</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {selected.certifications && selected.certifications.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Certifications</p>
                      <div className="space-y-2">
                        {selected.certifications.map(cert => (
                          <div key={cert} className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-sm font-semibold text-emerald-800">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
