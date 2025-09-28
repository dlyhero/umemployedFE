// @/hooks/useCompanyDetails.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

// Define the company details interface based on API response
export interface CompanyDetails {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
  founded?: number;
  website_url?: string;
  country?: string;
  contact_email?: string;
  contact_phone?: string;
  mission_statement?: string;
  linkedin?: string;
  video_introduction?: string;
  logo?: string;
  cover_photo?: string;
  job_openings?: string;
  created_at?: string;
  updated_at?: string;
}

const fetchCompanyDetails = async (companyId: string, accessToken?: string): Promise<CompanyDetails> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('🔍 Fetching company details:', {
      companyId,
      apiUrl: `${apiUrl}/company/company-details/${companyId}/`,
      hasToken: !!accessToken
    });

    const headers: any = {
      'Content-Type': 'application/json'
    };

    // Only add authorization header if we have a token
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.get<CompanyDetails>(
      `${apiUrl}/company/company-details/${companyId}/`,
      { headers }
    );
    
    console.log('✅ Company details response:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching company details:', {
      companyId,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

const useCompanyDetails = (companyId: string) => {
  const { data: session, status } = useSession();
  
  console.log('🔍 useCompanyDetails hook called:', {
    companyId,
    hasSession: !!session,
    status,
    hasAccessToken: !!session?.user?.accessToken,
    companyIdFromSession: session?.user?.companyId
  });
  
  return useQuery({
    queryKey: ['companyDetails', companyId, session?.user?.accessToken],
    queryFn: () => fetchCompanyDetails(companyId, session?.user?.accessToken),
    enabled: !!companyId, // Only require companyId, not authentication
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export { useCompanyDetails };
export default useCompanyDetails;