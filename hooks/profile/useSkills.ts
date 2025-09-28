// hooks/profile/useSkills.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface Skill {
  id?: number;
  name: string;
  is_extracted?: boolean;
  user?: number;
  categories: number[];
}

export interface SkillCreateDTO {
  skill_id: number;
}

export interface SkillUpdateDTO extends Partial<Omit<Skill, 'id' | 'user' | 'is_extracted'>> {}

interface SkillsResponse {
  results: {
    skills: Skill[];
  };
}

export const useSkills = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get all skills
  const {
    data: skills = [],
    isLoading,
    isError,
    error
  } = useQuery<Skill[], AxiosError>({
    queryKey: ['skills'],
    queryFn: async (): Promise<Skill[]> => {
      const response = await axios.get<SkillsResponse>(`${API_URL}/resume/skills/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data.results.skills || [];
    },
    enabled: !!session?.user.accessToken,
  });

  // Create new skill
  const createSkillMutation = useMutation<Skill, AxiosError, SkillCreateDTO>({
    mutationFn: async (newSkill: SkillCreateDTO): Promise<Skill> => {
      const response = await axios.post<Skill>(`${API_URL}/resume/skills/`, newSkill, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (error: AxiosError) => {
      console.error('Create skill error:', error);
    },
  });

  // Update skill
  const updateSkillMutation = useMutation<
    Skill,
    AxiosError,
    { id: number; data: SkillUpdateDTO }
  >({
    mutationFn: async ({ id, data }: { id: number; data: SkillUpdateDTO }): Promise<Skill> => {
      const response = await axios.patch<Skill>(`${API_URL}/resume/skills/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (error: AxiosError) => {
      console.error('Update skill error:', error);
    },
  });

  // Delete skill
  // Delete skill - try both approaches
const deleteSkillMutation = useMutation<void, AxiosError, number | undefined>({
  mutationFn: async (id: number | undefined): Promise<void> => {
    if (!id) {
      throw new Error('Skill ID is required for deletion');
    }
    
    try {
      // First try: DELETE with ID in URL (standard REST approach)
      await axios.delete(`${API_URL}/resume/skills/${id}/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        }
      });
    } catch (error: any) {
      // If that fails, try the original approach with skill_id in body
      if (error.response?.status === 404 || error.response?.status === 405) {
        console.log('Trying alternative delete approach with skill_id in body');
        await axios.delete(`${API_URL}/resume/skills/`, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          data: {
            skill_id: id
          }
        });
      } else {
        throw error; // Re-throw if it's a different error
      }
    }
  },
  onSuccess: () => {
    console.log('Skill deleted successfully, invalidating queries');
    queryClient.invalidateQueries({ queryKey: ['skills'] });
    // Also try to refetch the data immediately
    queryClient.refetchQueries({ queryKey: ['skills'] });
  },
  onError: (error: AxiosError) => {
    console.error('Delete skill error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
  },
});

  return {
    skills,
    isLoading,
    isError,
    error,
    createSkill: createSkillMutation.mutateAsync,
    updateSkill: updateSkillMutation.mutateAsync,
    deleteSkill: deleteSkillMutation.mutateAsync,
    isCreating: createSkillMutation.isPending,
    isUpdating: updateSkillMutation.isPending,
    isDeleting: deleteSkillMutation.isPending,
  };
};