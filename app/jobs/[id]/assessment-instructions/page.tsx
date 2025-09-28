"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'sonner';
import { useJobQuestions } from '@/hooks/jobs/useJobsAssessment';
import { useJobDetail } from '@/hooks/jobs/useJobDetails';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';

export default function AssessmentInstructionsPage() {
  const { id: jobId } = useParams() as { id: string };
  const router = useRouter();
  const { data: session, status } = useSession();

  // API hooks
  const { data: job, isLoading: jobLoading } = useJobDetail(Number(jobId));
  // Don't load assessment questions immediately - only when user clicks Start Assessment
  const [shouldLoadAssessment, setShouldLoadAssessment] = useState(false);
  const { data: assessment, isLoading: assessmentLoading } = useJobQuestions(jobId, shouldLoadAssessment);

  // Component state
  const [timeLeft, setTimeLeft] = useState(600);
  const [initialTimeSet, setInitialTimeSet] = useState(false);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Extract all questions from the assessment data
  useEffect(() => {
    if (assessment?.questions_by_skill && !initialTimeSet) {
      const questions: any[] = [];

      Object.entries(assessment.questions_by_skill).forEach(([skillKey, skill]: [string, any]) => {
        skill.questions.forEach((question: any) => {
          questions.push(question);
        });
      });

      setAllQuestions(questions);

      // Set initial time only once
      const totalTimeInMinutes = assessment.total_time > 60
        ? Math.floor(assessment.total_time / 60)
        : assessment.total_time;
      setTimeLeft(totalTimeInMinutes * 60);
      setInitialTimeSet(true);
    }
  }, [assessment, initialTimeSet]);

  // Check camera access
  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      // Stop the stream immediately after checking
      stream.getTracks().forEach(track => track.stop());
      setCameraError(null);
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      const errorMessage = 'Camera access denied. Please enable camera permissions to continue.';
      setCameraError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const handleStartAssessment = async () => {
    if (job?.hasApplied) {
      toast.error('You have already completed this assessment.');
      return;
    }

    const cameraAccess = await checkCameraAccess();
    if (cameraAccess) {
      // Trigger assessment loading when user clicks Start Assessment
      setShouldLoadAssessment(true);
      // Wait a moment for the assessment to load, then navigate
      setTimeout(() => {
        router.push(`/jobs/${jobId}/assessment`);
      }, 1000);
    }
  };

  // Authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <Icon icon="lucide:lock" className="text-red-600 size-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the assessment for this job.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/login')}
                className="bg-brand hover:bg-brand/90 rounded-full px-8 py-3 w-full"
              >
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/jobs/${jobId}`)}
                className="rounded-full px-8 py-3 w-full"
              >
                Back to Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading states
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

  // Only show assessment loading when user has clicked Start Assessment
  if (shouldLoadAssessment && assessmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (shouldLoadAssessment && !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Assessment not found or unavailable</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Security: Show "Already Applied" screen
  if (job?.hasApplied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl text-center border border-gray-200 rounded shadow-none border-none">
          <CardContent className="pt-8 pb-8">
            <div className=" flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:info" className="text-orange-600 size-16 md:size-20 " />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Assessment Already Completed
            </h2>

            <p className="text-gray-600 mb-2">
              You have already completed the skill assessment for
            </p>
            <p className="text-lg font-semibold text-brand mb-6">
              {assessment?.job_title || job?.title}
            </p>

            <div className="border-b mb-6">
              <p className="text-orange-700 mb-4">
                Your assessment has been submitted and is being reviewed.
                You cannot retake this assessment.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              If you believe this is an error or need to discuss your application,
              please contact our support team.
            </p>

            <div className="space-x-4 space-y-4">
              <Button
                variant="outline"
                className='rounded-full px-10 py-6'
                onClick={() => router.push('/jobs')}
              >
                Browse More Jobs
              </Button>
              <Button
                onClick={() => router.push('/applicant/dashboard')}
                className="bg-brand hover:bg-brand/90 rounded-full px-10 py-6"
              >
                Go to Dashboard
                <Icon icon="formkit:arrowright" className='size-8 md:size-10' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Screen */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl shadow-none border-none">
          <CardHeader className="text-center">
            <CardTitle className="text- dm-serif text-2xl md:text-3xl font-bold text-brand">
              Welcome to Your Skill Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{job?.title}</h3>
              <p className="text-gray-600">
                {assessment 
                  ? `You're about to begin a skill assessment with ${allQuestions.length} questions`
                  : "Click 'Start Assessment' to begin your skill assessment"
                }
              </p>
              {assessment && (
                <p className="text-sm text-gray-500 mt-1">
                  Total time: {Math.floor(timeLeft / 60)} minutes
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <Icon icon="lucide:info" width="20" height="20" className="mr-2" />
                Assessment Guidelines:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Total time limit: {assessment ? Math.floor(timeLeft / 60) : 'TBD'} minutes for all questions</li>
                <li>• Your camera will be monitored during the assessment</li>
                <li>• Assessment will auto-submit when time expires</li>
                <li>• You can navigate between questions freely</li>
                <li>• Ensure you have a stable internet connection</li>
                <li className="text-red-600 font-medium">• You can only take this assessment once</li>
              </ul>
            </div>

            {cameraError && (
              <Alert className="border-red-200">
                <Icon icon="lucide:camera-off" width="16" height="16" />
                <AlertDescription className="text-red-600">
                  {cameraError}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/jobs/${jobId}`)}
                className="rounded-full px-10 py-6"
              >
                Back to Job
              </Button>
              <Button
                onClick={handleStartAssessment}
                disabled={!!cameraError}
                className=" bg-brand hover:bg-brand/90 rounded-full px-10 py-6"
              >
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}