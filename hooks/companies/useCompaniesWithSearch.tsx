// @/hooks/companies/useCompaniesWithSearch.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

// Company search parameters interface matching backend API
export interface CompanySearchParams {
  search?: string;
  industry?: string;
  size?: string;
  country?: string;
  founded_year_min?: number;
  founded_year_max?: number;
  has_jobs?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Raw company interface from API
export interface RawCompany {
  id: number;
  name: string;
  industry: string;
  size: string;
  location: string;
  founded: number;
  website_url: string | null;
  country: string;
  contact_email: string | null;
  contact_phone: string | null;
  description: string;
  mission_statement: string;
  linkedin: string | null;
  video_introduction: string | null;
  logo: string;
  logo_url: string;
  cover_photo: string;
  cover_photo_url: string;
  job_openings: number | null;
  job_count: number;
  created_at: string;
  updated_at: string;
}

// Transformed company interface for UI
export interface TransformedCompany {
  id: number;
  name: string;
  industry: string;
  size: string;
  location: string;
  founded: number;
  websiteUrl: string | null;
  country: string;
  contactEmail: string | null;
  contactPhone: string | null;
  description: string;
  missionStatement: string;
  linkedin: string | null;
  videoIntroduction: string | null;
  logo: string;
  logoUrl: string;
  coverPhoto: string;
  coverPhotoUrl: string;
  jobOpenings: number | null;
  jobCount: number;
  availableJobs: number; // Alias for jobCount for backward compatibility
  createdAt: string;
  updatedAt: string;
}

interface CompaniesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawCompany[];
}

// Transform function
export const transformCompanies = (companies: RawCompany[]): TransformedCompany[] => {
  return companies.map(company => ({
    id: company.id,
    name: company.name,
    industry: company.industry,
    size: company.size,
    location: company.location,
    founded: company.founded,
    websiteUrl: company.website_url,
    country: company.country,
    contactEmail: company.contact_email,
    contactPhone: company.contact_phone,
    description: company.description,
    missionStatement: company.mission_statement,
    linkedin: company.linkedin,
    videoIntroduction: company.video_introduction,
    logo: company.logo,
    logoUrl: company.logo_url,
    coverPhoto: company.cover_photo,
    coverPhotoUrl: company.cover_photo_url,
    jobOpenings: company.job_openings,
    jobCount: company.job_count,
    availableJobs: company.job_count, // Backward compatibility
    createdAt: company.created_at,
    updatedAt: company.updated_at
  }));
};

const fetchCompaniesWithSearch = async (
  params: CompanySearchParams = {},
  accessToken?: string
): Promise<CompaniesResponse> => {
  try {
    const headers: any = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Build query parameters
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/company/list-companies/${queryString ? `?${queryString}` : ''}`;


    const response = await axios.get(url, { headers });
    
    // Check if response is paginated object or direct array
    if (Array.isArray(response.data)) {
      // Direct array response
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data
      };
    } else {
      // Paginated response
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching companies with search:', error);
    throw error;
  }
};

const useCompaniesWithSearch = (params: CompanySearchParams = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['companies-search', params, session?.user?.accessToken ? 'authenticated' : 'anonymous'],
    queryFn: () => fetchCompaniesWithSearch(params, session?.user?.accessToken),
    select: (data) => {
      const transformedCompanies = transformCompanies(data.results || []);
      
      return {
        companies: transformedCompanies,
        totalCount: data.count,
        hasNextPage: !!data.next,
        hasPreviousPage: !!data.previous,
        nextPage: data.next,
        previousPage: data.previous
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    gcTime: 1000 * 60 * 5, // 5 minutes cache time
    enabled: true, // Always fetch
    refetchOnWindowFocus: false,
    retry: 1
  });
};

export default useCompaniesWithSearch;
