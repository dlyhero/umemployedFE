'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import "../globals.css";
import AuthRoute from "@/utility/AuthRoute";
import Sidebar from "@/components/Dashboard/Sidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import HomeHeader from "../(Home)/Components/HomeHeader";
import MobileScrollToTop from "@/components/Dashboard/MobileScrollTop";
import { RecruiterFooter } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata moved to individual page.tsx files since this is now a client component

export default function RecruiterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // If pathname is /companies/create, just render children without layout
  if (pathname === '/companies/create') {
    return (
      <AuthRoute role="recruiter" type="protected">
        <div lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <HomeHeader key="home-header" />
          <div key="create-children">{children}</div>
        </div>
      </AuthRoute>
    );
  }

  // Otherwise, render with full layout
  return (
    <AuthRoute type="protected">
      <div lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-screen bg-brand/5">
          <DashboardHeader key="dashboard-header" />
          {/* Main Content Area with Sidebar */}
          <div className="flex flex-1 pt-18" key="main-content-area">
            <Sidebar key="sidebar" />
            {/* Main Content */}
            <main className="flex-1 min-[1220px]:p-6 overflow-auto hide-scrollbar mt-6" key="main-content"> 
              <div className=" mx-auto">
                 <MobileScrollToTop key="mobile-scroll-top" />
                <div key="layout-children">{children}</div>
              </div>
            </main>
          </div>
          <RecruiterFooter />
        </div>
      </div>
    </AuthRoute>
  );
}