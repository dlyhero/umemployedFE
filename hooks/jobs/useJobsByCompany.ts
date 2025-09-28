// @/hooks/jobs/useJobsByCompany.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { transformJobs, RawJob } from "@/utility/jobTransformer";
import { useSession } from "next-auth/react";

interface JobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawJob[];
}

const fetchJobsByCompany = async (
  companyId: string,
  accessToken?: string
): Promise<JobsResponse> => {
  try {
    const headers: any = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.get<JobsResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/?company=${companyId}`,
      { headers }
    );
    
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
    console.error('Error fetching jobs by company:', error);
    throw error;
  }
};

export const useJobsByCompany = (companyId: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['jobs-by-company', companyId, session?.user?.accessToken ? 'authenticated' : 'anonymous'],
    queryFn: () => fetchJobsByCompany(companyId, session?.user?.accessToken),
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
    enabled: !!companyId, // Only run if companyId is provided
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    gcTime: 1000 * 60 * 5, // 5 minutes cache time
    refetchOnWindowFocus: false,
    retry: 1
  });
};

export default useJobsByCompany;