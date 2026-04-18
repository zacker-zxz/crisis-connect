import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Dummy login delay
    setTimeout(() => {
      setIsLoading(false);
      // For demonstration, arbitrarily route to NGO dashboard
      navigate('/ngo-dashboard');
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498354136128-58f790194fa7?auto=format&fit=crop&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="glass-card max-w-md w-full p-8 z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-4 rounded-full border border-white/20 shadow-lg">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSignIn} className="space-y-5">
          <input 
            type="text" 
            placeholder="Email or Phone" 
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
              <input type="checkbox" className="accent-primary w-4 h-4 rounded border-gray-300 focus:ring-primary bg-white/10" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="text-secondary text-sm hover:underline">
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80 text-white font-semibold p-3 rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/signup" className="text-secondary text-sm hover:underline">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
