"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit } from "lucide-react";

export type LoadingScreenVariant = "solid" | "transparent";

export interface LoadingScreenProps {
  isVisible: boolean;
  /** solid = darker backdrop (deployments); transparent = light blur over content (AI scan) */
  variant?: LoadingScreenVariant;
  headline?: string;
  /** Optional rotating status text while visible */
  statusLines?: string[];
}

/** Seeded particle positions so we never touch `window` during SSR */
const PARTICLE_SEEDS = Array.from({ length: 18 }, (_, i) => ({
  left: ((i * 47) % 92) + 4,
  top: ((i * 31) % 88) + 6,
  duration: 6 + (i % 5) * 1.2,
  delay: (i % 4) * 0.3,
}));

export function LoadingScreen({
  isVisible,
  variant = "solid",
  headline = "Processing…",
  statusLines,
}: LoadingScreenProps) {
  const [lineIndex, setLineIndex] = useState(0);

  const backdropClass =
    variant === "transparent"
      ? "bg-slate-900/35 backdrop-blur-sm"
      : "bg-slate-950/90 backdrop-blur-md";

  const cardClass =
    variant === "transparent"
      ? "bg-white/75 border-white/50 shadow-2xl shadow-primary/10"
      : "bg-slate-900/80 border-white/10 shadow-2xl shadow-primary/20";

  const textPrimary = variant === "transparent" ? "text-slate-900" : "text-white";
  const textMuted = variant === "transparent" ? "text-slate-600" : "text-slate-400";

  useEffect(() => {
    if (!isVisible || !statusLines?.length) return;
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % statusLines.length);
    }, 1900);
    return () => clearInterval(id);
  }, [isVisible, statusLines]);

  useEffect(() => {
    if (isVisible) setLineIndex(0);
  }, [isVisible]);

  const activeLine = statusLines?.length ? statusLines[lineIndex] : null;

  const orbs = useMemo(
    () => [
      { className: "bg-primary/25 blur-3xl w-72 h-72 -top-20 -left-20" },
      { className: "bg-secondary/20 blur-3xl w-64 h-64 -bottom-16 -right-12" },
      { className: "bg-primary/15 blur-2xl w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
    ],
    []
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="crisis-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`fixed inset-0 z-[20000] flex items-center justify-center ${backdropClass}`}
          aria-busy="true"
          aria-live="polite"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {orbs.map((orb, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${orb.className}`}
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: variant === "transparent" ? [0.5, 0.75, 0.5] : [0.35, 0.55, 0.35],
                }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
            {PARTICLE_SEEDS.map((p, i) => (
              <motion.div
                key={`p-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary/70 shadow-[0_0_12px_rgba(20,184,166,0.6)]"
                style={{ left: `${p.left}%`, top: `${p.top}%` }}
                animate={{
                  y: [0, -18, 0],
                  x: [0, i % 2 === 0 ? 10 : -10, 0],
                  opacity: [0.35, 0.9, 0.35],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className={`relative z-10 mx-6 w-full max-w-md rounded-[2rem] border px-10 py-12 backdrop-blur-xl ${cardClass}`}
          >
            <div className="mb-8 flex justify-center">
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <motion.div
                  className="absolute inset-1 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <BrainCircuit className="relative z-10 h-9 w-9 text-white" />
              </motion.div>
            </div>

            <motion.h2
              key={headline}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-2 text-center text-xl font-black uppercase tracking-tight ${textPrimary}`}
            >
              {headline}
            </motion.h2>

            {activeLine && (
              <motion.p
                key={activeLine}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 min-h-[3rem] text-center text-sm font-semibold leading-relaxed ${textMuted}`}
              >
                {activeLine}
              </motion.p>
            )}

            {!activeLine && (
              <p className={`mb-8 text-center text-sm font-medium ${textMuted}`}>
                Please wait…
              </p>
            )}

            <div
              className={`relative h-2 w-full overflow-hidden rounded-full ${
                variant === "transparent" ? "bg-slate-200/80" : "bg-slate-800"
              }`}
            >
              <motion.div
                className="absolute left-0 top-0 h-full w-2/5 rounded-full bg-gradient-to-r from-primary via-teal-400 to-secondary"
                initial={{ x: "-20%" }}
                animate={{ x: ["-20%", "320%"] }}
                transition={{
                  duration: 1.35,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            <div className="mt-6 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.35, 1, 0.35],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
