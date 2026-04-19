"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Activity,
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  status: string;
  location: { address: string };
  dateTime: string;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [dailyTasks, setDailyTasks] = useState([
    { id: 'd1', title: 'Feed dogs in our society', completed: false },
    { id: 'd2', title: 'Water plants on gallery', completed: false },
    { id: 'd3', title: 'Throw 5 waste items in dustbin', completed: false },
  ]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Task[] = data.slice(0, 8).map((task: any, index: number) => ({
            _id: task._id || `task-${index}`,
            title: task.title || 'Untitled Mission',
            status: task.status || (index % 3 === 0 ? 'Completed' : 'In Progress'),
            location: { address: task.location?.address || 'Location unavailable' },
            dateTime: task.dateTime || new Date().toISOString()
          }));
          setTasks(mapped);
        } else {
          setTasks([
            { _id: '1', title: 'Medical Camp Setup', status: 'In Progress', location: { address: 'Sector 4, Navi Mumbai' }, dateTime: '2026-04-20T10:00:00Z' },
            { _id: '2', title: 'Food Distribution', status: 'Completed', location: { address: 'Dharavi Slums' }, dateTime: '2026-04-18T14:00:00Z' },
          ]);
        }
      } catch {
        setTasks([
          { _id: '1', title: 'Medical Camp Setup', status: 'In Progress', location: { address: 'Sector 4, Navi Mumbai' }, dateTime: '2026-04-20T10:00:00Z' },
          { _id: '2', title: 'Food Distribution', status: 'Completed', location: { address: 'Dharavi Slums' }, dateTime: '2026-04-18T14:00:00Z' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('volunteerDailyTasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setDailyTasks(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('volunteerDailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const toggleDailyTask = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Active Deployments</h2>
        <p className="text-slate-500">Track your ongoing commitments and past contributions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             [1,2].map(i => <div key={i} className="h-32 bg-white border border-slate-200 rounded-3xl animate-pulse"></div>)
        ) : tasks.length === 0 ? (
            <div className="bg-white p-20 rounded-[2rem] text-center border border-slate-200 shadow-sm">
                <Activity className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No active assignments</h3>
                <p className="text-slate-500">Jump into the Missions tab to start making an impact.</p>
            </div>
        ) : (
            tasks.map((task) => (
                <motion.div 
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center gap-8 group shadow-sm"
                >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border ${
                        task.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-500 border-emerald-200' 
                        : 'bg-primary/10 text-primary border-primary/20 animate-pulse-slow'
                    }`}>
                        {task.status === 'Completed' ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{task.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 border ${
                                task.status === 'Completed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-primary border-primary/30 bg-primary/5'
                            }`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                             <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4 text-primary" /> {task.location.address}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4 text-secondary" /> {new Date(task.dateTime).toLocaleString()}
                             </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-semibold text-sm flex items-center gap-2">
                           <MessageSquare className="w-4 h-4" /> Support
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-semibold text-sm">
                           Details
                        </button>
                    </div>
                </motion.div>
            ))
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Assignments Calendar</h3>
        <p className="text-sm text-slate-500 mb-6">Hover a date to view scheduled and completed tasks.</p>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => {
            const date = new Date();
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const startDay = (start.getDay() + 6) % 7;
            const dayNumber = index - startDay + 1;
            const monthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            const isValidDate = dayNumber > 0 && dayNumber <= monthDays;
            const dateKey = isValidDate
              ? new Date(date.getFullYear(), date.getMonth(), dayNumber).toDateString()
              : '';
            const dayTasks = tasks.filter(
              (task) => new Date(task.dateTime).toDateString() === dateKey
            );

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredDay(isValidDate ? dayNumber : null)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative min-h-[72px] rounded-xl border p-2 text-left ${
                  isValidDate ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/50 border-slate-100'
                }`}
              >
                {isValidDate && (
                  <>
                    <p className="text-sm font-semibold text-slate-800">{dayNumber}</p>
                    {dayTasks.length > 0 && (
                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {hoveredDay === dayNumber && dayTasks.length > 0 && (
                      <div className="absolute z-20 left-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-3">
                        {dayTasks.map((task) => (
                          <div key={task._id} className="mb-2 last:mb-0">
                            <p className="text-xs font-semibold text-slate-900">{task.title}</p>
                            <p className="text-[11px] text-slate-500">{task.location.address}</p>
                            <p className="text-[11px] text-slate-400">{task.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-2">My Daily Tasks</h3>
        <p className="text-sm text-slate-500 mb-5">Track personal everyday tasks with quick check marks.</p>
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <label key={task.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleDailyTask(task.id)}
                className="w-4 h-4"
              />
              <span className={`text-sm font-medium ${task.completed ? 'text-emerald-600 line-through' : 'text-slate-700'}`}>
                {task.title}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
