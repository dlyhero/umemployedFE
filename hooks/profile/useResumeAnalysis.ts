// @/hooks/profile/useResumeAnalysis.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CriteriaScores {
  structure_formatting: number;
  clarity_conciseness: number;
  professional_tone: number;
  grammar_spelling: number;
  achievements_metrics: number;
  relevance_to_job: number;
  keywords_ats_optimization: number;
  work_experience_detail: number;
  education_certifications: number;
  skills_section_effectiveness: number;
  action_verbs_language: number;
  consistency_flow: number;
  contact_information_completeness: number;
  customization_for_specific_job: number;
  overall_impact_readability: number;
}

interface ImprovementSuggestions {
  structure_formatting: string;
  clarity_conciseness: string;
  professional_tone: string;
  grammar_spelling: string;
  achievements_metrics: string;
  relevance_to_job: string;
  keywords_ats_optimization: string;
  work_experience_detail: string;
  education_certifications: string;
  skills_section_effectiveness: string;
  action_verbs_language: string;
  consistency_flow: string;
  contact_information_completeness: string;
  customization_for_specific_job: string;
  overall_impact_readability: string;
}

interface ResumeAnalysisResponse {
  overall_score: number;
  criteria_scores: CriteriaScores;
  improvement_suggestions: ImprovementSuggestions;
}

export const useResumeAnalysis = () => {
  const { data: session } = useSession();
  
  return useMutation<ResumeAnalysisResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/resume/resume-analysis/`, 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // You can handle progress updates here if needed
            }
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Resume analysis completed successfully!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to analyze resume. Please try again.'
      );
    },
  });
};

export default useResumeAnalysis;