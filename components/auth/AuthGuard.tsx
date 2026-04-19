"use client"
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      setAuthorized(false);
      router.push('/signin');
    } else {
      // Basic role-based access control
      if (pathname.startsWith('/ngo-dashboard') && user?.role !== 'ngo') {
        router.push('/volunteer-dashboard');
      } else if (pathname.startsWith('/volunteer-dashboard') && user?.role !== 'volunteer') {
        router.push('/ngo-dashboard');
      } else {
        setAuthorized(true);
      }
    }
  }, [token, user, pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
