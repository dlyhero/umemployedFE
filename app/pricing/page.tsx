'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PricingData } from '@/types/pricing';
import PricingCard from './components/pricingCard';
import HomeHeader from '../(Home)/Components/HomeHeader';
import { getPricingData } from '@/lib/pricingData';
import { useSubscriptionStatus, useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PricingPage() {
    const { data: session } = useSession();
    const { data: subscriptionStatus, isLoading: subscriptionLoading } = useSubscriptionStatus();
    const { createSubscription, cancelSubscription } = useSubscriptionManagement();
    
    const [userType, setUserType] = useState<'job_seeker' | 'recruiter'>('job_seeker');
    const [pricingData, setPricingData] = useState<PricingData | null>(null);

    // Determine user type from session
    useEffect(() => {
        if (session?.user?.role) {
            const role = session.user.role as 'job_seeker' | 'recruiter';
            setUserType(role);
            setPricingData(getPricingData(role));
        }
    }, [session]);

    // Handle plan selection
    const handlePlanSelect = async (planId: string) => {
        if (!session?.user?.accessToken) {
            toast.error('Please log in to subscribe');
            return;
        }

        try {
            switch (planId) {
                case 'basic':
                    toast.info('Basic plan is free! You can start using it right away.');
                    break;
                
                case 'standard':
                case 'premium':
                    const tier = planId as 'standard' | 'premium';
                    const userTypeForApi = userType === 'job_seeker' ? 'user' : 'recruiter';
                    
                    await createSubscription.mutateAsync({ tier, userType: userTypeForApi });
                    break;
                
                
                case 'custom':
                    // Redirect to contact form or custom pricing inquiry
                    toast.info('Please contact our sales team for custom pricing');
                    break;
                
                default:
                    toast.error('Invalid plan selected');
            }
        } catch (error) {
            console.error('Plan selection error:', error);
        }
    };

    // Handle subscription cancellation
    const handleCancelSubscription = async () => {
        if (!subscriptionStatus?.has_active_subscription) {
            toast.error('No active subscription to cancel');
            return;
        }

        try {
            await cancelSubscription.mutateAsync();
        } catch (error) {
            console.error('Subscription cancellation error:', error);
        }
    };

    if (!pricingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading pricing information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className='bg-blue-950'>
                <div className="px-4">
                    <div className="">
                        <HomeHeader />
                        <div className="flex flex-col items-center justify-center py-24 relative">
                            <div className="text-center text-white">
                                <h3 className="text-3xl md:text-5xl dm-serif tracking-wider">
                                    Pricing
                                </h3>
                                {pricingData.description && (
                                    <p className="text-xl text-white mt-5 max-w-2xl mx-auto">
                                        {pricingData.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='px-4 mb-10'>
                {/* User Type Toggle (if needed) */}
                {session?.user?.role === null && (
                    <div className="text-center mb-8">
                        <div className="inline-flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => {
                                    setUserType('job_seeker');
                                    setPricingData(getPricingData('job_seeker'));
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    userType === 'job_seeker'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Job Seeker
                            </button>
                            <button
                                onClick={() => {
                                    setUserType('recruiter');
                                    setPricingData(getPricingData('recruiter'));
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    userType === 'recruiter'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Recruiter
                            </button>
                        </div>
                    </div>
                )}

                {/* Current Subscription Status */}
                {subscriptionStatus?.has_active_subscription && (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center  my-8 rounded-lg px-4 py-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-800 font-medium">
                                Active {subscriptionStatus.tier} subscription
                            </span>
                            <button
                                onClick={handleCancelSubscription}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="text-2xl md:ext-3xl lg:text-5xl tracking-tight dm-serif text-gray-800">
                        {pricingData.title}
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {pricingData.plans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isPopular={plan.popular}
                            currentSubscription={subscriptionStatus}
                            onSelectPlan={handlePlanSelect}
                            isLoading={createSubscription.isPending}
                        />
                    ))}
                </div>

                {/* Additional Information */}
                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            {userType === 'job_seeker' 
                                ? "All plans include a 14-day free trial. No credit card required."
                                : "All plans include a 14-day free trial. Cancel anytime."
                            }
                        </p>
                        
                        {/* Custom Pricing CTA for Recruiters */}
                        {userType === 'recruiter' && (
                            <div className="mt-8 p-6 ">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Need Custom Pricing?
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    For enterprise organizations with specific requirements, we offer custom pricing plans.
                                </p>
                                <Link
                                    href="/billing?tab=custom-pricing"
                                    className="inline-flex items-center px-6 py-3 bg-brand3 text-white rounded-full hover:bg-gray-900 transition-colors"
                                >
                                    Request Custom Pricing
                                </Link>
                            </div>
                        )}
                        
                        {/* Billing Management Link */}
                        <div className="mt-6">
                            <Link
                                href="/billing"
                                className="text-brand hover:text-brand2 underline"
                            >
                                Manage Billing & View Transaction History →
                            </Link>
                        </div>
                    </div>
            </div>
        </div>
    );
}