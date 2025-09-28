// @/hooks/jobs/useJobsWithFilters.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { transformJobs, RawJob } from "@/utility/jobTransformer";
import { useSession } from "next-auth/react";

// Filter parameters interface matching backend API
export interface JobSearchParams {
  search?: string;
  location?: string;
  category?: number;
  salary_range?: string;
  job_type?: string;
  job_location_type?: string;
  experience_levels?: string;
  level?: string;
  weekly_ranges?: string;
  shifts?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

interface JobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawJob[];
}

const fetchJobsWithSearch = async (
  params: JobSearchParams = {},
  accessToken?: string
): Promise<JobsResponse> => {
  try {
    const headers: any = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Build query parameters
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/${queryString ? `?${queryString}` : ''}`;

  
    const response = await axios.get(url, { headers });
    
    // Check if response is paginated object or direct array
    if (Array.isArray(response.data)) {
      // Direct array response
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data
      };
    } else {
      // Paginated response
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching jobs with search:', error);
    throw error;
  }
};

const useJobsWithSearch = (params: JobSearchParams = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['jobs-search', params, session?.user?.accessToken ? 'authenticated' : 'anonymous'],
    queryFn: () => fetchJobsWithSearch(params, session?.user?.accessToken),
    select: (data) => {
      const transformedJobs = transformJobs(data.results || []);
      
      return {
        jobs: transformedJobs,
        totalCount: data.count,
        hasNextPage: !!data.next,
        hasPreviousPage: !!data.previous,
        nextPage: data.next,
        previousPage: data.previous
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    gcTime: 1000 * 60 * 5, // 5 minutes cache time (renamed from cacheTime)
    enabled: true, // Always fetch
    refetchOnWindowFocus: false,
    retry: 1
  });
};

export default useJobsWithSearch;
