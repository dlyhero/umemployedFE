import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AuthHeader from "./components/AuthHeader";
import AuthFooter from "./components/AuthFooter";
import AuthRoute from "@/utility/AuthRoute";
import Logo from "../(Home)/Components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Authentication | UmEmployed",
  description: "Sign in or sign up to access your UmEmployed account and start your job search journey.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <AuthRoute type="auth">
        <div
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 md:bg-gray-50 `}
        >
          <div className="h-18 flex items-center px-4 sm:max-w-6xl mx-auto md:bg-white">
           <Logo/>
          </div>
          <div className="flex flex-col min-h-[calc(100vh-3.5rem)] justify-center py-8">
            {children}
            <AuthFooter />
          </div>
        </div>
      </AuthRoute>
    </div>
  );
}
