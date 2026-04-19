"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building2, Briefcase, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'ngo' ? 'ngo' : 'volunteer';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    organizationName: '',
    skills: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    const submissionData = {
      ...formData,
      skills: formData.role === 'volunteer' ? formData.skills.split(',').map(s => s.trim()) : [],
      organizationName: formData.role === 'ngo' ? formData.organizationName : undefined
    };

    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/signin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join Sahayog India</h1>
          <p className="text-gray-400">Create an account to start making an impact</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10">
          <button 
            type="button"
            onClick={() => setFormData({...formData, role: 'volunteer'})}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${formData.role === 'volunteer' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Volunteer
          </button>
          <button 
            type="button"
            onClick={() => setFormData({...formData, role: 'ngo'})}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${formData.role === 'ngo' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            NGO / Lead
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                min={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                placeholder="••••••••"
              />
            </div>
          </div>

          {formData.role === 'ngo' ? (
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  required={formData.role === 'ngo'}
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-secondary transition" 
                  placeholder="Global Relief Group"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Skills (comma separated)</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition" 
                  placeholder="First Aid, Logistics, Teaching"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`col-span-1 md:col-span-2 w-full ${formData.role === 'volunteer' ? 'bg-primary' : 'bg-secondary'} hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4 shadow-xl`}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus className="w-5 h-5" /> Start Your Journey
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account? <Link href="/signin" className="text-primary hover:underline font-semibold">Sign in here</Link>
        </div>
      </motion.div>
    </div>
  );
}
