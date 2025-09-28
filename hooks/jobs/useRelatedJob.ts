import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { RawJob, TransformedJob, transformJob } from '@/utility/jobTransformer';
import { useSession } from 'next-auth/react';

const fetchRelatedJobs = async (jobId: number | string, token?: string): Promise<TransformedJob[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/${jobId}/similar-jobs/?page=1&page_size=5&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    const jobsArray = response.data;
    // Transform each job in the array
    return jobsArray.map((job: RawJob) => transformJob(job));
  } catch (error) {
    throw new Error('Failed to fetch related jobs');
  }
};

export const useRelatedJobs = (jobId: number | string): UseQueryResult<TransformedJob[], Error> => {
  const { data: session } = useSession();
  const token = session?.user.accessToken;
  
  return useQuery({
    // Fixed: Include jobId in the query key to make each query unique
    queryKey: ['relatedJobs', jobId],
    queryFn: () => fetchRelatedJobs(jobId, token),
    enabled: !!jobId, // Only run the query if jobId exists
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
};