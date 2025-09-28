// @/hooks/profile/useResumeAnalysisHistory.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface CriteriaScores {
  consistency_flow?: number;
  grammar_spelling?: number;
  relevance_to_job?: number;
  professional_tone?: number;
  clarity_conciseness?: number;
  achievements_metrics?: number;
  structure_formatting?: number;
  action_verbs_language?: number;
  work_experience_detail?: number;
  education_certifications?: number;
  keywords_ats_optimization?: number;
  overall_impact_readability?: number;
  skills_section_effectiveness?: number;
  customization_for_specific_job?: number;
  contact_information_completeness?: number;
}

interface ImprovementSuggestions {
  consistency_flow?: string;
  grammar_spelling?: string;
  relevance_to_job?: string;
  professional_tone?: string;
  clarity_conciseness?: string;
  achievements_metrics?: string;
  structure_formatting?: string;
  action_verbs_language?: string;
  work_experience_detail?: string;
  education_certifications?: string;
  keywords_ats_optimization?: string;
  overall_impact_readability?: string;
  skills_section_effectiveness?: string;
  customization_for_specific_job?: string;
  contact_information_completeness?: string;
}

export interface ResumeAnalysisHistoryItem {
  id: number;
  overall_score: number;
  criteria_scores: CriteriaScores;
  improvement_suggestions: ImprovementSuggestions;
  analyzed_at: string;
  user: number;
  resume: number;
}

const fetchResumeAnalysisHistory = async (accessToken: string): Promise<ResumeAnalysisHistoryItem[]> => {
  try {
    const response = await axios.get<ResumeAnalysisHistoryItem[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/resume/resume-analyses/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching resume analysis history:', error);
    throw error;
  }
};

export const useResumeAnalysisHistory = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['resumeAnalysisHistory', session?.user?.accessToken],
    queryFn: () => fetchResumeAnalysisHistory(session?.user?.accessToken as string),
    enabled: !!session?.user?.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
    refetchOnWindowFocus: false,
    retry: 1
  });
};

export default useResumeAnalysisHistory;