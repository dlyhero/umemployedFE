import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

interface UserImage {
  id: number;
  profile_image?: string;  // The actual field name from your API
  created_at?: string;
  // Add other fields your API returns
}

interface ImageUploadDTO {
  file: File;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useUserImages = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get user images
  const { data: images = [], isLoading, isError, error } = useQuery<UserImage[], AxiosError>({
    queryKey: ['userImages'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/user-images/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.user.accessToken,
  });

  // Upload image
  const uploadImage = useMutation<UserImage, AxiosError, ImageUploadDTO>({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await axios.post(`${API_URL}/resume/user-images/`, formData, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userImages'] });
    },
  });

  return {
    images,
    isLoading,
    isError,
    error,
    uploadImage: uploadImage.mutateAsync,
    isUploading: uploadImage.isPending,
  };
};