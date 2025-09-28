import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

// Types
export interface Country {
  code: string;
  name: string;
  flag_url: string;
}

interface CountriesResponse {
  countries: Country[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useCountries = () => {
  const { data: session } = useSession();

  const {
    data: countriesResponse,
    isLoading,
    isError,
    error
  } = useQuery<CountriesResponse, AxiosError>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resume/countries/`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      console.log('Fetched countries:', response.data);
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (countries don't change often)
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });

  return {
    countries: countriesResponse?.countries || [],
    isLoading,
    isError,
    error,
  };
};