import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface CompanyJob {
  id: number;
  title: string;
  application_count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchCompanyJobs = async (companyId: string, accessToken?: string): Promise<CompanyJob[]> => {
  try {
    const headers: any = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    
    const response = await axios.get<CompanyJob[]>(
      `${API_URL}/company/company/${companyId}/jobs/`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    throw error;
  }
};

const useCompanyJobs = (companyId: string) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['companyJobs', companyId],
    queryFn: () => fetchCompanyJobs(companyId, session?.user?.accessToken),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export default useCompanyJobs;