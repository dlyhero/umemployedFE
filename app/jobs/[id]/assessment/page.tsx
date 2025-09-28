"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'sonner';
import {
  useJobQuestions,
  useSubmitJobAnswers,
  type Question,
  type Answer,
  type SubmitAnswersRequest
} from '@/hooks/jobs/useJobsAssessment';
import { useJobDetail } from '@/hooks/jobs/useJobDetails';
import SubscriptionModal from '@/components/ui/SubscriptionModal';

type AssessmentStage = 'assessment' | 'completed' | 'already-applied';

export default function SkillAssessmentPage() {
  const { id: jobId } = useParams() as { id: string };
  const router = useRouter();

  // API hooks
  const { data: job, isLoading: jobLoading } = useJobDetail(Number(jobId));
  const { data: assessment, isLoading: assessmentLoading } = useJobQuestions(jobId);
  const submitAnswersMutation = useSubmitJobAnswers();

  // Component state
  const [stage, setStage] = useState<AssessmentStage>('assessment');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [initialTimeSet, setInitialTimeSet] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [skillIdMap, setSkillIdMap] = useState<Record<number, number>>({});
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lockWarningCount, setLockWarningCount] = useState(0);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSubmittingRef = useRef(false);

  // Timer functionality with better management
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    setTimerActive(false);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current || job?.hasApplied) {
      clearInterval(timerRef.current);
      return;
    }

    setTimerActive(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;

        // Auto-submit when time reaches 0
        if (newTime <= 0 && !isSubmittingRef.current && !job?.hasApplied) {
          handleAutoSubmit();
          return 0;
        }

        return newTime;
      });
    }, 1000);
  }, [job?.hasApplied]);

  // Camera functionality
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const startCamera = async (): Promise<boolean> => {
    if (job?.hasApplied) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
      toast.success('Camera access granted');
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      const errorMessage = 'Camera access denied. Please enable camera permissions to continue.';
      setCameraError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Security: Check if user has already applied/completed assessment
  useEffect(() => {
    if (job?.hasApplied && stage !== 'already-applied') {
      setStage('already-applied');
      // Clean up any ongoing processes
      stopTimer();
      stopCamera();
    }
  }, [job?.hasApplied, stage, stopTimer, stopCamera]);

  // Security: Prevent navigation during assessment
  useEffect(() => {
    if (stage === 'assessment' && assessmentStarted) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your assessment progress will be lost.';
      };

      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        // Replace alert with toast confirmation
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Leave Assessment?</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to leave? Your progress will be lost.</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.dismiss(t);
                  window.history.pushState(null, '', window.location.href);
                }}
              >
                Stay
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast.dismiss(t);
                  stopTimer();
                  stopCamera();
                  router.back();
                }}
              >
                Leave
              </Button>
            </div>
          </div>
        ), {
          duration: Infinity // Keep open until user responds
        });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      // Push a state to handle back button
      window.history.pushState(null, '', window.location.href);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [stage, assessmentStarted, router, stopTimer, stopCamera]);

  // Extract all questions from the assessment data and create skill mapping
  useEffect(() => {
    if (assessment?.questions_by_skill && !initialTimeSet && !job?.hasApplied) {
      const questions: Question[] = [];
      const skillMapping: Record<number, number> = {};

      Object.entries(assessment.questions_by_skill).forEach(([skillKey, skill]) => {
        skill.questions.forEach(question => {
          questions.push(question);
          skillMapping[question.id] = skill.skill_id;
        });
      });

      setAllQuestions(questions);
      setSkillIdMap(skillMapping);

      // Set initial time only once
      const totalTimeInMinutes = assessment.total_time > 60
        ? Math.floor(assessment.total_time / 60)
        : assessment.total_time;
      setTimeLeft(totalTimeInMinutes * 60);
      setInitialTimeSet(true);
    }
  }, [assessment, initialTimeSet, job?.hasApplied]);

  // Auto-submit when time runs out
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmittingRef.current || job?.hasApplied) return;

    toast.warning('Time\'s up! Auto-submitting your assessment...');
    await handleSubmitAssessment();
  }, [job?.hasApplied]);

  // Auto-start assessment when component mounts
  useEffect(() => {
    const autoStartAssessment = async () => {
      if (job?.hasApplied) {
        setStage('already-applied');
        return;
      }

      if (assessment && allQuestions.length > 0 && !assessmentStarted) {
        const cameraStarted = await startCamera();
        if (cameraStarted) {
          setAssessmentStarted(true);
          // Start timer immediately when assessment begins
          startTimer();
          toast.success('Assessment started! Good luck!');
        }
      }
    };

    autoStartAssessment();
  }, [assessment, allQuestions.length, assessmentStarted, job?.hasApplied, startCamera, startTimer]);


  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (job?.hasApplied) return;

    const answerLetter = String.fromCharCode(65 + optionIndex);
    setAnswers(prev => ({ ...prev, [questionId]: answerLetter }));
  };

  // Format answers for submission
  const formatAnswersForSubmission = (): Answer[] => {
    return allQuestions.map(question => {
      const skillId = skillIdMap[question.id] || null;

      return {
        question_id: question.id,
        answer: answers[question.id] || null,
        skill_id: skillId
      };
    });
  };

  const goToNextQuestion = () => {
    if (job?.hasApplied) return;

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async () => {
    // Security checks
    if (isSubmittingRef.current || job?.hasApplied) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Stop timer and camera
    stopTimer();
    stopCamera();

    try {
      const formattedAnswers = formatAnswersForSubmission();

      // Check for unanswered questions
      const unansweredQuestions = formattedAnswers.filter(answer => answer.answer === null);

      if (unansweredQuestions.length > 0 && timeLeft > 0) {
        // Replace confirm with toast dialog
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md mx-auto">
            <h3 className="font-semibold text-lg mb-2">Unanswered Questions</h3>
            <p className="text-gray-600 mb-4">
              You have {unansweredQuestions.length} unanswered questions. Are you sure you want to submit?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  toast.dismiss(t);
                  isSubmittingRef.current = false;
                  setIsSubmitting(false);
                  if (stage === 'assessment' && timeLeft > 0 && !job?.hasApplied) {
                    startTimer();
                  }
                }}
              >
                Continue Assessment
              </Button>
              <Button
                onClick={() => {
                  toast.dismiss(t);
                  submitAnswers();
                }}
              >
                Submit Anyway
              </Button>
            </div>
          </div>
        ), { duration: Infinity });

        return;
      }

      await submitAnswers();
    } catch (error) {
      console.error('Error in submission process:', error);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const submitAnswers = async () => {
    try {
      const formattedAnswers = formatAnswersForSubmission();
      const payload: SubmitAnswersRequest = {
        responses: formattedAnswers
      };

      await submitAnswersMutation.mutateAsync({
        jobId: jobId,
        data: payload
      });

      setStage('completed');
      toast.success('Assessment submitted successfully!');

    } catch (error: any) {
      console.error('Error submitting assessment:', error);

      // Handle subscription error
      if (error.response?.data?.message === "No active user subscription found.") {
        setShowSubscriptionModal(true);
      } else if (error.response?.data?.error === "Responses are required.") {
        toast.error('Please answer all questions before submitting.');
      } else {
        toast.error('Failed to submit assessment. Please try again.');
      }

      // Only restart timer if we're still in assessment stage, have time left, and it's not a subscription error
      if (stage === 'assessment' && timeLeft > 0 &&
        error.response?.data?.message !== "No active user subscription found." &&
        !job?.hasApplied) {
        startTimer();
      }

      throw error; // Re-throw for the outer catch
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Browser Lock Implementation
  useEffect(() => {
    if (stage === 'assessment' && assessmentStarted && !job?.hasApplied) {
      // Request fullscreen
      const requestFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
          }
        } catch (error) {
          console.log('Fullscreen request failed:', error);
        }
      };

      requestFullscreen();

      // Prevent context menu
      const preventContextMenu = (e: Event) => {
        e.preventDefault();
        return false;
      };

      // Prevent keyboard shortcuts
      const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        const forbiddenKeys = [
          'F12',
          'F11',
          'F5',
          'F4',
          'F3',
          'F2',
          'F1'
        ];

        const forbiddenCombinations = [
          { ctrl: true, shift: true, key: 'I' }, // Dev tools
          { ctrl: true, shift: true, key: 'C' }, // Dev tools
          { ctrl: true, shift: true, key: 'J' }, // Console
          { ctrl: true, key: 'U' }, // View source
          { ctrl: true, key: 'S' }, // Save
          { ctrl: true, key: 'P' }, // Print
          { ctrl: true, key: 'A' }, // Select all
          { ctrl: true, key: 'C' }, // Copy
          { ctrl: true, key: 'V' }, // Paste
          { ctrl: true, key: 'X' }, // Cut
          { ctrl: true, key: 'R' }, // Refresh
          { ctrl: true, key: 'F' }, // Find
          { ctrl: true, key: 'H' }, // History
          { ctrl: true, key: 'T' }, // New tab
          { ctrl: true, key: 'W' }, // Close tab
          { ctrl: true, key: 'N' }, // New window
          { alt: true, key: 'Tab' }, // Alt+Tab
          { alt: true, key: 'F4' }, // Alt+F4
        ];

        // Check for forbidden keys
        if (forbiddenKeys.includes(e.key)) {
          e.preventDefault();
          toast.warning('This key is disabled during assessment');
          return false;
        }

        // Check for forbidden combinations
        const isForbidden = forbiddenCombinations.some(combo => {
          const ctrlMatch = combo.ctrl ? e.ctrlKey : !e.ctrlKey;
          const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
          const altMatch = combo.alt ? e.altKey : !e.altKey;
          const keyMatch = combo.key.toLowerCase() === e.key.toLowerCase();
          
          return ctrlMatch && shiftMatch && altMatch && keyMatch;
        });

        if (isForbidden) {
          e.preventDefault();
          toast.warning('This shortcut is disabled during assessment');
          return false;
        }
      };

      // Prevent tab switching and window focus loss
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setLockWarningCount(prev => prev + 1);
          if (lockWarningCount >= 3) {
            toast.error('Multiple tab switches detected. Assessment will be submitted.');
            handleSubmitAssessment();
          } else {
            toast.warning(`Tab switch detected! Warning ${lockWarningCount + 1}/3`);
          }
        }
      };

      // Prevent window blur (alt+tab, win+tab, etc.)
      const handleWindowBlur = () => {
        setLockWarningCount(prev => prev + 1);
        if (lockWarningCount >= 3) {
          toast.error('Multiple window switches detected. Assessment will be submitted.');
          handleSubmitAssessment();
        } else {
          toast.warning(`Window switch detected! Warning ${lockWarningCount + 1}/3`);
        }
      };

      // Prevent drag and drop
      const preventDragDrop = (e: DragEvent) => {
        e.preventDefault();
        return false;
      };

      // Prevent text selection
      const preventTextSelection = (e: Event) => {
        e.preventDefault();
        return false;
      };

      // Add event listeners
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('selectstart', preventTextSelection);
      document.addEventListener('dragstart', preventDragDrop);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);

      // Monitor fullscreen changes
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        
        setIsFullscreen(isCurrentlyFullscreen);
        
        if (!isCurrentlyFullscreen && assessmentStarted) {
          toast.warning('Please return to fullscreen mode to continue the assessment');
          // Auto-request fullscreen again after a short delay
          setTimeout(() => {
            requestFullscreen();
          }, 1000);
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('selectstart', preventTextSelection);
        document.removeEventListener('dragstart', preventDragDrop);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }
  }, [stage, assessmentStarted, job?.hasApplied, lockWarningCount, handleSubmitAssessment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopCamera();
      isSubmittingRef.current = false;
    };
  }, [stopTimer, stopCamera]);

  // Handle subscription modal close
  const handleSubscriptionModalClose = () => {
    setShowSubscriptionModal(false);
    // Redirect to pricing or dashboard when modal is closed
    router.push('/applicant/dashboard');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading states
  if (jobLoading || assessmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Assessment not found or unavailable</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
        <SubscriptionModal
          showSubscriptionModal={showSubscriptionModal}
          onClose={handleSubscriptionModalClose}
        />
      </div>
    );
  }

  // Security: Show "Already Applied" screen
  if (stage === 'already-applied' || job?.hasApplied) {
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
              {assessment.job_title || job?.title}
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
                <Icon icon="formkit:arrowright"  className='size-8 md:size-10' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  return (
    <div className={`min-h-screen bg-gray-50 ${stage === 'assessment' && assessmentStarted ? 'select-none' : ''}`}>
      <SubscriptionModal
        showSubscriptionModal={showSubscriptionModal}
        onClose={handleSubscriptionModalClose}
      />

      {/* Fixed Header - only show during assessment */}
      {stage === 'assessment' && !job?.hasApplied && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {allQuestions.length}
                </div>
                <Progress value={progress} className="w-48 h-2" />
              </div>

              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full font-semibold transition-colors ${timeLeft <= 60 ? 'bg-red-100 text-red-700 animate-pulse' :
                    timeLeft <= 300 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                  }`}>
                  <Icon icon="lucide:clock" width="16" height="16" />
                  <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
                  {timerActive && (
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Security Indicators */}
                <div className="flex items-center space-x-2">
                  {/* Fullscreen Indicator */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${isFullscreen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <Icon icon={isFullscreen ? "lucide:maximize" : "lucide:minimize"} width="12" height="12" />
                    <span>{isFullscreen ? 'Fullscreen' : 'Exit Fullscreen'}</span>
                  </div>

                  {/* Lock Indicator */}
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <Icon icon="lucide:lock" width="12" height="12" />
                    <span>Secure Mode</span>
                  </div>

                  {/* Warning Count */}
                  {lockWarningCount > 0 && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${lockWarningCount >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      <Icon icon="lucide:alert-triangle" width="12" height="12" />
                      <span>Warnings: {lockWarningCount}/3</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-24 h-18 rounded-lg bg-gray-200 object-cover border-2 border-gray-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Assessment Screen */}
      {stage === 'assessment' && currentQuestion && !job?.hasApplied && (
        <div className="pt-32 pb-8 px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="mb-6 shadow-none border-none">
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[currentQuestion.id] === String.fromCharCode(65 + index)
                          ? 'border-brand bg-blue-50 text-brand'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      disabled={job?.hasApplied}
                    >
                      <div className="flex items-center">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 mr-3 flex items-center justify-center text-sm font-semibold ${answers[currentQuestion.id] === String.fromCharCode(65 + index)
                            ? 'border-brand bg-brand text-white'
                            : 'border-gray-300 text-gray-500'
                          }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0 || job?.hasApplied}
                  className="flex items-center rounded-full px-10 py-6"
                >
                  <Icon icon="formkit:arrowleft" className='size-4 mr-2' />
                  Previous
                </Button>

                <div className="text-sm text-gray-500">
                  {Object.keys(answers).length} of {allQuestions.length} answered
                </div>
              </div>

              <Button
                onClick={goToNextQuestion}
                disabled={isSubmitting || job?.hasApplied}
                className="bg-brand hover:bg-brand/90 flex items-center rounded-full px-10 py-6"
              >
                {currentQuestionIndex === allQuestions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                <Icon icon="formkit:arrowright" className='size-4 ml-2' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {stage === 'completed' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-5xl text-center border-0 shadow-none">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon="lucide:check" className="text-green-600 size-8" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Assessment Completed Successfully!
              </h2>

              <p className="text-gray-600 mb-2">
                Thank you for completing the skill assessment for
              </p>
              <p className="text-lg font-semibold text-brand mb-6">
                {assessment.job_title || job?.title}
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Questions Answered:</span>
                    <p>{Object.keys(answers).length} of {allQuestions.length}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Submission Status:</span>
                    <p className="text-green-600">Successfully Submitted</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Your assessment has been submitted and will be reviewed by our team.
                You will be notified of the results via email within 2-3 business days.
              </p>

              <div className="space-x-4">
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
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
            <p className="text-gray-600">Submitting your assessment...</p>
          </div>
        </div>
      )}
    </div>
  );
}