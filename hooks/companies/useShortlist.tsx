"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { showSuccessMessage, handleApiError, withRetry } from '@/lib/errorHandling';

// Function to shortlist a candidate
const shortlistCandidate = async (
  companyId: string,
  jobId: string,
  candidateId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> => {
  if (!companyId || !jobId || !candidateId) {
    throw new Error('Company ID, Job ID, and Candidate ID are required');
  }

  if (!accessToken) {
    throw new Error('Access token is required');
  }

  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/job/${jobId}/shortlist/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          candidate_id: candidateId
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to shortlist candidate: ${response.status}`);
      (error as any).response = { 
        status: response.status,
        data: errorData 
      };
      throw error;
    }

    const data = await response.json();
    return data;
  }, 2, 1000, 'shortlisting candidate');
};

// Function to unshortlist a candidate
const unshortlistCandidate = async (
  companyId: string,
  jobId: string,
  candidateId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> => {
  if (!companyId || !jobId || !candidateId) {
    throw new Error('Company ID, Job ID, and Candidate ID are required');
  }

  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/job/${jobId}/unshortlist/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          candidate_id: candidateId
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to unshortlist candidate: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unshortlisting candidate:', error);
    throw error;
  }
};

// Custom hook for shortlisting candidates
export const useShortlistCandidate = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, jobId, candidateId }: { 
      companyId: string; 
      jobId: string; 
      candidateId: number; 
    }) =>
      shortlistCandidate(
        companyId,
        jobId,
        candidateId,
        session?.user?.accessToken as string
      ),
    onSuccess: (data, variables) => {
      // Invalidate and refetch applications data with smart cache invalidation
      queryClient.invalidateQueries({ 
        queryKey: ['companyApplications', variables.companyId],
        exact: false // Invalidate all pages for this company
      });
      queryClient.invalidateQueries({ 
        queryKey: ['jobApplications', variables.companyId, variables.jobId],
        exact: false // Invalidate all pages for this job
      });
      
      // Optimistically update the cache if possible
      queryClient.setQueryData(
        ['companyApplications', variables.companyId],
        (oldData: any) => {
          if (oldData) {
            // Update the candidate's shortlist status in cache
            const updatedData = { ...oldData };
            if (updatedData.top_5_candidates) {
              updatedData.top_5_candidates = updatedData.top_5_candidates.map((candidate: any) =>
                candidate.user_id === variables.candidateId
                  ? { ...candidate, isShortlisted: true, status: 'shortlisted' }
                  : candidate
              );
            }
            if (updatedData.waiting_list_candidates) {
              updatedData.waiting_list_candidates = updatedData.waiting_list_candidates.map((candidate: any) =>
                candidate.user_id === variables.candidateId
                  ? { ...candidate, isShortlisted: true, status: 'shortlisted' }
                  : candidate
              );
            }
            return updatedData;
          }
          return oldData;
        }
      );
      
      // Invalidate shortlisted candidates cache to update counts and UI
      queryClient.invalidateQueries({ 
        queryKey: ['shortlistedCandidates', variables.companyId, variables.jobId],
        exact: false
      });
      
      showSuccessMessage(data.message || 'Candidate shortlisted successfully', 'Candidate has been added to your shortlist');
    },
    onError: (error: Error) => {
      handleApiError(error, 'shortlisting candidate');
    }
  });
};

// Custom hook for unshortlisting candidates
export const useUnshortlistCandidate = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, jobId, candidateId }: { 
      companyId: string; 
      jobId: string; 
      candidateId: number; 
    }) =>
      unshortlistCandidate(
        companyId,
        jobId,
        candidateId,
        session?.user?.accessToken as string
      ),
    onSuccess: (data, variables) => {
      // Invalidate and refetch applications data
      queryClient.invalidateQueries({ 
        queryKey: ['companyApplications', variables.companyId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['jobApplications', variables.companyId, variables.jobId] 
      });
      
      // Optimistically update the cache if possible
      queryClient.setQueryData(
        ['companyApplications', variables.companyId],
        (oldData: any) => {
          if (oldData) {
            // Update the candidate's shortlist status in cache
            const updatedData = { ...oldData };
            if (updatedData.top_5_candidates) {
              updatedData.top_5_candidates = updatedData.top_5_candidates.map((candidate: any) =>
                candidate.user_id === variables.candidateId
                  ? { ...candidate, isShortlisted: false, status: 'pending' }
                  : candidate
              );
            }
            if (updatedData.waiting_list_candidates) {
              updatedData.waiting_list_candidates = updatedData.waiting_list_candidates.map((candidate: any) =>
                candidate.user_id === variables.candidateId
                  ? { ...candidate, isShortlisted: false, status: 'pending' }
                  : candidate
              );
            }
            return updatedData;
          }
          return oldData;
        }
      );
      
      // Invalidate shortlisted candidates cache to update counts and UI
      queryClient.invalidateQueries({ 
        queryKey: ['shortlistedCandidates', variables.companyId, variables.jobId],
        exact: false
      });
      
      showSuccessMessage(data.message || 'Candidate removed from shortlist', 'Candidate has been removed from your shortlist');
    },
    onError: (error: Error) => {
      handleApiError(error, 'removing candidate from shortlist');
    }
  });
};