import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// Types - Updated to match actual API response and usage
export interface Question {
  id: number;
  question: string; // Changed from 'text' to 'question'
  options: string[]; // Made required since all questions have options
}

export interface SkillCategory {
  skill_id: number; // Changed from 'id' to 'skill_id'
  questions: Question[];
  // Removed 'name' and 'description' as they're not in the API response
}

export interface JobQuestionsResponse {
  job_title: string; // Changed from 'job_id' to 'job_title'
  total_time: number; // in seconds, not minutes
  questions_by_skill: Record<string, SkillCategory>; // Changed from 'categories' array to object
  // Removed 'total_questions' and 'estimated_time' as they're not in API response
}

// Fixed Answer interface to match actual usage in component
export interface Answer {
  question_id: number;
  answer: string | null; // Allow null for unanswered questions
  skill_id: number | null; // Add skill_id as used in component
}

// Fixed request interface to match API expectation
export interface SubmitAnswersRequest {
  responses: Answer[]; // Changed from 'answers' to 'responses' to match API
}

export interface SubmitAnswersResponse {
  message: string;
  submission_id: string;
  status: 'submitted' | 'draft';
  submitted_at: string;
}

// API functions - FIXED
const fetchJobQuestions = async (jobId: string, token?: string): Promise<JobQuestionsResponse> => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/questions/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const submitJobAnswers = async (
  jobId: string,
  data: SubmitAnswersRequest,
  token?: string
): Promise<SubmitAnswersResponse> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/questions/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Hooks - UPDATED
export const useJobQuestions = (jobId: string, enabled: boolean = true) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['jobQuestions', jobId],
    queryFn: () => fetchJobQuestions(jobId, session?.user.accessToken),
    enabled: !!jobId && !!session?.user.accessToken && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubmitJobAnswers = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: SubmitAnswersRequest }) =>
      submitJobAnswers(jobId, data, session?.user.accessToken),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['jobQuestions', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobDetail', variables.jobId] });
    },
  });
};