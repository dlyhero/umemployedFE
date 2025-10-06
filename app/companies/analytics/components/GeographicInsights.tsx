"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getCountryName, getCountryFlag } from '@/lib/textUtils';

interface GeographicInsightsProps {
  geographic: {
    applications_by_country: Array<{ job__location: string; count: number }>;
    jobs_by_location_type: Array<{ job_location_type: string; count: number }>;
    remote_jobs_percentage: number;
  };
}

const GeographicInsights: React.FC<GeographicInsightsProps> = ({ geographic }) => {
  const colors = [
    'bg-brand',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-brand3',
    'bg-red-500',
    'bg-yellow-500'
  ];

  const formatLocationType = (locationType: string) => {
    return locationType.charAt(0).toUpperCase() + locationType.slice(1);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Geographic Insights</h2>
          <p className="text-gray-600">Global reach and location preferences</p>
        </div>
      </div>

      {/* Remote Jobs Highlight */}
      <div className="mb-6">
        <div className="border border-brand3 rounded-lg p-4 flex flex-col">
          <div className="flex items-center gap-3 ">
            <span className="text-lg md:text-xl">Remote Work Percentage</span>
          </div>
              <div className="text-sm md:text-base text-brand">
            {geographic.remote_jobs_percentage > 50 
              ? "Remote-first company - Great for global talent!" 
              : "Balanced approach to remote and onsite work"
            }
          </div>
          <div className="text-2xl md:text-4xl  dm-serif self-end">{geographic.remote_jobs_percentage}%</div>
        </div>
      </div>

      {/* Applications by Country */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Country</h3>
        <div className="space-y-3">
          {geographic.applications_by_country.slice(0, 5).map((country, index) => {
            const total = geographic.applications_by_country.reduce((sum, c) => sum + c.count, 0);
            const percentage = (country.count / total) * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 text-lg">
                  {getCountryFlag(country.job__location)}
                </div>
                <div className="w-24 text-sm text-gray-700">
                  {getCountryName(country.job__location)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                  {country.count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jobs by Location Type */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Location Type</h3>
        <div className="space-y-3">
          {geographic.jobs_by_location_type.map((location, index) => {
            const total = geographic.jobs_by_location_type.reduce((sum, l) => sum + l.count, 0);
            const percentage = (location.count / total) * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-700">
                  {formatLocationType(location.job_location_type)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className={`${colors[(index + 3) % colors.length]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                  {location.count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GeographicInsights;