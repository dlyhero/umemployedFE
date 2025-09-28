"use client";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { handleApiError, withRetry } from '@/lib/errorHandling';

export interface CompanyAnalytics {
  company_info: {
    id: number;
    name: string;
    industry: string;
    size: string;
    location: string;
    founded: number;
    created_at: string;
  };
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
  job_posting_stats: {
    by_job_type: Array<{ job_type: string; count: number }>;
    by_location_type: Array<{ job_location_type: string; count: number }>;
    by_experience_level: Array<{ experience_levels: string; count: number }>;
    salary_analysis: {
      avg_salary: number;
      min_salary: number;
      max_salary: number;
    };
    popular_job_titles: Array<{ title: string; count: number }>;
    avg_hire_number: number;
  };
  application_metrics: {
    status_breakdown: Array<{ status: string; count: number }>;
    timeline: Array<{ month: string; applications: number }>;
    top_jobs_by_applications: Array<{
      id: number;
      title: string;
      application_count: number;
      created_at: string;
    }>;
    completion_rate: number;
    avg_quiz_score: number;
    avg_matching_percentage: number;
    total_completed_quizzes: number;
  };
  hiring_performance: {
    hiring_rate: number;
    rejection_rate: number;
    pending_rate: number;
    interviews_conducted: number;
    interview_to_hire_ratio: number;
    hiring_by_job_title: Array<{
      job__title: string;
      count: number;
      avg_score: number;
    }>;
    accepted_applications: number;
    avg_score_of_hired: number;
  };
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
  geographic_data: {
    applications_by_country: Array<{ job__location: string; count: number }>;
    jobs_by_location_type: Array<{ job_location_type: string; count: number }>;
    remote_jobs_percentage: number;
  };
  engagement_metrics: {
    avg_company_rating: number;
    total_ratings: number;
    daily_applications_last_30_days: Array<{ date: string; applications: number }>;
    applications_by_day_of_week: Array<{ day: string; applications: number }>;
    most_active_day: string;
    avg_daily_applications: number;
  };
  last_updated: string;
}

const fetchCompanyAnalytics = async (
  companyId: string,
  accessToken: string
): Promise<CompanyAnalytics> => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/analytics/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to fetch company analytics: ${response.status}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const data: CompanyAnalytics = await response.json();
    return data;
  }, 2, 1000, 'fetching company analytics');
};

export const useCompanyAnalytics = (companyId?: string) => {
  const { data: session, status } = useSession();

  return useQuery<CompanyAnalytics, Error>({
    queryKey: ['companyAnalytics', companyId, session?.user?.accessToken],
    queryFn: () =>
      fetchCompanyAnalytics(
        companyId as string,
        session?.user?.accessToken as string
      ),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for analytics data
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};