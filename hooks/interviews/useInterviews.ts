import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { handleApiError } from '@/lib/errorHandling';

// Types
export interface Interview {
  id: number;
  candidate_name: string;
  candidate_email: string;
  recruiter_name: string;
  recruiter_email: string;
  job_title: string;
  company_name: string;
  date: string;
  time: string;
  timezone: string;
  interview_type: 'google_meet' | 'phone' | 'in_person';
  meeting_link?: string;
  note?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  user_role: 'candidate' | 'recruiter';
  can_join?: boolean;
}

export interface CreateInterviewData {
  candidate_id: number;
  job_id: number;
  company_id: number;
  date: string;
  time: string;
  timezone: string;
  note?: string;
  interview_type: 'google_meet' | 'phone' | 'in_person';
}

// Hook to get all interviews for a user
export const useInterviews = (role?: 'candidate' | 'recruiter') => {
  const { data: session, status: sessionStatus } = useSession();
  
  return useQuery<Interview[]>({
    queryKey: ['interviews', role],
    queryFn: async () => {
      if (!session?.user?.accessToken) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const url = role 
        ? `/company/interviews/?role=${role}`
        : '/company/interviews/';
      
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch interviews: ${response.status}`);
      }

      return response.json();
    },
    enabled: sessionStatus === 'authenticated' && !!session?.user?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to get specific interview details
export const useInterviewDetails = (interviewId: number) => {
  const { data: session, status: sessionStatus } = useSession();
  
  return useQuery<Interview>({
    queryKey: ['interview', interviewId],
    queryFn: async () => {
      if (!session?.user?.accessToken) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/interviews/${interviewId}/`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch interview details: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!interviewId && sessionStatus === 'authenticated' && !!session?.user?.accessToken,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to create an interview
export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateInterviewData) => {
      if (!session?.user?.accessToken) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/google/create-interview/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create interview: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch interviews
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (error) => {
      handleApiError(error, 'creating interview');
    },
  });
};

// Utility function to format interview date and time
export const formatInterviewDateTime = (interview: Interview) => {
  const date = new Date(`${interview.date}T${interview.time}`);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };
  
  return date.toLocaleDateString('en-US', options);
};

// Utility function to get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'text-blue-600 bg-blue-100';
    case 'in_progress':
      return 'text-green-600 bg-green-100';
    case 'completed':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Utility function to check if interview is happening soon
export const isInterviewSoon = (interview: Interview) => {
  const now = new Date();
  const interviewTime = new Date(`${interview.date}T${interview.time}`);
  const timeDiff = interviewTime.getTime() - now.getTime();
  const hoursUntilInterview = timeDiff / (1000 * 60 * 60);
  
  return hoursUntilInterview <= 24 && hoursUntilInterview > 0;
};