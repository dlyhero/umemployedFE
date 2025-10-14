import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AuthRoute from "@/utility/AuthRoute";
import Sidebar from "@/components/Dashboard/Sidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import MobileScrollToTop from "@/components/Dashboard/MobileScrollTop";
import { JobSeekerFooter } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Applicant Dashboard",
  description: "Applicant dashboard page",
};

export default function ApplicantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthRoute role="job_seeker" type="protected">
      <div lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-screen bg-brand/5">
          <DashboardHeader />
          {/* Main Content Area with Sidebar */}
          <div className="flex flex-1 pt-18">
            <Sidebar />
            {/* Main Content */}
            <main className="flex-1 min-[1220px]:p-6 overflow-auto hide-scrollbar mt-5">
              <div className="mx-auto">
                <MobileScrollToTop />
                {children}
              </div>
            </main>
          </div>
          <JobSeekerFooter />
        </div>
      </div>
    </AuthRoute>
  );
}