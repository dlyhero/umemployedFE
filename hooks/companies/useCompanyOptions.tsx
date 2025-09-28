// @/hooks/companies/useCompanyOptions.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Company options interfaces
export interface IndustryOption {
  value: string;
  label: string;
  company_count: number;
}

export interface SizeOption {
  value: string;
  label: string;
  company_count: number;
}

export interface CountryOption {
  code: string;
  name: string;
  flag_url: string;
  company_count: number;
}

export interface CompanyOptionsResponse {
  industries: IndustryOption[];
  sizes: SizeOption[];
  countries: CountryOption[];
 founding_year_range: {
    min_year: number;
    max_year: number;
  };
}

const fetchCompanyOptions = async (): Promise<CompanyOptionsResponse> => {
  try {
    const response = await axios.get<CompanyOptionsResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/company/company-options/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching company options:', error);
    
    // Return fallback data if API fails
    return {
      industries: [
        { value: 'technology', label: 'Technology', company_count: 0 },
        { value: 'finance', label: 'Finance', company_count: 0 },
        { value: 'healthcare', label: 'Healthcare', company_count: 0 },
        { value: 'education', label: 'Education', company_count: 0 },
        { value: 'manufacturing', label: 'Manufacturing', company_count: 0 },
        { value: 'retail', label: 'Retail', company_count: 0 },
        { value: 'hospitality', label: 'Hospitality', company_count: 0 },
        { value: 'construction', label: 'Construction', company_count: 0 }
      ],
      sizes: [
        { value: '1-10', label: '1-10 employees', company_count: 0 },
        { value: '11-50', label: '11-50 employees', company_count: 0 },
        { value: '51-200', label: '51-200 employees', company_count: 0 },
        { value: '201-500', label: '201-500 employees', company_count: 0 },
        { value: '501-1000', label: '501-1000 employees', company_count: 0 },
        { value: '1001-5000', label: '1001-5000 employees', company_count: 0 },
        { value: '5001-10000', label: '5001-10000 employees', company_count: 0 },
        { value: '10000+', label: '10000+ employees', company_count: 0 }
      ],
      countries: [
        { code: 'US', name: 'United States', flag_url: '', company_count: 0 },
        { code: 'UK', name: 'United Kingdom', flag_url: '', company_count: 0 },
        { code: 'CA', name: 'Canada', flag_url: '', company_count: 0 },
        { code: 'DE', name: 'Germany', flag_url: '', company_count: 0 },
        { code: 'FR', name: 'France', flag_url: '', company_count: 0 },
        { code: 'AU', name: 'Australia', flag_url: '', company_count: 0 },
        { code: 'JP', name: 'Japan', flag_url: '', company_count: 0 },
        { code: 'SG', name: 'Singapore', flag_url: '', company_count: 0 }
      ],
      founding_year_range: {
        min_year: 1900,
        max_year: new Date().getFullYear()
      }
    };
  }
};

const useCompanyOptions = () => {
  return useQuery({
    queryKey: ['company-options'],
    queryFn: fetchCompanyOptions,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: false, // Don't retry on failure, use fallback data
    refetchOnWindowFocus: false
  });
};

export default useCompanyOptions;
