import { toast } from 'sonner';

// Error message mappings
export const errorMessages = {
  401: "Please sign in to continue",
  403: "You don't have permission to view applications",
  404: "Job or company not found",
  500: "Server error. Please try again later",
  network: "Connection error. Please check your internet",
  default: "An unexpected error occurred. Please try again."
};

// Error types
export type ErrorType = keyof typeof errorMessages;

// Function to handle API errors
export const handleApiError = (error: any, context?: string) => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  let errorMessage = errorMessages.default;
  let errorType: ErrorType = 'default';
  
  // First, try to extract backend error message from response
  if (error?.response?.data?.error) {
    errorMessage = error.response.data.error;
    errorType = error.response.status as ErrorType;
  } else if (error?.response?.status) {
    const status = error.response.status as ErrorType;
    if (status in errorMessages) {
      errorMessage = errorMessages[status];
      errorType = status;
    }
  } else if (error?.message) {
    // Check if the error message contains backend error info
    if (error.message.includes('Candidate is already shortlisted')) {
      errorMessage = 'Candidate is already shortlisted for this job.';
      errorType = 'default';
    } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      errorMessage = errorMessages.network;
      errorType = 'network';
    } else if (error.message.includes('401')) {
      errorMessage = errorMessages[401];
      errorType = 401;
    } else if (error.message.includes('403')) {
      errorMessage = errorMessages[403];
      errorType = 403;
    } else if (error.message.includes('404')) {
      errorMessage = errorMessages[404];
      errorType = 404;
    } else if (error.message.includes('500')) {
      errorMessage = errorMessages[500];
      errorType = 500;
    }
  }
  
  // Show toast notification
  toast.error(errorMessage, {
    description: context ? `Error occurred while ${context}` : undefined,
    duration: 5000,
  });
  
  return { errorMessage, errorType };
};

// Function to show success messages
export const showSuccessMessage = (message: string, context?: string) => {
  toast.success(message, {
    description: context,
    duration: 3000,
  });
};

// Function to show loading state
export const showLoadingMessage = (message: string) => {
  return toast.loading(message);
};

// Function to dismiss loading toast
export const dismissLoadingToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Retry mechanism helper
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        handleApiError(error, context);
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      
      // Show retry message
      toast.warning(`Retrying ${context || 'operation'}... (Attempt ${attempt + 1}/${maxRetries})`, {
        duration: 2000,
      });
    }
  }
  
  throw lastError;
};

// Error boundary helper for React components
export const createErrorBoundary = (componentName: string) => {
  return (error: Error, errorInfo: any) => {
    console.error(`Error in ${componentName}:`, error, errorInfo);
    toast.error(`Error in ${componentName}`, {
      description: "Please refresh the page and try again.",
      duration: 5000,
    });
  };
};