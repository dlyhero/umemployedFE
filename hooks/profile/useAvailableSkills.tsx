// hooks/profile/useAvailableSkills.ts
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import type { SkillsListResponse } from '@/types/profile/skill';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAvailableSkills = (searchQuery = '', page = 1, pageSize = 20) => {
  const { data: session } = useSession();

  return useQuery<SkillsListResponse, AxiosError>({
    queryKey: ['availableSkills', searchQuery, page],
    queryFn: async (): Promise<SkillsListResponse> => {
      const response = await axios.get<SkillsListResponse>(`${API_URL}/resume/skills-list/`, {
        params: {
          search: searchQuery,
          page,
          page_size: pageSize
        },
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken && searchQuery.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};