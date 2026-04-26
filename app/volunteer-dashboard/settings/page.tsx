"use client"
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Wand2, 
  Calendar, 
  Save,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
  Lock,
  Upload
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function VolunteerSettingsPage() {
  const { user, token, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || '');
  const [availability, setAvailability] = useState(
    user?.availability && user.availability.length > 0
      ? user.availability
      : DAYS.map((day) => ({ day, enabled: false, start: '09:00', end: '18:00' }))
  );

  const tabs = [
    { id: 'account', name: 'Profile', icon: User },
    { id: 'skills', name: 'Neural Skills', icon: Wand2 },
    { id: 'availability', name: 'Deployment Time', icon: Calendar },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Lock },
  ];

  const selectedSkills = useMemo(() => skills.filter(Boolean), [skills]);

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setProfileImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkill('');
  };

  const updateAvailability = (
    day: string,
    key: 'enabled' | 'start' | 'end',
    value: boolean | string
  ) => {
    setAvailability((prev) =>
      prev.map((item) => (item.day === day ? { ...item, [key]: value } : item))
    );
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          skills: selectedSkills,
          availability,
          profileImageUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        alert('Settings updated successfully.');
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-12rem)] flex flex-col no-scrollbar">
      <div className="flex flex-col lg:flex-row gap-10 flex-1 min-h-0">
        {/* Navigation Tabs */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-2 sticky top-0">
            <div className="pb-6 border-b border-slate-50 mb-4 px-2">
              <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Settings</h3>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-[0_15px_30px_rgba(20,184,166,0.2)] scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-300 group-hover:text-primary'}`} />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em] leading-none">{tab.name}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Panel */}
        <div className="flex-1 min-w-0 flex flex-col pb-10">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col"
          >
            {/* Header for active section */}
            <div className="bg-white p-12 relative overflow-hidden border-b border-slate-50 shrink-0">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Zap className="w-40 h-40 text-primary" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-slate-950 font-black text-4xl mb-4 tracking-tight uppercase">
                       {tabs.find(t => t.id === activeTab)?.name}
                    </h3>
                    <p className="text-slate-400 font-medium text-sm tracking-wide">
                       Manage your volunteer preferences and profile details
                    </p>
                </div>
            </div>

            <div className="p-12 flex-1 space-y-12 overflow-y-auto no-scrollbar">
              {activeTab === 'account' && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row items-center gap-12 pb-12 border-b border-slate-50">
                      <div className="relative group">
                          <div className="w-36 h-36 rounded-[3rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center font-black text-slate-950 text-5xl shadow-sm overflow-hidden ring-8 ring-slate-50/50">
                              {profileImageUrl ? (
                                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                user?.name?.[0] || 'V'
                              )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 bg-primary text-white p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white cursor-pointer">
                              <Upload className="w-5 h-5" />
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                          <h4 className="text-slate-950 font-black text-4xl tracking-tighter mb-3 uppercase">{user?.name}</h4>
                          <p className="text-slate-400 font-bold text-lg tracking-tight mb-8">{user?.email}</p>
                          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                             <span className="px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-600 tracking-[0.2em] uppercase">Verified Agent</span>
                             <span className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Clearance Level VI</span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Display Name</label>
                          <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] py-6 px-10 text-slate-900 font-black text-base focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner placeholder:text-slate-300" 
                            placeholder="Enter display name"
                          />
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Email</label>
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] py-6 px-10 text-slate-900 font-black text-base focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="agent@crisisconnect.com"
                          />
                      </div>
                      <div className="space-y-4 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Contact Number</label>
                          <input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] py-6 px-10 text-slate-900 font-black text-base focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="+1 (555) 000-0000"
                          />
                      </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['First Aid', 'Crisis Management', 'Logistics', 'Driving', 'Communications', 'Medical', 'Security', 'Translation', 'Rescue'].map((skill) => (
                          <motion.div 
                            key={skill} 
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => toggleSkill(skill)}
                            className={`p-8 rounded-[2.5rem] flex items-center justify-between transition-all cursor-pointer border-2 shadow-sm ${
                                skills.includes(skill) 
                                  ? 'bg-primary/5 border-primary shadow-[0_10px_20px_rgba(20,184,166,0.1)]' 
                                  : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                          >
                              <span className={`text-xs font-black uppercase tracking-widest ${skills.includes(skill) ? 'text-primary' : 'text-slate-950'}`}>{skill}</span>
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                  skills.includes(skill) ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-slate-50 text-transparent'
                              }`}>
                                  <CheckCircle2 className="w-5 h-5" />
                              </div>
                          </motion.div>
                      ))}
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Add custom skill</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Example: Drone Surveying"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={addCustomSkill}
                        className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90"
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>

                  <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex items-center gap-10">
                      <div className="p-6 bg-white rounded-[2rem] shadow-xl text-primary shrink-0">
                        <Wand2 className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-slate-950 font-black uppercase text-sm tracking-[0.3em] mb-3">Neural Matching Status: Synchronized</p>
                        <p className="text-base text-slate-500 font-medium leading-relaxed max-w-2xl">
                          Your expertise profile is influencing 15+ live mission nodes. Sector response time optimized by 22% for matching categories.
                        </p>
                      </div>
                  </div>
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="space-y-5">
                  <p className="text-slate-500 text-sm">Set when you are available for volunteering. Only enabled days are used for deployment matching.</p>
                  {availability.map((slot) => (
                    <div key={slot.day} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={(e) => updateAvailability(slot.day, 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold text-slate-900">{slot.day}</span>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Start</label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateAvailability(slot.day, 'start', e.target.value)}
                          disabled={!slot.enabled}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">End</label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateAvailability(slot.day, 'end', e.target.value)}
                          disabled={!slot.enabled}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold ${slot.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {slot.enabled ? `${slot.start} - ${slot.end}` : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="rounded-3xl border border-slate-200 p-8 bg-slate-50">
                  <h4 className="font-semibold text-slate-900 mb-2">Notification preferences</h4>
                  <p className="text-slate-500 text-sm">Push and email settings will be configurable here in the next update.</p>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="rounded-3xl border border-slate-200 p-8 bg-slate-50">
                  <h4 className="font-semibold text-slate-900 mb-2">Security settings</h4>
                  <p className="text-slate-500 text-sm">Session controls and password update are planned for this section.</p>
                </div>
              )}
            </div>

            <div className="p-12 bg-slate-50/50 border-t border-slate-100 flex justify-end shrink-0">
               <button 
                 onClick={handleSave} 
                 disabled={loading}
                 className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black px-16 py-8 rounded-[2.5rem] shadow-[0_25px_50px_rgba(20,184,166,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 uppercase tracking-[0.3em] text-sm"
               >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} Synchronize Profile
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>

  );
}
