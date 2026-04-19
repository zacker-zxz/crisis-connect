"use client"
import React from 'react';
import LiveHeatmap from '@/components/maps/LiveHeatmap';
import { motion } from 'framer-motion';

export default function VolunteerHeatmapPage() {
  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end shrink-0"
      >
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Crisis Heatmap</h2>
          <p className="text-gray-400">Identify urgent needs and clusters requiring immediate attention.</p>
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
