"use client"
import React, { useState, useRef, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Home, 
  ClipboardList, 
  PlusCircle, 
  Users, 
  Map as MapIcon, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  UserPlus,
  UserCog,
  AlertTriangle,
  Inbox
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// --- Notifications Data ---
const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    type: 'task_created',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    title: 'Mission Deployed',
    body: '"Flood Relief Coordinator" is now live and accepting volunteers.',
    time: '2h ago',
    read: false,
  },
  {
    id: 2,
    type: 'deadline',
    icon: Clock,
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
    title: 'Deadline Approaching',
    body: '"Medical Supply Transport" is scheduled in 2 days. Confirm readiness.',
    time: '5h ago',
    read: false,
  },
  {
    id: 3,
    type: 'volunteer_joined',
    icon: UserPlus,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Volunteer Enrolled',
    body: 'Rahul Verma has joined "Food Distribution Drive". Deployment: 6 / 10.',
    time: '1d ago',
    read: false,
  },
  {
    id: 4,
    type: 'profile_updated',
    icon: UserCog,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
    title: 'Profile Updated',
    body: 'Your organization profile and description were saved successfully.',
    time: '2d ago',
    read: true,
  },
  {
    id: 5,
    type: 'capacity',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    title: 'Capacity Reached',
    body: '"Search & Rescue Team" has filled all volunteer slots. Mission is In Progress.',
    time: '3d ago',
    read: true,
  },
];

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openNotifications = () => {
    setNotifOpen(prev => !prev);
    // Mark all as read when opened
    if (!notifOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/ngo-dashboard', icon: Home },
    { name: 'Active Tasks', href: '/ngo-dashboard/tasks', icon: ClipboardList },
    { name: 'Post New Task', href: '/ngo-dashboard/create', icon: PlusCircle },
    { name: 'My Schedule', href: '/ngo-dashboard/schedule', icon: Calendar },
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
                  <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-xs">
                      CC
                  </div>
                  <span className="text-xl font-black text-slate-800 tracking-tight">Crisis Connect</span>
              </Link>
            <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
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
                <item.icon className={`w-5 h-5 shrink-0 ${pathname === item.href ? 'text-primary' : ''}`} />
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-bold text-sm shadow-sm shadow-red-500/30"
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
                  {/* Notifications Bell */}
                  <div className="relative" ref={notifRef}>
                    <button 
                      onClick={openNotifications}
                      className="relative p-2.5 rounded-xl bg-slate-100 border border-gray-200 text-slate-500 hover:text-slate-700 transition-all"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount}
                          </span>
                        )}
                    </button>

                    {/* Notification Drawer */}
                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                        >
                          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Inbox className="w-5 h-5 text-primary" />
                              <h3 className="font-black text-slate-800 text-base">Notifications</h3>
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                              {notifications.filter(n => n.read).length} read
                            </span>
                          </div>

                          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                            {notifications.map((notif) => (
                              <div key={notif.id} className={`flex gap-4 p-5 transition-colors ${notif.read ? 'bg-white' : 'bg-slate-50'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                                  <notif.icon className={`w-5 h-5 ${notif.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm font-bold ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <span className="w-2 h-2 bg-secondary rounded-full shrink-0 mt-1.5"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.body}</p>
                                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-3 border-t border-gray-100 bg-slate-50">
                            <button 
                              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                              className="w-full text-xs font-bold text-primary hover:text-primary/70 transition py-1"
                            >
                              Mark all as read
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

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
