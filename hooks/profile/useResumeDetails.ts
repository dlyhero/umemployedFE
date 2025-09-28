import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { ResumeDetails } from '@/types/profile/resume'
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useResumeDetails = () => {
  const { data: session } = useSession();

  const { 
    data: resumeDetails, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<ResumeDetails, AxiosError>({
    queryKey: ['resume-details'],
    queryFn: async () => {
      const response = await axios.get<ResumeDetails>(`${API_URL}/resume/resume-details/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  return {
    resumeDetails,
    isLoading,
    isError,
    error,
    refetch,
  };
};