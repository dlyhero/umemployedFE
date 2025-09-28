// @/hooks/useCompanies.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the raw company interface based on your API response
export interface RawCompany {
  id: number;
  name: string;
  description?: string;
  available_jobs: number;
  // Add other fields that might be available in the future
}

// Transformed company interface
export interface Company {
  id: number;
  name: string;
  description?: string;
  availableJobs: number;
  // We'll add placeholder properties for UI purposes
  industry?: string;
  location?: string;
  logo?: string;
}

// Transform function for companies
export const transformCompanies = (companies: RawCompany[]): Company[] => {
  return companies.map(company => ({
    id: company.id,
    name: company.name,
    description: company.description,
    availableJobs: company.available_jobs,
    // Add placeholder data for UI (these would come from the API in a real scenario)
    industry: getIndustryFromName(company.name),
    location: getLocationFromName(company.name),
  }));
};

// Helper functions to generate placeholder data
const getIndustryFromName = (name: string): string => {
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 
    'Manufacturing', 'Retail', 'Hospitality', 'Construction'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % industries.length;
  return industries[index];
};

const getLocationFromName = (name: string): string => {
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
    'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Remote'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % locations.length;
  return locations[index];
};

const fetchAllCompanies = async (): Promise<RawCompany[]> => {
  try {
    const response = await axios.get<RawCompany[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/company/companies/`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: fetchAllCompanies,
    select: (companies) => {
      const transformedCompanies = transformCompanies(companies);
      return {
        allCompanies: transformedCompanies,
        totalCount: companies.length
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
};

export default useCompanies;