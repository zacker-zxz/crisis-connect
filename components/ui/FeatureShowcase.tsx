"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Geospatial Triage",
      description: "Our proprietary heatmap clusters community needs in real-time, allowing for instant triage and visual command across urban hubs. Get a bird’s eye view of where help is needed most.",
      icon: Map,
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "border-primary",
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80",
      metrics: [
        { label: "Update Rate", value: "Real-time" },
        { label: "Precision", value: "Street-level" }
      ]
    },
    {
      title: "Algorithmic Matching",
      description: "Direct-to-needs orchestration. The engine cross-references skill profiles and geolocation to deploy the perfect team in minutes, ensuring no time is wasted in emergencies.",
      icon: Zap,
      color: "text-secondary",
      bg: "bg-secondary/10",
      borderColor: "border-secondary",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80",
      metrics: [
        { label: "Match Speed", value: "< 2 mins" },
        { label: "Success Rate", value: "94%" }
      ]
    },
    {
      title: "Impact Verification",
      description: "Every deployment is tracked and verified. Build an institutional-grade reporting system for social impact and reliability, rewarding volunteers for their contributions.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      borderColor: "border-emerald-500",
      image: "https://images.unsplash.com/photo-1593113560732-a81cd51ba49d?auto=format&fit=crop&q=80",
      metrics: [
        { label: "Verification", value: "Blockchain-backed" },
        { label: "Trust Score", value: "Dynamic" }
      ]
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-sm"
          >
            Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-800 mb-6"
          >
            The Orchestration Engine
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Features Navigation */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveFeature(i)}
                className={`p-6 md:p-8 rounded-[2rem] cursor-pointer transition-all duration-300 border-2 ${
                  activeFeature === i 
                    ? `bg-white shadow-xl ${feature.borderColor} scale-[1.02]` 
                    : 'bg-transparent border-transparent hover:bg-white/50 text-slate-500 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    activeFeature === i ? feature.bg + ' ' + feature.color : 'bg-slate-200 text-slate-400'
                  }`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                      activeFeature === i ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {feature.title}
                    </h3>
                    {activeFeature === i && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-slate-600 leading-relaxed overflow-hidden"
                      >
                        {feature.description}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Graphic Display */}
          <div className="relative h-[500px] w-full rounded-[2.5rem] bg-slate-200 overflow-hidden shadow-2xl lg:block hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={features[activeFeature].image} 
                  alt={features[activeFeature].title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                
                {/* Floating Metric Cards */}
                <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                  {features[activeFeature].metrics.map((metric, i) => (
                    <motion.div 
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex-1 glass-card bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                    >
                      <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{metric.label}</p>
                      <p className="text-white font-black text-xl">{metric.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
