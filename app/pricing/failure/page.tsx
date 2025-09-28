'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleFailure = () => {
      // Show cancellation message
      toast.error('Payment was cancelled. You can try again anytime.');
      setIsLoading(false);
      
      // Redirect back to pricing page after a few seconds
      setTimeout(() => {
        window.location.href = '/pricing';
      }, 3000);
    };

    handleFailure();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg  p-8 text-center">
        {/* Failure Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Failure Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled or could not be processed. No charges have been made to your account.
        </p>

        {/* Error Details (if available) */}
        {(sessionId || paymentId || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm">
            <p className="text-red-800 font-medium mb-2">Payment Details:</p>
            {sessionId && (
              <p className="text-red-700">Session ID: {sessionId}</p>
            )}
            {paymentId && (
              <p className="text-red-700">Payment ID: {paymentId}</p>
            )}
            {error && (
              <p className="text-red-700">Error: {error}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="w-full bg-brand text-white py-3 px-4 rounded-full font-medium hover:bg-brand2 transition-colors block"
          >
            Try Again
          </Link>
          
              <Link
            href={session?.user?.role === 'recruiter' ? '/companies/dashboard' : '/applicant/dashboard'}
            className="w-full flex items-center justify-between bg-brand3 text-white py-3 px-4 rounded-full font-medium hover:bg-green-700 transition-colors "
          >
            Go to Dashboard
            <Icon icon="mynaui:arrow-long-right" className={`size-7`} />
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">
            Need help? Common issues include:
          </p>
          <ul className="text-left space-y-1">
            <li>• Insufficient funds</li>
            <li>• Card declined by bank</li>
            <li>• Expired card</li>
            <li>• Incorrect billing information</li>
          </ul>
          <p className="mt-3">
            Contact support if you continue to experience issues.
          </p>
        </div>
      </div>
    </div>
  );
}