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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Wait for client hydration before rendering auth-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide header on dashboard routes (they have their own sidebars)
  if (pathname.includes('/dashboard')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            Si
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">Sahayog<span className="text-secondary">India</span></span>
        </Link>
        
        {/* Desktop Nav – Centered Links */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition">Home</Link>
          <Link href="/#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary transition">How it Works</Link>
          <Link href="/#impact" className="text-sm font-semibold text-slate-600 hover:text-primary transition">Impact</Link>
          <Link href="/#contact" className="text-sm font-semibold text-slate-600 hover:text-primary transition">Contact Us</Link>
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/signin" className="text-sm font-semibold text-slate-600 hover:text-primary transition">Login</Link>
          <Link href="/signup" className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full text-white font-semibold transition-all hover:scale-105 active:scale-95 text-sm shadow-md">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-4 flex flex-col gap-4 shadow-lg">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-primary p-2">Home</Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-primary p-2">How it Works</Link>
          <Link href="/#impact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-primary p-2">Impact</Link>
          <Link href="/#contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-primary p-2">Contact Us</Link>
          <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-primary p-2">Login</Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-lg text-white font-semibold text-center mt-2">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
