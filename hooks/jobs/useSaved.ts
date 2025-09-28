import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { RawJob, TransformedJob, transformJobs } from '@/utility/jobTransformer';

interface SavedJobsParams {
  page?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useSavedJobs = (params: SavedJobsParams = {}) => {
  const { data: session } = useSession();
  const { page = 1 } = params;

  const {
    data: savedJobs,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<RawJob[], AxiosError>({
    queryKey: ['savedJobs', page],
    queryFn: async () => {
      const response = await axios.get<RawJob[]>(`${API_URL}/job/saved-jobs/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
        params: {
          page,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const transformedJobs = savedJobs ? transformJobs(savedJobs) : [];

  return {
    savedJobs: transformedJobs,
    totalCount: transformedJobs.length,
    hasNext: false, // Adjust based on your pagination
    hasPrevious: false, // Adjust based on your pagination
    isLoading,
    isError,
    error,
    refetch,
  };
};