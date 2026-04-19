"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const { user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on dashboard routes (optional, but they have their own sidebars)
  if (pathname.includes('/dashboard')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-lg py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            Si
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Sahayog<span className="text-secondary">India</span></span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition">How it Works</Link>
          <Link href="/#reviews" className="text-sm font-medium text-gray-300 hover:text-white transition">Impact</Link>
          
          {user ? (
            <Link 
              href={user.role === 'ngo' ? '/ngo-dashboard' : '/volunteer-dashboard'} 
              className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95 text-sm shadow-[0_0_20px_rgba(20,184,166,0.3)]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/signin" className="text-sm font-semibold text-gray-200 hover:text-white transition">Sign In</Link>
              <Link href="/signup" className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-semibold transition-all hover:scale-105 active:scale-95 text-sm">
                Join the Movement
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl">
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white p-2">How it Works</Link>
          <Link href="/#reviews" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white p-2">Impact</Link>
          <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white p-2">Sign In</Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-primary/80 hover:bg-primary px-6 py-3 rounded-lg text-white font-semibold text-center mt-2">
            Join the Movement
          </Link>
        </div>
      )}
    </header>
  );
}
