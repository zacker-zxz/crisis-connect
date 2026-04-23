"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

type BreakdownItem = {
  taskId: string;
  title: string;
  marginalScore: number;
  notes: string;
};

type ResonancePayload = {
  recommendedTaskId: string;
  recommendedTitle: string;
  reasoning: string;
  impactPotential: number;
  marginalImpactIndex: number;
  bottleneck: string;
  projectedDeltaPercent: number;
  breakdown: BreakdownItem[];
};

const bottleneckLabel: Record<string, string> = {
  skill: "Skill binding",
  capacity: "Capacity gap",
  priority: "Priority pressure",
  geo: "Reach / proximity",
  balanced: "Balanced field",
};

export default function ResonanceFieldPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<ResonancePayload | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Sign in to load the resonance field.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/volunteer/resonance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: "{}",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not load resonance.");
        setData(null);
        return;
      }
      if (json.recommendation === null || !json.recommendedTaskId) {
        setData(null);
        setMessage(json.message || "No eligible missions right now.");
        return;
      }
      setData(json as ResonancePayload);
    } catch {
      setError("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-10 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Link
          href="/volunteer-dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Command center
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 opacity-[0.06] text-primary pointer-events-none">
          <BrainCircuit className="w-80 h-80" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="w-4 h-4" /> Resonance field
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight uppercase mb-4">
            Marginal impact <span className="text-primary">engine</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-3xl leading-relaxed font-medium mb-10">
            Deterministic scoring across skill fit, open capacity, mission priority, and optional
            proximity to your saved location. Guardian narrative may be polished when{" "}
            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">GEMINI_API_KEY</code> is set;
            rankings stay on the server either way.
          </p>

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold">
              <Loader2 className="w-5 h-5 animate-spin" /> Synchronizing field…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-3 p-6 rounded-3xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && message && (
            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-slate-600 font-medium">
              {message}
            </div>
          )}

          {!loading && data && (
            <div className="space-y-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  {data.impactPotential}% impact potential
                </span>
                <span className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest">
                  +{data.projectedDeltaPercent}% projected clearance
                </span>
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-2xl text-[9px] font-black uppercase tracking-widest border border-primary/15">
                  Bottleneck: {bottleneckLabel[data.bottleneck] ?? data.bottleneck}
                </span>
              </div>

              <div>
                <h2 className="text-xs font-black text-secondary uppercase tracking-widest mb-2">
                  Lead deployment
                </h2>
                <p className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                  {data.recommendedTitle}
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <p className="text-slate-600 text-lg leading-relaxed italic font-medium">
                  &ldquo;{data.reasoning}&rdquo;
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Top nodes by marginal score
                  </h2>
                </div>
                <div className="space-y-4">
                  {data.breakdown.map((row, i) => (
                    <motion.div
                      key={row.taskId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-6 rounded-[2rem] border ${
                        row.taskId === data.recommendedTaskId
                          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
                          : "border-slate-100 bg-white"
                      } shadow-sm`}
                    >
                      <div className="flex flex-wrap justify-between gap-3 items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{row.title}</h3>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest tabular-nums">
                          {row.marginalScore} / 100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold tracking-wide">{row.notes}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Link
                href={`/volunteer-dashboard/missions/${data.recommendedTaskId}`}
                className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-primary text-white font-black px-10 py-5 rounded-[2rem] transition-all uppercase tracking-[0.2em] text-xs"
              >
                Open mission briefing
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
