// hooks/useUserProfile.ts
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface UserProfile {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  is_recruiter: boolean
  is_applicant: boolean
  has_resume: boolean
  has_company: boolean
  created_at: string
  updated_at: string
}

export const useUserProfile = () => {
  const { data: session } = useSession()

  return useQuery<UserProfile, Error>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/`,
        {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    },
    enabled: !!session?.user?.accessToken, // Only fetch when we have a token
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  })
}