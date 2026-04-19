"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, X, MapPin, Users, Calendar,
  Clock, CheckCircle2, AlertTriangle, Circle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Completed';
  priority?: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  location: { address: string };
  dateTime: string;
  requiredSkills?: string[];
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  Urgent:   { label: 'Urgent',   color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  Medium:   { label: 'Medium',   color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Low:      { label: 'Low',      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const STATUS_CONFIG: Record<string, { dot: string; label: string; textColor: string }> = {
  'Open':        { dot: 'bg-secondary', label: 'Open', textColor: 'text-secondary' },
  'In Progress': { dot: 'bg-primary',   label: 'In Progress', textColor: 'text-primary' },
  'Completed':   { dot: 'bg-emerald-500', label: 'Completed', textColor: 'text-emerald-600' },
};

// --- Mock tasks to supplement (matching create form structure) ---
const MOCK_TASKS: Task[] = [
  {
    _id: 'mock1', title: 'Flood Relief Coordinator', description: 'Coordinate rescue teams during flood in coastal area.', 
    status: 'In Progress', priority: 'Critical', requiredVolunteers: 10, filledVolunteers: 7,
    location: { address: 'Bandra West, Mumbai' }, dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    requiredSkills: ['Logistics', 'Search & Rescue']
  },
  {
    _id: 'mock2', title: 'Medical Supply Transport', description: 'Transport medicines and supplies to remote health camps.',
    status: 'Open', priority: 'Urgent', requiredVolunteers: 5, filledVolunteers: 2,
    location: { address: 'Andheri East, Mumbai' }, dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    requiredSkills: ['Medical', 'Driving']
  },
  {
    _id: 'mock3', title: 'Food Distribution Drive', description: 'Distribute food packets in affected zones.',
    status: 'Completed', priority: 'Medium', requiredVolunteers: 8, filledVolunteers: 8,
    location: { address: 'Dadar, Mumbai' }, dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    requiredSkills: ['Food Distribution']
  },
  {
    _id: 'mock4', title: 'Community Counseling Session', description: 'Mental health support for disaster survivors.',
    status: 'Completed', priority: 'Low', requiredVolunteers: 3, filledVolunteers: 3,
    location: { address: 'Kurla West, Mumbai' }, dateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    requiredSkills: ['Counseling']
  },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SchedulePage() {
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks([...data, ...MOCK_TASKS]);
        }
      } catch {}
    };
    fetchTasks();
  }, [token]);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
      const d = new Date(t.dateTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const isPast = (dateStr: string) => new Date(dateStr) < today;

  // Stats
  const upcoming = tasks.filter(t => !isPast(t.dateTime) && t.status !== 'Completed');
  const completed = tasks.filter(t => t.status === 'Completed');
  const totalVolunteers = tasks.reduce((sum, t) => sum + (t.filledVolunteers || 0), 0);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Missions', value: tasks.length, color: 'text-slate-800', icon: Calendar, bg: 'bg-primary/10', iconColor: 'text-primary' },
          { label: 'Upcoming', value: upcoming.length, color: 'text-secondary', icon: Clock, bg: 'bg-secondary/10', iconColor: 'text-secondary' },
          { label: 'Completed', value: completed.length, color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Total Volunteers', value: totalVolunteers, color: 'text-primary', icon: Users, bg: 'bg-primary/10', iconColor: 'text-primary' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card bg-white/70 border-gray-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm"
          >
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-white border border-gray-200 rounded-[2rem] shadow-sm"
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60 rounded-t-[2rem]" />
        {/* Ring decoration top-right */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border-2 border-primary/10 pointer-events-none" />
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full border-2 border-secondary/10 pointer-events-none" />
        {/* Dot-grid bottom-left */}
        <div className="absolute bottom-0 left-0 w-36 h-36 pointer-events-none overflow-hidden">
          <div className="grid grid-cols-5 gap-2 opacity-[0.04] p-4">
            {Array.from({length: 25}).map((_,i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />)}
          </div>
        </div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{MONTHS[month]}</h2>
            <p className="text-slate-500 text-sm font-medium">{year}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2.5 rounded-xl bg-slate-100 border border-gray-200 text-slate-500 hover:bg-slate-200 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewDate(new Date())}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-bold hover:bg-primary/20 transition"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2.5 rounded-xl bg-slate-100 border border-gray-200 text-slate-500 hover:bg-slate-200 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty leading cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-gray-100 bg-slate-50/40" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayTasks = getTasksForDay(day);

            return (
              <div
                key={day}
                className={`min-h-[100px] p-2 border-r border-b border-gray-100 transition-colors ${isToday ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1.5 ${
                  isToday ? 'bg-primary text-white shadow-md' : 'text-slate-600'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => {
                    const past = isPast(task.dateTime);
                    const pCfg = PRIORITY_CONFIG[task.priority || 'Medium'];
                    return (
                      <button
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-bold truncate border transition hover:scale-[1.02] ${
                          past
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : `${pCfg.bg} ${pCfg.color} ${pCfg.border}`
                        }`}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <p className="text-[9px] text-slate-400 font-bold pl-1">+{dayTasks.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority:</span>
        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
          </span>
        ))}
        <span className="ml-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Past tasks:</span>
        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-400 border-slate-200">Muted</span>
      </div>

      {/* Task Detail Slide-Over */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
            >
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mission Detail</p>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status & Priority Row */}
                <div className="flex gap-3 flex-wrap">
                  {(() => {
                    const s = STATUS_CONFIG[selectedTask.status] || STATUS_CONFIG['Open'];
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-slate-50 border-gray-200 ${s.textColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                        {s.label}
                      </span>
                    );
                  })()}
                  {selectedTask.priority && (() => {
                    const p = PRIORITY_CONFIG[selectedTask.priority];
                    return (
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${p.bg} ${p.color} ${p.border}`}>
                        {p.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedTask.description}</p>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scheduled</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {new Date(selectedTask.dateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                      {isPast(selectedTask.dateTime) && (
                        <p className="text-xs text-slate-400 mt-1">(Past mission)</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedTask.location.address}</p>
                    </div>
                  </div>
                </div>

                {/* Volunteer Count */}
                <div className="bg-slate-50 p-5 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <p className="text-sm font-bold text-slate-700">Volunteer Deployment</p>
                    </div>
                    <span className="text-lg font-black text-primary">
                      {selectedTask.filledVolunteers} <span className="text-slate-400 font-medium text-sm">/ {selectedTask.requiredVolunteers}</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (selectedTask.filledVolunteers / selectedTask.requiredVolunteers) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {selectedTask.requiredVolunteers - selectedTask.filledVolunteers > 0
                      ? `${selectedTask.requiredVolunteers - selectedTask.filledVolunteers} spots remaining`
                      : 'All slots filled!'}
                  </p>
                </div>

                {/* Required Skills */}
                {selectedTask.requiredSkills && selectedTask.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Required Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.requiredSkills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
