import type { Metadata } from "next";
import "../../../globals.css";
import HomeHeader from "@/app/(Home)/Components/HomeHeader";



export default function ApplicantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <div>
        <HomeHeader />
        {children}
     </div>
  );
}