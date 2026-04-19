import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Crisis Connect - Intelligent Orchestration Engine",
  description: "Connect. Volunteer. Save Lives. Real-time crisis orchestration platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-800 min-h-screen flex flex-col relative overflow-x-hidden`} suppressHydrationWarning>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-orange-50 z-[-1] fixed" />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
