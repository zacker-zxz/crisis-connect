"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, LifeBuoy, MapPin, Phone, Send, User, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

interface TaskDetail {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  requiredSkills: string[];
  location: { address: string };
  dateTime: string;
}

export default function MissionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [showSupport, setShowSupport] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [support, setSupport] = useState({
    name: user?.name || "",
    phone: "",
    query: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${params.id}`);
        const data = await res.json();
        setTask(data);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const reachCountdown = () => {
    const userId = String(user?.id || user?._id || "");
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(`reachBy:${userId}:${params.id}`);
      if (!raw) return null;
      const reachByTs = Number(raw);
      if (!Number.isFinite(reachByTs)) return null;
      const diff = reachByTs - now;
      if (diff <= 0) return { label: "Overdue", level: "overdue" as const };
      const totalSeconds = Math.floor(diff / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const label =
        h > 0 ? `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s` : `${m}m ${String(s).padStart(2, "0")}s`;
      const level = totalSeconds <= 3600 ? ("soon" as const) : ("ok" as const);
      return { label, level };
    } catch {
      return null;
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitting(true);
    setTimeout(() => {
      setSupportSubmitting(false);
      setShowSupport(false);
      addNotification({
        title: "Support Request Sent",
        message: "Mission support team will contact you shortly.",
        type: "alert",
      });
    }, 600);
  };

  const handleLeaveMission = async () => {
    if (!token || !task || !confirm("Leave this mission?")) return;
    setLeaveSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not leave mission");
        return;
      }
      addNotification({
        title: "Mission Left",
        message: `You backed off from "${task.title}".`,
        type: "alert",
      });
      router.push("/volunteer-dashboard/my-tasks");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white" />;
  }

  if (!task || !task._id) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-slate-400" />
        <p className="font-semibold text-slate-700">Mission not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">Mission Details</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{task.title}</h2>
          </div>
          <button
            onClick={handleLeaveMission}
            disabled={leaveSubmitting}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            {leaveSubmitting ? "Leaving..." : "Reject Mission"}
          </button>
        </div>

        {(() => {
          const cd = reachCountdown();
          if (!cd) return null;
          return (
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest border-red-200 bg-red-50 text-red-700 shadow-sm shadow-red-500/10"
            >
              ⏳ {cd.label} to reach location
            </div>
          );
        })()}

        <p className="mb-6 text-slate-600">{task.description}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="mb-2 font-bold text-slate-900">Mission Status</p>
            <p>{task.status}</p>
            <p className="mt-1 text-xs text-slate-500">Priority: {task.priority || "Medium"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="mb-2 font-bold text-slate-900">Schedule & Location</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {task.location.address}</p>
            <p className="mt-1">{new Date(task.dateTime).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-sm font-bold text-slate-900">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {(task.requiredSkills || []).map((skill) => (
              <span key={skill} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setShowSupport(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90"
          >
            <LifeBuoy className="h-4 w-4" /> Support
          </button>
        </div>
      </div>

      {showSupport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Mission Support</h3>
              <button onClick={() => setShowSupport(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Name</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full py-2.5 outline-none"
                    value={support.name}
                    onChange={(e) => setSupport((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full py-2.5 outline-none"
                    value={support.phone}
                    onChange={(e) => setSupport((s) => ({ ...s, phone: e.target.value }))}
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Query</span>
                <textarea
                  className="min-h-[100px] w-full rounded-xl border border-slate-200 p-3 outline-none"
                  value={support.query}
                  onChange={(e) => setSupport((s) => ({ ...s, query: e.target.value }))}
                  required
                />
              </label>
              <button
                type="submit"
                disabled={supportSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {supportSubmitting ? "Submitting..." : "Submit Support Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
