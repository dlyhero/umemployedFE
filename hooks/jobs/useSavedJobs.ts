import { TransformedJob } from '@/utility/jobTransformer';
import { useMutation, useQueryClient, QueryClient, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface SaveJobResponse {
  message: string;
}

interface JobsQueryData {
  allJobs: TransformedJob[];
  totalCount: number;
}

interface RecommendedJobsResponse {
  results?: TransformedJob[];
  [key: string]: any;
}

interface MutationContext {
  previousData: {
    authenticatedJobs?: JobsQueryData;
    anonymousJobs?: JobsQueryData;
    recommended?: TransformedJob[] | RecommendedJobsResponse;
    relatedJobs: Array<{ queryKey: any[]; data: TransformedJob[] }>;
    jobDetails?: TransformedJob;
    savedJobs?: TransformedJob[];
    appliedJobs?: TransformedJob[]
  };
  jobId: number;
  previousSavedState: boolean;
}

export const useSaveJob = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const findCurrentSavedState = (jobId: number): boolean => {
    // Check both authenticated and anonymous jobs queries
    const authenticatedJobsData = queryClient.getQueryData<JobsQueryData>(['jobs', 'authenticated']);
    const anonymousJobsData = queryClient.getQueryData<JobsQueryData>(['jobs', 'anonymous']);

    const jobsData = authenticatedJobsData || anonymousJobsData;
    if (jobsData?.allJobs) {
      const job = jobsData.allJobs.find(j => j.id === jobId);
      if (job !== undefined) return job.isSaved;
    }

    // Check job details
    const jobDetails = queryClient.getQueryData<TransformedJob>(['jobDetails', jobId]);
    if (jobDetails !== undefined) return jobDetails.isSaved;

    // Check recommended jobs
    const recommendedData = queryClient.getQueryData<TransformedJob[] | RecommendedJobsResponse>(['recommendedJobs']);
    if (recommendedData) {
      if (Array.isArray(recommendedData)) {
        const job = recommendedData.find(j => j.id === jobId);
        if (job !== undefined) return job.isSaved;
      } else if (recommendedData.results) {
        const job = recommendedData.results.find(j => j.id === jobId);
        if (job !== undefined) return job.isSaved;
      }
    }

    // Check all related jobs queries
    const allQueries = queryClient.getQueryCache().getAll();
    for (const query of allQueries) {
      if (Array.isArray(query.queryKey) && query.queryKey[0] === 'relatedJobs') {
        const data = query.state.data as TransformedJob[] | undefined;
        if (data) {
          const job = data.find(j => j.id === jobId);
          if (job !== undefined) return job.isSaved;
        }
      }
    }

    return false; // Default to false if not found anywhere
  };


  // Helper to update a single job in an array
  const updateJobInArray = (jobs: TransformedJob[], jobId: number, isSaved: boolean): TransformedJob[] => {
    return jobs.map(job => job.id === jobId ? { ...job, isSaved } : job);
  };

  // Optimistically update all relevant queries
  const optimisticallyUpdate = (jobId: number, newSavedState: boolean) => {

    // 1. Update both authenticated and anonymous jobs queries
    queryClient.setQueryData<JobsQueryData>(['jobs', 'authenticated'], (old) => {
      if (!old?.allJobs) return old;
      return {
        ...old,
        allJobs: updateJobInArray(old.allJobs, jobId, newSavedState)
      };
    });

    queryClient.setQueryData<JobsQueryData>(['jobs', 'anonymous'], (old) => {
      if (!old?.allJobs) return old;
      return {
        ...old,
        allJobs: updateJobInArray(old.allJobs, jobId, newSavedState)
      };
    });

    // 2. Update job details query
    queryClient.setQueryData<TransformedJob>(['jobDetails', jobId], (old) => {
      if (!old) return undefined;
      return { ...old, isSaved: newSavedState };
    });

    // 3. Update recommended jobs query
    queryClient.setQueryData<TransformedJob[] | RecommendedJobsResponse>(['recommendedJobs'], (old) => {
      if (!old) return old;

      if (Array.isArray(old)) {
        return updateJobInArray(old, jobId, newSavedState);
      } else if (old.results) {
        return {
          ...old,
          results: updateJobInArray(old.results, jobId, newSavedState)
        };
      }
      return old;
    });

    const allQueries = queryClient.getQueryCache().getAll();
    const relatedQueries = allQueries.filter(query =>
      Array.isArray(query.queryKey) && query.queryKey[0] === 'relatedJobs'
    );

    relatedQueries.forEach(query => {
      queryClient.setQueryData<TransformedJob[]>(query.queryKey as any[], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return updateJobInArray(old, jobId, newSavedState);
      });
    });
  };

  return useMutation<SaveJobResponse, AxiosError, number, MutationContext>({
    mutationFn: async (jobId: number) => {
      if (!session?.user.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await axios.post<SaveJobResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/${jobId}/save/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onMutate: async (jobId) => {

      await queryClient.cancelQueries({ queryKey: ['jobs'], exact: false });
      await queryClient.cancelQueries({ queryKey: ['recommendedJobs'] });
      await queryClient.cancelQueries({ queryKey: ['relatedJobs'], exact: false });
      await queryClient.cancelQueries({ queryKey: ['jobDetails', jobId] });
      await queryClient.cancelQueries({ queryKey: ['savedJobs'] });
      await queryClient.cancelQueries({ queryKey: ['appliedJobs'] });

      const currentSavedState = findCurrentSavedState(jobId);
      const newSavedState = !currentSavedState;

      const previousAuthenticatedJobs = queryClient.getQueryData<JobsQueryData>(['jobs', 'authenticated']);
      const previousAnonymousJobs = queryClient.getQueryData<JobsQueryData>(['jobs', 'anonymous']);
      const previousRecommended = queryClient.getQueryData<TransformedJob[] | RecommendedJobsResponse>(['recommendedJobs']);
      const previousJobDetails = queryClient.getQueryData<TransformedJob>(['jobDetails', jobId]);
      const previousSavedJobs = queryClient.getQueryData<TransformedJob[]>(['savedJobs']);
      const previousAppliedJobs = queryClient.getQueryData<TransformedJob[]>(['appliedJobs']);

      const allQueries = queryClient.getQueryCache().getAll();
      const relatedJobsQueries = allQueries
        .filter(query => Array.isArray(query.queryKey) && query.queryKey[0] === 'relatedJobs')
        .map(query => ({
          queryKey: query.queryKey as any[],
          data: query.state.data as TransformedJob[] || []
        }));

      optimisticallyUpdate(jobId, newSavedState);

      return {
        previousData: {
          authenticatedJobs: previousAuthenticatedJobs,
          anonymousJobs: previousAnonymousJobs,
          recommended: previousRecommended,
          relatedJobs: relatedJobsQueries,
          jobDetails: previousJobDetails,
          savedJobs: previousSavedJobs,
          appliedJobs: previousAppliedJobs
        },
        jobId,
        previousSavedState: currentSavedState
      };
    },
    onError: (err, jobId, context) => {

      if (context?.previousData) {
        if (context.previousData.authenticatedJobs) {
          queryClient.setQueryData(['jobs', 'authenticated'], context.previousData.authenticatedJobs);
        }

        if (context.previousData.anonymousJobs) {
          queryClient.setQueryData(['jobs', 'anonymous'], context.previousData.anonymousJobs);
        }

        if (context.previousData.recommended !== undefined) {
          queryClient.setQueryData(['recommendedJobs'], context.previousData.recommended);
        }

        if (context.previousData.jobDetails !== undefined) {
          queryClient.setQueryData(['jobDetails', jobId], context.previousData.jobDetails);
        }

        if (context?.previousData.savedJobs) {
          queryClient.setQueryData(['savedJobs'], context.previousData.savedJobs);
        }
        if (context?.previousData.appliedJobs) {
          queryClient.setQueryData(['appliedJobs'], context.previousData.savedJobs);
        }
        // Rollback all related jobs queries
        context.previousData.relatedJobs.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error(
        (err as Error).message === 'Authentication required'
          ? 'Please login to save jobs'
          : 'Failed to save job'
      );
    },
    onSuccess: (data, jobId, context) => {
      toast.success(data.message);

      // Remove jobDetails invalidation to prevent reverting the optimistic update
      queryClient.invalidateQueries({ queryKey: ['jobs'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['recommendedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
      // In the onSuccess callback, change this line:
      queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId, !!session?.user.accessToken] });
    }
  });
};