"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Type, 
  AlignLeft, 
  Users, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Wand2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function CreateTaskPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredVolunteers: 1,
    requiredSkills: '',
    location: {
      address: '',
      lat: 19.0760, // Default to Mumbai
      lng: 72.8777
    },
    dateTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

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
    <div className="max-w-4xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 rounded-[2.5rem] border-white/10"
      >
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <PlusCircle className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-3xl font-extrabold text-white">Deploy New Mission</h2>
              <p className="text-gray-400">Post an urgent requirement to the orchestration engine.</p>
           </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Mission deployed successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">Mission Title</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                    placeholder="e.g., Medical Supplies Transport"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">Volunteers Needed</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={formData.requiredVolunteers}
                    onChange={(e) => setFormData({...formData, requiredVolunteers: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                  />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 ml-1">Detailed Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-6 w-5 h-5 text-gray-500" />
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition resize-none" 
                placeholder="Explain the urgency and exact requirements..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">Required Expertise (Comma Separated)</label>
                <div className="relative">
                  <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    value={formData.requiredSkills}
                    onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                    placeholder="First Aid, Logistics, Heavy Lifting"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                  />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 ml-1">Geographic Location (Address)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                required
                value={formData.location.address}
                onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                placeholder="Street address or Area name"
              />
            </div>
            <p className="text-[10px] text-gray-500 ml-2 italic">Note: In a production build, this would use a Mapbox Search autocomplete.</p>
          </div>

          <div className="flex justify-end gap-4 pt-6">
             <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-4 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition"
              >
                Cancel
             </button>
             <button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white font-black px-12 py-4 rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.2)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Deploying...' : 'Deploy Mission'}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
