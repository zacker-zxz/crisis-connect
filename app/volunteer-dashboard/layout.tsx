"use client"
import React, { useState, useRef, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  ClipboardList, 
  CheckSquare, 
  Map as MapIcon, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Bell,
  Heart,
  ChevronRight,
  Zap,
  Info,
  Building2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, updateUser } = useAuthStore();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshUser = async () => {
      if (token && !user?.profileImageUrl) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            updateUser(data);
          } else if (res.status === 401) {
            logout();
          }
        } catch (err) {
          console.error("Failed to refresh user data", err);
        }
      }
    };
    refreshUser();
  }, [token]);

  const navItems = [
    { name: 'Dashboard', href: '/volunteer-dashboard', icon: Home },
    { name: 'Available Missions', href: '/volunteer-dashboard/missions', icon: ClipboardList },
    { name: 'My Assignments', href: '/volunteer-dashboard/my-tasks', icon: CheckSquare },
    { name: 'Crisis Heatmap', href: '/volunteer-dashboard/heatmap', icon: MapIcon },
    { name: 'Join Community / NGO', href: '/volunteer-dashboard/community', icon: Building2 },
    { name: 'My Profile', href: '/volunteer-dashboard/profile', icon: User },
    { name: 'Settings', href: '/volunteer-dashboard/settings', icon: Settings },
  ];

  const mockNotifs = [
    { id: 1, title: 'Medical Mission nearby', desc: '5 volunteers needed in Bandra', time: '2m ago', urgent: true },
    { id: 2, title: 'Badge Unlocked', desc: 'You earned "First Responder" badge!', time: '1h ago', urgent: false },
    { id: 3, title: 'Shift Starting', desc: 'Your shift for Flood Relief starts in 30m', time: '30m ago', urgent: true },
    { id: 4, title: 'System Update', desc: 'New evacuation routes updated for Thane', time: '5h ago', urgent: false },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed md:sticky top-0 h-full w-80 bg-white border-r border-slate-200 z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col shadow-xl`}
        >
          <div className="p-8 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-black text-white shadow-[0_10px_24px_rgba(20,184,166,0.28)]">
                      CC
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">Crisis Connect</span>
              </Link>
            <button className="md:hidden text-slate-400 hover:text-slate-800 p-2" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-5 space-y-2 mt-2">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
                  pathname === item.href 
                    ? 'bg-primary text-white shadow-[0_12px_24px_rgba(20,184,166,0.25)]' 
                    : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {pathname === item.href && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
               <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-lg shadow-lg overflow-hidden">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="User avatar" className="h-full w-full object-cover" />
                  ) : (
                    user.name[0]
                  )}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-primary font-semibold mt-1">Verified Volunteer</p>
               </div>
            </div>
            <button 
              onClick={() => { logout(); router.push('/'); }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-red-50 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all font-semibold text-sm shadow-[0_0_0_rgba(239,68,68,0.45)] hover:shadow-[0_0_22px_rgba(239,68,68,0.45)]"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          <header className="h-24 border-b border-slate-200 bg-white px-8 md:px-10 flex items-center justify-between z-50 shrink-0">
             <div className="flex items-center gap-8">
                 <button className="md:hidden text-slate-900 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(true)}>
                      <Menu className="w-6 h-6" />
                 </button>
                 <div className="hidden md:block">
                    <p className="text-xs font-medium text-slate-500 mb-1">Volunteer Workspace</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
                    </h1>
                 </div>
             </div>

             <div className="flex items-center gap-8">
                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                      <button 
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`relative p-3 rounded-xl transition-all ${notifOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
                      >
                          <Bell className="w-5 h-5" />
                          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white animate-pulse"></span>
                      </button>

                      <AnimatePresence>
                        {notifOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-4 w-96 bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden z-[100]"
                          >
                            <div className="p-5 bg-slate-900 flex justify-between items-center">
                              <h3 className="text-white font-semibold text-sm">Notifications</h3>
                              <span className="bg-white/10 text-white/70 text-xs font-medium px-2 py-1 rounded">Live</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                              {mockNotifs.map(n => (
                                <div key={n.id} className="p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-4">
                                  <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${n.urgent ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {n.urgent ? <Zap className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                                      {n.title}
                                      {n.urgent && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>}
                                    </h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium mb-2">{n.desc}</p>
                                    <span className="text-[11px] font-medium text-slate-400">{n.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button className="w-full p-4 text-sm font-medium text-primary hover:bg-primary/5 transition-all bg-white border-t border-slate-100">
                              Clear Notifications
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>

                  <div className="hidden sm:flex flex-col items-end">
                      <p className="text-xs font-medium text-slate-500 mb-1 leading-none">Impact Score</p>
                      <p className="text-xl font-bold text-secondary flex items-center gap-2 tabular-nums">
                          <Heart className="w-5 h-5 fill-secondary" /> 2,450
                      </p>
                  </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar no-scrollbar relative bg-slate-50">
             {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
