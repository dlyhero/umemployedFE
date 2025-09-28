import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';

// Types
interface RetakeRequestPayload {
  reason: string;
}

interface RetakeRequestResponse {
  message: string;
  requestId?: string;
  status?: string;
}

interface RetakeRequestError {
  message: string;
  error?: string;
  details?: string;
}

interface UseRetakeRequestOptions {
  onSuccess?: (data: RetakeRequestResponse) => void;
  onError?: (error: RetakeRequestError) => void;
  showToast?: boolean;
}

// API function
const submitRetakeRequest = async (
  jobId: string,
  payload: RetakeRequestPayload,
  accessToken: string
): Promise<RetakeRequestResponse> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/report-test/`,
    payload,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Main hook
export const useRetakeRequest = (jobId: string, options: UseRetakeRequestOptions = {}) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  const {
    onSuccess,
    onError,
    showToast = true
  } = options;

  return useMutation({
    mutationFn: (payload: RetakeRequestPayload) => {
      if (!session?.user.accessToken) {
        throw new Error('Authentication required. Please log in.');
      }
      
      if (!payload.reason?.trim()) {
        throw new Error('Please provide a reason for retaking the assessment');
      }

      return submitRetakeRequest(jobId, { reason: payload.reason.trim() }, session.user.accessToken);
    },
    
    onSuccess: (data: RetakeRequestResponse) => {
      // Show success toast if enabled
      if (showToast) {
        toast.success(
          'Retake request submitted successfully!',
          {
            description: data.message || "We'll review your request and get back to you shortly.",
          }
        );
      }

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['job', jobId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['job-applications'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['retake-requests'] 
      });

      // Call custom success handler
      onSuccess?.(data);
    },

    onError: (error: any) => {
      console.error('Retake request submission error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to submit retake request. Please try again.';

      const errorData: RetakeRequestError = {
        message: errorMessage,
        error: error.response?.data?.error,
        details: error.response?.data?.details
      };

      // Show error toast if enabled
      if (showToast) {
        toast.error(errorMessage);
      }

      // Call custom error handler
      onError?.(errorData);
    },

    // Optional: Add retry logic for network errors
    retry: (failureCount, error: any) => {
      // Don't retry for authentication or validation errors
      if (error.response?.status === 401 || error.response?.status === 400) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },

    // Optional: Set retry delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for getting retake request history using useQuery instead of useMutation
export const useRetakeRequestHistory = (jobId: string, enabled: boolean = true) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['retake-requests', jobId],
    queryFn: async () => {
      if (!session?.user.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/retake-requests/`,
        {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`
          }
        }
      );

      return response.data;
    },
    enabled: enabled && !!session?.user.accessToken,
  });
};

// Export types for use in components
export type { 
  RetakeRequestPayload, 
  RetakeRequestResponse, 
  RetakeRequestError,
  UseRetakeRequestOptions
};