import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Education, EducationCreateDTO, EducationUpdateDTO } from '../../types/profile/education';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useEducations = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get all education records
  const { 
    data: educations = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<Education[], AxiosError>({
    queryKey: ['educations'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/educations/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  // Create new education record
  const createEducation = useMutation<Education, AxiosError, EducationCreateDTO>({
    mutationFn: async (newEducation) => {
      const response = await axios.post(`${API_URL}/resume/educations/`, newEducation, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
    },
  });

  // Update education record
  const updateEducation = useMutation<
    Education,
    AxiosError,
    { id: number; data: EducationUpdateDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`${API_URL}/resume/educations/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
    },
  });

  // Delete education record
  const deleteEducation = useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/resume/educations/${id}/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
    },
  });

  return {
    educations,
    isLoading,
    isError,
    error,
    createEducation: createEducation.mutateAsync,
    updateEducation: updateEducation.mutateAsync,
    deleteEducation: deleteEducation.mutateAsync,
    isCreating: createEducation.isPending,
    isUpdating: updateEducation.isPending,
    isDeleting: deleteEducation.isPending,
  };
};