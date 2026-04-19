"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  ClipboardList, 
  PlusCircle, 
  Users, 
  Map as MapIcon, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user || user.role !== 'ngo') {
      router.push('/signin');
    }
  }, [user, router]);

  const navItems = [
    { name: 'Dashboard', href: '/ngo-dashboard', icon: Home },
    { name: 'Active Tasks', href: '/ngo-dashboard/tasks', icon: ClipboardList },
    { name: 'Post New Task', href: '/ngo-dashboard/create', icon: PlusCircle },
    { name: 'Volunteers', href: '/ngo-dashboard/volunteers', icon: Users },
    { name: 'Heat Map', href: '/ngo-dashboard/heatmap', icon: MapIcon },
    { name: 'Settings', href: '/ngo-dashboard/settings', icon: Settings },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 h-full w-72 bg-slate-950/50 backdrop-blur-xl border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}
      >
        <div className="p-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                    Si
                </div>
                <span className="text-xl font-black text-white tracking-tight">Sahayog</span>
            </Link>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                pathname === item.href 
                  ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-primary' : ''}`} />
              <span className="font-semibold text-sm tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 p-2">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg">
                {user.name[0]}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-secondary font-medium">NGO Administrator</p>
             </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className="h-20 border-b border-white/5 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between z-30 shrink-0">
           <div className="flex items-center gap-4">
               <button className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-6 h-6" />
               </button>
               <h1 className="text-xl font-bold tracking-tight text-white hidden md:block">
                  {navItems.find(i => i.href === pathname)?.name || 'NGO Console'}
               </h1>
           </div>

           <div className="flex items-center gap-6">
                <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-slate-900"></span>
                </button>
                <div className="hidden sm:flex flex-col items-end">
                    <p className="text-xs font-bold text-white uppercase tracking-widest opacity-50">Local Status</p>
                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div> Active
                    </p>
                </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
           {children}
        </div>
      </main>
    </div>
  );
}
