import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 border-t border-white/10 pt-16 pb-8 text-gray-400 relative z-10 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                Si
              </div>
              <span className="text-xl font-black text-white tracking-tight">Sahayog<span className="text-secondary">India</span></span>
            </Link>
            <p className="mb-6 max-w-sm text-sm">
              The Intelligent Orchestration Engine for Social Impact. Bridging the gap between localized social needs and available human resources in real-time.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">For Volunteers</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/signup?role=volunteer" className="hover:text-primary transition">Join as Responder</Link></li>
              <li><Link href="/signin" className="hover:text-primary transition">Volunteer Login</Link></li>
              <li><Link href="#" className="hover:text-primary transition">How it Works</Link></li>
              <li><Link href="#" className="hover:text-primary transition">Safety Guidelines</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">For NGOs</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/signup?role=ngo" className="hover:text-secondary transition">Register Organization</Link></li>
              <li><Link href="/signin" className="hover:text-secondary transition">NGO Portal</Link></li>
              <li><Link href="#" className="hover:text-secondary transition">API Access</Link></li>
              <li><Link href="#" className="hover:text-secondary transition">Partner Resources</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div>© {new Date().getFullYear()} Sahayog India. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
