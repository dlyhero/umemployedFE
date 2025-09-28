import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

// Types
export interface JobTitle {
  id: number;
  name: string;
  description?: string;
  category?: string;
  // Add other fields that might come from skill-categories endpoint
  title?: string; // Alternative field name
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useJobTitles = () => {
  const { data: session } = useSession();

  const {
    data: jobTitles = [],
    isLoading,
    isError,
    error
  } = useQuery<JobTitle[], AxiosError>({
    queryKey: ['jobTitles'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/skill-categories/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      
      // Handle different response structures
      const data = response.data;
      
      // If the API returns data in a different structure, normalize it
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name || item.title || item.category_name || '',
          description: item.description,
          category: item.category
        }));
      }
      
      return data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (updated from cacheTime)
  });

  return {
    jobTitles,
    isLoading,
    isError,
    error,
  };
};