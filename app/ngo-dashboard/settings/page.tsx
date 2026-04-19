"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Globe, 
  Save,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Security & Access', icon: Shield },
    { id: 'notifications', name: 'Communications', icon: Bell },
  ];

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
                    ? 'bg-primary/20 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500'}`} />
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
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                   <h3 className="text-2xl font-black text-white mb-2">Organization Profile</h3>
                   <p className="text-gray-400">Update your public identity on the Sahayog Network.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 py-6 border-y border-white/5">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-black text-white text-3xl shadow-xl">
                            {user?.name[0]}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-slate-900 border border-white/10 rounded-xl text-primary hover:scale-110 transition-transform shadow-lg">
                           <Save className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-white font-bold text-lg">{user?.name}</p>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Entity Name</label>
                        <input type="text" defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-primary transition" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Operating Sector</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-primary transition appearance-none">
                            <option>Disaster Relief</option>
                            <option>Healthcare</option>
                            <option>Education</option>
                            <option>Environment</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Public Description</label>
                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-primary transition resize-none" defaultValue="Leading social impact initiatives focused on localized community needs." />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                   <h3 className="text-2xl font-black text-white mb-2">Access & Security</h3>
                   <p className="text-gray-400">Manage your credentials and API access keys.</p>
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Lock className="w-6 h-6 text-secondary" />
                            <div>
                                <p className="text-white font-bold text-sm">Two-Factor Authentication</p>
                                <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <button className="text-xs font-black text-secondary uppercase tracking-widest hover:underline">Enable</button>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Globe className="w-6 h-6 text-primary" />
                            <div>
                                <p className="text-white font-bold text-sm">API Integration Key</p>
                                <p className="text-xs text-gray-500">Connect Sahayog to your internal CRM.</p>
                            </div>
                        </div>
                        <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Revoke</button>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                   <h4 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Danger Zone
                   </h4>
                   <button className="px-6 py-3 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      Archive Account
                   </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-10">
               <button className="bg-primary hover:bg-primary/90 text-white font-black px-10 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-widest text-sm">
                  <Save className="w-5 h-5" /> Update Configuration
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
