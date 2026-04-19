"use client"
import React from 'react';
import LiveHeatmap from '@/components/maps/LiveHeatmap';
import { motion } from 'framer-motion';

export default function NgoHeatmapPage() {
  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end shrink-0"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Geospatial Intelligence</h2>
          <p className="text-slate-500">Monitoring real-time community needs and heat clusters.</p>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 min-h-0"
      >
        <LiveHeatmap />
      </motion.div>
    </div>
  );
}
