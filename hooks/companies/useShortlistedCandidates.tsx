"use client";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { withRetry } from '@/lib/errorHandling';

// Types for shortlisted candidates
export interface ShortlistedCandidate {
  candidate_id: number;
  shortlisted_date: string;
}

// Function to fetch shortlisted candidates
const fetchShortlistedCandidates = async (
  companyId: string,
  jobId: string,
  accessToken: string
): Promise<ShortlistedCandidate[]> => {
  if (!companyId || !jobId) {
    throw new Error('Company ID and Job ID are required');
  }

  if (!accessToken) {
    throw new Error('Access token is required');
  }

  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${companyId}/job/${jobId}/shortlisted/`,
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
      const error = new Error(errorData.error || `Failed to fetch shortlisted candidates: ${response.status}`);
      (error as any).response = { 
        status: response.status,
        data: errorData 
      };
      throw error;
    }

    const data: ShortlistedCandidate[] = await response.json();
    return data;
  }, 2, 1000, 'fetching shortlisted candidates');
};

// Hook to fetch shortlisted candidates
export const useShortlistedCandidates = (companyId?: string, jobId?: string) => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['shortlistedCandidates', companyId, jobId, session?.user?.accessToken],
    queryFn: () =>
      fetchShortlistedCandidates(
        companyId as string,
        jobId as string,
        session?.user?.accessToken as string
      ),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!companyId && !!jobId,
    staleTime: 1 * 60 * 1000, // 1 minute - shortlist data changes frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};