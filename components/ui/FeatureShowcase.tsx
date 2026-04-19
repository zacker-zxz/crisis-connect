"use client"
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Map, Zap, Heart, ShieldCheck, Users, Target } from 'lucide-react';

export default function FeatureShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Animation values for the sticky frame
  const frameRotateX = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [20, 0, 0, -20]);
  const frameScale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  
  // Content transitions inside the frame
  const stepOpacity1 = useTransform(smoothProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const stepOpacity2 = useTransform(smoothProgress, [0.35, 0.45, 0.6], [0, 1, 0]);
  const stepOpacity3 = useTransform(smoothProgress, [0.6, 0.7, 1], [0, 1, 1]);

  const features = [
    {
      title: "Geospatial Triage",
      description: "Our proprietary heatmap clusters community needs in real-time, allowing for instant triage and visual command across urban hubs.",
      icon: Map,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Algorithmic Matching",
      description: "Direct-to-needs orchestration. The engine cross-references skill profiles and geolocation to deploy the perfect team in minutes.",
      icon: Zap,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      title: "Impact Verification",
      description: "Every deployment is tracked and verified. Build an institutional-grade reporting system for social impact and reliability.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100"
    }
  ];

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-slate-50">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Title Section that fades out */}
        <motion.div 
          style={{ opacity: useTransform(smoothProgress, [0, 0.1], [1, 0]) }}
          className="absolute top-20 text-center"
        >
          <h2 className="text-5xl font-black text-slate-800 mb-4">The Orchestration Engine</h2>
          <p className="text-slate-500">Scroll to see the engine in action</p>
        </motion.div>

        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-20">
          
          {/* Left Side: Descriptions */}
          <div className="flex-1 space-y-40 relative z-10 w-full max-w-xl">
             {features.map((f, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ margin: "-40%" }}
                   className="h-screen flex flex-col justify-center py-20"
                >
                   <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} mb-8 border border-gray-200 shadow-sm`}>
                      <f.icon className="w-8 h-8" />
                   </div>
                   <h3 className="text-4xl font-bold text-slate-800 mb-6 uppercase tracking-tight">{f.title}</h3>
                   <p className="text-xl text-slate-500 leading-relaxed font-light">{f.description}</p>
                </motion.div>
             ))}
          </div>

          {/* Right Side: Sticky Device Frame */}
          <div className="flex-1 w-full max-w-2xl perspective-1000 hidden lg:block">
            <motion.div
              style={{ 
                rotateX: frameRotateX,
                scale: frameScale,
                boxShadow: "0 50px 100px -20px rgba(0,0,0,0.1)"
              }}
              className="glass-card w-full aspect-[4/3] rounded-[3rem] border border-gray-200 p-4 bg-white/70 backdrop-blur-xl"
            >
               <div className="w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden relative shadow-inner">
                  
                  {/* Step 1: Map View */}
                  <motion.div style={{ opacity: stepOpacity1 }} className="absolute inset-0 p-8 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                         <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
                         <div className="h-8 w-8 bg-primary/20 rounded-lg border border-primary/20"></div>
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-3xl border border-slate-200 relative overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-50" />
                         <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute top-1/2 left-1/3 w-12 h-12 bg-primary/20 rounded-full border-2 border-primary flex items-center justify-center"
                          >
                            <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_#0d9488]"></div>
                         </motion.div>
                         <motion.div 
                            animate={{ scale: [1.2, 1, 1.2] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute top-1/4 right-1/4 w-16 h-16 bg-secondary/20 rounded-full border-2 border-secondary flex items-center justify-center"
                          >
                            <div className="w-6 h-6 bg-secondary rounded-full shadow-[0_0_20px_#ea580c]"></div>
                         </motion.div>
                      </div>
                  </motion.div>

                  {/* Step 2: Matchmaking */}
                  <motion.div style={{ opacity: stepOpacity2 }} className="absolute inset-0 p-10 flex flex-col justify-center items-center gap-8">
                     <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center border-2 border-dashed border-secondary animate-spin-slow">
                        <Zap className="w-10 h-10 text-secondary" />
                     </div>
                     <div className="space-y-4 w-full px-10">
                        {[1,2,3].map(i => (
                           <motion.div key={i} className="h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                                <div className="h-3 w-20 bg-slate-300 rounded"></div>
                              </div>
                              <div className="text-[10px] font-black text-secondary">MATCH FOUND</div>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>

                  {/* Step 3: Success / Verification */}
                  <motion.div style={{ opacity: stepOpacity3 }} className="absolute inset-0 p-10 flex flex-col justify-center items-center text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center border-2 border-emerald-300 mb-8"
                      >
                         <ShieldCheck className="w-16 h-16 text-emerald-600" />
                      </motion.div>
                      <h4 className="text-3xl font-black text-slate-800 mb-4 italic uppercase">MISSION SECURED</h4>
                      <p className="text-slate-500">Orchestration Successfully Completed</p>
                      <div className="mt-10 h-1 w-48 bg-slate-200 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-full w-full bg-emerald-500"
                         />
                      </div>
                  </motion.div>

               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
