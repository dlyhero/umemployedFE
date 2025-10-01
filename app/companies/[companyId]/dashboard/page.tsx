"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function CompanyDashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract company ID from URL if present
    const pathSegments = window.location.pathname.split('/');
    const companyIdIndex = pathSegments.findIndex(segment => segment === 'companies');
    
    if (companyIdIndex !== -1 && pathSegments[companyIdIndex + 1]) {
      const companyId = pathSegments[companyIdIndex + 1];
      
      // Check for Google OAuth success
      const googleOAuth = searchParams.get('google_oauth');
      if (googleOAuth === 'success') {
        toast.success('Google Calendar Connected!', {
          description: 'You can now schedule Google Meet interviews with automatic calendar integration.',
        });
      }
      
      // Redirect to correct dashboard URL
      router.replace('/companies/dashboard');
    } else {
      // Fallback: redirect to dashboard
      router.replace('/companies/dashboard');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}