// @/hooks/jobs/useJobOptions.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Simple interface for job options
export interface JobOptions {
  categories?: Array<{
    id: number;
    name: string;
    db_id: number;
    job_count: number;
  }>;
  salary_ranges?: Record<string, any>;
  experience_levels?: Record<string, any>;
  job_location_types?: Record<string, any>;
  job_types?: Record<string, any>;
  weekly_ranges?: Record<string, any>;
  shifts?: Record<string, any>;
  levels?: Record<string, any>;
  locations?: Array<{
    code: string;
    name: string;
    flag_url: string;
  }>;
}

const fetchJobOptions = async (): Promise<JobOptions> => {
  try {
    const response = await axios.get<JobOptions>(
      `${process.env.NEXT_PUBLIC_API_URL}/job/job-options/`
    );
    return response.data;
  } catch (error) {
    console.warn('Job options API not available, using fallback data');
    // Return empty object to use fallback data
    return {};
  }
};

const useJobOptions = () => {
  return useQuery({
    queryKey: ['job-options'],
    queryFn: fetchJobOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false,
  });
};

export default useJobOptions;
