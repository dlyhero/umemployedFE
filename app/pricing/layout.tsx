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

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Metadata moved to individual page.tsx files since this is now a client component

export default function PricingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();


    // Otherwise, render with full layout
    return (
        <AuthRoute type="protected">
            <div lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}

            </div>
        </AuthRoute>
    );
}