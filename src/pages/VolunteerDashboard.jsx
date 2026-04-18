import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ClipboardList, CheckSquare, Map as MapIcon, User, Bell, LogOut, Menu, X, Check } from 'lucide-react';

export default function VolunteerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: Home, active: true },
    { name: 'Available Tasks', icon: ClipboardList, active: false },
    { name: 'My Tasks', icon: CheckSquare, active: false },
    { name: 'Heat Map', icon: MapIcon, active: false },
    { name: 'Profile', icon: User, active: false },
    { name: 'Notifications', icon: Bell, active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex text-white relative">
      {/* Background Gradient to make glassmorphism visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-secondary/20 z-0"></div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 h-screen w-64 bg-white/10 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <span className="text-2xl font-bold text-white">CrisisConnect</span>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href="#" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active 
                  ? 'bg-primary/40 text-white border border-primary/50 shadow-inner' 
                  : 'text-gray-300 hover:bg-secondary/20 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 w-full md:w-auto h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 w-full bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold md:hidden">CrisisConnect</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors hidden md:block">
              <Bell className="w-6 h-6 text-gray-300" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 bg-white/10 rounded-full pr-4 p-1 border border-white/20 cursor-pointer hover:bg-white/20 transition">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full border border-primary"
              />
              <span className="text-sm font-medium">Alex Johnson</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Alex!</h2>
            <p className="text-gray-300">Here's your current dashboard overview.</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {['First Aid', 'Logistics', 'Search & Rescue'].map(skill => (
                <div key={skill} className="px-3 py-1 bg-white/5 border border-primary text-primary rounded-full text-sm font-medium">
                  {skill}
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Map and Upcoming */}
            <div className="lg:col-span-2 space-y-8">
              {/* Heatmap Preview */}
              <div className="glass-card rounded-xl p-5 border border-white/20 h-64 relative overflow-hidden group">
                <h3 className="text-lg font-semibold mb-4 text-white relative z-10 drop-shadow-md">Live Heatmap</h3>
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')" }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                  {/* Mock Hotspots */}
                  <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="absolute top-1/4 left-2/3 w-3 h-3 bg-secondary rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-1/4 left-2/3 w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <div className="absolute bottom-4 right-4 z-10 glass-card bg-black/50 px-4 py-2 rounded-lg text-sm">
                  2 Urgent Zones Nearby
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">Your Upcoming Tasks</h3>
                <div className="space-y-4">
                  <div className="glass-card bg-white/10 rounded-xl p-4 flex items-center justify-between border-l-4 border-l-primary">
                    <div>
                      <h4 className="font-semibold text-lg text-white">Food Distribution</h4>
                      <p className="text-gray-300 text-sm">Global Care NGO • Downtown Shelter • Today, 2:00 PM</p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 rounded-md text-xs text-gray-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recommended Tasks */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xl font-bold mb-4 text-white">Recommended Tasks</h3>
              
              {[
                { title: 'Debris Clearance', ngo: 'Local Relief', loc: 'Main St.', skill: 'Logistics' },
                { title: 'Medical Triage', ngo: 'Red Cross', loc: 'City Center', skill: 'First Aid' },
              ].map((task, idx) => (
                <div key={idx} className="glass-card bg-white/10 rounded-xl border border-white/20 p-5 hover:bg-white/15 transition-all">
                  <h4 className="font-bold text-lg text-white mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-300 mb-3">{task.ngo} • {task.loc}</p>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300 border border-white/10">{task.skill}</span>
                    <button className="glass-card bg-secondary/80 hover:bg-secondary px-4 py-2 rounded-lg text-white text-sm font-semibold transition-transform hover:scale-105 shadow-lg">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
