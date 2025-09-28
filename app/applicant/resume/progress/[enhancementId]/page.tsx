"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useEnhancementStatus } from '@/hooks/useEnhancedResume';

export default function EnhancementProgressPage() {
  const { enhancementId: taskId } = useParams() as { enhancementId: string };
  const router = useRouter();
  const { data: session } = useSession();

  // Check if this is a legacy task ID (for backwards compatibility)
  const { data: statusData, isLoading: statusLoading, error: statusError } = useEnhancementStatus(taskId || '');

  // Handle legacy enhancement status
  useEffect(() => {
    if (!statusData) return;

    console.log('Legacy enhancement status:', statusData);

    if (statusData.status === 'completed' && statusData.enhanced_resume?.job) {
      const jobId = statusData.enhanced_resume.job;
      toast.success('Resume enhancement completed!');
      router.push(`/applicant/resume/enhanced/${jobId}`);
    } else if (statusData.status === 'failed') {
      toast.error('Resume enhancement failed. Please try again.');
      router.push('/applicant/dashboard');
    }
  }, [statusData, router]);

  // Handle errors
  useEffect(() => {
    if (statusError) {
      console.error('Status check error:', statusError);
      toast.error('Unable to check enhancement status. Please try again.');
      router.push('/applicant/dashboard');
    }
  }, [statusError, router]);

  // Show loading state
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
          <p className="text-gray-600">Checking enhancement status...</p>
        </div>
      </div>
    );
  }

  // Show message for legacy progress tracking
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <Icon icon="lucide:info" width="48" height="48" className="mx-auto mb-4 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Legacy Progress Tracking
        </h2>
        <p className="text-gray-600 mb-6">
          Resume enhancement is now instant! This page is only for legacy enhancement tracking.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/applicant/dashboard')}
            className="bg-brand text-white rounded-full py-2 px-6 font-semibold hover:bg-brand2 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 rounded-full py-2 px-6 font-semibold hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}