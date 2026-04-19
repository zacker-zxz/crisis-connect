"use client"
import React, { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
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
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed md:sticky top-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}
        >
          <div className="p-8 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                      CC
                  </div>
                  <span className="text-xl font-black text-slate-800 tracking-tight">Crisis Connect</span>
              </Link>
            <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(false)}>
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
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-primary' : ''}`} />
                <span className="font-semibold text-sm tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-3 p-2">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg">
                  {user.name[0]}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-secondary font-medium">NGO Administrator</p>
               </div>
            </div>
            <button 
              onClick={() => { logout(); router.push('/'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-semibold text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          <header className="h-20 border-b border-gray-200 bg-white/60 backdrop-blur-md px-8 flex items-center justify-between z-30 shrink-0">
             <div className="flex items-center gap-4">
                 <button className="md:hidden text-slate-700 p-2 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                      <Menu className="w-6 h-6" />
                 </button>
                 <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden md:block">
                    {navItems.find(i => i.href === pathname)?.name || 'NGO Console'}
                 </h1>
             </div>

             <div className="flex items-center gap-6">
                  <button className="relative p-2.5 rounded-xl bg-slate-100 border border-gray-200 text-slate-500 hover:text-slate-700 transition-all">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
                  </button>
                  <div className="hidden sm:flex flex-col items-end">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Status</p>
                      <p className="text-sm font-bold text-primary flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"></span> Active
                      </p>
                  </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
             {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
