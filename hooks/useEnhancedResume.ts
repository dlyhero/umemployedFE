import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types - Updated to match official API
export interface EnhancedResume {
  id: number;
  user: number;
  job: number;
  full_name: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
  summary: string;
  skills: string[]; // Simplified to match API
  experience: EnhancedExperience[];
  education: EnhancedEducation[];
  certifications?: EnhancedCertification[];
  projects?: EnhancedProject[];
  languages?: EnhancedLanguage[];
  awards?: EnhancedAward[];
  publications?: EnhancedPublication[];
  volunteer_experience?: EnhancedVolunteerExperience[];
  interests?: string[];
  created_at: string;
}

export interface EnhancedExperience {
  id?: number;
  company: string;
  position: string;
  period?: string;
  start_date: string;
  end_date: string;
  description: string;
  location?: string;
  is_current?: boolean;
}

export interface EnhancedEducation {
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_year: number;
  location?: string;
  gpa?: string;
}

export interface EnhancedCertification {
  name: string;
  issuer: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
}

export interface EnhancedProject {
  name: string;
  description: string;
  technologies: string[];
  start_date?: string;
  end_date?: string;
  url?: string;
}

export interface EnhancedLanguage {
  name: string;
  proficiency: string;
}

export interface EnhancedAward {
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface EnhancedPublication {
  title: string;
  publisher: string;
  publication_date: string;
  url?: string;
  authors?: string[];
}

export interface EnhancedVolunteerExperience {
  organization: string;
  role: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface EnhancedBasicInfo {
  full_name: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
  summary: string;
}

export interface EnhancedSkills {
  technical: string[];
  soft_skills: string[];
  tools: string[];
}

export interface EnhancementHistory {
  id: number;
  job_title: string;
  job_id: number;
  company: string;
  summary: string;
  created_at: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface UploadResponse {
  message: string;
  status: 'completed';
  enhanced_resume: EnhancedResume;
}

export interface EnhancementStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  task_id: string;
  created_at: string;
  updated_at: string;
  last_updated_timestamp: number;
  message: string;
  enhanced_resume?: EnhancedResume;
  error_message?: string;
}

export const useEnhancedResume = (userId?: number, jobId?: number) => {
  const { data: session } = useSession();

  return useQuery<EnhancedResume | null, AxiosError>({
    queryKey: ['enhancedResume', userId, jobId],
    queryFn: async (): Promise<EnhancedResume | null> => {
      try {
        const response = await axios.get<EnhancedResume>(
          `${API_URL}/resume/check-enhanced-resume/${userId}/${jobId}/`,
          {
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
          }
        );
        return response.data;
      } catch (error: any) {
        // Handle 404 as "no enhanced resume exists" rather than an error
        if (error.response?.status === 404) {
          console.log(`No enhanced resume found for user ${userId} and job ${jobId}`);
          return null;
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: !!session?.user.accessToken && !!userId && !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if enhanced resume doesn't exist
  });
};

// Helper hook to check if enhanced resume exists (returns boolean)
export const useEnhancedResumeExists = (userId?: number, jobId?: number) => {
  const { data: enhancedResume, isLoading, error } = useEnhancedResume(userId, jobId);
  
  return {
    exists: !!enhancedResume,
    isLoading,
    error,
    enhancedResume,
  };
};

export const useEnhancementHistory = () => {
  const { data: session } = useSession();

  return useQuery<EnhancementHistory[], AxiosError>({
    queryKey: ['enhancementHistory'],
    queryFn: async (): Promise<EnhancementHistory[]> => {
      const response = await axios.get<EnhancementHistory[]>(
        `${API_URL}/resume/enhancement-history/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUploadResume = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, AxiosError, { file: File; jobId: number }>({
    mutationFn: async ({ file, jobId }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<UploadResponse>(
        `${API_URL}/resume/enhance-resume/${jobId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, { jobId }) => {
      // Cache the enhanced resume immediately since we get it in the response
      queryClient.setQueryData(
        ['enhancedResume', session?.user.id, jobId],
        data.enhanced_resume
      );
      
      // Invalidate enhancement history to include the new enhanced resume
      queryClient.invalidateQueries({ 
        queryKey: ['enhancementHistory'] 
      });
    },
  });
};

// Check enhancement status (legacy/optional - no longer needed for new enhancements)
export const useEnhancementStatus = (taskId?: string) => {
  const { data: session } = useSession();

  return useQuery<EnhancementStatus, AxiosError>({
    queryKey: ['enhancementStatus', taskId],
    queryFn: async (): Promise<EnhancementStatus> => {
      const response = await axios.get<EnhancementStatus>(
        `${API_URL}/resume/enhancement-status/${taskId}/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken && !!taskId,
    // No polling needed - enhancement is now synchronous
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get Enhanced Resume Details by ID
export const useEnhancedResumeById = (resumeId?: number) => {
  const { data: session } = useSession();

  return useQuery<EnhancedResume, AxiosError>({
    queryKey: ['enhancedResumeById', resumeId],
    queryFn: async (): Promise<EnhancedResume> => {
      const response = await axios.get<EnhancedResume>(
        `${API_URL}/resume/enhanced-resume/${resumeId}/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken && !!resumeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update Enhanced Resume
export const useUpdateEnhancedResume = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<EnhancedResume, AxiosError, { resumeId: number; data: Partial<EnhancedResume> }>({
    mutationFn: async ({ resumeId, data }) => {
      const response = await axios.put<EnhancedResume>(
        `${API_URL}/resume/enhanced-resume/${resumeId}/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, { resumeId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['enhancedResumeById', resumeId] });
      queryClient.invalidateQueries({ queryKey: ['enhancedResume', data.user, data.job] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// ===== SECTION-SPECIFIC HOOKS =====

// Enhanced Experiences
export const useEnhancedExperiences = () => {
  const { data: session } = useSession();

  return useQuery<{ experiences: EnhancedExperience[] }, AxiosError>({
    queryKey: ['enhancedExperiences'],
    queryFn: async () => {
      const response = await axios.get<{ experiences: EnhancedExperience[] }>(
        `${API_URL}/resume/enhanced-experiences/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedExperiences = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string; experiences: EnhancedExperience[] }, AxiosError, { experiences: EnhancedExperience[] }>({
    mutationFn: async ({ experiences }) => {
      const response = await axios.put<{ message: string; experiences: EnhancedExperience[] }>(
        `${API_URL}/resume/enhanced-experiences/`,
        { experiences },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedExperiences'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Basic Info
export const useEnhancedBasicInfo = () => {
  const { data: session } = useSession();

  return useQuery<EnhancedBasicInfo, AxiosError>({
    queryKey: ['enhancedBasicInfo'],
    queryFn: async () => {
      const response = await axios.get<EnhancedBasicInfo>(
        `${API_URL}/resume/enhanced-basic-info/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedBasicInfo = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, Partial<EnhancedBasicInfo>>({
    mutationFn: async (data) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-basic-info/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedBasicInfo'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Skills
export const useEnhancedSkills = () => {
  const { data: session } = useSession();

  return useQuery<EnhancedSkills, AxiosError>({
    queryKey: ['enhancedSkills'],
    queryFn: async () => {
      const response = await axios.get<EnhancedSkills>(
        `${API_URL}/resume/enhanced-skills/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedSkills = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string; skills_count: number }, AxiosError, EnhancedSkills>({
    mutationFn: async (skills) => {
      const response = await axios.put<{ message: string; skills_count: number }>(
        `${API_URL}/resume/enhanced-skills/`,
        { skills },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedSkills'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Education
export const useEnhancedEducation = () => {
  const { data: session } = useSession();

  return useQuery<{ education: EnhancedEducation[] }, AxiosError>({
    queryKey: ['enhancedEducation'],
    queryFn: async () => {
      const response = await axios.get<{ education: EnhancedEducation[] }>(
        `${API_URL}/resume/enhanced-education/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedEducation = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { education: EnhancedEducation[] }>({
    mutationFn: async ({ education }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-education/`,
        { education },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedEducation'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Certifications
export const useEnhancedCertifications = () => {
  const { data: session } = useSession();

  return useQuery<{ certifications: EnhancedCertification[] }, AxiosError>({
    queryKey: ['enhancedCertifications'],
    queryFn: async () => {
      const response = await axios.get<{ certifications: EnhancedCertification[] }>(
        `${API_URL}/resume/enhanced-certifications/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedCertifications = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { certifications: EnhancedCertification[] }>({
    mutationFn: async ({ certifications }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-certifications/`,
        { certifications },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedCertifications'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Projects
export const useEnhancedProjects = () => {
  const { data: session } = useSession();

  return useQuery<{ projects: EnhancedProject[] }, AxiosError>({
    queryKey: ['enhancedProjects'],
    queryFn: async () => {
      const response = await axios.get<{ projects: EnhancedProject[] }>(
        `${API_URL}/resume/enhanced-projects/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedProjects = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { projects: EnhancedProject[] }>({
    mutationFn: async ({ projects }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-projects/`,
        { projects },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Languages
export const useEnhancedLanguages = () => {
  const { data: session } = useSession();

  return useQuery<{ languages: EnhancedLanguage[] }, AxiosError>({
    queryKey: ['enhancedLanguages'],
    queryFn: async () => {
      const response = await axios.get<{ languages: EnhancedLanguage[] }>(
        `${API_URL}/resume/enhanced-languages/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedLanguages = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { languages: EnhancedLanguage[] }>({
    mutationFn: async ({ languages }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-languages/`,
        { languages },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Awards
export const useEnhancedAwards = () => {
  const { data: session } = useSession();

  return useQuery<{ awards: EnhancedAward[] }, AxiosError>({
    queryKey: ['enhancedAwards'],
    queryFn: async () => {
      const response = await axios.get<{ awards: EnhancedAward[] }>(
        `${API_URL}/resume/enhanced-awards/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedAwards = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { awards: EnhancedAward[] }>({
    mutationFn: async ({ awards }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-awards/`,
        { awards },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedAwards'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Publications
export const useEnhancedPublications = () => {
  const { data: session } = useSession();

  return useQuery<{ publications: EnhancedPublication[] }, AxiosError>({
    queryKey: ['enhancedPublications'],
    queryFn: async () => {
      const response = await axios.get<{ publications: EnhancedPublication[] }>(
        `${API_URL}/resume/enhanced-publications/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedPublications = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { publications: EnhancedPublication[] }>({
    mutationFn: async ({ publications }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-publications/`,
        { publications },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedPublications'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Volunteer Experience
export const useEnhancedVolunteerExperience = () => {
  const { data: session } = useSession();

  return useQuery<{ volunteer_experience: EnhancedVolunteerExperience[] }, AxiosError>({
    queryKey: ['enhancedVolunteerExperience'],
    queryFn: async () => {
      const response = await axios.get<{ volunteer_experience: EnhancedVolunteerExperience[] }>(
        `${API_URL}/resume/enhanced-volunteer-experience/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedVolunteerExperience = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { volunteer_experience: EnhancedVolunteerExperience[] }>({
    mutationFn: async ({ volunteer_experience }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-volunteer-experience/`,
        { volunteer_experience },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedVolunteerExperience'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};

// Enhanced Interests
export const useEnhancedInterests = () => {
  const { data: session } = useSession();

  return useQuery<{ interests: string[] }, AxiosError>({
    queryKey: ['enhancedInterests'],
    queryFn: async () => {
      const response = await axios.get<{ interests: string[] }>(
        `${API_URL}/resume/enhanced-interests/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateEnhancedInterests = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, { interests: string[] }>({
    mutationFn: async ({ interests }) => {
      const response = await axios.put<{ message: string }>(
        `${API_URL}/resume/enhanced-interests/`,
        { interests },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedInterests'] });
      queryClient.invalidateQueries({ queryKey: ['enhancementHistory'] });
    },
  });
};