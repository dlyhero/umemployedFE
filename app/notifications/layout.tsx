import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AuthRoute from "@/utility/AuthRoute";
import HomeHeader from "../(Home)/Components/HomeHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notifications | UmEmployed",
  description: "Stay updated with your job applications, messages, and important updates from UmEmployed.",
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
       <AuthRoute type="protected" >
        <HomeHeader />
        {children}
       </AuthRoute>
        </div>
      </div>
  );
}
