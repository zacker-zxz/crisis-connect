"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, MapPin, Mail, ShieldCheck,
  X, Phone, Calendar, Award, ClipboardList, UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { NGO_SEED_TEAM } from '@/lib/ngoTeamSeed';

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

const bios = [
  'Police reform and community volunteer training advocate; supports disaster discipline on ground.',
  'Grassroots organiser for rural relief and anti-corruption supply-chain transparency.',
  'Displacement and rehabilitation specialist; coordinates with authorities during evacuations.',
  'Orphan care and women’s shelter networks; last-mile family reunification after floods.',
];

const MOCK_VOLUNTEERS: Volunteer[] = NGO_SEED_TEAM.map((t, i) => ({
  _id: t.id,
  name: t.name,
  email: `${t.name.toLowerCase().replace(/\s+/g, '.')}@relief-khindi.org`,
  skills: i === 0 ? ['First Aid', 'Crowd Management'] : i === 1 ? ['Logistics', 'Community Kitchen'] : i === 2 ? ['Advocacy', 'Shelter Ops'] : ['Child Protection', 'Counselling'],
  location: { address: i % 2 === 0 ? 'Mumbai, Maharashtra' : 'Navi Mumbai, Maharashtra' },
  phone: `+91 98${700 + i} 12${100 + i}`,
  joinedDate: `2024-0${i + 1}-15`,
  completedMissions: 10 + i * 3,
  rating: 4.7 + i * 0.05,
  certifications: i === 0 ? ['CPR', 'Disaster Response L2'] : ['Field Safety', 'Relief Logistics'],
  availability: 'On-call during orange/red alerts',
  bio: bios[i] ?? bios[0],
}));

function volunteerFromApprovedRequest(req: any): Volunteer | null {
  const v = req.volunteerId;
  if (!v || typeof v === 'string') return null;
  const id = String(v._id ?? v.id ?? '');
  if (!id) return null;
  return {
    _id: id,
    name: v.name || 'Volunteer',
    email: v.email || '',
    skills: Array.isArray(v.skills) ? v.skills : [],
    location: v.location?.address ? { address: v.location.address } : { address: 'India' },
    phone: v.phone,
    joinedDate: req.updatedAt || req.createdAt || new Date().toISOString(),
    completedMissions: 0,
    rating: 4.5,
    certifications: [],
    availability: 'Joined via Crisis Connect',
    bio: 'Approved volunteer from your join requests.',
  };
}

function mergeNetworkTeam(base: Volunteer[], requests: any[]): Volunteer[] {
  const approved = requests
    .filter((r) => r.status === 'Approved')
    .map(volunteerFromApprovedRequest)
    .filter(Boolean) as Volunteer[];
  const seen = new Set(base.map((b) => b._id));
  const extra = approved.filter((a) => !seen.has(a._id));
  return [...base, ...extra];
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [activeTab, setActiveTab] = useState<'network' | 'requests'>('network');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/ngo-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRequests(data);
          setVolunteers(mergeNetworkTeam(MOCK_VOLUNTEERS, data));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setVolunteers(MOCK_VOLUNTEERS);
      setLoading(false);
      return;
    }
    fetchRequests().finally(() => setLoading(false));
  }, [token, fetchRequests]);

  const handleRequestAction = async (requestId: string, status: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const res = await fetch('/api/ngo-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, status }),
      });
      if (res.ok) {
        await fetchRequests();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Could not update request');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

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
          
          <div className="flex bg-slate-100 p-1 rounded-2xl md:ml-auto">
            <button 
              onClick={() => setActiveTab('network')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'network' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Network
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'requests' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Requests
              {requests.filter(r => r.status === 'Pending').length > 0 && (
                <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] shadow-md">
                  {requests.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full md:w-80">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
                type="text" 
                placeholder="Filter network..." 
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
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
             <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-[3rem] shadow-sm">
                <p className="text-slate-500">No incoming volunteer requests found.</p>
             </div>
          ) : (
            requests.map((req, i) => (
             <motion.div 
              key={req._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden bg-white border border-gray-200 p-7 rounded-[2.5rem] shadow-sm group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary opacity-60 rounded-t-[2.5rem]" />
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  req.status === 'Pending' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                  req.status === 'Approved' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                  'bg-red-50 text-red-500 border border-red-100'
                }`}>
                  {req.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{req.volunteerId?.name || "Unknown Volunteer"}</h3>
              <p className="text-sm text-slate-500 mb-4">{req.volunteerId?.email}</p>
              
              {req.message && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
                   <p className="text-xs italic text-slate-600 line-clamp-3">"{req.message}"</p>
                </div>
              )}
              
              {req.status === 'Pending' && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => handleRequestAction(req._id, 'Approved')}
                    disabled={actionLoading === req._id}
                    className="py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-sm"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleRequestAction(req._id, 'Rejected')}
                    disabled={actionLoading === req._id}
                    className="py-3 rounded-2xl bg-rose-50 text-rose-500 font-bold text-sm hover:bg-rose-100 transition"
                  >
                    Decline
                  </button>
                </div>
              )}
            </motion.div>
            ))
          )
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
