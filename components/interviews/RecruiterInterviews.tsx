"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useInterviews, formatInterviewDateTime, getStatusColor, isInterviewSoon } from '@/hooks/interviews/useInterviews';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import PopupGoogleMeet from './PopupGoogleMeet';

const RecruiterInterviews: React.FC = () => {
  const router = useRouter();
  const { data: interviews, isLoading, error } = useInterviews('recruiter');
  const [showPopupMeet, setShowPopupMeet] = useState<{ [key: number]: boolean }>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin text-brand" />
          <span className="text-gray-600">Loading interviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon icon="solar:danger-circle-bold" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Interviews</h3>
        <p className="text-gray-600 mb-4">Unable to load your scheduled interviews. Please try again.</p>
        <Button onClick={() => window.location.reload()}>
          <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:calendar-bold" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
        <p className="text-gray-600 mb-6">You haven't scheduled any interviews yet.</p>
        <Button onClick={() => router.push('/companies/applications')}>
          <Icon icon="solar:calendar-add-bold" className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Scheduled Interviews</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {interview.job_title}
                  </h3>
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status.replace('_', ' ')}
                  </Badge>
                  {isInterviewSoon(interview) && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Icon icon="solar:clock-circle-bold" className="w-3 h-3 mr-1" />
                      Soon
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Candidate</p>
                    <p className="font-medium text-gray-900">{interview.candidate_name}</p>
                    <p className="text-sm text-gray-600">{interview.candidate_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {formatInterviewDateTime(interview)}
                    </p>
                  </div>
                </div>

                {interview.note && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-900">{interview.note}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Icon 
                    icon={
                      interview.interview_type === 'google_meet' ? 'logos:google-meet' :
                      interview.interview_type === 'phone' ? 'solar:phone-bold' :
                      'solar:users-group-rounded-bold'
                    } 
                    className="w-4 h-4 text-gray-500" 
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {interview.interview_type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/interviews/${interview.id}`)}
                >
                  <Icon icon="solar:eye-bold" className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                
                {interview.meeting_link && interview.can_join && (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={() => setShowPopupMeet(prev => ({ ...prev, [interview.id]: true }))}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Icon icon="solar:play-circle-bold" className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(interview.meeting_link, '_blank')}
                      variant="outline"
                    >
                      <Icon icon="solar:external-link-bold" className="w-4 h-4 mr-2" />
                      Open in Tab
                    </Button>
                  </div>
                )}
                
                {interview.meeting_link && !interview.can_join && interview.status === 'upcoming' && (
                  <Button
                    size="sm"
                    disabled
                    variant="outline"
                    className="text-gray-500"
                  >
                    <Icon icon="solar:lock-bold" className="w-4 h-4 mr-2" />
                    Available Soon
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Popup Google Meet Modals */}
      {interviews?.map((interview) => (
        showPopupMeet[interview.id] && interview.meeting_link && (
          <div key={`meet-${interview.id}`} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
              <PopupGoogleMeet
                meetingLink={interview.meeting_link}
                interviewTitle={`${interview.job_title} Interview`}
                onClose={() => setShowPopupMeet(prev => ({ ...prev, [interview.id]: false }))}
              />
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default RecruiterInterviews;