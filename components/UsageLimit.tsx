'use client';

import React from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement';
import Link from 'next/link';

interface UsageLimitProps {
  currentUsage: number;
  dailyLimit: number;
  actionType: 'applications' | 'job_posts' | 'actions';
  className?: string;
}

export default function UsageLimit({ 
  currentUsage, 
  dailyLimit, 
  actionType,
  className = '' 
}: UsageLimitProps) {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  
  const usagePercentage = (currentUsage / dailyLimit) * 100;
  const remainingActions = dailyLimit - currentUsage;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = currentUsage >= dailyLimit;

  const getActionLabel = () => {
    switch (actionType) {
      case 'applications':
        return 'job applications';
      case 'job_posts':
        return 'job posts';
      default:
        return 'actions';
    }
  };

  const getUpgradeMessage = () => {
    const currentTier = subscriptionStatus?.tier || 'basic';
    
    if (currentTier === 'basic') {
      return actionType === 'job_posts' 
        ? 'Upgrade to Standard for 5 daily job posts'
        : 'Upgrade to Standard for 20 daily applications';
    } else if (currentTier === 'standard') {
      return 'Upgrade to Premium for unlimited actions';
    }
    return 'Upgrade for more daily actions';
  };

  const getProgressBarColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getAlertColor = () => {
    if (isAtLimit) return 'bg-red-50 border-red-200 text-red-800';
    if (isNearLimit) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className={`rounded-lg border p-4 ${getAlertColor()} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isAtLimit ? (
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : isNearLimit ? (
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">
              {isAtLimit ? 'Daily Limit Reached' : isNearLimit ? 'Approaching Daily Limit' : 'Daily Usage'}
            </h3>
          </div>
        </div>
        <div className="text-sm font-medium">
          {currentUsage} / {dailyLimit}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Used: {currentUsage}</span>
          <span>Limit: {dailyLimit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-sm">
        {isAtLimit ? (
          <p className="mb-3">
            You've reached your daily limit of {dailyLimit} {getActionLabel()}. 
            {subscriptionStatus?.tier !== 'premium' && ' Upgrade to continue.'}
          </p>
        ) : isNearLimit ? (
          <p className="mb-3">
            You have {remainingActions} {getActionLabel()} remaining today.
          </p>
        ) : (
          <p className="mb-3">
            You have {remainingActions} {getActionLabel()} remaining today.
          </p>
        )}

        {/* Upgrade Button */}
        {subscriptionStatus?.tier !== 'premium' && (
          <div className="flex justify-end">
            <Link
              href="/pricing"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {getUpgradeMessage()}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for usage tracking
export const useUsageTracking = () => {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  
  const getDailyLimit = (actionType: 'applications' | 'job_posts' | 'actions') => {
    const tier = subscriptionStatus?.tier || 'basic';
    const userType = subscriptionStatus?.user_type || 'job_seeker';
    
    if (actionType === 'job_posts') {
      switch (tier) {
        case 'premium': return 20;
        case 'standard': return 5;
        default: return 1;
      }
    } else {
      switch (tier) {
        case 'premium': return Infinity;
        case 'standard': return 20;
        default: return 5;
      }
    }
  };

  const checkUsageLimit = (currentUsage: number, actionType: 'applications' | 'job_posts' | 'actions') => {
    const limit = getDailyLimit(actionType);
    return {
      isAtLimit: currentUsage >= limit,
      isNearLimit: currentUsage >= limit * 0.8,
      remaining: Math.max(0, limit - currentUsage),
      limit,
      percentage: limit === Infinity ? 0 : (currentUsage / limit) * 100
    };
  };

  return {
    getDailyLimit,
    checkUsageLimit,
    subscriptionStatus
  };
};