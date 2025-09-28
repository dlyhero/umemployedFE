"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useResumeAnalysisHistory, ResumeAnalysisHistoryItem } from '@/hooks/profile/useResumeAnalysisHistory';

export default function ResumeAnalysisHistoryPage() {
  const router = useRouter();
  const { data: historyData, isLoading, error } = useResumeAnalysisHistory();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const handleViewAnalysis = (analysis: ResumeAnalysisHistoryItem): void => {
    // Store the analysis result in sessionStorage for the results page
    sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(analysis));
    router.push('/applicant/resume-advisor/results');
  };

  const hasValidAnalysis = (analysis: ResumeAnalysisHistoryItem): boolean => {
    return analysis.overall_score > 0 && 
           Object.keys(analysis.criteria_scores).length > 0 && 
           Object.keys(analysis.improvement_suggestions).length > 0;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl p-0 md:p-8 lg:p-16 min-h-screen">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center min-h-[400px]">
            <Icon icon="line-md:loading-twotone-loop" className="animate-spin w-8 h-8 text-brand" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-0 md:p-8 lg:p-16 min-h-screen">
        <div className="container mx-auto px-4 py-3">
          <div className="text-center py-12">
            <Icon icon="heroicons:exclamation-triangle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading History</h3>
            <p className="text-gray-500 mb-4">Unable to load your analysis history. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-brand text-white rounded-full hover:bg-brand/90 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validAnalyses = historyData?.filter(hasValidAnalysis) || [];

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
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900">Analysis History</h2>
            </div>
            <p className="text-gray-600 px-2">
              View your past resume analyses and track your improvement over time.
            </p>
          </div>

          {/* History List */}
          {validAnalyses.length > 0 ? (
            <div className="space-y-4">
              {validAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${getScoreBackground(analysis.overall_score)}`}
                  onClick={() => handleViewAnalysis(analysis)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getScoreColor(analysis.overall_score)} bg-white`}>
                          {analysis.overall_score}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Resume Analysis #{analysis.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(analysis.analyzed_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Structure</div>
                          <div className="font-semibold text-gray-900">
                            {analysis.criteria_scores.structure_formatting || 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Content</div>
                          <div className="font-semibold text-gray-900">
                            {analysis.criteria_scores.clarity_conciseness || 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Experience</div>
                          <div className="font-semibold text-gray-900">
                            {analysis.criteria_scores.work_experience_detail || 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Skills</div>
                          <div className="font-semibold text-gray-900">
                            {analysis.criteria_scores.skills_section_effectiveness || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Icon icon="heroicons:chevron-right" className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Icon icon="heroicons:document-text" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Analysis History</h3>
              <p className="text-gray-500 mb-6">You haven't analyzed any resumes yet. Start by uploading your first resume for analysis.</p>
              <Link
                href="/applicant/resume-advisor"
                className="inline-flex items-center px-6 py-3 bg-brand text-white rounded-full hover:bg-brand/90 transition-colors duration-200"
              >
                <Icon icon="heroicons:arrow-up-tray" className="w-5 h-5 mr-2" />
                Analyze Resume
              </Link>
            </div>
          )}

          {/* Back to Resume Advisor */}
          <div className="mt-8 text-center">
            <Link
              href="/applicant/resume-advisor"
              className="inline-flex items-center px-6 py-3 text-brand bg-brand/10 hover:bg-brand/20 rounded-full font-medium transition-colors duration-200"
            >
              <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
              Back to Resume Advisor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}