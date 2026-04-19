"use client"
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Map, Bell, ShieldCheck, Zap, Globe, MessageSquare, Mail, Phone, Users, Star } from 'lucide-react';
import FeatureShowcase from '../components/ui/FeatureShowcase';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
        className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative pt-20"
      >
        <div className="absolute inset-0 z-[-1] overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 object-center mix-blend-overlay"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium text-sm">
            Intelligent Orchestration Engine
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-tight">
            Connect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Volunteer.</span><br/>Save Lives.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Bridging the gap between localized social needs and available human resources in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/signup?role=ngo" className="group relative px-8 py-4 bg-primary rounded-xl overflow-hidden shadow-[0_0_40px_rgba(20,184,166,0.3)] transition-transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative text-white font-bold text-lg">Join as NGO</span>
            </Link>
            <Link href="/signup?role=volunteer" className="group relative px-8 py-4 bg-secondary rounded-xl overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative text-white font-bold text-lg">Volunteer Now</span>
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* Two-Sided Ecosystem */}
      <section id="how-it-works" className="py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Two-Sided Ecosystem</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">A seamless platform catering to organizations that need help and individuals ready to give it.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-10 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-32 h-32 text-secondary" />
              </div>
              <h3 className="text-3xl font-bold text-secondary mb-4">The Volunteer</h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Sign up, set your availability, list your specific skills (medical, logistics, teaching), and get alerted instantly to local opportunities where your exact help is needed.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><CheckCircle className="text-secondary w-5 h-5"/> Skill-based matching</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-secondary w-5 h-5"/> Real-time push alerts</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-secondary w-5 h-5"/> Localized impact tracking</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-10 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-32 h-32 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">The NGO Lead</h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Post requirements instantly, manage active volunteer teams on a live dashboard, and seamlessly deploy qualified people to urgent tasks without administrative bottlenecks.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><CheckCircle className="text-primary w-5 h-5"/> Live task deployment</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-primary w-5 h-5"/> Automated skill filtration</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-primary w-5 h-5"/> Live tracking dashboard</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Features (Scroll Animation) */}
      <FeatureShowcase />

      {/* Reviews Section */}
      <section id="reviews" className="py-32 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Impact Stories</h2>
            <p className="text-gray-400">See how Sahayog India is making a difference.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 rounded-2xl relative"
              >
                <MessageSquare className="absolute top-6 right-6 text-white/5 w-12 h-12" />
                <div className="flex gap-1 text-primary mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} />)}
                </div>
                <p className="text-gray-300 mb-6 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{review.name}</h4>
                    <span className="text-sm text-gray-400">{review.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 border-t border-white/5 relative bg-slate-950">
        <div className="container mx-auto max-w-4xl glass-card rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-400 mb-8">Have questions about integrating your NGO or partnering with us? Reach out today.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Mail className="w-5 h-5 text-primary" /></div>
                  contact@sahayogindia.org
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Phone className="w-5 h-5 text-secondary" /></div>
                  1-800-SAHAYOG
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <input type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition" />
              <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition" />
              <textarea placeholder="Message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition resize-none"></textarea>
              <button type="button" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// Subcomponents
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )
}


const reviews = [
  {
    name: "Dr. Ananya Sharma",
    role: "NGO Directo, Mumbai",
    text: "Sahayog India completely changed how we respond to floods. We used to spend hours calling volunteers. Now, we pinpoint the need on the map and the right people show up."
  },
  {
    name: "Rahul Verma",
    role: "Registered Volunteer",
    text: "I want to help but I have a full-time job. With alerts, I only get pinged when there's an emergency needing CPR within a 5km radius. It's incredibly efficient."
  },
  {
    name: "Vikram Singh",
    role: "Community Lead",
    text: "The algorithmic matching is flawless. We needed logicstics experts to clear debris last month, and the platform found 15 verified locals in under 10 minutes."
  }
]
