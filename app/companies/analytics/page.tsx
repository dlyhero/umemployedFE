"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'sonner';
import { useCompanyAnalytics } from '@/hooks/companies/useCompanyAnalytics';
import OverviewCards from './components/OverviewCards';
import JobPostingCharts from './components/JobPostingCharts';
import ApplicationTrends from './components/ApplicationTrends';
import HiringPerformance from './components/HiringPerformance';
import GeographicInsights from './components/GeographicInsights';
import EngagementMetrics from './components/EngagementMetrics';
import KeyMetrics from './components/KeyMetrics';

export default function CompanyAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      toast.error('Please sign in to view analytics.');
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'recruiter') {
      toast.error('Only recruiters can view company analytics.');
      router.push('/select-role');
      return;
    }
  }, [session, status, router]);

  // Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics
  } = useCompanyAnalytics(session?.user?.companyId as string);

  // Auto-refresh analytics every 5 minutes
  useEffect(() => {
    if (analytics) {
      const interval = setInterval(() => {
        refetchAnalytics();
      }, 300000); // 5 minutes

      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [analytics, refetchAnalytics]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const handleExportAnalytics = () => {
    if (!analytics) return;

    const exportData = {
      company: analytics.company_info.name,
      export_date: new Date().toISOString(),
      overview: analytics.overview,
      job_posting_stats: analytics.job_posting_stats,
      application_metrics: analytics.application_metrics,
      hiring_performance: analytics.hiring_performance,
      trends: analytics.trends,
      geographic_data: analytics.geographic_data,
      engagement_metrics: analytics.engagement_metrics
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analytics.company_info.name}_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully!');
  };

  const handleRefresh = () => {
    refetchAnalytics();
    toast.success('Analytics refreshed!');
  };

  if (status === 'loading' || analyticsLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Icon icon="solar:loading-bold" className="w-6 h-6 animate-spin text-brand" />
          <span className="text-lg font-medium text-gray-700"><Icon icon="svg-spinners:6-dots-rotate" className='size-7' /></span>
        </div>
      </div>
    );
  }


  if (!analytics) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:chart-line-bold-duotone" className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-4">No analytics data available for your company yet.</p>
          <button onClick={() => router.push('/companies/dashboard')}>
            <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-none min-[1220px]:border p-2">
      <div className="lg:p-14 min-[1220px]:p-14">
        {/* Header */}
        <button
          onClick={() => router.push('/companies/dashboard')}
          className='mb-4 md:mb-8 flex items-center gap-2'
        >
          <Icon icon="mynaui:arrow-long-left" className='size-6'/>
          Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-4 md:mb-8 p-2">

          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl tracking-wider font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                {analytics.company_info.name} • Last updated: {new Date(analytics.last_updated).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={handleRefresh}
              disabled={analyticsLoading}
              className='text-sm md:text-base bg-brand/20 rounded-full px-6 py-2'
            >
              Refresh
            </button>
            <button
              onClick={handleExportAnalytics}
              className='text-sm md:text-base bg-brand/20 rounded-full px-6 py-2'

            >
              Export Data
            </button>

          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-4 md:mb-8">
          <OverviewCards overview={analytics.overview} />
        </div>

        {/* Key Metrics */}
        <div className="mb-4 md:mb-8">
          <KeyMetrics analytics={analytics} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4 md:mb-8">
          {/* Application Trends */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit">
            <ApplicationTrends trends={analytics.trends} />
          </div>

          {/* Job Posting Stats */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <JobPostingCharts jobStats={analytics.job_posting_stats} />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4 md:mb-8">
          {/* Hiring Performance */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <HiringPerformance performance={analytics.hiring_performance} />
          </div>

          {/* Geographic Insights */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <GeographicInsights geographic={analytics.geographic_data} />
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="mb-4 md:mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <EngagementMetrics engagement={analytics.engagement_metrics} />
          </div>
        </div>

        {/* Performance Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="solar:danger-triangle-bold-duotone" className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Performance Insights</h2>
              <p className="text-sm text-gray-600">Key insights and recommendations</p>
            </div>
          </div>

          <div className="space-y-4">
            {analytics.hiring_performance.hiring_rate < 5 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Low Hiring Rate</h4>
                  <p className="text-sm text-yellow-700">
                    Your hiring rate is {analytics.hiring_performance.hiring_rate}%. Consider reviewing job requirements and improving candidate screening.
                  </p>
                </div>
              </div>
            )}

            {analytics.application_metrics.completion_rate < 60 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon icon="solar:info-circle-bold" className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Low Quiz Completion Rate</h4>
                  <p className="text-sm text-blue-700">
                    Your quiz completion rate is {analytics.application_metrics.completion_rate}%. Consider simplifying assessments to improve completion rates.
                  </p>
                </div>
              </div>
            )}

            {analytics.trends.application_growth_rate > 20 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Strong Application Growth</h4>
                  <p className="text-sm text-green-700">
                    Great job! Your application growth rate is {analytics.trends.application_growth_rate}%. Keep up the excellent work!
                  </p>
                </div>
              </div>
            )}

            {analytics.geographic_data.remote_jobs_percentage > 50 && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <Icon icon="solar:home-bold" className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Remote-First Company</h4>
                  <p className="text-sm text-purple-700">
                    {analytics.geographic_data.remote_jobs_percentage}% of your jobs are remote. This expands your talent pool significantly!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}