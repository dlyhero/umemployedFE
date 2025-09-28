'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface RecommendedJobsFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

export default function RecommendedJobsFallback({ error, onRetry }: RecommendedJobsFallbackProps) {
  const isServerError = error?.message?.includes('500') || error?.message?.includes('Server error');
  const isAuthError = error?.message?.includes('401') || error?.message?.includes('403');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <Icon icon="material-symbols:warning-outline" width="24" height="24" className="text-yellow-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isServerError ? 'Service Temporarily Unavailable' : 'Unable to Load Recommended Jobs'}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {isServerError 
            ? 'Our recommendation service is currently experiencing issues. Please try again later.'
            : isAuthError
            ? 'Please log in to view your personalized job recommendations.'
            : 'We encountered an issue loading your recommended jobs. Please try again.'
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && !isAuthError && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
            >
              <Icon icon="material-symbols:refresh" width="16" height="16" className="mr-2" />
              Try Again
            </button>
          )}
          
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
          >
            <Icon icon="material-symbols:search" width="16" height="16" className="mr-2" />
            Browse All Jobs
          </Link>

          {isAuthError && (
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Icon icon="material-symbols:login" width="16" height="16" className="mr-2" />
              Log In
            </Link>
          )}
        </div>

        {isServerError && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Technical Details:</strong> The recommendation service returned a server error (500). 
              This is likely a temporary backend issue. Our team has been notified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}