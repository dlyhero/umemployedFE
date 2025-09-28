"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

interface ResumeAnalysisResult {
  overall_score: number;
  criteria_scores: {
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
  };
  improvement_suggestions: {
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
  };
}

export default function ResumeAnalysisResultsPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('resumeAnalysisResult');
    if (storedResult) {
      setAnalysisResult(JSON.parse(storedResult));
    } else {
      // Redirect back to resume advisor if no analysis result is found
      router.push('/applicant/resume-advisor');
    }
  }, [router]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 80) return 'bg-blue-100 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getProgressBarColor = (score: number): string => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatCriteriaName = (key: string): string => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCriteriaIcon = (key: string): string => {
    const iconMap: Record<string, string> = {
      structure_formatting: 'heroicons:squares-2x2',
      clarity_conciseness: 'heroicons:eye',
      professional_tone: 'heroicons:briefcase',
      grammar_spelling: 'heroicons:check-circle',
      achievements_metrics: 'heroicons:chart-bar',
      relevance_to_job: 'heroicons:target',
      keywords_ats_optimization: 'heroicons:magnifying-glass',
      work_experience_detail: 'heroicons:clock',
      education_certifications: 'heroicons:academic-cap',
      skills_section_effectiveness: 'heroicons:cog-6-tooth',
      action_verbs_language: 'heroicons:chat-bubble-left-ellipsis',
      consistency_flow: 'heroicons:arrow-path',
      contact_information_completeness: 'heroicons:phone',
      customization_for_specific_job: 'heroicons:pencil-square',
      overall_impact_readability: 'heroicons:star'
    };
    return iconMap[key] || 'heroicons:document-text';
  };

  const getOverallPerformance = (score: number): { label: string; color: string; icon: string } => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', icon: 'heroicons:face-smile' };
    if (score >= 80) return { label: 'Good', color: 'text-blue-600', icon: 'heroicons:hand-thumb-up' };
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-600', icon: 'heroicons:minus-circle' };
    if (score >= 60) return { label: 'Needs Work', color: 'text-orange-600', icon: 'heroicons:exclamation-triangle' };
    return { label: 'Poor', color: 'text-red-600', icon: 'heroicons:x-circle' };
  };

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="line-md:loading-twotone-loop" className="animate-spin w-8 h-8 text-brand" />
      </div>
    );
  }

  const performance = getOverallPerformance(analysisResult.overall_score);

  return (
    <div className="rounded-2xl p-0 md:p-8 lg:p-16 min-h-screen">
      <div className="container mx-auto px-4 py-3">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-brand transition-colors"
              >
                <Icon icon="heroicons:arrow-left" className="w-6 h-6" />
              </button>
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900">Resume Analysis Results</h2>
            </div>
            <p className="text-gray-600 px-2">
              Detailed breakdown of your resume analysis with personalized improvement suggestions.
            </p>
          </div>

          {/* Overall Score Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
            <div className="p-4 md:p-10">
              <div className="text-center py-8 px-4 bg-gradient-to-r from-brand/10 to-brand/5 rounded-xl">
                <Icon icon={performance.icon} className="w-16 h-16 text-brand mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Overall Resume Score</h3>
                <div className={`text-6xl md:text-7xl font-bold mb-2 ${getScoreColor(analysisResult.overall_score)}`}>
                  {analysisResult.overall_score}
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                <div className={`text-xl font-semibold ${performance.color}`}>
                  {performance.label}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Criteria Scores */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
            <div className="p-4 md:p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h3>
              <div className="grid gap-6">
                {Object.entries(analysisResult.criteria_scores).map(([key, score]) => (
                  <div key={key} className={`p-6 rounded-xl border-2 ${getScoreBackground(score)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Icon icon={getCriteriaIcon(key)} className="w-6 h-6 text-brand" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {formatCriteriaName(key)}
                          </h4>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(score)} bg-white`}>
                        {score}%
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(score)}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Improvement Suggestion */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Icon icon="heroicons:light-bulb" className="w-4 h-4 text-yellow-500 mr-2" />
                        Improvement Suggestion
                      </h5>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {analysisResult.improvement_suggestions[key as keyof typeof analysisResult.improvement_suggestions]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary and Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Icon icon="heroicons:arrow-trending-up" className="w-5 h-5 text-green-500 mr-2" />
                    Strengths to Maintain
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(analysisResult.criteria_scores)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([key, score]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700">{formatCriteriaName(key)}</span>
                          <span className="font-semibold text-green-600">{score}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Icon icon="heroicons:arrow-trending-down" className="w-5 h-5 text-orange-500 mr-2" />
                    Priority Improvements
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(analysisResult.criteria_scores)
                      .sort(([,a], [,b]) => a - b)
                      .slice(0, 3)
                      .map(([key, score]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="text-gray-700">{formatCriteriaName(key)}</span>
                          <span className="font-semibold text-orange-600">{score}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push('/applicant/resume-advisor')}
                  className="px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand/90 transition-colors duration-200"
                >
                  Analyze Another Resume
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 text-brand bg-brand/10 hover:bg-brand/20 rounded-full font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  <Icon icon="heroicons:printer" className="w-5 h-5 mr-2" />
                  Print Results
                </button>
                <button
                  onClick={() => router.push('/applicant/dashboard')}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}