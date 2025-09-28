"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { handleApiError, showSuccessMessage, withRetry } from '@/lib/errorHandling';

export interface CompanyUpdateData {
  name?: string;
  industry?: string;
  size?: string;
  location?: string;
  founded?: number;
  website_url?: string;
  country?: string;
  contact_email?: string;
  contact_phone?: string;
  description?: string;
  mission_statement?: string;
  linkedin?: string;
  video_introduction?: string;
}

interface CompanyUpdateVariables {
  companyId: string;
  data: CompanyUpdateData;
}

const updateCompany = async (
  companyId: string,
  data: CompanyUpdateData,
  accessToken: string
): Promise<any> => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/update-company/${companyId}/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || errorData.non_field_errors?.join(', ') || `Failed to update company: ${response.status}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();
    return result;
  }, 2, 1000, 'updating company');
};

export const useCompanyUpdate = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<any, Error, CompanyUpdateVariables>({
    mutationFn: ({ companyId, data }) =>
      updateCompany(companyId, data, session?.user?.accessToken as string),
    onSuccess: (data, variables) => {
      // Invalidate and refetch company details
      queryClient.invalidateQueries({ 
        queryKey: ['companyDetails', variables.companyId], 
        exact: false 
      });
      
      // Invalidate company jobs if they exist
      queryClient.invalidateQueries({ 
        queryKey: ['companyJobs', variables.companyId], 
        exact: false 
      });

      showSuccessMessage('Company updated successfully!');
    },
    onError: (error) => {
      handleApiError(error, 'updating company');
    },
  });
};