"use client";
import React, { useState, ChangeEvent, DragEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useUploadResume } from '@/hooks/profile/useUploadResume';

interface SessionData {
  hasResume?: boolean;
  // Add other session properties as needed
}

export default function UploadResumePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { mutate: uploadResume, isPending: isUploading } = useUploadResume();

  const handleFileChange = (selectedFile: File | null): void => {
    if (selectedFile) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, Word document, or text file');
        return;
      }

      if (selectedFile.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
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

    setError('');

    const formData = new FormData();
    formData.append('file', file);

    uploadResume(formData, {
      onSuccess: async () => {
        // Update session to reflect resume upload
        await update({ hasResume: true });
        
        // Redirect to edit profile page after successful upload
        setTimeout(() => {
          router.push('/applicant/edit-profile');
        }, 1000);
      },
      onError: (error) => {
        setError(error.message || 'Failed to upload resume. Please try again.');
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

  return (
    <div className="rounded-2xl p-0 md:p-8 lg:p-16  min-h-screen">
      <div className="container mx-auto px-4 py-3">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4 p-2">My Resume</h2>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* File Upload Area */}
                <div className="space-y-4">
                  <label className="block text-xl  text-brand">
                    Resume Document
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
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Drag & drop your resume here
                          </p>
                          <p className="text-gray-500 mb-4">or</p>
                          <button
                            type="button"
                            className="inline-flex items-center px-6 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand2 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Browse Files
                          </button>
                        </div>

                        <p className="text-sm text-gray-500">
                          Supported formats: PDF, DOC, DOCX, TXT • Maximum size: 5MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                 
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Resume'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-3 md:mt-8 bg-white p-4 md:p-8 rounded-lg ">
            <h3 className='text-brand text-xl'>Manual Profile Setup</h3>
            <div className="text-gray-600 my-3">Build your profile step-by-step without uploading files</div>
            <div className='border mt-3 rounded-lg p-4'>            
              <Link href={`/applicant/edit-profile`} className='text-gray-800'>Enter your details manually</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}