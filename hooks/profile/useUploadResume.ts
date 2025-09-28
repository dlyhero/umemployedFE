// hooks/useUploadResume.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UploadResumeResponse {
  message: string;
  success: boolean;
  // Add other response properties as needed
}

export const useUploadResume = () => {
    const {data: session, update} = useSession();
    const router = useRouter();
    
  return useMutation<UploadResumeResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resume/upload-resume/`, formData, {
        headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // You can handle progress updates here if needed
          }
        },
      });
      return response.data;
    },
    onSuccess: async () => {
      toast.success('Resume uploaded successfully!');
      
      // Update session to reflect that user now has a resume
      await update();
      
      // Redirect to edit profile page
      router.push('/applicant/edit-profile');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to upload resume. Please try again.'
      );
    },
  });
};