import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sahayog India - Intelligent Orchestration Engine",
  description: "Connect. Volunteer. Save Lives. Real-time crisis orchestration platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-900 text-white min-h-screen flex flex-col relative overflow-x-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-tertiary/20 z-[-1] fixed" />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
