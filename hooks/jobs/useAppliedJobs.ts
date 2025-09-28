import { RawJob, TransformedJob, transformJob } from '@/utility/jobTransformer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useSaveJob } from './useSavedJobs';

interface AppliedJobsParams {
    page?: number;
}

// Interface for applied job response
interface AppliedJobResponse {
    id: number;
    job: number;
    quiz_score: number;
    matching_percentage: number;
    status: string;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAppliedJobs = (params: AppliedJobsParams = {}) => {
    const { data: session } = useSession();
    const { page = 1 } = params;
    const queryClient = useQueryClient();
    const { mutate: saveJob } = useSaveJob();

    const {
        data: appliedJobsData,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<TransformedJob[], AxiosError>({
        queryKey: ['appliedJobs', page],
        queryFn: async () => {
            // First, get the applied jobs to get the job IDs
            const appliedResponse = await axios.get<AppliedJobResponse[]>(`${API_URL}/job/applied-jobs/`, {
                headers: {
                    Authorization: `Bearer ${session?.user.accessToken}`,
                },
                params: {
                    page,
                },
            });

            // Extract job IDs from applied jobs
            const jobIds = appliedResponse.data.map(appliedJob => appliedJob.job);

            // Fetch and transform job details for each applied job
            const transformedJobs = await Promise.all(
                jobIds.map(async (jobId) => {
                    try {
                        const jobResponse = await axios.get<RawJob>(`${API_URL}/job/jobs/${jobId}/`, {
                            headers: {
                                Authorization: `Bearer ${session?.user.accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        // Transform the raw job data using your transformer
                        return transformJob(jobResponse.data);
                    } catch (error) {
                        // If job details can't be fetched, return null
                        console.error(`Failed to fetch job details for job ${jobId}:`, error);
                        return null;
                    }
                })
            );

            // Filter out jobs where details couldn't be fetched
            return transformedJobs.filter(job => job !== null) as TransformedJob[];
        },
        enabled: !!session?.user.accessToken,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    // Function to handle saving/unsaving jobs from the applied jobs list
    const handleSaveJob = (jobId: number) => {
        saveJob(jobId, {
            onSuccess: () => {
                // Optimistically update the applied jobs list
                queryClient.setQueryData<TransformedJob[]>(['appliedJobs', page], (old) => {
                    if (!old) return old;
                    return old.map(job => 
                        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
                    );
                });
            }
        });
    };

    return {
        appliedJobs: appliedJobsData || [],
        totalCount: appliedJobsData?.length || 0,
        hasNext: false, // Adjust based on your pagination
        hasPrevious: false, // Adjust based on your pagination
        isLoading,
        isError,
        error,
        refetch,
        handleSaveJob
    };
};