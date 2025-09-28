import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface Language {
  id: number;
  name: string;
}

export interface UserLanguage {
  id: number;
  language: Language;
  language_id: number;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native' | null;
}

export interface UserLanguageCreateDTO {
  language_id: number;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native' | null;
}

export interface UserLanguageUpdateDTO extends Partial<UserLanguageCreateDTO> {}

export const useLanguages = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get all user languages
  const { 
    data: languages = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<UserLanguage[], AxiosError>({
    queryKey: ['userLanguages'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/languages/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  // Get all available languages (for dropdown)
  const { 
    data: availableLanguages = [], 
    isLoading: isLoadingAvailable 
  } = useQuery<Language[], AxiosError>({
    queryKey: ['availableLanguages'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/languages-list/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  // Create new language
  const createLanguageMutation = useMutation<UserLanguage, AxiosError, UserLanguageCreateDTO>({
    mutationFn: async (newLanguage) => {
      const response = await axios.post(`${API_URL}/resume/languages/`, newLanguage, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
    },
  });

  // Update language
  const updateLanguageMutation = useMutation<
    UserLanguage,
    AxiosError,
    { id: number; data: UserLanguageUpdateDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`${API_URL}/resume/languages/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
    },
  });

  // Delete language
  const deleteLanguageMutation = useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/resume/languages/${id}/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
    },
  });

  return {
    languages,
    availableLanguages,
    isLoading,
    isLoadingAvailable,
    isError,
    error,
    createLanguage: createLanguageMutation.mutateAsync,
    updateLanguage: updateLanguageMutation.mutateAsync,
    deleteLanguage: deleteLanguageMutation.mutateAsync,
    isCreating: createLanguageMutation.isPending,
    isUpdating: updateLanguageMutation.isPending,
    isDeleting: deleteLanguageMutation.isPending,
  };
};