"use client";

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface ApplicationTrendsProps {
  trends: {
    monthly_job_posting: Array<{ month: string; jobs_posted: number }>;
    weekly_applications: Array<{ week: string; applications: number }>;
    job_posting_growth_rate: number;
    application_growth_rate: number;
    jobs_this_month: number;
    jobs_last_month: number;
    apps_this_month: number;
    apps_last_month: number;
  };
}

const ApplicationTrends: React.FC<ApplicationTrendsProps> = ({ trends }) => {
  // Calculate growth indicators
  const jobGrowthIndicator = trends.job_posting_growth_rate >= 0 ? 'up' : 'down';
  const appGrowthIndicator = trends.application_growth_rate >= 0 ? 'up' : 'down';

  // Format data for charts
  const weeklyData = trends.weekly_applications.slice(-8).map(item => ({
    name: item.week.replace('Week of ', '').substring(0, 8),
    value: item.applications
  }));

  const monthlyData = trends.monthly_job_posting.slice(-6).map(item => ({
    name: item.month,
    value: item.jobs_posted
  }));

  return (
    <div className="bg-white md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Application Trends</h2>
        <p className="text-gray-600">Weekly application patterns and growth</p>
      </div>

      {/* Growth Summary */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Job Posting Growth</span>
            {jobGrowthIndicator === 'up' ? 
              <ArrowUp className="size-8 text-brand" /> : 
              <ArrowDown className="size-8 text-brand3" />
            }
          </div>
          <div className={`text-xl md:text-3xl dm-serif font-semibold ${jobGrowthIndicator === 'up' ? 'text-brand' : 'text-brand3'}`}>
            {Math.abs(trends.job_posting_growth_rate)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {trends.jobs_this_month} this month vs {trends.jobs_last_month} last month
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Application Growth</span>
            {appGrowthIndicator === 'up' ? 
              <ArrowUp className="size-8 text-brand" /> : 
              <ArrowDown className="size-8 text-brand3" />
            }
          </div>
          <div className={`text-xl md:text-3xl dm-serif font-semibold ${appGrowthIndicator === 'up' ? 'text-brand' : 'text-brand3'}`}>
            {Math.abs(trends.application_growth_rate)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {trends.apps_this_month} this month vs {trends.apps_last_month} last month
          </div>
        </div>
      </div>

      {/* Weekly Applications Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Applications</h3>
        <div className="bg-gray-50 rounded-lg md:p-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 15, fill: '#6b7280' }}
              />
              <YAxis hide />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorWeekly)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Job Postings Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Job Postings</h3>
        <div className="bg-gray-50 rounded-lg md:p-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 15, fill: '#6b7280' }}
              />
              <YAxis hide />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#colorMonthly)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTrends;