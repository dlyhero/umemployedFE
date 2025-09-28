"use client";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { handleApiError, withRetry } from '@/lib/errorHandling';

// Types for the applications data based on actual API response
export interface ApplicationCandidate {
  application_id: number;
  job_id: number;
  user_id: number;
  user: string; // This is the email
  status: string;
  quiz_score: number;
  matching_percentage: number;
  overall_match_percentage: number;
  created_at: string;
  updated_at: string;
  // Enhanced profile data from user profile endpoint
  full_name?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    location?: string;
    jobTitle?: string;
    profileImage?: string;
    coverLetter?: string;
    skills?: string[];
    contacts?: {
      email: string;
      phone?: string;
    };
    experiences?: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    languages?: string[];
  };
  isShortlisted?: boolean;
}

// Types for user profile API response
export interface UserProfileResponse {
  contact_info: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    country?: string;
    job_title_name?: string;
  };
  profile_image?: string;
  description?: string;
  skills: Array<{ name: string }>;
  work_experience: Array<{
    role: string;
    start_date: string;
    end_date: string;
    company?: string;
    description?: string;
  }>;
  languages: Array<{ name: string }>;
}

export interface ApplicationsResponse {
  top_5_candidates: ApplicationCandidate[];
  waiting_list_candidates: ApplicationCandidate[];
  pagination?: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Function to fetch user profile details
const fetchUserProfile = async (
  userId: number,
  accessToken: string
): Promise<UserProfileResponse> => {
  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/resume/user-profile/${userId}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to fetch user profile: ${response.status}`);
      (error as any).response = { status: response.status };
      throw error;
    }

    const data: UserProfileResponse = await response.json();
    return data;
  }, 2, 1000, `fetching profile for user ${userId}`);
};

// Function to transform user profile data into our format
const transformUserProfile = (profile: UserProfileResponse): ApplicationCandidate['profile'] => {
  return {
    firstName: profile.contact_info.name?.split(' ')[0],
    lastName: profile.contact_info.name?.split(' ').slice(1).join(' '),
    location: profile.contact_info.city && profile.contact_info.country 
      ? `${profile.contact_info.city}, ${profile.contact_info.country}`
      : profile.contact_info.city || profile.contact_info.country || 'Location not specified',
    jobTitle: profile.contact_info.job_title_name || 'Job title not specified',
    profileImage: profile.profile_image,
    coverLetter: profile.description,
    skills: profile.skills?.map(skill => skill.name) || [],
    contacts: {
      email: profile.contact_info.email,
      phone: profile.contact_info.phone,
    },
    experiences: profile.work_experience?.map(exp => ({
      company: exp.company || 'Company not specified',
      position: exp.role,
      duration: `${exp.start_date} - ${exp.end_date}`,
      description: exp.description || 'No description provided',
    })) || [],
    languages: profile.languages?.map(lang => lang.name) || [],
  };
};

// Function to fetch company applications with enhanced profile data
const fetchCompanyApplications = async (
  companyId: string,
  accessToken: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApplicationsResponse> => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  if (!accessToken) {
    throw new Error('Access token is required');
  }

  return withRetry(async () => {
    // Step 1: Fetch basic applications data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/applications/?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to fetch applications: ${response.status}`);
      (error as any).response = { status: response.status };
      throw error;
    }

    const data: ApplicationsResponse = await response.json();

    console.log('Applications API Response:', {
      companyId,
      data,
    });

    // Step 2: Enhance candidates with profile data
    const enhancedCandidates = await Promise.allSettled(
      [...data.top_5_candidates, ...data.waiting_list_candidates].map(async (candidate) => {
        try {
          // Fetch detailed profile for each candidate
          const profileData = await fetchUserProfile(candidate.user_id, accessToken);
          
          // Transform and merge profile data
          const enhancedCandidate: ApplicationCandidate = {
            ...candidate,
            full_name: profileData.contact_info.name,
            profile: transformUserProfile(profileData),
            isShortlisted: candidate.status === 'shortlisted' || candidate.status === 'Shortlisted',
          };

          return enhancedCandidate;
        } catch (error) {
          console.error(`Failed to fetch profile for user ${candidate.user_id}:`, error);
          // Return candidate with basic data if profile fetch fails
          return {
            ...candidate,
            full_name: candidate.user.split('@')[0],
            isShortlisted: candidate.status === 'shortlisted' || candidate.status === 'Shortlisted',
          };
        }
      })
    );

    // Step 3: Separate successful and failed profile fetches
    const successfulCandidates = enhancedCandidates
      .filter((result): result is PromiseFulfilledResult<ApplicationCandidate> => result.status === 'fulfilled')
      .map(result => result.value);

    // Step 4: Sort by creation date (newest first)
    successfulCandidates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Step 5: Split back into top 5 and waiting list
    const top5Count = Math.min(5, successfulCandidates.length);
    const top5Candidates = successfulCandidates.slice(0, top5Count);
    const waitingListCandidates = successfulCandidates.slice(top5Count);

    return {
      top_5_candidates: top5Candidates,
      waiting_list_candidates: waitingListCandidates,
    };
  }, 3, 1000, 'fetching company applications');
};

// Function to fetch job-specific applications with enhanced profile data
const fetchJobApplications = async (
  companyId: string,
  jobId: string,
  accessToken: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApplicationsResponse> => {
  if (!companyId || !jobId) {
    throw new Error('Company ID and Job ID are required');
  }

  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    // Step 1: Fetch basic applications data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/job/${jobId}/applications/?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch job applications: ${response.status}`);
    }

    const data: ApplicationsResponse = await response.json();

    console.log('Job Applications API Response:', {
      companyId,
      jobId,
      data,
    });

    // Step 2: Enhance candidates with profile data
    const enhancedCandidates = await Promise.allSettled(
      [...data.top_5_candidates, ...data.waiting_list_candidates].map(async (candidate) => {
        try {
          // Fetch detailed profile for each candidate
          const profileData = await fetchUserProfile(candidate.user_id, accessToken);
          
          // Transform and merge profile data
          const enhancedCandidate: ApplicationCandidate = {
            ...candidate,
            full_name: profileData.contact_info.name,
            profile: transformUserProfile(profileData),
            isShortlisted: candidate.status === 'shortlisted' || candidate.status === 'Shortlisted', // Determine shortlist status from status field
          };

          return enhancedCandidate;
        } catch (error) {
          console.error(`Failed to fetch profile for user ${candidate.user_id}:`, error);
          // Return candidate with basic data if profile fetch fails
          return {
            ...candidate,
            full_name: candidate.user.split('@')[0], // Fallback to email name
            isShortlisted: candidate.status === 'shortlisted' || candidate.status === 'Shortlisted',
          };
        }
      })
    );

    // Step 3: Separate successful and failed profile fetches
    const successfulCandidates = enhancedCandidates
      .filter((result): result is PromiseFulfilledResult<ApplicationCandidate> => result.status === 'fulfilled')
      .map(result => result.value);

    // Step 4: Sort by creation date (newest first)
    successfulCandidates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Step 5: Split back into top 5 and waiting list
    const top5Count = Math.min(5, successfulCandidates.length);
    const top5Candidates = successfulCandidates.slice(0, top5Count);
    const waitingListCandidates = successfulCandidates.slice(top5Count);

    return {
      top_5_candidates: top5Candidates,
      waiting_list_candidates: waitingListCandidates,
    };
  } catch (error) {
    console.error('Error fetching job applications:', {
      companyId,
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// Custom hook for company-wide applications
export const useApplications = (companyId?: string, page: number = 1, pageSize: number = 20) => {
  const { data: session, status } = useSession();

  const query = useQuery<ApplicationsResponse, Error>({
    queryKey: ['companyApplications', companyId, page, pageSize, session?.user?.accessToken],
    queryFn: () =>
      fetchCompanyApplications(
        companyId as string,
        session?.user?.accessToken as string,
        page,
        pageSize
      ),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes - applications data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  if (query.isSuccess) {
    console.log('Applications Query Success:', {
      companyId,
      topCandidatesCount: query.data?.top_5_candidates?.length ?? 0,
      waitingListCount: query.data?.waiting_list_candidates?.length ?? 0,
    });
  }

  if (query.isError) {
    console.error('Applications Query Error:', {
      companyId,
      error: query.error?.message,
    });
  }

  return query;
};

// Custom hook for job-specific applications
export const useJobApplications = (companyId?: string, jobId?: string, page: number = 1, pageSize: number = 20) => {
  const { data: session, status } = useSession();

  const query = useQuery<ApplicationsResponse, Error>({
    queryKey: ['jobApplications', companyId, jobId, page, pageSize, session?.user?.accessToken],
    queryFn: () =>
      fetchJobApplications(
        companyId as string,
        jobId as string,
        session?.user?.accessToken as string,
        page,
        pageSize
      ),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!companyId && !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes - applications data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  if (query.isSuccess) {
    console.log('Job Applications Query Success:', {
      companyId,
      jobId,
      topCandidatesCount: query.data?.top_5_candidates?.length ?? 0,
      waitingListCount: query.data?.waiting_list_candidates?.length ?? 0,
    });
  }

  if (query.isError) {
    console.error('Job Applications Query Error:', {
      companyId,
      jobId,
      error: query.error?.message,
    });
  }

  return query;
};