import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// Define the job interface based on the backend response
export interface CompanyJob {
  id: number; // Backend returns numeric IDs
  title: string;
  application_count: number;
}

// API response type (array of jobs)
type CompanyJobsResponse = CompanyJob[];

// Function to fetch company jobs
const fetchCompanyJobs = async (
  companyId: string,
  accessToken: string,
  sessionCompanyId?: string
): Promise<CompanyJob[]> => {
  // Use provided companyId or fall back to sessionCompanyId
  const validCompanyId = companyId && companyId !== 'undefined' ? companyId : sessionCompanyId;

  // Validate companyId
  if (!validCompanyId) {
    throw new Error('No valid company ID provided');
  }

  // Validate accessToken
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company/${validCompanyId}/jobs/`,
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
      throw new Error(errorData.error || `Failed to fetch jobs: ${response.status}`);
    }

    const data: CompanyJobsResponse = await response.json();

    // Debug: Log the raw response data
    console.log('Company Jobs API Response:', {
    
      data,
    });

    return data; // Return the array of jobs
  } catch (error) {
    console.error('Error fetching company jobs:', {
      companyId: validCompanyId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// Custom hook using TanStack Query
export const useCompanyJobs = (companyId?: string) => {
  const { data: session, status } = useSession();

  // Use session.companyId if available (adjust based on your session structure)
  const sessionCompanyId: string | undefined = session?.user?.companyId ?? undefined; // Ensure undefined, not null

  // Determine the company ID to use
  const effectiveCompanyId = companyId || sessionCompanyId;

  const query = useQuery<CompanyJob[], Error>({
    queryKey: ['companyJobs', effectiveCompanyId, session?.user?.accessToken],
    queryFn: () =>
      fetchCompanyJobs(
        effectiveCompanyId as string,
        session?.user?.accessToken as string,
        sessionCompanyId
      ),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!effectiveCompanyId, // Only run when authenticated and a companyId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Debug: Log query status changes outside useQuery
  if (query.isSuccess) {
    console.log('Company Jobs Query Success:', {
      companyId: effectiveCompanyId,
      jobCount: query.data?.length ?? 0,
      jobs: query.data,
    });
  }

  if (query.isError) {
    console.error('Company Jobs Query Error:', {
      companyId: effectiveCompanyId,
      error: query.error?.message,
    });
  }

  return query;
};