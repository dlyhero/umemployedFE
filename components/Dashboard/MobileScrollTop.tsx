// File: components/Dashboard/MobileScrollToTop.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const MobileScrollToTop = () => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1120);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Find the main content area and scroll it to top
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.scrollTo({
            top: 0,
            behavior: 'instant' // Use instant for immediate scroll on route change
          });
        }
        
        // Also scroll the window to top as a fallback
        window.scrollTo({
          top: 0,
          behavior: 'instant'
        });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pathname, isMobile]); // Trigger on route changes and mobile state changes

  return null; // This component doesn't render anything
};

export default MobileScrollToTop;