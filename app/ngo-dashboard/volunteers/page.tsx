"use client"
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, MapPin, Mail, ShieldCheck,
  X, Phone, Calendar, Award, ClipboardList, UserCheck,
  Users, AlertTriangle, ChevronDown, ChevronUp, Trash2
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
  availability?: string | { day: string; enabled: boolean; start: string; end: string }[];
  bio?: string;
}

interface MissionTask {
  _id: string;
  title: string;
  priority: 'Critical' | 'Urgent' | 'Medium' | 'Low';
  status: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  assignedVolunteers: { _id: string; name: string; email: string; skills?: string[]; profileImageUrl?: string; phone?: string }[];
  dateTime: string;
  location?: { address?: string };
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
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading database...</div>}>
      <VolunteersContent />
    </Suspense>
  );
}

function VolunteersContent() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [activeTab, setActiveTab] = useState<'network' | 'requests' | 'missions'>('network');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [missions, setMissions] = useState<MissionTask[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
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
    fetchMissions();
  }, [token, fetchRequests]);

  useEffect(() => {
    if (taskId) {
      setActiveTab('missions');
      setExpandedMission(taskId);
    }
  }, [taskId]);

  const handleRequestAction = async (requestId: string, status: string, reason?: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const res = await fetch('/api/ngo-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, status, reason }),
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

  const handleRemoveVolunteer = async (volunteerId: string) => {
    if (!confirm('Are you sure you want to remove this volunteer from your team? This will also unassign them from any active missions.')) return;
    if (!token) return;
    setActionLoading(volunteerId);
    try {
      const res = await fetch(`/api/ngo-requests?volunteerId=${volunteerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchRequests();
        await fetchMissions();
        if (selected?._id === volunteerId) setSelected(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Could not remove volunteer');
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

  const fetchMissions = useCallback(async () => {
    if (!token) return;
    setMissionsLoading(true);
    try {
      const res = await fetch('/api/ngo/missions-roster', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch missions roster', e);
    } finally {
      setMissionsLoading(false);
    }
  }, [token]);

  const priorityColor = (p: string) => {
    switch(p) {
      case 'Critical': return 'bg-red-50 text-red-600 border-red-200';
      case 'Urgent': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Medium': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

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
            <button 
              onClick={() => { setActiveTab('missions'); fetchMissions(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'missions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ClipboardList className="w-3.5 h-3.5" /> By Mission
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

      {activeTab === 'missions' && (
        <div className="space-y-4">
          {missionsLoading ? (
            [1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[2rem] animate-pulse" />)
          ) : missions.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-[3rem] shadow-sm">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No missions found.</p>
              <p className="text-slate-400 text-sm mt-1">Create a mission first to see volunteer assignments here.</p>
            </div>
          ) : (
            missions.map((mission, i) => {
              const isExpanded = expandedMission === mission._id;
              const vols = mission.assignedVolunteers || [];
              return (
                <motion.div
                  key={mission._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden"
                >
                  {/* Mission Header - clickable */}
                  <button
                    onClick={() => setExpandedMission(isExpanded ? null : mission._id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        mission.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                        mission.priority === 'Urgent' ? 'bg-amber-100 text-amber-600' :
                        mission.priority === 'Medium' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate">{mission.title}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${priorityColor(mission.priority)}`}>
                            {mission.priority}
                          </span>
                          <span className="text-xs text-slate-400">{mission.location?.address}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400">
                            {new Date(mission.dateTime).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-black text-slate-700">
                            {vols.length}<span className="text-slate-400 font-semibold">/{mission.requiredVolunteers}</span>
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {vols.length === 0 ? 'No volunteers' : `${vols.length} assigned`}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded volunteer list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                          {vols.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4 font-medium">No volunteers assigned to this mission yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {vols.map(v => (
                                <div key={v._id} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm shrink-0 shadow overflow-hidden">
                                    {v.profileImageUrl ? (
                                      <img src={v.profileImageUrl} alt={v.name} className="w-full h-full object-cover" />
                                    ) : v.name?.[0] || '?'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                                      {v.name} <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{v.email}</p>
                                    {v.skills && v.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {v.skills.slice(0, 3).map(s => (
                                          <span key={s} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold">{s}</span>
                                        ))}
                                        {v.skills.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{v.skills.length - 3}</span>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelected(v as unknown as Volunteer); }}
                                      className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all"
                                      title="View Credentials"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveVolunteer(v._id); }}
                                      className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                      title="Remove from Team"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {activeTab !== 'missions' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => {
                      setRejectingRequestId(req._id);
                      setRejectionReason('');
                    }}
                    disabled={actionLoading === req._id}
                    className="py-3 rounded-2xl bg-rose-50 text-rose-500 font-bold text-sm hover:bg-rose-100 transition disabled:opacity-50"
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

              <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                <button
                  onClick={() => setSelected(vol)}
                  className="py-3 rounded-2xl bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 text-primary font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Credentials
                </button>
                <button
                  onClick={() => handleRemoveVolunteer(vol._id)}
                  disabled={actionLoading === vol._id}
                  className="py-3 rounded-2xl bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 text-rose-500 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>}

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
                        <span className="text-white font-bold text-sm">{(selected.rating || 4.5).toFixed(1)} · {selected.completedMissions || 0} missions</span>
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
                      <p className="text-sm font-bold text-slate-800">
                        {typeof selected.availability === 'string' 
                          ? selected.availability 
                          : Array.isArray(selected.availability)
                            ? selected.availability.filter(a => a.enabled).map(a => a.day.substring(0, 3)).join(', ') || 'Flexible'
                            : 'Flexible'
                        }
                      </p>
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

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingRequestId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setRejectingRequestId(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800">Decline Request</h3>
                  <button onClick={() => setRejectingRequestId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Please provide a reason for declining this request. The volunteer will receive a polite notification along with your feedback, and they will be able to re-apply later.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Currently we have reached our capacity for volunteers."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 mb-6 min-h-[100px]"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectingRequestId(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleRequestAction(rejectingRequestId, 'Rejected', rejectionReason);
                      setRejectingRequestId(null);
                    }}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition disabled:opacity-50"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
