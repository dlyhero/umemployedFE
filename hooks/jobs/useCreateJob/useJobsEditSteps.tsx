import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner"; // or whatever toast library you're using

// Types for each step's data - matching your API exactly
export interface JobStep1Data {
  title: string;
  hire_number: number;
  job_location_type: string;
  job_type: string;
  location: string;
  salary_range: string;
  category: number;
}

export interface JobStep2Data {
  job_type: string;
  experience_levels: string[];
  weekly_ranges: string[];
  shifts: string[];
}

export interface JobStep3Data {
  description: string;
  responsibilities: string[];
  benefits: string[];
}

export interface JobStep4Data {
  requirements: string[];
  level: string;
}

// API response types
interface JobStepResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (typeof errors === 'object') {
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        return errorMessages;
      }
      return String(errors);
    }
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 429:
        return 'Too many requests. Please wait before trying again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.response?.statusText || 'An error occurred';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// API Update functions for all steps
const updateJobStep1 = async (jobId: string, data: JobStep1Data, accessToken?: string): Promise<JobStepResponse> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.patch<JobStepResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/update-step1/`,
      data,
      { headers }
    );
    
    console.log('Update step 1 response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating job step 1:', error);
    throw error;
  }
};

const updateJobStep2 = async (jobId: string, data: JobStep2Data, accessToken?: string): Promise<JobStepResponse> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.patch<JobStepResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/update-step2/`,
      data,
      { headers }
    );
    
    console.log('Update step 2 response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating job step 2:', error);
    throw error;
  }
};

const updateJobStep3 = async (jobId: string, data: JobStep3Data, accessToken?: string): Promise<JobStepResponse> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.patch<JobStepResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/update-step3/`,
      data,
      { headers }
    );
    
    console.log('Update step 3 response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating job step 3:', error);
    throw error;
  }
};

const updateJobStep4 = async (jobId: string, data: JobStep4Data, accessToken?: string): Promise<JobStepResponse> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.patch<JobStepResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/update-step4/`,
      data,
      { headers }
    );
    
    console.log('Update step 4 response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating job step 4:', error);
    throw error;
  }
};

// Edit hooks for all job steps
export const useEditJobStep1 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep1Data }) =>
      updateJobStep1(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 1 updated successfully:', data);
      
      toast.success('Job basic details updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update job step 1:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update job basic details: ${errorMessage}`);
    },
  });
};

export const useEditJobStep2 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep2Data }) =>
      updateJobStep2(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 2 updated successfully:', data);
      
      toast.success('Job preferences updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update job step 2:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update job preferences: ${errorMessage}`);
    },
  });
};

export const useEditJobStep3 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep3Data }) =>
      updateJobStep3(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 3 updated successfully:', data);
      
      toast.success('Job description and content updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update job step 3:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update job description and content: ${errorMessage}`);
    },
  });
};

export const useEditJobStep4 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep4Data }) =>
      updateJobStep4(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 4 updated successfully:', data);
      
      toast.success('Job requirements and level updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update job step 4:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update job requirements and level: ${errorMessage}`);
    },
  });
};

// Main hook that combines all job edit steps
export const useJobEditSteps = () => {
  const editStep1 = useEditJobStep1();
  const editStep2 = useEditJobStep2();
  const editStep3 = useEditJobStep3();
  const editStep4 = useEditJobStep4();

  return {
    editStep1,
    editStep2,
    editStep3,
    editStep4,
    isLoading: editStep1.isPending || editStep2.isPending || editStep3.isPending || editStep4.isPending,
  };
};
