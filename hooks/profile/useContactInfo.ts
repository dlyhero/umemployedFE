import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { ContactInfo, ContactInfoCreateDTO, ContactInfoUpdateDTO } from '../../types/profile/contactInfo';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useContactInfo = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get contact info
  const {
    data: contactInfo = [],
    isLoading,
    isError,
    error
  } = useQuery<ContactInfo[], AxiosError>({
    queryKey: ['contactInfo'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/contact-info/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  // Create contact info
  const createContactInfo = useMutation<ContactInfo, AxiosError, ContactInfoCreateDTO>({
    mutationFn: async (newContactInfo) => {
      const response = await axios.post(`${API_URL}/resume/contact-info/`, newContactInfo, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
    },
  });

  // Update contact info
  const updateContactInfo = useMutation<
    ContactInfo,
    AxiosError,
    { id: number; data: ContactInfoUpdateDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`${API_URL}/resume/contact-info/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
    },
  });

  // Delete contact info
  const deleteContactInfo = useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/resume/contact-info/${id}/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
    },
  });

  // Combined save function that creates or updates based on whether contact info exists
  const saveContactInfo = async (data: ContactInfoCreateDTO | ContactInfoUpdateDTO) => {
    const currentContactInfo = contactInfo[0];
    
    if (currentContactInfo?.id) {
      // Update existing contact info
      return await updateContactInfo.mutateAsync({ 
        id: currentContactInfo.id, 
        data: data as ContactInfoUpdateDTO 
      });
    } else {
      // Create new contact info
      return await createContactInfo.mutateAsync(data as ContactInfoCreateDTO);
    }
  };

  // Combined saving state
  const isSaving = createContactInfo.isPending || updateContactInfo.isPending;
  
  // Combined error state
  const saveError = createContactInfo.error || updateContactInfo.error;

  // Check if user has contact info
  const hasContactInfo = Boolean(contactInfo[0]?.id);

  return {
    contactInfo: contactInfo[0], // Assuming single contact info per user
    isLoading,
    isError,
    error,
    createContactInfo: createContactInfo.mutateAsync,
    updateContactInfo: updateContactInfo.mutateAsync,
    deleteContactInfo: deleteContactInfo.mutateAsync,
    saveContactInfo, // New combined function
    isCreating: createContactInfo.isPending,
    isUpdating: updateContactInfo.isPending,
    isDeleting: deleteContactInfo.isPending,
    isSaving, // Combined saving state
    saveError, // Combined error state
    hasContactInfo, // Boolean to check if contact info exists
  };
};