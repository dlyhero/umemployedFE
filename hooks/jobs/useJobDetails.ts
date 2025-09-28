import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { RawJob, TransformedJob, transformJob } from '@/utility/jobTransformer';
import { useSession } from 'next-auth/react';

const fetchJobById = async (jobId: number | string, token?: string): Promise<TransformedJob> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get<RawJob>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/${jobId}/`,
      {
        headers
      }
    );
    return transformJob(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Job not found');
      }
      throw new Error(error.response?.data?.message || `Failed to fetch job: ${error.message}`);
    }
    throw new Error('Unknown error occurred while fetching job');
  }
};

export const useJobDetail = (jobId: number | string): UseQueryResult<TransformedJob, Error> => {
  const { data: session } = useSession();
  const token = session?.user.accessToken;

  return useQuery({
    queryKey: ['jobDetails', jobId, !!token], // Add token presence to query key
    queryFn: () => fetchJobById(jobId, token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404 errors
      if (error.message === 'Job not found') return false;
      return failureCount < 2; // Retry up to 2 times
    },
  });
};