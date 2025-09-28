'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Show success message
        toast.success('Subscription activated successfully!');
        
        // Invalidate subscription status cache to force refresh on next access
        // This is less aggressive than refetch() and reduces API calls
        queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
        
        setIsLoading(false);
        
        // Redirect to dashboard after a few seconds
        setTimeout(() => {
          const dashboardUrl = session?.user?.role === 'recruiter' 
            ? '/companies/dashboard' 
            : '/applicant/dashboard';
          window.location.href = dashboardUrl;
        }, 3000);
      } catch (error) {
        console.error('Error handling payment success:', error);
        toast.error('Payment processed but there was an error updating your account');
        setIsLoading(false);
      }
    };

    if (sessionId || paymentId) {
      handleSuccess();
    } else {
      setIsLoading(false);
    }
  }, [sessionId, paymentId, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your subscription. Your account has been upgraded and you now have access to all premium features.
        </p>

        {/* Session Info (for debugging) */}
        {(sessionId || paymentId) && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm">
            <p className="text-gray-700">
              {sessionId && `Session ID: ${sessionId}`}
              {paymentId && `Payment ID: ${paymentId}`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={session?.user?.role === 'recruiter' ? '/companies/dashboard' : '/applicant/dashboard'}
            className="w-full flex items-center justify-between bg-brand3 text-white py-3 px-4 rounded-full font-medium hover:bg-green-700 transition-colors "
          >
            Go to Dashboard
            <Icon icon="mynaui:arrow-long-right" className={`size-7`} />
          </Link>
          
          <Link
            href="/pricing"
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-full font-medium hover:bg-gray-300 transition-colors block"
          >
            View Pricing
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            You can manage your subscription from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
}