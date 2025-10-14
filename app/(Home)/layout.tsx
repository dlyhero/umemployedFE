import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import HomeHeader from './Components/HomeHeader'
import AuthRoute from "@/utility/AuthRoute";
import { HomePageFooter } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UmEmployed - Find Your Dream Job",
  description: "Connect with top employers and find your perfect job match. UmEmployed helps job seekers discover opportunities and companies find the right talent.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <AuthRoute type="public">
         {children}
         <HomePageFooter />
       </AuthRoute>
      </div>
    </div>
  );
}
