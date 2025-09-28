// hooks/useAbout.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { AboutData } from '@/types/profile/about';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAbout = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch about data
  const { 
    data: aboutData, 
    isLoading, 
    isError, 
    error 
  } = useQuery<AboutData, AxiosError>({
    queryKey: ['about'],
    queryFn: async () => {
      const response = await axios.get<{ about: AboutData }>(`${API_URL}/resume/about/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data.about;
    },
    enabled: !!session?.user.accessToken,
  });

  // Create or update about data
  const upsertAbout = useMutation({
    mutationFn: async (data: { bio?: string, description?: string }) => {
      const response = await axios.put<{ about: AboutData }>(
        `${API_URL}/resume/about/`, 
        { about: data },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data.about;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
    },
  });

  return {
    aboutData,
    isLoading,
    isError,
    error,
    upsertAbout: upsertAbout.mutateAsync,
    isUpdating: upsertAbout.isPending,
    upsertError: upsertAbout.error,
  };
};