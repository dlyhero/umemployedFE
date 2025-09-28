import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Define the user stats interface
export interface UserStats {
  profileViews: number;
  applications: number;
  jobMatches: number;
  skillEndorsements: number;
}

// API response interface (adjust based on your actual API response)
interface UserStatsResponse {
  profile_views: number;
  applications: number;
  job_matches: number;
  skill_endorsements: number;
}

// Base URL - adjust this to match your actual base URL

// Function to fetch user stats
const fetchUserStats = async (token: string): Promise<UserStats> => {
  try {
    const response = await axios.get<UserStatsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/resume/user-stats/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    
    // Transform the response to match our interface (snake_case to camelCase)
    return {
      profileViews: response.data.profile_views || 0,
      applications: response.data.applications || 0,
      jobMatches: response.data.job_matches || 0,
      skillEndorsements: response.data.skill_endorsements || 0,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Custom hook using React Query
export const useUserStats = () => {
  const { data: session, status } = useSession();

  return useQuery<UserStats, Error>({
    queryKey: ['userStats', session?.user.accessToken],
    queryFn: () => fetchUserStats(session?.user.accessToken as string),
    enabled: status === 'authenticated' && !!session?.user.accessToken, // Only run when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};