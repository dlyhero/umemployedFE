import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

// Define a local Job interface to replace RawJob
interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any; // For flexibility with additional fields
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useShortlistedJobs = () => {
  const { data: session } = useSession();

  const {
    data: shortlistedJobs,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Job[], AxiosError>({
    queryKey: ['shortlistedJobs'],
    queryFn: async () => {
      const response = await axios.get<Job[]>(`${API_URL}/company/my-shortlisted-jobs/${session?.user.id}`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    shortlistedJobs: shortlistedJobs || [],
    totalCount: (shortlistedJobs || []).length,
    hasNext: false, // Adjust based on your pagination
    hasPrevious: false, // Adjust based on your pagination
    isLoading,
    isError,
    error,
    refetch,
  };
};