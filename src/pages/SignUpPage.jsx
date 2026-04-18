import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Handshake, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Dummy redirection based on some mock state, here we just go to volunteer dashboard
      navigate('/volunteer-dashboard');
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593113580326-fe61eb2fb630?auto=format&fit=crop&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="glass-card max-w-md w-full p-8 z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-4 rounded-full border border-white/20 shadow-lg">
            <Handshake className="w-10 h-10 text-secondary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {step === 1 ? 'Create an Account' : 'Verify Your Email'}
        </h2>

        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="flex gap-4 mb-4 justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input type="radio" name="role" value="volunteer" defaultChecked className="accent-primary" />
                <span>Volunteer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input type="radio" name="role" value="ngo" className="accent-primary" />
                <span>NGO</span>
              </label>
            </div>

            <input 
              type="text" 
              placeholder="Full Name" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/80 text-white font-semibold p-3 rounded-lg transition shadow-lg flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <p className="text-gray-300 text-center text-sm">
              We've sent a 6-digit code to your email/phone. Please enter it below.
            </p>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6}
              required
              className="w-full bg-white/10 border border-white/30 rounded-lg p-4 text-center text-2xl tracking-[0.5em] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/80 text-white font-semibold p-3 rounded-lg transition shadow-lg flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
            </button>
            <div className="text-center">
              <button type="button" className="text-secondary text-sm hover:underline">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/signin" className="text-secondary text-sm hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
