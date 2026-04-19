"use client"
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      setAuthorized(false);
      router.push('/signin');
      return;
    }

    if (!user) {
      setAuthorized(false);
      return;
    }

    if (pathname.startsWith('/ngo-dashboard') && user.role !== 'ngo') {
      setAuthorized(false);
      router.push('/volunteer-dashboard');
      return;
    }

    if (pathname.startsWith('/volunteer-dashboard') && user.role !== 'volunteer') {
      setAuthorized(false);
      router.push('/ngo-dashboard');
      return;
    }

    setAuthorized(true);
  }, [mounted, token, user, pathname, router]);

  // Avoid SSR/client mismatches by waiting for client mount first.
  if (!mounted) {
    return null;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
