import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export interface AITailoredDescriptionRequest {
  job_id: string;
  // Add any additional parameters your API expects
  skills?: string[];
  tone?: string; // e.g., "professional", "casual", "creative"
}

export interface AITailoredDescriptionResponse {
  description: string;
  responsibilities: string;
  benefits: string;
  success: boolean;
  message?: string;
}

const generateTailoredDescription = async (
  data: AITailoredDescriptionRequest,
  accessToken?: string
): Promise<AITailoredDescriptionResponse> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.post<AITailoredDescriptionResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/${data.job_id}/tailored-description/`,
      data,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
};

export const useAITailoredDescription = () => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: AITailoredDescriptionRequest) =>
      generateTailoredDescription(data, session?.user?.accessToken),
    onSuccess: (data) => {
      console.log('AI generation successful:', data);
      toast.success('AI-generated content created successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to generate AI content:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to generate AI content. Please try again.';
      
      toast.error(errorMessage);
    },
  });
};