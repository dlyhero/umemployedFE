'use client';

import React from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement';
import Link from 'next/link';

interface SubscriptionStatusProps {
  showUpgradePrompt?: boolean;
  feature?: string;
  requiredTier?: 'standard' | 'premium';
  className?: string;
}

export default function SubscriptionStatus({ 
  showUpgradePrompt = false, 
  feature, 
  requiredTier,
  className = '' 
}: SubscriptionStatusProps) {
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!subscriptionStatus) {
    return null;
  }

  const hasActiveSubscription = subscriptionStatus.has_active_subscription;
  const currentTier = subscriptionStatus.tier || 'basic';

  // Check if user needs upgrade for specific feature
  const needsUpgrade = showUpgradePrompt && requiredTier && (
    !hasActiveSubscription || 
    (requiredTier === 'premium' && currentTier !== 'premium') ||
    (requiredTier === 'standard' && currentTier === 'basic')
  );

  if (needsUpgrade) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {feature ? `${feature} requires ${requiredTier} subscription` : 'Upgrade Required'}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                {feature 
                  ? `This feature is available with a ${requiredTier} subscription.`
                  : 'Upgrade your subscription to access premium features.'
                }
              </p>
            </div>
            <div className="mt-3">
              <div className="-mx-2 -my-1.5 flex">
                <Link
                  href="/pricing"
                  className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show current subscription status
  if (hasActiveSubscription) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Subscription Active
            </p>
            <p className="text-xs text-green-600">
              {subscriptionStatus.user_type === 'job_seeker' ? 'Job Seeker' : 'Recruiter'} Plan
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show free plan status
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">
            Free Plan
          </p>
          <p className="text-xs text-gray-600">
            Limited features available
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for checking feature access
export const useFeatureAccess = (requiredTier?: 'standard' | 'premium') => {
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();

  if (isLoading || !subscriptionStatus || !requiredTier) {
    return { hasAccess: false, isLoading, currentTier: 'basic' };
  }

  const currentTier = subscriptionStatus.tier || 'basic';
  const hasActiveSubscription = subscriptionStatus.has_active_subscription;

  let hasAccess = false;
  if (requiredTier === 'standard') {
    hasAccess = hasActiveSubscription && (currentTier === 'standard' || currentTier === 'premium');
  } else if (requiredTier === 'premium') {
    hasAccess = hasActiveSubscription && currentTier === 'premium';
  }

  return {
    hasAccess,
    isLoading,
    currentTier,
    hasActiveSubscription,
    needsUpgrade: !hasAccess
  };
};