import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AuthRoute from "@/utility/AuthRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Find Jobs | UmEmployed",
  description: "Browse thousands of job opportunities from top employers. Find your perfect job match with UmEmployed.",
};

export default function JobListingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <AuthRoute type="public" >
        {children}
       </AuthRoute>
        </div>
      </div>
  );
}
