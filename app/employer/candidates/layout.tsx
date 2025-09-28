import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthRoute from "@/utility/AuthRoute";
import HomeHeader from "@/app/(Home)/Components/HomeHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candidates | UmEmployed",
  description: "Browse and manage candidate profiles for your job postings on UmEmployed.",
};

export default function CandidateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <AuthRoute type="protected" role="recruiter">
         <HomeHeader />
        {children}
       </AuthRoute>
      </div>
    </div>
  );
}
