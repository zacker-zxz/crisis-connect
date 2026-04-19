"use client"
import React from 'react';
import { usePathname } from "next/navigation";
import Header from "./ui/Header";
import Footer from "./ui/Footer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.includes('dashboard');
  const isAuth = pathname.includes('signin') || pathname.includes('signup');

  return (
    <>
      {(!isDashboard && !isAuth) && <Header />}
      <main className={`${(!isDashboard && !isAuth) ? 'flex-1' : 'h-screen'} flex flex-col`}>
        {children}
      </main>
      {(!isDashboard && !isAuth) && <Footer />}
    </>
  );
}
