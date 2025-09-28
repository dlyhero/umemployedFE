"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/app/(Home)/Components/Logo';
import { useResumeDetails } from '@/hooks/profile/useResumeDetails';

interface MenuItem {
    name: string;
    icon: string;
    href: string;
}

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navMenuRef = useRef<HTMLDivElement>(null);
    const activeItemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const {resumeDetails} = useResumeDetails();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1120);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isLocked, setIsLocked] = useState(false);

    // Enhanced scroll lock effect
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            // Get the current scroll position
            const scrollY = window.scrollY;
            
            // Lock the scroll
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            
            setIsLocked(true);

            return () => {
                // Restore scroll when unmounting or closing
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                document.body.style.touchAction = '';
                
                // Restore scroll position
                window.scrollTo(0, scrollY);
                setIsLocked(false);
            };
        }
    }, [isMobile, sidebarOpen]);

    useEffect(() => {
        const scrollToActiveItem = () => {
            const activeItemRef = activeItemRefs.current[pathname];
            if (activeItemRef && navMenuRef.current) {
                const container = navMenuRef.current.closest('.sidebar-scroll');
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const itemRect = activeItemRef.getBoundingClientRect();
                    
                    const isItemFullyVisible = 
                        itemRect.top >= containerRect.top && 
                        itemRect.bottom <= containerRect.bottom;
                    
                    if (!isItemFullyVisible) {
                        const scrollTop = container.scrollTop;
                        const containerHeight = container.clientHeight;
                        const itemTop = activeItemRef.offsetTop;
                        const itemHeight = activeItemRef.clientHeight;
                        
                        const targetScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
                        
                        container.scrollTo({
                            top: Math.max(0, targetScrollTop),
                            behavior: 'smooth'
                        });
                    }
                }
            }
        };

        const timeoutId = setTimeout(scrollToActiveItem, 150);
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    // Define menu items based on user role
    const getMenuItems = (): MenuItem[] => {
        const isRecruiter = session?.user?.role === 'recruiter';
        
        if (isRecruiter) {
            // Recruiter menu items
            return [
                {
                    name: 'Dashboard',
                    icon: 'iwwa:dashboard',
                    href: '/companies/dashboard',
                },
                     {
                    name: 'Jobs',
                    icon: 'hugeicons:briefcase-06',
                    href: '/companies/jobs',
                },
                {
                    name: 'Applications',
                    icon: 'solar:users-group-two-rounded-line-duotone',
                    href: '/companies/applications',
                },
           
                {
                    name: 'Messages',
                    icon: 'basil:envelope-outline',
                    href: '/companies/messages',
                },
           
                {
                    name: 'Analytics',
                    icon: 'solar:chart-line-duotone',
                    href: '/companies/analytics',
                },
                {
                    name: 'Update',
                    icon: 'solar:refresh-line-duotone',
                    href: '/companies/update',
                },
            ];
        } else {
            // Applicant menu items (default)
            return [
                {
                    name: 'Dashboard',
                    icon: 'iwwa:dashboard',
                    href: '/applicant/dashboard',
                },
                {
                    name: 'Profile',
                    icon: 'solar:user-line-duotone',
                    href: '/applicant/profile',
                },
                {
                    name: 'Edit Profile',
                    icon: 'iconamoon:edit-thin',
                    href: '/applicant/edit-profile',
                },
                {
                    name: 'Messages',
                    icon: 'basil:envelope-outline',
                    href: '/applicant/messages/inbox',
                },
                {
                    name: 'Saved Jobs',
                    icon: 'si:heart-line',
                    href: '/applicant/jobs/saved',
                },
                {
                    name: 'Applied Jobs',
                    icon: 'hugeicons:briefcase-06',
                    href: '/applicant/jobs/applied',
                },
                {
                    name: 'My Shortlisted Jobs',
                    icon: 'heroicons:star',
                    href: '/applicant/jobs/shortlisted/enhance-resume',
                },
                {
                    name: 'Resume Advisor',
                    icon: 'solar:file-text-line-duotone',
                    href: '/applicant/resume-advisor',
                },
                {
                    name: 'Perfect Job Title',
                    icon: 'heroicons:magnifying-glass-20-solid',
                    href: '/applicant/perfect-job-title',
                },
            ];
        }
    };

    const menuItems = getMenuItems();

    const isActiveLink = (href: string): boolean => {
        if (href === '#') return false; // Don't highlight placeholder links
        return pathname === href || pathname.startsWith(href + '/');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleLinkClick = (href: string) => {
        if (isMobile) {
            closeSidebar();
        }
    };

    const renderSidebarContent = () => (
        <div className="sidebar-scroll fixed left-0 top-0 h-screen w-72 overflow-y-auto overflow-x-hidden bg-[#fff] " style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
        }}>
            <style jsx>{`
                .sidebar-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div className="p-4 md:p-6 flex flex-col items-center  space-y-6 md:space-y-8">
                {/* User Profile Section */}
                <div className='flex flex-col justify-center items-center gap-3 md:gap-4'>
                    <div className='min-[1120px]'>
                        <Logo />
                    </div>
                    <div className='relative'>
                        <div className='w-20 h-20 md:w-28 md:h-28 bg-center rounded-full object-cover border-4 border-brand/30 flex items-center justify-center bg-gray-100 overflow-hidden'>
                            {resumeDetails?.profile_image ? (
                                <img 
                                    src={resumeDetails.profile_image} 
                                    alt="Profile" 
                                    className='w-full h-full object-cover'
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : null}
                            {(!resumeDetails?.profile_image || resumeDetails.profile_image === '') && (
                                <div className='w-full h-full flex items-center justify-center bg-brand/10 text-brand font-bold text-xl md:text-2xl'>
                                    {session?.user?.name?.split(' ').map(n => n[0]).join('') || 
                                     session?.user?.email?.split('@')[0].substring(0, 2).toUpperCase() || 
                                     'US'}
                                </div>
                            )}
                        </div>
                    
                    </div>
                    <div className='text-center'>
                        {/* <p className='text-xs md:text-sm text-gray-600 font-medium'>Welcome back,</p> */}
                        <p className='text-base md:text-lg text-gray-900/90 font-semibold truncate max-w-[160px] md:max-w-[200px]'>
                            {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
                        </p>
                        {/* <p className='text-xs md:text-sm text-gray-500 truncate max-w-[160px] md:max-w-[200px]'>{session?.user?.email}</p>
                        {session?.user?.role && (
                            <p className='text-xs text-brand font-medium capitalize'>{session.user.role}</p>
                        )} */}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div ref={navMenuRef} className='w-full flex flex-col justify-center items-start space-y-1 md:space-y-2'>
                    {menuItems.map((item) => {
                        const isActive = isActiveLink(item.href);
                        return (
                            <Link 
                                key={item.href}
                                href={item.href}
                                ref={(el) => {
                                    if (isActive) {
                                        activeItemRefs.current[item.href] = el;
                                    }
                                }}
                                onClick={() => handleLinkClick(item.href)}
                                className={`w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300  b group ${
                                    isActive 
                                        ? 'bg-brand border-brand/30 text-white' 
                                        : 'border-gray-100 text-gray-700'
                                }`}
                            >
                                <div className={`p-1.5 md:p-2 rounded-md md:rounded-lg transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-brand/20 text-white' 
                                        : 'bg-gray-50 text-gray-500 '
                                }`}>
                                    <Icon 
                                        icon={item.icon} 
                                        className="size-6 md:size-6.2" 
                                    />
                                </div>
                                <p className={`text-[15px] md:text-[17px] font-semibold transition-all duration-300 ${
                                    isActive ? 'text-white' : 'text-gray-700'
                                }`}>
                                    {item.name}
                                </p>
                                {isActive && (
                                    <motion.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className='ml-auto'
                                    >
                                        <Icon 
                                            icon="heroicons:chevron-right-20-solid" 
                                            className='size-3 md:size-4 text-brand animate-pulse' 
                                        />
                                    </motion.div>
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Bottom Section */}
                <div className='w-full pt-4 md:pt-6 border-t border-gray-100'>
                    <Link 
                        href="/account-settings"
                        ref={(el) => {
                            if (isActiveLink('/account-settings')) {
                                activeItemRefs.current['/account-settings'] = el;
                            }
                        }}
                        onClick={() => handleLinkClick('/account-settings')}
                        className={`w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300  ${
                            isActiveLink('/account-settings')
                                ? 'bg-brand/10 border-brand/30 text-brand shadow-sm shadow-brand/20 scale-[1.02]' 
                                : 'border-gray-100 text-gray-600 hover:text-brand hover:scale-[1.01]'
                        }`}
                    >
                        <div className={`p-1.5 md:p-2 rounded-md md:rounded-lg transition-all duration-300 ${
                            isActiveLink('/account-settings')
                                ? 'bg-brand/20 text-brand' 
                                : 'bg-gray-50 text-gray-500 group-hover:bg-brand/10 group-hover:text-brand'
                        }`}>
                            <Icon icon="solar:settings-bold-duotone" className="size-4 md:size-5" />
                        </div>
                        <p className={`text-sm md:text-base font-semibold transition-all duration-300 ${
                            isActiveLink('/account-settings') ? 'text-brand' : 'text-gray-700 group-hover:text-brand'
                        }`}>
                            Settings
                        </p>
                        {isActiveLink('/account-settings') && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className='ml-auto'
                            >
                                <Icon 
                                    icon="solar:arrow-right-bold" 
                                    className='size-3 md:size-4 text-brand animate-pulse' 
                                />
                            </motion.div>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Hamburger Button (visible on mobile) */}
            {isMobile && (
                <button 
                    onClick={toggleSidebar}
                    className="fixed left-2 top-5.5 md:top-7 z-50  rounded-md  max-[1120px]:    text-white min-[1120px]:hidden transition-transform duration-200 hover:scale-110 active:scale-95"
                    aria-label="Toggle sidebar"
                >
                    <Icon icon="pepicons-pencil:menu" className="size-6" />
                </button>
            )}

            {/* Desktop Sidebar (always visible on larger screens) */}
            {!isMobile && (
                <div className="h-full w-72 border-r border-gray-100">
                    {renderSidebarContent()}
                </div>
            )}

            {/* Mobile Sidebar with Framer Motion */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <React.Fragment key="mobile-sidebar">
                        <motion.div
                            key="sidebar-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={closeSidebar}
                        />
                        
                        <motion.div
                            key="sidebar-content"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
                        >
                            {renderSidebarContent()}
                        </motion.div>
                    </React.Fragment>
                )}
            </AnimatePresence>
        </>
    );
}