// @/hooks/profile/useUploadTranscript.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface TranscriptUploadResponse {
  message: string;
  extracted_text: string;
  job_title: string;
  reasoning: string;
}

export const useUploadTranscript = () => {
  const { data: session } = useSession();
  
  return useMutation<TranscriptUploadResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/resume/upload-transcript/`, 
        formData, 
        {
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
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Transcript uploaded and processed successfully!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to upload transcript. Please try again.'
      );
    },
  });
};

export default useUploadTranscript;