"use client";
import { useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useUploadResume } from '@/hooks/useEnhancedResume';
import { useJobDetail } from '@/hooks/jobs/useJobDetails';

export default function ResumeUploadPage() {
  const { jobId } = useParams() as { jobId: string };
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const { data: job, isLoading: jobLoading } = useJobDetail(Number(jobId));
  const uploadMutation = useUploadResume();
  
  // State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // File validation
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        jobId: Number(jobId),
      });

      console.log('Upload result:', result);
      console.log('Enhanced resume:', result.enhanced_resume);

      toast.success('Resume enhanced successfully!');
      
      // Redirect directly to enhanced resume view since enhancement is now instant
      router.push(`/applicant/resume/enhanced/${jobId}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error.response?.data?.code === 'PREMIUM_REQUIRED') {
        toast.error('Premium subscription required to enhance resumes.');
      } else if (error.response?.data?.code === 'INVALID_FILE_TYPE') {
        toast.error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
      } else if (error.response?.data?.code === 'FILE_TOO_LARGE') {
        toast.error('File too large. Maximum size is 10MB.');
      } else {
        toast.error('Failed to enhance resume. Please try again.');
      }
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return 'vscode-icons:file-type-pdf2';
    if (file.type.includes('word')) return 'vscode-icons:file-type-word';
    return 'vscode-icons:default-file';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <Icon icon="lucide:arrow-left" className="h-4 w-4" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhance Your Resume
          </h1>
          
          {job && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/10 rounded-lg">
                  <Icon icon="lucide:briefcase" className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-gray-600">{job.company?.name} • {job.location}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Your Resume
            </h3>
            <p className="text-gray-600">
              Upload your current resume and our AI will enhance it specifically for this job position.
            </p>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-brand bg-brand/5'
                : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Icon icon={getFileIcon(selectedFile)} className="h-12 w-12" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Icon icon="lucide:check-circle" className="h-5 w-5" />
                  <span className="text-sm font-medium">File ready for upload</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Icon 
                  icon="lucide:upload-cloud" 
                  className="h-12 w-12 text-gray-400 mx-auto" 
                />
                
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag & drop your resume here
                  </p>
                  <p className="text-gray-600 mt-1">
                    or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-brand hover:text-brand2 font-medium"
                    >
                      browse files
                    </button>
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Supported formats: PDF, DOC, DOCX</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <Icon icon="lucide:info" className="h-4 w-4 inline mr-1" />
              Enhancement is now instant - get results immediately!
            </div>
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="px-6 py-3 bg-brand text-white rounded-full font-semibold hover:bg-brand2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <Icon icon="svg-spinners:6-dots-rotate" className="h-4 w-4" />
                  Uploading...
                </>
              ) : (
                <>
                  <Icon icon="lucide:sparkles" className="h-4 w-4" />
                  Start Enhancement
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Icon icon="lucide:info" className="h-5 w-5" />
            How Resume Enhancement Works
          </h4>
          
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 text-sm font-semibold mt-0.5">
                1
              </div>
              <p>Upload your current resume in PDF, DOC, or DOCX format</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 text-sm font-semibold mt-0.5">
                2
              </div>
              <p>Our AI instantly analyzes the job requirements and your experience</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 text-sm font-semibold mt-0.5">
                3
              </div>
              <p>Get your enhanced resume immediately - no waiting required!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}