"use client";
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import Stats from '@/components/Dashboard/Stats';
import { useCompanyAnalytics } from '@/hooks/companies/useCompanyAnalytics';
import ApplicationTrends from '../analytics/components/ApplicationTrends';
import GoogleMeetStatus from '@/components/GoogleMeetStatus';
import RecruiterInterviews from '@/components/interviews/RecruiterInterviews';
import { toast } from 'sonner';

// Explicitly typed default values
const defaultTrends = {
  monthly_job_posting: [] as { month: string; jobs_posted: number }[],
  weekly_applications: [] as { week: string; applications: number }[],
  job_posting_growth_rate: 0,
  application_growth_rate: 0,
  jobs_this_month: 0,
  jobs_last_month: 0,
  apps_this_month: 0,
  apps_last_month: 0,
};

type TabType = 'overview' | 'interviews' | 'analytics';

export default function RecruiterDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: profile } = useUserProfile();
  const { data: session } = useSession();
  const { data: analytics } = useCompanyAnalytics(session?.user?.companyId as string);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Check for Google OAuth success
  useEffect(() => {
    const googleOAuth = searchParams.get('google_oauth');
    if (googleOAuth === 'success') {
      toast.success('Google Calendar Connected!', {
        description: 'You can now schedule Google Meet interviews with automatic calendar integration.',
      });
      // Clean up the URL
      router.replace('/companies/dashboard');
    }
  }, [searchParams, router]);

  if (session?.user.hasCompany === false) {
    router.push('/companies/create');
  }

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview',
      icon: 'solar:home-bold',
      description: 'Dashboard overview and stats'
    },
    {
      id: 'interviews' as TabType,
      label: 'Interviews',
      icon: 'solar:calendar-bold',
      description: 'Manage scheduled interviews'
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: 'solar:chart-bold',
      description: 'Company analytics and insights'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Stats />
            
            {/* Google Meet Status */}
            <div className="px-4">
              <GoogleMeetStatus />
            </div>
            
            <div className="grid grid-cols-1 mt-6 gap-8 mb-4 md:mb-8">
              {/* Application Trends */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit">
                <ApplicationTrends trends={analytics?.trends || defaultTrends} />
              </div>
            </div>
          </div>
        );
      case 'interviews':
        return (
          <div className="px-4">
            <RecruiterInterviews />
          </div>
        );
      case 'analytics':
        return (
          <div className="px-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              <p className="text-gray-600">Analytics features coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='border-none min-[1220px]:border'>
      <div className="lg:p-14 min-[1220px]:p-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className='text-2xl md:text-4xl px-4 mt-4 md:mt-0'>Dashboard</h1>
            <div className="my-2 px-4 text-gray-900/90">{profile?.first_name} {profile?.last_name}!</div>
          </div>
          <div className="px-4">
            <button
              onClick={() => router.push('/companies/update')}
              className="text-brand flex items-center"
            >
              <Icon icon="solar:refresh-line-duotone" className="w-4 h-4 mr-2" />
              Update Company
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm md:text-base flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}