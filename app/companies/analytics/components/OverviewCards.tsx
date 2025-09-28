"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface OverviewCardsProps {
  overview: {
    total_jobs_posted: number;
    active_jobs: number;
    total_applications: number;
    applications_last_30_days: number;
    total_interviews: number;
    hired_candidates: number;
    company_age_days: number;
    avg_applications_per_job: number;
  };
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const cards = [
    {
      title: "Total Jobs Posted",
      value: overview.total_jobs_posted,
      icon: "solar:suitcase-outline",
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Active Jobs",
      value: overview.active_jobs,
      icon: "material-symbols-light:notifications-active-outline-sharp",
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Total Applications",
      value: overview.total_applications.toLocaleString(),
      icon: "mynaui:users-group",
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Applications (30 days)",
      value: overview.applications_last_30_days,
      icon: "mynaui:users-group",
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      title: "Total Interviews",
      value: overview.total_interviews,
      icon: "hugeicons:meeting-room",
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200"
    },
    {
      title: "Hired Candidates",
      value: overview.hired_candidates,
      icon: "clarity:employee-group-line",
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">

        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-wider text-gray-900">Overview</h2>
          <p className="text-sm md:text-[16.5px] text-gray-600">Key metrics at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={` ${card.borderColor} bg-white rounded-3xl p-8 flex-1 min-w-[250px] border-2 h-fit`}
          >

            <div className="flex items-center justify-between">
              <div className="flex-1">

                <>
                  <div className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {card.title}
                  </div>
                </>
              </div>

              <div className={`rounded-full flex items-center justify-center  flex-shrink-0 ml-4`}>
                <Icon icon={card.icon} className={`w-7 h-7 md:w-10 md:h-10 text-white ${card.iconColor}`} />
                <Icon icon={card.icon} className={`size-12 `} />

              </div>
            </div>

            {/* Additional metrics for specific cards */}
            {card.title === "Total Applications" && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg per job:</span>
                  <span className="font-medium text-gray-900">{overview.avg_applications_per_job.toFixed(1)}</span>
                </div>
              </div>
            )}

            {card.title === "Hired Candidates" && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Company age:</span>
                  <span className="font-medium text-gray-900">{overview.company_age_days} days</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewCards;