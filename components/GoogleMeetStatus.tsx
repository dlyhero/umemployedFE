"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleMeetConnection } from '@/hooks/companies/useGoogleMeet';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface GoogleMeetStatusProps {
  className?: string;
  showTitle?: boolean;
}

const GoogleMeetStatus: React.FC<GoogleMeetStatusProps> = ({ 
  className = '', 
  showTitle = true 
}) => {
  const { data: session } = useSession();
  const { data: connection, isLoading, error, refetch } = useGoogleMeetConnection();

  const handleConnectGoogle = async () => {
    if (!session?.user?.accessToken) {
      toast.error('Authentication required', {
        description: 'Please sign in to connect your Google account.',
      });
      return;
    }
    
    try {
      // Method 2: API Call to get authorization URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/google/auth-url/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authorization_url) {
          // Redirect to Google OAuth
          window.location.href = data.authorization_url;
        } else {
          throw new Error('No authorization URL received');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast.error('Failed to connect to Google', {
        description: 'Please try again or contact support if the issue persists.',
      });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className={`p-4 ${className} shadow-none border-0`}>
        <div className="flex items-center gap-3">
          <Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">Checking Google Meet connection...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 shadow-none border-0 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Google Meet Error</div>
              <div className="text-xs text-gray-600">Unable to check connection status</div>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold" className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 shadow-none  border-0 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon 
            icon="logos:google-meet" 
            className={`size-12 md:size-16 ${connection?.connected ? 'text-green-600' : 'text-gray-400'}`} 
          />
          <div>
            {showTitle && (
              <div className="text-lg md:text-xl font-medium text-gray-900">Google Meet</div>
            )}
            <div className={`text-xs ${
              connection?.connected ? 'text-green-600' : 'text-gray-600'
            }`}>
              {connection?.connected ? 'Connected' : 'Not connected'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {connection?.connected ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Ready</span>
            </div>
          ) : (
            <button 
              onClick={handleConnectGoogle}
              className="text-brand border border-brand rounded-full px-3 py-1"
            >
              Connect
            </button>
          )}
          
          <button 
            onClick={handleRefresh}
            className="p-1"
          >
            <Icon icon="solar:refresh-bold" className="size-6" />
          </button>
        </div>
      </div>
      
      {!connection?.connected && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs md:text-sm text-yellow-800">
          <div className="flex items-start gap-2">
            <Icon icon="solar:info-circle-bold" className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div>
              Connect your Google account to schedule Google Meet interviews with automatic calendar integration.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GoogleMeetStatus;