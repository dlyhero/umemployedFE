// hooks/jobs/useCreateJob/useExtractedSkills.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export const useExtractedSkills = (jobId: string | null) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['extracted-skills', jobId],
    queryFn: async () => {
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (session?.user?.accessToken) {
        headers.Authorization = `Bearer ${session.user.accessToken}`;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/job/jobs/${jobId}/extracted-skills/`,
        { headers }
      );
      
      return response.data;
    },
    enabled: !!jobId, // Only fetch when jobId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};