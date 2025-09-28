import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Define the company analytics interface (what we'll use in our components)
export interface CompanyAnalytics {
  totalJobs: number;
  totalApplications: number;
}

// API response interface (matches actual API response)
interface CompanyAnalyticsResponse {
  total_jobs: number;
  total_applications: number;
}

// Function to fetch company analytics
const fetchCompanyAnalytics = async (companyId: string, token: string): Promise<CompanyAnalytics> => {
  try {
    const response = await axios.get<CompanyAnalyticsResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/analytics/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Company Analytics Response:', response.data);
    
    // Transform the response to match our interface (snake_case to camelCase)
    return {
      totalJobs: response.data.total_jobs || 0,
      totalApplications: response.data.total_applications || 0,
    };
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    throw error;
  }
};

// Custom hook using React Query
export const useCompanyAnalytics = (companyId?: string | null) => {
  const { data: session, status } = useSession();
  
  return useQuery<CompanyAnalytics, Error>({
    queryKey: ['companyAnalytics', companyId, session?.user.accessToken],
    queryFn: () => fetchCompanyAnalytics(companyId as string, session?.user.accessToken as string),
    enabled: status === 'authenticated' && !!session?.user.accessToken && !!companyId, // Only run when authenticated and companyId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};