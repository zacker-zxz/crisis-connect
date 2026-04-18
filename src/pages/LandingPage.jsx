import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Map, Bell, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <main className="container mx-auto px-4 py-20 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
            Connect. Volunteer. Save Lives.
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 drop-shadow-md">
            NGOs post urgent tasks. Volunteers respond in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              to="/signup?role=ngo" 
              className="glass-card bg-primary/80 hover:bg-primary px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all scale-105 hover:scale-110 shadow-2xl"
            >
              Join as NGO
            </Link>
            <Link 
              to="/signup?role=volunteer" 
              className="glass-card bg-secondary/80 hover:bg-secondary px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all scale-105 hover:scale-110 shadow-2xl"
            >
              Join as Volunteer
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 w-full">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center transform transition-all hover:scale-105">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Skill-Based Matching</h3>
              <p className="text-gray-200">Connect with the right task based on your expertise and training.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center transform transition-all hover:scale-105">
              <div className="bg-secondary/20 p-4 rounded-full mb-4">
                <Map className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Heatmap</h3>
              <p className="text-gray-200">Real-time visualization of areas needing immediate attention.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center transform transition-all hover:scale-105">
              <div className="bg-tertiary/20 p-4 rounded-full mb-4">
                <Bell className="w-10 h-10 text-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Alerts</h3>
              <p className="text-gray-200">Get notified immediately when natural disasters strike nearby.</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-32 w-full max-w-4xl glass-card p-10 rounded-2xl">
          <h2 className="text-3xl font-bold text-center text-primary mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-100">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Verified NGOs</h4>
                <p className="text-sm">Partner exclusively with authenticated organizations for safe operations.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-secondary shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Real-Time Coordination</h4>
                <p className="text-sm">Skip the bureaucracy and act instantly when time matters most.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Globe className="w-8 h-8 text-tertiary shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Disaster Alerts</h4>
                <p className="text-sm">Integrated warning systems to stay ahead of crises in your region.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto backdrop-blur-md bg-black/40 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white font-bold text-xl">CrisisConnect</div>
          <div className="flex gap-6 text-gray-300">
            <Link to="/signup" className="hover:text-white transition">Sign Up</Link>
            <Link to="/signin" className="hover:text-white transition">Sign In</Link>
            <a href="#" className="hover:text-white transition">About</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
          <div className="text-sm text-gray-400">© 2026 CrisisConnect. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
