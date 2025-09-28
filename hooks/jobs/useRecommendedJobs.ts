import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { RawJob, TransformedJob, transformJobs } from '@/utility/jobTransformer';

// API response interface for the raw data from backend
interface RawRecommendedJobsResponse extends Array<RawJob> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
}

// Transformed response interface that we'll use in components
interface RecommendedJobsResponse extends Array<TransformedJob> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
}

interface RecommendedJobsParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  minSkillsMatch?: number;
  enabled?: boolean;
}

// Helper function to get token from session
const getTokenFromSession = (session: any): string | undefined => {
  return (
    session?.accessToken ||
    session?.user?.accessToken ||
    session?.access_token ||
    session?.token?.accessToken ||
    session?.user?.access_token
  );
};

// Function to fetch recommended jobs
const fetchRecommendedJobs = async (
  token: string,
  params: RecommendedJobsParams
): Promise<RecommendedJobsResponse> => {
  try {
    const { page = 1, pageSize = 10, limit = 50, minSkillsMatch = 0 } = params;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }

    console.log('Fetching recommended jobs from:', `${apiUrl}/job/recommended-jobs/`);
    console.log('Request params:', { page, page_size: pageSize, limit, min_skills_match: minSkillsMatch });
    
    // Fetch raw data from API
    const response = await axios.get<RawRecommendedJobsResponse>(
      `${apiUrl}/job/recommended-jobs/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          page,
          page_size: pageSize,
          limit,
          min_skills_match: minSkillsMatch,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('Recommended jobs response:', response.status, response.data);

    // Transform the raw jobs data
    const transformedJobs = transformJobs(response.data);

    // Return transformed response with array properties
    return Object.assign(transformedJobs, {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      total_pages: response.data.total_pages,
      current_page: response.data.current_page,
    });
  } catch (error: any) {
    console.error('Error fetching recommended jobs:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Re-throw with more context
    const enhancedError = new Error(
      `Failed to fetch recommended jobs: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`
    );
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
};

// Custom hook for recommended jobs
export const useRecommendedJobs = (params: RecommendedJobsParams = {}) => {
  const { data: session, status } = useSession();
  const token = getTokenFromSession(session);

  const {
    page = 1,
    pageSize = 10,
    limit = 50,
    minSkillsMatch = 0,
    enabled = true
  } = params;

  return useQuery<RecommendedJobsResponse, Error>({
    queryKey: [
      'recommendedJobs',
      token,
      page,
      pageSize,
      limit,
      minSkillsMatch
    ],
    queryFn: () => {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      return fetchRecommendedJobs(token, params);
    },
    enabled: status === 'authenticated' && !!token && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) or 403 (forbidden)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook for infinite scroll (optional)
export const useInfiniteRecommendedJobs = (params: Omit<RecommendedJobsParams, 'page'> = {}) => {
  const { data: session, status } = useSession();
  const token = session?.user.accessToken;

  return useQuery<RecommendedJobsResponse, Error>({
    queryKey: [
      'recommendedJobsInfinite',
      token,
      params.pageSize,
      params.limit,
      params.minSkillsMatch
    ],
    queryFn: async () => {
      // Start with first page and transform the data
      return fetchRecommendedJobs(token as string, { ...params, page: 1 });
    },
    enabled: status === 'authenticated' && !!token && (params.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};