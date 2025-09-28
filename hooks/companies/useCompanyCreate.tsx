import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

interface CreateCompanyData {
  name: string;
  industry: string | null;
  founded: number | null;
  size: string | null;
  website_url: string;
  contact_email: string;
  contact_phone: string;
  description: string;
  country: string;
  mission_statement: string;
  linkedin: string;
  video_introduction: string;
  location: string; // Required field
}

export interface CreatedCompany extends CreateCompanyData {
  id: string;
  created_at: string;
  updated_at: string;
}

interface CreateCompanyResponse {
  company: CreatedCompany;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useCreateCompany = () => {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateCompanyResponse, AxiosError, CreateCompanyData>({
    mutationFn: async (companyData: CreateCompanyData) => {
      if (!session?.user.accessToken) {
        throw new Error('No access token available');
      }

      const response = await axios.post(
        `${API_URL}/company/create-company/`,
        companyData,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: async (data) => {
      // Invalidate and refetch any company-related queries
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
      
      // Optionally, you can set the new company data in cache
      queryClient.setQueryData(['company',], data.company);
      
      // Update session to reflect that user now has a company
      await update();
    },
    onError: (error: AxiosError) => {
      console.error('Failed to create company:', error);
    },
  });

  return {
    createCompany: mutation.mutate,
    createCompanyAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};