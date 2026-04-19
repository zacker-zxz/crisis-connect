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
  Inbox,
  ChevronRight
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
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — aligned with volunteer dashboard shell */}
        <aside 
          className={`fixed md:sticky top-0 z-[70] flex h-full w-80 -translate-x-full transform flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : ''}`}
        >
          <div className="flex items-center justify-between p-8">
              <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary font-black text-white shadow-[0_10px_24px_rgba(20,184,166,0.28)]">
                      CC
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">Crisis Connect</span>
              </Link>
            <button className="p-2 text-slate-400 hover:text-slate-800 md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-2 flex-1 space-y-2 overflow-y-auto px-5">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between rounded-2xl px-5 py-4 transition-all ${
                  pathname === item.href 
                    ? 'bg-primary text-white shadow-[0_12px_24px_rgba(20,184,166,0.25)]' 
                    : 'font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`h-5 w-5 shrink-0 ${pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                  <span className="text-sm font-semibold">{item.name}</span>
                </div>
                {pathname === item.href && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Link>
            ))}
          </nav>

          <div className="space-y-4 border-t border-slate-200 p-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-lg font-black text-white shadow-lg">
                  {user.name[0]}
               </div>
               <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="mt-1 text-xs font-semibold text-primary">NGO Administrator</p>
               </div>
            </div>
            <button 
              onClick={() => { logout(); router.push('/'); }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-4 text-sm font-semibold text-red-50 shadow-[0_0_0_rgba(239,68,68,0.45)] transition-all hover:from-red-500 hover:to-red-400 hover:shadow-[0_0_22px_rgba(239,68,68,0.45)]"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="relative flex h-full flex-1 flex-col overflow-hidden">
          <header className="z-50 flex h-24 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 md:px-10">
             <div className="flex items-center gap-8">
                 <button className="rounded-xl bg-slate-50 p-3 text-slate-900 transition-colors hover:bg-slate-100 md:hidden" onClick={() => setSidebarOpen(true)}>
                      <Menu className="h-6 w-6" />
                 </button>
                 <div className="hidden md:block">
                    <p className="mb-1 text-xs font-medium text-slate-500">NGO Workspace</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {navItems.find(i => i.href === pathname)?.name || 'NGO Console'}
                    </h1>
                 </div>
             </div>

             <div className="flex items-center gap-8">
                  {/* Notifications Bell */}
                  <div className="relative" ref={notifRef}>
                    <button 
                      onClick={openNotifications}
                      className={`relative rounded-xl p-3 transition-all ${notifOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-secondary text-[10px] font-black text-white">
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
                          className="absolute right-0 top-14 z-[100] w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
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

                  <div className="hidden flex-col items-end sm:flex">
                      <p className="text-xs font-medium uppercase leading-none tracking-widest text-slate-500">Local Status</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-primary">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span> Active
                      </p>
                  </div>
             </div>
          </header>

          <div className="custom-scrollbar relative flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
             {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
