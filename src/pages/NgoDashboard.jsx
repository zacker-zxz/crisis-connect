import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, Users, Map as MapIcon, User, LogOut, Menu, X, LayoutDashboard, CheckSquare } from 'lucide-react';

export default function NgoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'create-task'

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'active', name: 'Active Tasks', icon: ClipboardList },
    { id: 'create-task', name: 'Create Task', icon: PlusCircle },
    { id: 'volunteers', name: 'Volunteers', icon: Users },
    { id: 'heatmap', name: 'Heat Map', icon: MapIcon },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  const renderContent = () => {
    if (activeView === 'create-task') {
      return (
        <div className="glass-card bg-white/10 p-8 rounded-2xl max-w-3xl mx-auto border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">Create New Task</h2>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-gray-200 font-medium">Task Title</label>
              <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Medical Supplies Transport" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-200 font-medium">Description</label>
              <textarea rows="4" className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Task details..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-200 font-medium">Volunteers Needed</label>
                <input type="number" min="1" className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="5" />
              </div>
              <div className="space-y-2">
                <label className="text-gray-200 font-medium">Required Skills</label>
                <select className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                  <option className="text-black">First Aid</option>
                  <option className="text-black">Logistics</option>
                  <option className="text-black">Search & Rescue</option>
                  <option className="text-black">General Help</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-200 font-medium">Location</label>
                <input type="text" className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Street Address" />
              </div>
              <div className="space-y-2">
                <label className="text-gray-200 font-medium">Date & Time</label>
                <input type="datetime-local" className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setActiveView('dashboard')} className="px-6 py-3 rounded-lg text-white font-medium mr-4 hover:bg-white/10 transition">Cancel</button>
              <button type="button" onClick={() => setActiveView('dashboard')} className="glass-card bg-primary/90 hover:bg-primary px-8 py-3 rounded-lg text-white font-bold transition shadow-xl">Post Task</button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Global Care!</h2>
          <p className="text-gray-300">Your organization's dashboard overview.</p>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card bg-white/10 p-6 rounded-xl border border-white/20 flex flex-col hover:bg-white/15 transition-all">
            <span className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-primary" /> Active Tasks</span>
            <span className="text-4xl font-bold text-white">12</span>
          </div>
          <div className="glass-card bg-white/10 p-6 rounded-xl border border-white/20 flex flex-col hover:bg-white/15 transition-all">
            <span className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /> Volunteers Available</span>
            <span className="text-4xl font-bold text-white">348</span>
          </div>
          <div className="glass-card bg-white/10 p-6 rounded-xl border border-white/20 flex flex-col hover:bg-white/15 transition-all">
            <span className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-tertiary" /> Tasks Completed</span>
            <span className="text-4xl font-bold text-white">85</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Tasks Quick List */}
          <div className="glass-card bg-white/10 p-6 rounded-xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Active Tasks</h3>
              <button 
                onClick={() => setActiveView('create-task')}
                className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-md hover:bg-primary/30 transition"
              >
                + New Task
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Food Distribution', loc: 'Downtown Shelter', needed: 5, fill: 3, status: 'In Progress' },
                { title: 'Medical Transport', loc: 'North Hospital', needed: 2, fill: 0, status: 'Open' },
              ].map((task, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">{task.title}</h4>
                    <p className="text-xs text-gray-300 mb-1">{task.loc}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded text-secondary bg-secondary/20">{task.fill}/{task.needed} Vols</span>
                      <span className="px-2 py-0.5 rounded text-gray-300 bg-white/10">{task.status}</span>
                    </div>
                  </div>
                  <button className="glass-card bg-primary/80 hover:bg-primary px-4 py-2 rounded-lg text-white text-sm font-semibold transition">
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Volunteer Applications & Heatmap */}
          <div className="space-y-8">
            <div className="glass-card bg-white/10 p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Recent Applications</h3>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Connor', skill: 'First Aid' },
                  { name: 'John Doe', skill: 'Logistics' },
                ].map((vol, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{vol.name}</h4>
                        <span className="text-xs text-primary px-2 py-0.5 rounded-full border border-primary/30 mt-1 inline-block">{vol.skill}</span>
                      </div>
                    </div>
                    <button className="glass-card bg-secondary/80 hover:bg-secondary px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/20 h-48 relative overflow-hidden group">
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')" }}
              >
                <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition"></div>
              </div>
              <div className="relative z-10 flex items-center justify-center h-full">
                <button className="glass-card px-6 py-2 rounded-lg text-white font-medium shadow-xl hover:scale-105 transition flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-secondary" /> Open Full Heatmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-tertiary/20 z-0"></div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white/10 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <span className="text-2xl font-bold text-white">NGO Portal</span>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                if (item.id === 'create-task' || item.id === 'dashboard') {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeView === item.id 
                  ? 'bg-primary/40 text-white border border-primary/50 shadow-inner' 
                  : 'text-gray-300 hover:bg-secondary/20 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col z-10 h-screen overflow-y-auto">
        <header className="sticky top-0 w-full bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold md:hidden">NGO Portal</h1>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 bg-white/10 rounded-full pr-4 p-1 border border-white/20 cursor-pointer hover:bg-white/20 transition">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold">GC</div>
              <span className="text-sm font-medium">Global Care</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
