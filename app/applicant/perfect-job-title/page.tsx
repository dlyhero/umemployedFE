"use client";
import React, { useState, ChangeEvent, DragEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useUploadTranscript } from '@/hooks/profile/useUploadTranscript';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement';
import UpgradeModal from '@/components/UpgradeModal';

interface TranscriptResult {
  message: string;
  extracted_text: string;
  job_title: string;
  reasoning: string;
}

export default function PerfectJobTitlePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { mutate: uploadTranscript, isPending: isUploading } = useUploadTranscript();

  const handleFileChange = (selectedFile: File | null): void => {
    if (selectedFile) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, Word document, text file, or image (JPG, PNG)');
        return;
      }

      if (selectedFile.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null); // Reset previous results
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

    uploadTranscript(formData, {
      onSuccess: (data) => {
        setResult(data);
        setFile(null); // Reset form after successful upload
      },
      onError: (error) => {
        setError(error.message || 'Failed to upload transcript. Please try again.');
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
    setResult(null);
  };

  return (
    <div className="rounded-2xl p-0 md:p-8 lg:p-16 min-h-screen">
      <div className="container mx-auto px-4 py-3">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4 p-2">Perfect Job Title</h2>
            <p className="text-gray-600 px-2 mb-6">
              Upload your academic transcript or resume to discover the perfect job title that matches your qualifications and experience.
            </p>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-4 md:p-10">
                <div className="space-y-6">
                  {/* Job Title Result */}
                  <div className="text-center py-8 px-4 bg-gradient-to-r from-brand/10 to-brand/5 rounded-xl">
                    <Icon icon="heroicons:star-20-solid" className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Perfect Job Title</h3>
                    <p className="text-3xl md:text-4xl font-bold text-brand mb-4">{result.job_title}</p>
                  </div>

                  {/* Reasoning */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon icon="heroicons:light-bulb" className="w-6 h-6 text-yellow-500 mr-2" />
                      Why This Title Fits You
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand/90 transition-colors duration-200"
                    >
                      Try Another Document
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.job_title)}
                      className="px-6 py-3 text-brand bg-brand/10 hover:bg-brand/20 rounded-full font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <Icon icon="heroicons:clipboard-document" className="w-5 h-5 mr-2" />
                      Copy Job Title
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Card */}
          {!result && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* File Upload Area */}
                  <div className="space-y-4">
                    <label className="block text-xl text-brand">
                      Upload Document
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
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={handleInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="transcript-upload"
                        />

                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-brand/10 rounded-lg flex items-center justify-center mx-auto">
                            <Icon icon="heroicons:document-text" className="w-8 h-8 text-brand" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              Drag & drop your transcript or resume here
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
                            Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG • Maximum size: 10MB
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

                          {!isUploading && (
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
                      disabled={isUploading}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!file || isUploading}
                      className="px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    >
                      {isUploading ? (
                        <>
                          <Icon icon="line-md:loading-twotone-loop" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Icon icon="heroicons:sparkles" className="w-5 h-5 mr-2" />
                          Discover My Perfect Job Title
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
              Why Use Perfect Job Title?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">AI-Powered Analysis</h4>
                    <p className="text-gray-600 text-sm">Our advanced AI analyzes your educational background and experience to suggest the most suitable job titles.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Career Optimization</h4>
                    <p className="text-gray-600 text-sm">Find job titles that accurately represent your skills and increase your chances of getting noticed by recruiters.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Market Alignment</h4>
                    <p className="text-gray-600 text-sm">Get job titles that align with current market demands and industry standards.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Profile Enhancement</h4>
                    <p className="text-gray-600 text-sm">Use the suggested job title to improve your LinkedIn profile, resume, and job applications.</p>
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
        feature="Perfect Job Title"
        description="AI-powered job title analysis requires a Standard or Premium subscription. Get personalized job title recommendations based on your skills and experience."
      />
    </div>
  );
}