'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useSubscriptionStatus, useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import CustomPricingForm from '@/components/CustomPricingForm';
import CustomPricingInquiriesList from '@/components/CustomPricingInquiriesList';
import TransactionHistory from '@/components/TransactionHistory';
import { toast } from 'sonner';
import Link from 'next/link';
import HomeHeader from '../(Home)/Components/HomeHeader';

type TabType = 'overview' | 'transactions' | 'custom-pricing' | 'inquiries';

function BillingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const { cancelSubscription } = useSubscriptionManagement();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['overview', 'transactions', 'custom-pricing', 'inquiries'].includes(tab)) {
      setActiveTab(tab);
      if (tab === 'custom-pricing') {
        setShowCustomForm(true);
      }
    }
  }, [searchParams]);

  const handleCancelSubscription = async () => {
    if (!subscriptionStatus?.has_active_subscription) {
      toast.error('No active subscription to cancel');
      return;
    }

    if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      try {
        await cancelSubscription.mutateAsync();
      } catch (error) {
        console.error('Subscription cancellation error:', error);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'material-symbols:dashboard-outline' },
    { id: 'transactions', label: 'Transactions', icon: 'material-symbols:credit-card-outline' },
    { id: 'custom-pricing', label: 'Custom Pricing', icon: 'material-symbols:business-outline' },
    { id: 'inquiries', label: 'My Inquiries', icon: 'material-symbols:description-outline' },
  ];

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Manage your subscription, view transaction history, and request custom pricing.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-2 sm:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon icon={tab.icon} width="18" height="18" className="mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Subscription Overview</h2>
              
              {subscriptionStatus?.has_active_subscription ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Active Subscription */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-green-800">
                          {subscriptionStatus.tier ? subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1) : 'Premium'} Subscription
                        </h3>
                        <p className="text-green-600 mt-1">
                          Active since {subscriptionStatus.started_at ? new Date(subscriptionStatus.started_at).toLocaleDateString() : 'N/A'}
                        </p>
                        {subscriptionStatus.user_type && (
                          <p className="text-green-600 text-sm">
                            User Type: {subscriptionStatus.user_type === 'job_seeker' ? 'Job Seeker' : 'Recruiter'}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end sm:text-right">
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelSubscription.isPending}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
                        >
                          {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Benefits */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-brand/5 border border-brand/20 rounded-lg p-4 sm:p-6">
                      <h4 className="font-medium text-brand3 mb-3">Current Plan Benefits</h4>
                      <ul className="space-y-2 text-brand2 text-sm sm:text-base">
                        {subscriptionStatus.tier === 'premium' ? (
                          <>
                            <li>• Unlimited daily actions</li>
                            <li>• AI resume enhancement</li>
                            <li>• Top applicant status</li>
                            <li>• Advanced analytics</li>
                            <li>• Priority support</li>
                          </>
                        ) : (
                          <>
                            <li>• {subscriptionStatus.tier === 'standard' ? '20' : '5'} daily actions</li>
                            <li>• Advanced job matching</li>
                            <li>• Application tracking</li>
                            <li>• Priority support</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
                      <div className="space-y-3">
                        <Link
                          href="/pricing"
                          className="block w-full px-4 py-2 bg-brand text-white text-center rounded-md hover:bg-brand2 transition-colors text-sm sm:text-base"
                        >
                          Upgrade Plan
                        </Link>
                        <button
                          onClick={() => setActiveTab('transactions')}
                          className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base"
                        >
                          View Transactions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-500 mb-6">
                    You're currently on the free plan. Upgrade to unlock premium features.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center px-6 py-3 bg-brand text-white rounded-md hover:bg-brand2 transition-colors"
                  >
                    View Pricing Plans
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-4 sm:p-6">
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'custom-pricing' && (
            <div className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Custom Pricing</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Need a custom plan for your organization? Tell us about your requirements and we'll create a tailored solution.
                </p>
              </div>
              
              {showCustomForm ? (
                <CustomPricingForm
                  onSuccess={() => {
                    setShowCustomForm(false);
                    setActiveTab('inquiries');
                    toast.success('Custom pricing inquiry submitted successfully!');
                  }}
                  onCancel={() => setShowCustomForm(false)}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Request Custom Pricing</h3>
                  <p className="text-gray-500 mb-6">
                    Get a personalized quote based on your organization's specific needs.
                  </p>
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-brand text-white rounded-md hover:bg-brand2 transition-colors"
                  >
                    Start Custom Pricing Inquiry
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="p-4 sm:p-6">
              <CustomPricingInquiriesList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}