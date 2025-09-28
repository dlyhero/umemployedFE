import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import HomeHeader from "../(Home)/Components/HomeHeader";
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
  title: "Onboarding | UmEmployed",
  description: "Complete your profile setup to get started with UmEmployed and find your dream job.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
       <AuthRoute type="protected" >
          <HomeHeader />
        {children}
       </AuthRoute>
        </div>
      </div>
  );
}
