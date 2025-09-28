"use client"

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Logo from '@/app/(Home)/Components/Logo';
import UserDashboard from '@/components/Header/UserDashboard';
import HomeHeader from '@/app/(Home)/Components/HomeHeader';
import NotificationBell from '@/app/applicant/components/Notifications';

export default function DashboardHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine button content based on user role
  const getActionButton = () => {
    const isRecruiter = session?.user?.role === 'recruiter';
    
    if (isRecruiter) {
      return {
        href: '/companies/post-job',
        mobileText: 'Post Job',
        desktopText: 'Post a Job',
        icon: 'heroicons:plus-20-solid' // Optional: add an icon for post job
      };
    } else {
      return {
        href: '/applicant/upload-resume',
        mobileText: 'Resume',
        desktopText: 'Upload Resume',
        icon: 'heroicons:document-arrow-up-20-solid' // Optional: add an icon for upload resume
      };
    }
  };

  const actionButton = getActionButton();

  return (
    <header className='h-18 md:h-20 w-full flex items-center px-2 md:px-6 lg:px-10 fixed top-0 left-0 right-0  z-40  max-[1120px]:bg-brand3'>
      {/* Logo - Hidden on mobile */}
      <div className='hidden '>
        <Logo />
      </div>

      <div className='flex items-center justify-end w-full  '>
        <div className='flex gap-4 md:gap-6 items-center'>
         <div className="mr-10"> <NotificationBell /></div>
          <UserDashboard />
          <Link 
            href={actionButton.href} 
            className='px-4 py-2 md:px-8 md:py-4 text-white bg-brand rounded-full text-sm font-medium hover:bg-brand2 hover:text-white transition-colors flex items-center gap-2'
          >
            {/* Optional: Display icon */}
        
            {isMobile ? actionButton.mobileText : actionButton.desktopText}
          </Link>
        </div>
      </div>
      {/* <HomeHeader/> */}
    </header>
  );
}