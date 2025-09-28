import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { WorkExperience, WorkExperienceCreateDTO, WorkExperienceUpdateDTO } from '../../types/workExperiences';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useWorkExperiences = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get all work experiences
  const { data: experiences, isLoading, isError, error } = useQuery<WorkExperience[], AxiosError>({
    queryKey: ['workExperiences'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/work-experiences/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  // Create a new work experience
  const createExperienceMutation = useMutation<WorkExperience, AxiosError, WorkExperienceCreateDTO>({
    mutationFn: async (newExperience) => {
      const response = await axios.post(`${API_URL}/resume/work-experiences/`, newExperience, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workExperiences'] });
    },
  });

  // Update an existing work experience
  const updateExperienceMutation = useMutation<
    WorkExperience,
    AxiosError,
    { id: number; data: WorkExperienceUpdateDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`${API_URL}/resume/work-experiences/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workExperiences'] });
    },
  });

  // Delete a work experience
  const deleteExperienceMutation = useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/resume/work-experiences/${id}/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workExperiences'] });
    },
  });

  return {
    experiences,
    isLoading,
    isError,
    error,
    createExperience: createExperienceMutation.mutateAsync,
    updateExperience: updateExperienceMutation.mutateAsync,
    deleteExperience: deleteExperienceMutation.mutateAsync,
    isCreating: createExperienceMutation.isPending,
    isUpdating: updateExperienceMutation.isPending,
    isDeleting: deleteExperienceMutation.isPending,
  };
};