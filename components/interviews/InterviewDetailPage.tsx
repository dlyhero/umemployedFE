"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useInterviewDetails, formatInterviewDateTime, getStatusColor } from '@/hooks/interviews/useInterviews';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PopupGoogleMeet from './PopupGoogleMeet';

interface InterviewDetailPageProps {
  interviewId: string;
}

const InterviewDetailPage: React.FC<InterviewDetailPageProps> = ({ interviewId }) => {
  const router = useRouter();
  const { data: interview, isLoading, error } = useInterviewDetails(parseInt(interviewId));
  const [showPopupMeet, setShowPopupMeet] = useState(false);

  const handleJoinMeeting = () => {
    if (interview?.meeting_link) {
      window.open(interview.meeting_link, '_blank');
    }
  };

  const handleCopyMeetingLink = () => {
    if (interview?.meeting_link) {
      navigator.clipboard.writeText(interview.meeting_link);
      toast.success('Meeting link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin text-brand" />
          <span className="text-gray-600">Loading interview details...</span>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="solar:danger-circle-bold" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Interview Not Found</h3>
          <p className="text-gray-600 mb-6">The interview you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.back()}>
            <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{interview.job_title} Interview</h1>
          <p className="text-gray-600">Interview Details</p>
        </div>
        <Badge className={getStatusColor(interview.status)}>
          {interview.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {formatInterviewDateTime(interview)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Interview Type</p>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={
                      interview.interview_type === 'google_meet' ? 'logos:google-meet' :
                      interview.interview_type === 'phone' ? 'solar:phone-bold' :
                      'solar:users-group-rounded-bold'
                    } 
                    className="w-4 h-4 text-gray-500" 
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {interview.interview_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {interview.note && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{interview.note}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            {interview.user_role === 'candidate' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company</p>
                  <p className="font-medium text-gray-900">{interview.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recruiter</p>
                  <p className="font-medium text-gray-900">{interview.recruiter_name}</p>
                  <p className="text-sm text-gray-600">{interview.recruiter_email}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Candidate</p>
                  <p className="font-medium text-gray-900">{interview.candidate_name}</p>
                  <p className="text-sm text-gray-600">{interview.candidate_email}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meeting Actions */}
          {interview.interview_type === 'google_meet' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Room</h3>
              
              {interview.meeting_link ? (
                <div className="space-y-3">
                  {interview.can_join ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => setShowPopupMeet(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Icon icon="solar:play-circle-bold" className="w-4 h-4 mr-2" />
                        Join Meeting (Popup Window)
                      </Button>
                      <Button
                        onClick={handleJoinMeeting}
                        variant="outline"
                        className="w-full"
                      >
                        <Icon icon="solar:external-link-bold" className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-500"
                      >
                        <Icon icon="solar:lock-bold" className="w-4 h-4 mr-2" />
                        Meeting Not Available
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        {interview.status === 'upcoming' 
                          ? 'Meeting will be available 15 minutes before the scheduled time'
                          : 'Meeting has ended'
                        }
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleCopyMeetingLink}
                    className="w-full"
                  >
                    <Icon icon="solar:copy-bold" className="w-4 h-4 mr-2" />
                    Copy Meeting Link
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Icon icon="solar:danger-triangle-bold" className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No meeting link available</p>
                  <p className="text-xs mt-1">The Google Meet integration may not be properly configured</p>
                </div>
              )}
            </Card>
          )}

          {/* Interview Tips */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">Test your camera and microphone beforehand</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">Find a quiet, well-lit space</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">Have your resume and notes ready</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">Join 5 minutes early</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Popup Google Meet Modal */}
      {showPopupMeet && interview?.meeting_link && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <PopupGoogleMeet
              meetingLink={interview.meeting_link}
              interviewTitle={`${interview.job_title} Interview`}
              onClose={() => setShowPopupMeet(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetailPage;