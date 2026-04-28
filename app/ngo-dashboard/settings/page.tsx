"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, Lock, Globe, Save, Trash2, ChevronRight,
  Loader2, Phone, MapPin, Tag, Building2, Hash, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const SECTORS = [
  'Disaster Relief', 'Healthcare', 'Education', 'Environment',
  'Food Security', 'Child Welfare', 'Women Empowerment', 'Elderly Care', 'Mental Health'
];

const REGIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Pan India'
];

type ToastState = { msg: string; type: 'success' | 'error' } | null;

export default function SettingsPage() {
  const { user, token, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // profile form state
  const [name,              setName]              = useState(user?.name || '');
  const [publicDescription, setPublicDescription] = useState((user as any)?.publicDescription || '');
  const [phone,             setPhone]             = useState((user as any)?.phone || '');
  const [website,           setWebsite]           = useState((user as any)?.website || '');
  const [city,              setCity]              = useState((user as any)?.city || '');
  const [sector,            setSector]            = useState((user as any)?.sector || '');
  const [operatingRegions,  setOperatingRegions]  = useState<string[]>((user as any)?.operatingRegions || []);

  // notification toggles
  const [notifyVolJoin,   setNotifyVolJoin]   = useState((user as any)?.notifyOnVolunteerJoin  ?? true);
  const [notifyDeadline,  setNotifyDeadline]  = useState((user as any)?.notifyOnDeadline       ?? true);
  const [notifyCapacity,  setNotifyCapacity]  = useState((user as any)?.notifyOnCapacityFull   ?? true);
  const [emailNotif,      setEmailNotif]      = useState((user as any)?.emailNotifications      ?? false);

  const tabs = [
    { id: 'profile',       name: 'Organization Profile',  icon: User    },
    { id: 'contact',       name: 'Contact & Region',      icon: Phone   },
    { id: 'notifications', name: 'Notifications',         icon: Bell    },
    { id: 'security',      name: 'Security & Access',     icon: Shield  },
  ];

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleRegion = (region: string) => {
    setOperatingRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleSave = async (fields: Record<string, any>) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        showToast('Settings saved successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save.', 'error');
      }
    } catch {
      showToast('Network error. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 px-5 text-slate-800 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm placeholder:text-gray-400";

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="glass-card p-4 rounded-[2rem] relative overflow-hidden bg-white/70 border-gray-200 shadow-sm space-y-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-50 rounded-t-[2rem]" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full border-2 border-primary/10" />
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">{tab.name}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* User card */}
          <div className="mt-6 glass-card p-6 rounded-[2rem] bg-white/70 border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-black text-white text-2xl shadow-lg mx-auto mb-3">
              {user?.name?.[0] || 'O'}
            </div>
            <p className="font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <span className="mt-2 inline-block text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
              NGO Admin
            </span>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="glass-card p-8 rounded-[2.5rem] bg-white/70 border-gray-200 shadow-sm space-y-8"
            >

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">Organization Profile</h3>
                    <p className="text-slate-500 text-sm">Update your public-facing identity on Crisis Connect.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your NGO name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Operating Sector</label>
                      <select value={sector} onChange={e => setSector(e.target.value)} className={inputCls}>
                        <option value="">Select Sector</option>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Public Description</label>
                    <textarea value={publicDescription} onChange={e => setPublicDescription(e.target.value)} rows={4} className={`${inputCls} resize-none`} placeholder="Describe your organization's mission..." />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Operating Regions (Select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {REGIONS.map(region => (
                        <button key={region} type="button" onClick={() => toggleRegion(region)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            operatingRegions.includes(region)
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white text-slate-600 border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={() => handleSave({ name, publicDescription, sector, operatingRegions })}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Profile
                    </button>
                  </div>
                </>
              )}

              {/* CONTACT TAB */}
              {activeTab === 'contact' && (
                <>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">Contact & Location</h3>
                    <p className="text-slate-500 text-sm">Contact details visible to assigned volunteers.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Phone Number</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43XXX" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Globe className="w-4 h-4 text-secondary" /> Website</label>
                      <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className={inputCls} placeholder="https://your-ngo.org" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> City / Headquarters</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputCls} placeholder="Mumbai" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={() => handleSave({ phone, website, city })}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Contact
                    </button>
                  </div>
                </>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">Notification Preferences</h3>
                    <p className="text-slate-500 text-sm">Control which events trigger alerts for your account.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Volunteer joins a mission',   sub: 'Notified when someone enrols in your posted task.',         value: notifyVolJoin,  set: setNotifyVolJoin },
                      { label: 'Mission deadline approaching',sub: 'Reminder 48 hours before a task\'s scheduled time.',        value: notifyDeadline, set: setNotifyDeadline },
                      { label: 'Volunteer capacity reached',  sub: 'Alert when all slots are filled for a mission.',            value: notifyCapacity, set: setNotifyCapacity },
                      { label: 'Email notifications',        sub: 'Receive all alerts to your registered email address.',       value: emailNotif,     set: setEmailNotif },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-5 bg-slate-50 border border-gray-200 rounded-2xl shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                        </div>
                        <button
                          onClick={() => item.set(!item.value)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${item.value ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={() => handleSave({ notifyOnVolunteerJoin: notifyVolJoin, notifyOnDeadline: notifyDeadline, notifyOnCapacityFull: notifyCapacity, emailNotifications: emailNotif })}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Preferences
                    </button>
                  </div>
                </>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">Security & Access</h3>
                    <p className="text-slate-500 text-sm">Manage credentials and integration keys.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: '2-Factor Authentication', desc: 'Add an extra layer of security. Links via SMS or Auth app.', action: 'Enable', color: 'text-secondary', Icon: Lock },
                      { title: 'API Integration Key',     desc: 'Connect Crisis Connect to your CRM or field ops platform.', action: 'Regenerate', color: 'text-primary', Icon: Globe },
                      { title: 'Active Sessions',         desc: '3 active sessions across 2 devices.',                        action: 'Revoke All', color: 'text-slate-500', Icon: Shield },
                    ].map(item => (
                      <div key={item.title} className="p-5 bg-slate-50 border border-gray-200 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <item.Icon className={`w-6 h-6 ${item.color}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <button className={`text-xs font-black uppercase tracking-widest hover:underline ${item.color}`}>
                          {item.action}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Danger Zone
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      Permanently archive this account. All posted missions will be closed and volunteers notified. This cannot be undone.
                    </p>
                    <button className="px-6 py-3 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">
                      Archive Account
                    </button>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
