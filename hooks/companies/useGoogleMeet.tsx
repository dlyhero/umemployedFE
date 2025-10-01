import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface GoogleMeetConnectionStatus {
  connected: boolean;
  // google_auth_url not needed since backend redirects directly
}

export interface CreateGoogleMeetInterviewData {
  candidate_id: number;
  job_id: number;
  company_id: number;
  date: string;
  time: string;
  timezone: string;
  notes?: string;
  interview_type?: 'google_meet' | 'phone' | 'in_person';
}

export interface GoogleMeetInterviewResponse {
  success: boolean;
  interview_id: number;
  meeting_link: string;
  calendar_event_id: string;
  portal_join_url: string;
  emails_sent: {
    candidate: boolean;
    recruiter: boolean;
  };
  message: string;
}

export interface InterviewDetails {
  interview_id: number;
  meet_link: string;
  can_join: boolean;
  meeting_status: 'upcoming' | 'ready' | 'ended';
  candidate_name: string;
  recruiter_name: string;
  job_title: string;
  scheduled_time: string;
  time_until_meeting: number;
}

export interface ConnectionTestResult {
  connection_test: string;
  camera_access: boolean;
  microphone_access: boolean;
  network_quality: string;
  recommendations: string[];
}

// API Functions
const checkGoogleMeetConnection = async (token: string): Promise<GoogleMeetConnectionStatus> => {
  const response = await axios.get(`${API_URL}/company/google/check-connection/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const createGoogleMeetInterview = async (
  interviewData: CreateGoogleMeetInterviewData,
  token: string
): Promise<GoogleMeetInterviewResponse> => {
  const response = await axios.post(
    `${API_URL}/company/google/create-interview/`,
    interviewData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

const getInterviewDetails = async (
  interviewId: number,
  token: string
): Promise<InterviewDetails> => {
  const response = await axios.get(
    `${API_URL}/company/interviews/${interviewId}/join/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

const testMeetConnection = async (token: string): Promise<ConnectionTestResult> => {
  const response = await axios.post(
    `${API_URL}/company/interviews/test-connection/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// Hooks
export const useGoogleMeetConnection = () => {
  const { data: session, status } = useSession();

  return useQuery<GoogleMeetConnectionStatus, AxiosError>({
    queryKey: ['googleMeetConnection', session?.user?.accessToken],
    queryFn: () => checkGoogleMeetConnection(session?.user?.accessToken as string),
    enabled: status === 'authenticated' && !!session?.user?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCreateGoogleMeetInterview = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<GoogleMeetInterviewResponse, AxiosError, CreateGoogleMeetInterviewData>({
    mutationFn: (interviewData: CreateGoogleMeetInterviewData) =>
      createGoogleMeetInterview(interviewData, session?.user?.accessToken as string),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['companyApplications'] });
      queryClient.invalidateQueries({ queryKey: ['googleMeetConnection'] });
      
      toast.success('Google Meet interview scheduled successfully!', {
        description: 'Both candidate and recruiter have been notified with calendar invitations.',
      });
    },
    onError: (error: AxiosError) => {
      console.error('Failed to create Google Meet interview:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication required', {
          description: 'Please connect your Google account to schedule Google Meet interviews.',
        });
      } else if (error.response?.status === 403) {
        toast.error('Google account not connected', {
          description: 'You need to connect your Google account to use Google Meet integration.',
        });
      } else {
        toast.error('Failed to schedule interview', {
          description: (error.response?.data as any)?.error || 'An unexpected error occurred.',
        });
      }
    },
  });
};

export const useInterviewDetails = (interviewId: number) => {
  const { data: session, status } = useSession();

  return useQuery<InterviewDetails, AxiosError>({
    queryKey: ['interviewDetails', interviewId, session?.user?.accessToken],
    queryFn: () => getInterviewDetails(interviewId, session?.user?.accessToken as string),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!interviewId,
    staleTime: 30 * 1000, // 30 seconds - interview status changes frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live updates
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useTestMeetConnection = () => {
  const { data: session } = useSession();

  return useMutation<ConnectionTestResult, AxiosError, void>({
    mutationFn: () => testMeetConnection(session?.user?.accessToken as string),
    onError: (error: AxiosError) => {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed', {
        description: 'Unable to test your camera and microphone. Please check your device permissions.',
      });
    },
  });
};