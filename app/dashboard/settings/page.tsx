"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function DashboardSettingsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for Google OAuth success
    const googleOAuth = searchParams.get('google_oauth');
    if (googleOAuth === 'success') {
      toast.success('Google Calendar Connected!', {
        description: 'You can now schedule Google Meet interviews with automatic calendar integration.',
      });
    }
    
    // Redirect to correct account settings page
    const url = new URL('/account-settings', window.location.origin);
    if (googleOAuth) {
      url.searchParams.set('google_oauth', googleOAuth);
    }
    
    router.replace(url.toString());
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to account settings...</p>
      </div>
    </div>
  );
}