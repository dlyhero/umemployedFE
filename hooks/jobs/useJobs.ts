import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { transformJobs, RawJob } from "@/utility/jobTransformer";
import { useSession } from "next-auth/react";

// Assuming TransformedJob is the type returned by transformJobs
type TransformedJob = ReturnType<typeof transformJobs>[number];

const fetchAllJobs = async (accessToken?: string): Promise<RawJob[]> => {
  try {
    const headers: any = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const response = await axios.get<RawJob[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

const useJobs = () => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['jobs'], // Static key to avoid re-fetch on session change
    queryFn: () => fetchAllJobs(session?.user?.accessToken),
    select: (jobs) => {
      const transformedJobs = transformJobs(jobs);
      return {
        allJobs: transformedJobs,
        totalCount: jobs.length,
      };
    },
    staleTime: 1000 * 60 * 0.2, // 1 minute
    gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
  });
};

export default useJobs;