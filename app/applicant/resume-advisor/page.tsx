"use client";
import React, { useState, ChangeEvent, DragEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useResumeAnalysis } from '@/hooks/profile/useResumeAnalysis';
import Link from 'next/link';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement';
import UpgradeModal from '@/components/UpgradeModal';

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

export default function ResumeAdvisorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { mutate: analyzeResume, isPending: isAnalyzing } = useResumeAnalysis();

  const handleFileChange = (selectedFile: File | null): void => {
    if (selectedFile) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, Word document, or text file');
        return;
      }

      if (selectedFile.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setAnalysisResult(null); // Reset previous results
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!file) return;

    // Check if user has Standard or Premium plan
    if (!subscriptionStatus?.has_active_subscription || 
        (subscriptionStatus.tier !== 'standard' && subscriptionStatus.tier !== 'premium')) {
      setShowUpgradeModal(true);
      return;
    }

    setError('');

    const formData = new FormData();
    formData.append('file', file);

    analyzeResume(formData, {
      onSuccess: (data) => {
        setAnalysisResult(data);
        setFile(null); // Reset form after successful analysis
      },
      onError: (error) => {
        setError(error.message || 'Failed to analyze resume. Please try again.');
      }
    });
  };

  const removeFile = (): void => {
    setFile(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = (): void => {
    setFile(null);
    setError('');
    setAnalysisResult(null);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const formatCriteriaName = (key: string): string => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleViewDetailedResults = (): void => {
    // Store the analysis result in sessionStorage for the results page
    if (analysisResult) {
      sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(analysisResult));
      router.push('/applicant/resume-advisor/results');
    }
  };

  return (
    <div className="rounded-2xl p-0 md:p-8 lg:p-16 min-h-screen">
      <div className="container mx-auto px-4 py-3">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-2">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-2">Resume Advisor</h2>
                <p className="text-gray-600">
                  Upload your resume to receive personalized improvement suggestions and comprehensive analysis from our AI-powered advisor.
                </p>
              </div>
              <Link
                href="/applicant/resume-advisor/history"
                className="inline-flex items-center px-4 py-2 text-brand bg-brand/10 hover:bg-brand/20 rounded-lg font-medium transition-colors duration-200"
              >
                <Icon icon="heroicons:clock" className="w-5 h-5 mr-2" />
                View History
              </Link>
            </div>
          </div>

          {/* Quick Results Section */}
          {analysisResult && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-4 md:p-10">
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center py-8 px-4 bg-gradient-to-r from-brand/10 to-brand/5 rounded-xl">
                    <Icon icon="heroicons:chart-bar" className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Resume Score</h3>
                    <div className={`text-6xl md:text-7xl font-bold mb-4 ${getScoreColor(analysisResult.overall_score)}`}>
                      {analysisResult.overall_score}
                      <span className="text-2xl text-gray-500">/100</span>
                    </div>
                  </div>

                  {/* Top 3 Areas to Improve */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon icon="heroicons:light-bulb" className="w-6 h-6 text-yellow-500 mr-2" />
                      Top Areas for Improvement
                    </h4>
                    <div className="grid gap-4">
                      {Object.entries(analysisResult.criteria_scores)
                        .sort(([,a], [,b]) => a - b)
                        .slice(0, 3)
                        .map(([key, score]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{formatCriteriaName(key)}</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {analysisResult.improvement_suggestions[key as keyof typeof analysisResult.improvement_suggestions]}
                              </p>
                            </div>
                            <div className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getScoreBackground(score)} ${getScoreColor(score)}`}>
                              {score}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={handleViewDetailedResults}
                      className="px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand/90 transition-colors duration-200"
                    >
                      View Detailed Results
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 text-brand bg-brand/10 hover:bg-brand/20 rounded-full font-medium transition-colors duration-200"
                    >
                      Analyze Another Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Card */}
          {!analysisResult && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* File Upload Area */}
                  <div className="space-y-4">
                    <label className="block text-xl text-brand">
                      Upload Resume
                    </label>

                    {!file ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                          dragActive
                            ? 'border-brand/10 bg-brand/10'
                            : 'border-gray-300 hover:border-brand/30 hover:bg-gray-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="resume-upload"
                        />

                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-brand/10 rounded-lg flex items-center justify-center mx-auto">
                            <Icon icon="heroicons:document-text" className="w-8 h-8 text-brand" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              Drag & drop your resume here
                            </p>
                            <p className="text-gray-500 mb-4">or</p>
                            <button
                              type="button"
                              className="inline-flex items-center px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand2 transition-colors duration-200"
                            >
                              <Icon icon="heroicons:arrow-up-tray" className="w-5 h-5 mr-2" />
                              Browse Files
                            </button>
                          </div>

                          <p className="text-sm text-gray-500">
                            Supported formats: PDF, DOC, DOCX, TXT • Maximum size: 10MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center">
                                <Icon icon="heroicons:document-text" className="w-6 h-6 text-brand" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          {!isAnalyzing && (
                            <button
                              type="button"
                              onClick={removeFile}
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                      disabled={isAnalyzing}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!file || isAnalyzing}
                      className="px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    >
                      {isAnalyzing ? (
                        <>
                          <Icon icon="line-md:loading-twotone-loop" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Analyzing Resume...
                        </>
                      ) : (
                        <>
                          <Icon icon="heroicons:chart-bar-square" className="w-5 h-5 mr-2" />
                          Analyze My Resume
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-8 bg-white p-4 md:p-8 rounded-lg border border-gray-100">
            <h3 className='text-brand text-xl flex items-center mb-4'>
              <Icon icon="heroicons:information-circle" className="w-6 h-6 mr-2" />
              Why Use Resume Advisor?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Comprehensive Analysis</h4>
                    <p className="text-gray-600 text-sm">Get detailed scores across 15 key criteria including formatting, content quality, and ATS optimization.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized Suggestions</h4>
                    <p className="text-gray-600 text-sm">Receive specific, actionable recommendations to improve each section of your resume.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">ATS Optimization</h4>
                    <p className="text-gray-600 text-sm">Ensure your resume passes through Applicant Tracking Systems with keyword and formatting guidance.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional Standards</h4>
                    <p className="text-gray-600 text-sm">Align your resume with industry best practices and professional standards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Resume Advisor"
        description="AI-powered resume analysis requires a Standard or Premium subscription. Get detailed feedback and improvement suggestions for your resume."
      />
    </div>
  );
}