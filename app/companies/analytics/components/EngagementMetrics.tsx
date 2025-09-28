"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface EngagementMetricsProps {
  engagement: {
    avg_company_rating: number;
    total_ratings: number;
    daily_applications_last_30_days: Array<{ date: string; applications: number }>;
    applications_by_day_of_week: Array<{ day: string; applications: number }>;
    most_active_day: string;
    avg_daily_applications: number;
  };
}

const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ engagement }) => {
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedDays = engagement.applications_by_day_of_week.sort((a, b) => 
    dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 border-green-200';
    if (rating >= 4.0) return 'bg-blue-50 border-blue-200';
    if (rating >= 3.5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <Icon icon="solar:heart-bold-duotone" className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Engagement Metrics</h2>
          <p className="text-sm text-gray-600">Candidate engagement and activity patterns</p>
        </div>
      </div>

      {/* Company Rating */}
      <div className="mb-6">
        <div className={`${getRatingBgColor(engagement.avg_company_rating)} border rounded-lg p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="solar:star-bold" className={`w-5 h-5 ${getRatingColor(engagement.avg_company_rating)}`} />
            <span className="text-sm font-medium text-gray-800">Company Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${getRatingColor(engagement.avg_company_rating)}`}>
              {engagement.avg_company_rating.toFixed(1)}
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i}
                  icon={i < Math.floor(engagement.avg_company_rating) ? "solar:star-bold" : "solar:star-line-duotone"} 
                  className={`w-4 h-4 ${getRatingColor(engagement.avg_company_rating)}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({engagement.total_ratings} ratings)</span>
          </div>
        </div>
      </div>

      {/* Daily Activity Pattern */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Pattern</h3>
        <div className="space-y-3">
          {sortedDays.map((day, index) => {
            const maxApplications = Math.max(...sortedDays.map(d => d.applications));
            const percentage = (day.applications / maxApplications) * 100;
            const isMostActive = day.day === engagement.most_active_day;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-20 text-sm ${isMostActive ? 'font-bold text-brand' : 'text-gray-700'}`}>
                  {day.day}
                  {isMostActive && <Icon icon="solar:crown-bold" className="w-3 h-3 ml-1 inline" />}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className={`${isMostActive ? 'bg-brand' : 'bg-gray-400'} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-medium text-gray-900 text-right">
                  {day.applications}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Most active day: <span className="font-medium text-brand">{engagement.most_active_day}</span>
        </div>
      </div>

      {/* Average Daily Applications */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:chart-2-bold" className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Average Daily Applications</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{engagement.avg_daily_applications.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Based on last 30 days</div>
        </div>
      </div>

      {/* Recent Daily Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Daily Activity (Last 7 Days)</h3>
        <div className="space-y-2">
          {engagement.daily_applications_last_30_days.slice(-7).map((day, index) => {
            const maxApplications = Math.max(...engagement.daily_applications_last_30_days.slice(-7).map(d => d.applications));
            const percentage = (day.applications / maxApplications) * 100;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-xs text-gray-600">
                  {dayName} {date.getDate()}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                  <div 
                    className="bg-gradient-to-r from-brand to-brand/80 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-xs font-medium text-gray-900 text-right">
                  {day.applications}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EngagementMetrics;