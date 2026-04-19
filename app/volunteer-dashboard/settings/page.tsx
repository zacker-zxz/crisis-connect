"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  Wand2, 
  Calendar, 
  Save,
  CheckCircle2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VolunteerSettingsPage() {
  const { user, token, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);

  const tabs = [
    { id: 'account', name: 'Identity & Account', icon: User },
    { id: 'skills', name: 'Skills & Expertise', icon: Wand2 },
    { id: 'availability', name: 'Mission Availability', icon: Calendar },
    { id: 'notifications', name: 'Alert Settings', icon: Bell },
  ];

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
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
          skills
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        alert('Settings updated successfully!');
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="glass-card p-4 rounded-[2rem] border-white/5 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
                  activeTab === tab.id 
                    ? 'bg-secondary/20 text-secondary border border-secondary/20 shadow-[0_0_20px_rgba(236,72,153,0.1)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-secondary' : 'text-gray-500'}`} />
                  <span className="font-bold text-sm tracking-wide">{tab.name}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 rounded-[2.5rem] border-white/10"
          >
            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                   <h3 className="text-2xl font-black text-white mb-2">Personal Identity</h3>
                   <p className="text-gray-400">Your profile information as visible to organizations.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 py-6 border-y border-white/5">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-black text-white text-3xl shadow-xl">
                            {user?.name?.[0] || 'V'}
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-white font-bold text-lg">{user?.name}</p>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
                           <span className="px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-[10px] font-black text-secondary tracking-widest uppercase">Certified Responder</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-secondary transition" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-secondary transition" />
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-8">
                <div>
                   <h3 className="text-2xl font-black text-white mb-2">Expertise & Skills</h3>
                   <p className="text-gray-400">Help organizations find you for relevant missions.</p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['First Aid', 'Crisis Management', 'Logistics', 'Driving', 'Communications', 'Medical'].map((skill) => (
                            <div 
                              key={skill} 
                              onClick={() => toggleSkill(skill)}
                              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-secondary/30 transition-all cursor-pointer"
                            >
                                <span className="text-sm font-bold text-white uppercase tracking-wide">{skill}</span>
                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                    skills.includes(skill) ? 'bg-secondary border-secondary text-white' : 'border-white/10 group-hover:border-white/30'
                                }`}>
                                    {skills.includes(skill) && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl">
                        <p className="text-xs font-bold text-secondary mb-2 flex items-center gap-2">
                            <Wand2 className="w-4 h-4" /> AI Matching Engine
                        </p>
                        <p className="text-sm text-gray-400">Your skills are automatically cross-referenced with incoming tasks for real-time notification.</p>
                    </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-10">
               <button 
                 onClick={handleSave} 
                 disabled={loading}
                 className="bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-widest text-sm"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
