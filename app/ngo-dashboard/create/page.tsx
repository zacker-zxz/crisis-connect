"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, NavigationControl, ViewStateChangeEvent } from 'react-map-gl';
import { 
  PlusCircle, 
  Type, 
  AlignLeft, 
  Users, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListPlus,
  Map as MapIcon,
  X,
  Search,
  Check,
  Flame,
  Sparkles,
  Camera
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { LoadingScreen } from '@/components/loading-screen';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const AVAILABLE_SKILLS = [
  'First Aid', 'Logistics', 'Search & Rescue', 'Medical', 
  'Food Distribution', 'Translation', 'Heavy Lifting', 
  'Counseling', 'Coordination', 'Evacuation', 'Debris Clearing'
];

export default function CreateTaskPage() {
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
  
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [dynamicSkills, setDynamicSkills] = useState<string[]>( AVAILABLE_SKILLS );

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Mapbox Geocoding suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (addressQuery.trim().length > 2) {
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

  const handleSmartScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          const response = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "AI Analysis failed");
          }
          
          const assessment = await response.json();
          // Get current date/time to local ISO string (YYYY-MM-DDTHH:mm)
          const now = new Date();
          const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          
          // Add any new AI-suggested skills to the vocabulary
          if (assessment.recommendedSkills) {
            setDynamicSkills(prev => {
              const newSkills = [...prev];
              assessment.recommendedSkills.forEach((skill: string) => {
                if (!newSkills.includes(skill)) newSkills.push(skill);
              });
              return newSkills;
            });
          }

          setFormData(prev => ({
            ...prev,
            title: assessment.crisisType || prev.title,
            description: assessment.description || prev.description,
            priority: assessment.suggestedPriority || assessment.severity || prev.priority,
            requiredSkills: assessment.recommendedSkills || prev.requiredSkills,
            requiredVolunteers: assessment.estimatedVolunteersNeeded || prev.requiredVolunteers,
            dateTime: localDateTime
          }));

          setScanning(false);
          addNotification({
            title: 'AI Intel Received',
            message: `Crisis identified as ${assessment.crisisType}. Recommendations applied.`,
            type: 'alert'
          });
        } catch (err: any) {
          setError("AI Scan failed: " + err.message);
          setScanning(false);
        }
      };
    } catch (err: any) {
      setError("AI Scan failed: " + err.message);
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.requiredSkills.length === 0) {
      setError("Please select at least one required expertise.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      addNotification({
        title: 'New Mission Deployed',
        message: `Deployment: "${formData.title}" in ${formData.location.address}. Priority: ${formData.priority}.`,
        type: 'mission'
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/ngo-dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      <LoadingScreen
        isVisible={scanning}
        variant="transparent"
        headline="Crisis Lens AI"
        statusLines={[
          'Ingesting visual crisis context…',
          'Extracting severity and resource signals…',
          'Drafting mission fields for your review…',
        ]}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 rounded-[2.5rem] bg-white/70 border-gray-200 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <PlusCircle className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-3xl font-extrabold text-slate-800">Deploy New Mission</h2>
              <p className="text-slate-500">Post an urgent requirement to the orchestration engine.</p>
           </div>
        </div>

        {/* Smart Scan Banner */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-1 shadow-lg shadow-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 backdrop-blur px-6 py-5 rounded-[1.4rem]">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <Sparkles className="w-6 h-6 animate-pulse" />
               </div>
               <div>
                 <h4 className="font-black text-slate-800">Crisis Lens AI™</h4>
                 <p className="text-xs text-slate-500 font-medium">Auto-fill mission logic with image intelligence</p>
               </div>
            </div>
            <button 
              type="button"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {scanning ? (
                <>Analyzing scene…</>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Smart Scan Photo
                </>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleSmartScan}
              className="hidden" 
              accept="image/*"
            />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-[50px] rounded-full -ml-8 -mb-8"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Mission deployed successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Mission Title</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition shadow-sm" 
                    placeholder="e.g., Medical Supplies Transport"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Volunteers Needed</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={formData.requiredVolunteers}
                    onChange={(e) => setFormData({...formData, requiredVolunteers: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition shadow-sm" 
                  />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">Detailed Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-6 w-5 h-5 text-gray-400" />
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-none shadow-sm placeholder:text-gray-400" 
                placeholder="Explain the urgency and exact requirements..."
              />
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <ListPlus className="w-5 h-5 text-slate-500" />
                   <label className="text-sm font-bold text-slate-600">Required Expertise (Select multiple)</label>
                 </div>
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={customSkillInput}
                     onChange={(e) => setCustomSkillInput(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         if (customSkillInput.trim()) {
                           const newSkill = customSkillInput.trim();
                           if (!dynamicSkills.includes(newSkill)) {
                             setDynamicSkills([...dynamicSkills, newSkill]);
                           }
                           if (!formData.requiredSkills.includes(newSkill)) {
                             setFormData(prev => ({...prev, requiredSkills: [...prev.requiredSkills, newSkill]}));
                           }
                           setCustomSkillInput('');
                         }
                       }
                     }}
                     placeholder="Type custom skill & press Enter"
                     className="text-sm bg-slate-50 border border-gray-200 rounded-lg py-1 px-3 w-48 focus:outline-none focus:border-primary transition"
                   />
                   <button
                     type="button"
                     onClick={() => {
                        if (customSkillInput.trim()) {
                          const newSkill = customSkillInput.trim();
                          if (!dynamicSkills.includes(newSkill)) {
                            setDynamicSkills([...dynamicSkills, newSkill]);
                          }
                          if (!formData.requiredSkills.includes(newSkill)) {
                            setFormData(prev => ({...prev, requiredSkills: [...prev.requiredSkills, newSkill]}));
                          }
                          setCustomSkillInput('');
                        }
                     }}
                     className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1 rounded-lg transition"
                   >
                     Add
                   </button>
                 </div>
             </div>
             <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-gray-200 rounded-2xl">
                {dynamicSkills.map(skill => {
                   const isSelected = formData.requiredSkills.includes(skill);
                   return (
                     <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                           isSelected 
                           ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105' 
                           : 'bg-white border-gray-200 text-slate-600 hover:border-primary/50'
                        }`}
                     >
                        {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                        {skill}
                     </button>
                   );
                })}
             </div>
          </div>

          {/* Priority Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-slate-500" />
              <label className="text-sm font-bold text-slate-600">Mission Priority</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRIORITY_OPTIONS.map(opt => {
                const isSelected = formData.priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({...formData, priority: opt.value})}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                      isSelected
                        ? `${opt.activeBg} ${opt.activeText} border-transparent shadow-lg scale-105`
                        : `${opt.bg} ${opt.color} ${opt.border} hover:scale-102`
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2 relative" ref={autocompleteRef}>
                <label className="text-sm font-bold text-slate-600 ml-1">Geographic Location</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        className="w-full h-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition shadow-sm placeholder:text-gray-400" 
                        placeholder="Search address..."
                        autoComplete="off"
                      />
                    </div>
                    <button 
                       type="button" 
                       onClick={() => setMapModalOpen(true)}
                       className="bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-white p-4 rounded-2xl transition shadow-sm flex items-center justify-center group"
                       title="Pick on Map"
                    >
                       <MapIcon className="w-6 h-6 group-hover:scale-110 transition" />
                    </button>
                </div>
                
                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                   {showSuggestions && suggestions.length > 0 && (
                      <motion.div 
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                      >
                         {suggestions.map((suggestion) => (
                            <div 
                               key={suggestion.id}
                               onClick={() => selectSuggestion(suggestion)}
                               className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start gap-3"
                            >
                               <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                               <div>
                                  <p className="text-sm font-bold text-slate-800">{suggestion.text}</p>
                                  <p className="text-xs text-slate-500">{suggestion.place_name}</p>
                               </div>
                            </div>
                         ))}
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>

             <div className="space-y-2 relative z-0">
                <label className="text-sm font-bold text-slate-600 ml-1">Event Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition shadow-sm" 
                  />
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
             <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 border border-transparent hover:border-gray-200 transition"
              >
                Cancel
             </button>
             <button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white font-black px-12 py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,128,128,0.4)] transition-all hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                {loading ? 'Deploying...' : 'Deploy Mission'}
             </button>
          </div>
        </form>
      </motion.div>

      {/* Map Picker Modal */}
      <AnimatePresence>
         {mapModalOpen && MAPBOX_TOKEN && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            >
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMapModalOpen(false)}></div>
               <motion.div 
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-white w-full max-w-4xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden relative z-10 flex flex-col border border-gray-200"
               >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
                     <div>
                        <h3 className="text-xl font-black text-slate-800">Pinpoint Mission Location</h3>
                        <p className="text-sm text-slate-500">Drag the map or marker to set the precise coordinates.</p>
                     </div>
                     <button onClick={() => setMapModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 transition">
                        <X className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className="flex-1 relative bg-slate-100">
                     <Map
                        mapboxAccessToken={MAPBOX_TOKEN}
                        {...viewState}
                        onMove={evt => setViewState(evt.viewState)}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        attributionControl={false}
                     >
                        <NavigationControl position="top-right" />
                        <Marker 
                           longitude={tempMarker.lng} 
                           latitude={tempMarker.lat} 
                           draggable
                           onDragEnd={(e) => setTempMarker({ lng: e.lngLat.lng, lat: e.lngLat.lat })}
                        >
                           <div className="relative group cursor-pointer">
                              <MapPin className="w-10 h-10 text-primary drop-shadow-xl z-20 relative pointer-events-none" fill="white" />
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 blur-sm rounded-full pointer-events-none"></div>
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">
                                 Drag me
                                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                              </div>
                           </div>
                        </Marker>
                     </Map>
                  </div>

                  <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
                     <div className="text-sm font-medium text-slate-500 hidden sm:block">
                        Lat: {tempMarker.lat.toFixed(4)}, Lng: {tempMarker.lng.toFixed(4)}
                     </div>
                     <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                           onClick={() => setMapModalOpen(false)}
                           className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                           Cancel
                        </button>
                        <button 
                           onClick={confirmMapLocation}
                           disabled={fetchingAddress}
                           className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                           {fetchingAddress ? 'Confirming...' : 'Confirm Location'}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
