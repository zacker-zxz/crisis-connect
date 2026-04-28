"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { 
  ClipboardList, 
  Type, 
  AlignLeft, 
  Users, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Check,
  Flame,
  Loader2,
  Save
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const AVAILABLE_SKILLS = [
  'First Aid', 'Logistics', 'Search & Rescue', 'Medical', 
  'Food Distribution', 'Translation', 'Heavy Lifting', 
  'Counseling', 'Coordination', 'Evacuation', 'Debris Clearing'
];

export default function EditTaskPage() {
  const { id } = useParams();
  const PRIORITY_OPTIONS = [
    { label: 'Critical', value: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', activeBg: 'bg-red-500', activeText: 'text-white' },
    { label: 'Urgent',   value: 'Urgent',   color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20', activeBg: 'bg-secondary', activeText: 'text-white' },
    { label: 'Medium',   value: 'Medium',   color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', activeBg: 'bg-amber-400', activeText: 'text-white' },
    { label: 'Low',      value: 'Low',      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBg: 'bg-emerald-500', activeText: 'text-white' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredVolunteers: 1,
    requiredSkills: [] as string[],
    priority: 'Medium',
    location: {
      address: '',
      lat: 19.0760,
      lng: 72.8777
    },
    dateTime: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Address Autocomplete UI state
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Map Modal State
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: 72.8777,
    latitude: 19.0760,
    zoom: 11
  });
  const [tempMarker, setTempMarker] = useState({ lat: 19.0760, lng: 72.8777 });
  const [fetchingAddress, setFetchingAddress] = useState(false);

  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (!res.ok) throw new Error("Failed to fetch mission details");
        const data = await res.json();
        setFormData({
          title: data.title,
          description: data.description,
          requiredVolunteers: data.requiredVolunteers,
          requiredSkills: data.requiredSkills || [],
          priority: data.priority || 'Medium',
          location: data.location,
          dateTime: data.dateTime ? new Date(data.dateTime).toISOString().slice(0, 16) : ''
        });
        setAddressQuery(data.location.address);
        setViewState({ longitude: data.location.lng, latitude: data.location.lat, zoom: 14 });
        setTempMarker({ lat: data.location.lat, lng: data.location.lng });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTask();
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (addressQuery.trim().length > 2 && addressQuery !== formData.location.address) {
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`);
          const data = await res.json();
          if (data.features) {
            setSuggestions(data.features);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error("Geocoding fetch error:", err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [addressQuery]);

  const selectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    setFormData(prev => ({
      ...prev,
      location: {
        address: feature.place_name,
        lat,
        lng
      }
    }));
    setAddressQuery(feature.place_name);
    setViewState({ longitude: lng, latitude: lat, zoom: 14 });
    setTempMarker({ lat, lng });
    setShowSuggestions(false);
  };

  const handleReverseGeocode = async (lat: number, lng: number) => {
    setFetchingAddress(true);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
    } catch (err) {
      console.error("Reverse Geocode error", err);
    } finally {
      setFetchingAddress(false);
    }
    return "Unknown Location";
  };

  const confirmMapLocation = async () => {
    const address = await handleReverseGeocode(tempMarker.lat, tempMarker.lng);
    setFormData(prev => ({
      ...prev,
      location: {
        address: address,
        lat: tempMarker.lat,
        lng: tempMarker.lng
      }
    }));
    setAddressQuery(address);
    setMapModalOpen(false);
  };

  const toggleSkill = (skill: string) => {
    if (formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({...prev, requiredSkills: prev.requiredSkills.filter(s => s !== skill)}));
    } else {
      setFormData(prev => ({...prev, requiredSkills: [...prev.requiredSkills, skill]}));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update mission');
      }

      setSuccess(true);
      addNotification({
        title: 'Mission Updated',
        message: `Changes to "${formData.title}" have been synced.`,
        type: 'alert'
      });
      setTimeout(() => router.push('/ngo-dashboard/tasks'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[70vh] flex items-center justify-center">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-10">
           <div className="p-4 bg-slate-900 rounded-[1.5rem] text-primary shadow-xl">
              <ClipboardList className="w-8 h-8" />
           </div>
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Refine Mission</h1>
              <p className="text-slate-500 font-medium tracking-tight">Adjust tactical details for the deployment.</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-12">
              {error && (
                <div className="mb-6 p-5 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-center gap-4 text-red-600 font-bold">
                   <AlertCircle className="w-6 h-6 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-[1.5rem] flex items-center gap-4 text-emerald-600 font-bold animate-bounce">
                   <CheckCircle2 className="w-6 h-6 shrink-0" /> Mission Updated! Redirecting...
                </div>
              )}
           </div>

           {/* Basic Intel Section */}
           <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
                     <span className="w-6 h-px bg-slate-200" /> Operational Overview
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mission Title</label>
                      <div className="relative">
                        <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          required
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g., Rescue Ops: Sector 7" 
                          className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Intel Briefing (Description)</label>
                      <div className="relative">
                        <AlignLeft className="absolute left-5 top-6 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <textarea 
                          required
                          rows={4}
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          placeholder="Provide a detailed mission briefing..."
                          className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Personnel Required</label>
                      <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="number" 
                          min={1}
                          required
                          value={formData.requiredVolunteers}
                          onChange={e => setFormData({...formData, requiredVolunteers: parseInt(e.target.value)})}
                          className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Deployment Time</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="datetime-local" 
                          required
                          value={formData.dateTime}
                          onChange={e => setFormData({...formData, dateTime: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                   <span className="w-6 h-px bg-slate-200" /> Required Skill Sets
                </h3>
                <div className="flex flex-wrap gap-3">
                   {AVAILABLE_SKILLS.map(skill => {
                     const isSelected = formData.requiredSkills.includes(skill);
                     return (
                       <button
                         key={skill}
                         type="button"
                         onClick={() => toggleSkill(skill)}
                         className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                           isSelected 
                           ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                           : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary'
                         }`}
                       >
                         {isSelected && <Check className="w-3 h-3 inline-block mr-2" />}
                         {skill}
                       </button>
                     );
                   })}
                </div>
              </div>
           </div>

           {/* Sidebar Section */}
           <div className="lg:col-span-5 space-y-8">
              {/* Tactical Priority */}
              <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[60px] opacity-20" />
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3 relative z-10">
                     <span className="w-6 h-px bg-white/10" /> Tactical Priority
                  </h3>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    {PRIORITY_OPTIONS.map(opt => {
                      const isSelected = formData.priority === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({...formData, priority: opt.value})}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                            isSelected ? `${opt.activeBg} border-transparent ${opt.activeText} shadow-xl scale-105` : `${opt.bg} ${opt.border} opacity-50 hover:opacity-100`
                          }`}
                        >
                          <Flame className={`w-6 h-6 ${isSelected ? 'text-white' : opt.color}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
              </div>

              {/* Geographic Coordinates */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center justify-between">
                     <span className="flex items-center gap-3">
                        <span className="w-6 h-px bg-slate-200" /> Geographic Lock
                     </span>
                     <button 
                        type="button"
                        onClick={() => setMapModalOpen(true)}
                        className="text-primary hover:underline"
                     >
                        Precise Lock
                     </button>
                  </h3>
                  
                  <div className="relative" ref={autocompleteRef}>
                     <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                        type="text" 
                        required
                        placeholder="Search operation site..."
                        value={addressQuery}
                        onChange={e => setAddressQuery(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-[1.5rem] py-5 pl-14 pr-6 text-slate-800 font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300"
                     />
                     
                     <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden py-3"
                          >
                            {suggestions.map((feature, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => selectSuggestion(feature)}
                                className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center gap-4 transition-colors group"
                              >
                                <MapPin className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                <div>
                                   <p className="text-sm font-bold text-slate-800 line-clamp-1">{feature.text}</p>
                                   <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{feature.place_name}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="h-44 w-full rounded-3xl bg-slate-50 overflow-hidden relative border border-slate-100">
                     {MAPBOX_TOKEN && (
                        <Map
                          mapboxAccessToken={MAPBOX_TOKEN}
                          {...viewState}
                          style={{width: '100%', height: '100%'}}
                          mapStyle="mapbox://styles/mapbox/streets-v11"
                        >
                          <Marker longitude={formData.location.lng} latitude={formData.location.lat} color="#2563eb" />
                        </Map>
                     )}
                  </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white font-black py-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs disabled:opacity-50"
              >
                {saving ? (
                  <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Save Mission <Save className="w-5 h-5" /></>
                )}
              </button>
           </div>
        </form>
      </motion.div>

      {/* Map Selection Modal */}
      <AnimatePresence>
        {mapModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[150] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <div className="h-[500px] w-full bg-slate-100 relative">
                {MAPBOX_TOKEN && (
                   <Map
                     mapboxAccessToken={MAPBOX_TOKEN}
                     initialViewState={{
                       longitude: tempMarker.lng,
                       latitude: tempMarker.lat,
                       zoom: 12
                     }}
                     style={{width: '100%', height: '100%'}}
                     mapStyle="mapbox://styles/mapbox/streets-v11"
                     onMove={evt => {
                       setTempMarker({ lat: evt.viewState.latitude, lng: evt.viewState.longitude });
                     }}
                   >
                     <NavigationControl position="top-right" />
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <MapPin className="w-10 h-10 text-primary -mt-10 animate-bounce transition-transform" />
                     </div>
                   </Map>
                )}
              </div>
              <div className="p-8 flex items-center justify-between gap-6">
                <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tactical coordinates</p>
                   <p className="text-sm font-bold text-slate-800 line-clamp-1">
                      {fetchingAddress ? "Resolving intel..." : "Move map to lock position"}
                   </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setMapModalOpen(false)} className="px-8 py-4 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={confirmMapLocation} disabled={fetchingAddress} className="px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                     Lock Location <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setMapModalOpen(false)}
                className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
