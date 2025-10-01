"use client";
import React, { useState } from 'react';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import RecommendedJobs from '../components/RecommendedJobs';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import Stats from '@/components/Dashboard/Stats';
import ApplicantInterviews from '@/components/interviews/ApplicantInterviews';

type TabType = 'overview' | 'interviews' | 'jobs';

export default function ApplicantDashboard() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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
      description: 'Your scheduled interviews'
    },
    {
      id: 'jobs' as TabType,
      label: 'Jobs',
      icon: 'solar:briefcase-bold',
      description: 'Recommended job opportunities'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Stats />
            <RecommendedJobs />
          </div>
        );
      case 'interviews':
        return (
          <div className="px-4">
            <ApplicantInterviews />
          </div>
        );
      case 'jobs':
        return (
          <div className="px-4">
            <RecommendedJobs />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen overflow-auto border-none min-[1220px]:border'>
      <div className="lg:p-14 min-[1220px]:p-14">
        {/* Header */}
        <div className="mb-6">
          <h1 className='text-4xl px-4 mt-4 md:mt-0'>Dashboard</h1>
          <div className="my-2 px-4 text-gray-900/90">{profile?.first_name} {profile?.last_name}!</div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon icon={tab.icon} className="w-4 h-4" />
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