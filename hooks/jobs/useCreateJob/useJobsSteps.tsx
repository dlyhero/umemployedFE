import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner"; // or whatever toast library you're using
// Alternative imports for different toast libraries:
// import { toast } from "react-toastify";
// import { useToast } from "@/components/ui/use-toast"; // for shadcn/ui

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
  requirements: number[];
  level: string;
}

// API response types
interface JobStep1Response {
  id: number;
  title: string;
  status: string;
  hire_number: number;
  job_location_type: string;
  job_type: string;
  location: string;
  salary_range: string;
  category: number;
  [key: string]: any;
}

interface JobStepResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    // Check for API response message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Check for API response error
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    // Check for validation errors
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (typeof errors === 'object') {
        // Handle validation errors object
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        return errorMessages;
      }
      return String(errors);
    }
    // Default HTTP status messages
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

// API functions
const createJobStep1 = async (data: JobStep1Data, accessToken?: string): Promise<JobStep1Response> => {
  console.log('=== createJobStep1 API call ===');
  console.log('Data to send:', data);
  
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.post<JobStep1Response>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/create-step1/`,
      data,
      { headers }
    );
    
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Re-throw to be handled by the mutation
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
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/create-step2/`,
      data,
      { headers }
    );
    
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
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/create-step3/`,
      data,
      { headers }
    );
    console.log(response.data)
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
      `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/create-step4/`,
      data,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating job step 4:', error);
    throw error;
  }
};

// Custom hooks with toast notifications
export const useCreateJobStep1 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobStep1Data) => 
      createJobStep1(data, session?.user?.accessToken),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      console.log('Job step 1 created successfully:', data);
      
      // Success toast
      toast.success('Job created successfully!', {
        duration: 3000,
        position: 'top-right',
      });
    },
    onError: (error) => {
      console.error('Failed to create job step 1:', error);
      
      // Extract error message and show toast
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000, // Longer duration for error messages
        position: 'top-right',
      });
    },
  });
};

export const useUpdateJobStep2 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep2Data }) =>
      updateJobStep2(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 2 updated successfully:', data);
      
      toast.success('Job details updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update job step 2:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update job details: ${errorMessage}`);
    },
  });
};

export const useUpdateJobStep3 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep3Data }) =>
      updateJobStep3(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 3 updated successfully:', data);
      
      toast.success('Job information updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update job step 3:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to update job information: ${errorMessage}`);
    },
  });
};

export const useUpdateJobStep4 = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobStep4Data }) =>
      updateJobStep4(jobId, data, session?.user?.accessToken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      console.log('Job step 4 updated successfully:', data);
      
      toast.success('Job completed successfully! 🎉', {
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error('Failed to update job step 4:', error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to complete job: ${errorMessage}`);
    },
  });
};

// Main hook that combines all job steps
const useJobSteps = () => {
  const createStep1 = useCreateJobStep1();
  const updateStep2 = useUpdateJobStep2();
  const updateStep3 = useUpdateJobStep3();
  const updateStep4 = useUpdateJobStep4();

  return {
    createStep1,
    updateStep2,
    updateStep3,
    updateStep4,
    isLoading: createStep1.isPending || updateStep2.isPending || updateStep3.isPending || updateStep4.isPending,
  };
};

export default useJobSteps;