"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';

interface ApplicationStatsProps {
  applications: ApplicationCandidate[];
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({ applications }) => {
  const stats = {
    totalApplications: applications.length,
    shortlistedCount: applications.filter(app => app.isShortlisted).length,
    pendingReview: applications.filter(app => !app.isShortlisted).length
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: 'solar:users-group-two-rounded-line-duotone',
      accentColor: 'bg-blue-500',
      description: 'All received applications'
    },
    {
      title: 'Shortlisted',
      value: stats.shortlistedCount,
      icon: 'solar:star-bold-duotone',
      accentColor: 'bg-yellow-500',
      description: 'Candidates in shortlist'
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: 'solar:clock-circle-bold-duotone',
      accentColor: 'bg-gray-500',
      description: 'Awaiting review'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-3xl p-8 flex-1 min-w-[250px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                {stat.title}
              </div>
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </div>
            
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${stat.accentColor} flex-shrink-0 ml-4`}>
              <Icon icon={stat.icon} className="w-7 h-7 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationStats;