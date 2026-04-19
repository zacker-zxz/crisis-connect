"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building2, Briefcase, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
          <h1 className="text-3xl font-bold text-slate-800">Join Crisis Connect</h1>
          <p className="text-slate-500">Create an account to start making an impact</p>
        </div>

        <div className="relative flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200 overflow-hidden">
          <motion.div 
            className={`absolute top-1 bottom-1 w-[calc(50%-12px)] rounded-xl z-0 ${formData.role === 'volunteer' ? 'bg-primary' : 'bg-secondary'}`}
            initial={false}
            animate={{ 
              x: formData.role === 'volunteer' ? '6px' : 'calc(100% + 18px)',
              backgroundColor: formData.role === 'volunteer' ? '#14b8a6' : '#f59e0b'
            }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
          />
          <button 
            type="button"
            onClick={() => setFormData({...formData, role: 'volunteer'})}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors z-10 ${formData.role === 'volunteer' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Volunteer
          </button>
          <button 
            type="button"
            onClick={() => setFormData({...formData, role: 'ngo'})}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors z-10 ${formData.role === 'ngo' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
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
            <label className="text-sm font-medium text-slate-600 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                min={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required
                min={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {formData.role === 'ngo' ? (
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-600 ml-1">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required={formData.role === 'ngo'}
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition shadow-sm" 
                  placeholder="Global Relief Group"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-600 ml-1">Skills (comma separated)</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition shadow-sm" 
                  placeholder="First Aid, Logistics, Teaching"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`col-span-1 md:col-span-2 w-full ${formData.role === 'volunteer' ? 'bg-primary shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)]' : 'bg-secondary shadow-[0_10px_25px_-5px_rgba(var(--secondary-rgb),0.4)]'} hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4 transition-all duration-300`}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus className="w-5 h-5" /> Start Your Journey
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link href="/signin" className="text-primary hover:underline font-semibold transition-colors">Sign in here</Link>
        </div>
      </motion.div>
    </div>
  );
}
