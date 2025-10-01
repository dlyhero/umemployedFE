"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  useInterviewDetails, 
  useTestMeetConnection,
  InterviewDetails as InterviewDetailsType 
} from '@/hooks/companies/useGoogleMeet';
import { toast } from 'sonner';

interface InterviewRoomProps {
  interviewId: number;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ interviewId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Fetch interview details
  const { 
    data: interview, 
    isLoading, 
    error, 
    refetch 
  } = useInterviewDetails(interviewId);

  // Connection test mutation
  const testConnection = useTestMeetConnection();

  useEffect(() => {
    // Auto-test connection when component mounts
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testConnection.mutateAsync();
      setConnectionTest(result);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const joinMeeting = () => {
    if (interview?.meet_link) {
      // Open Google Meet in a new window/tab
      window.open(interview.meet_link, '_blank', 'width=1200,height=800');
    }
  };

  const joinInCurrentTab = () => {
    if (interview?.meet_link) {
      // Redirect to Google Meet in current tab
      window.location.href = interview.meet_link;
    }
  };

  const copyMeetingLink = () => {
    if (interview?.meet_link) {
      navigator.clipboard.writeText(interview.meet_link);
      toast.success('Meeting link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Icon icon="solar:danger-triangle-bold" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Interview</h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'There was an error loading the interview details.'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Icon icon="solar:file-search-bold" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Not Found</h2>
          <p className="text-gray-600 mb-4">
            The interview you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Interview Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Interview: {interview.job_title}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interview.meeting_status === 'ready' ? 'bg-green-100 text-green-800' :
                  interview.meeting_status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {interview.meeting_status === 'ready' ? 'Ready to Join' :
                   interview.meeting_status === 'upcoming' ? 'Upcoming' : 'Ended'}
                </span>
                {interview.time_until_meeting < 0 && Math.abs(interview.time_until_meeting) <= 15 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Starting Soon
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-bold" className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Candidate:</span>
              <span className="font-medium">{interview.candidate_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Recruiter:</span>
              <span className="font-medium">{interview.recruiter_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:calendar-bold" className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Scheduled:</span>
              <span className="font-medium">{new Date(interview.scheduled_time).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Time until meeting:</span>
              <span className="font-medium">
                {Math.abs(interview.time_until_meeting)} minutes 
                {interview.time_until_meeting < 0 ? ' ago' : ' from now'}
              </span>
            </div>
          </div>
        </Card>

        {/* Connection Test Results */}
        {(connectionTest || isTestingConnection) && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">🔧 Connection Test</h2>
              <Button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
              >
                {isTestingConnection ? (
                  <>
                    <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
                    Retest
                  </>
                )}
              </Button>
            </div>
            
            {isTestingConnection ? (
              <div className="text-center py-8">
                <Icon icon="eos-icons:loading" className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
                <p className="text-gray-600">Testing your connection...</p>
              </div>
            ) : connectionTest ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${
                  connectionTest.camera_access ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Icon 
                      icon="solar:camera-bold" 
                      className={`w-6 h-6 ${connectionTest.camera_access ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    <div>
                      <div className={`font-medium ${connectionTest.camera_access ? 'text-green-800' : 'text-red-800'}`}>
                        Camera: {connectionTest.camera_access ? 'Working' : 'Not detected'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {connectionTest.camera_access ? 'Ready for video' : 'Check permissions'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border-2 ${
                  connectionTest.microphone_access ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Icon 
                      icon="solar:microphone-bold" 
                      className={`w-6 h-6 ${connectionTest.microphone_access ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    <div>
                      <div className={`font-medium ${connectionTest.microphone_access ? 'text-green-800' : 'text-red-800'}`}>
                        Microphone: {connectionTest.microphone_access ? 'Working' : 'Not detected'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {connectionTest.microphone_access ? 'Ready for audio' : 'Check permissions'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                  <div className="flex items-center gap-3">
                    <Icon icon="solar:wifi-router-bold" className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">
                        Network: {connectionTest.network_quality}
                      </div>
                      <div className="text-sm text-gray-600">Connection stable</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        )}

        {/* Meeting Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Join Your Interview</h2>
          
          {interview.meeting_status === 'upcoming' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Icon icon="solar:clock-circle-bold" className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">
                  Your interview starts in {Math.abs(interview.time_until_meeting)} minutes. 
                  You can join 15 minutes before the scheduled time.
                </p>
              </div>
            </div>
          )}

          {interview.meeting_status === 'ended' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-red-600" />
                <p className="text-red-800">
                  This interview has ended. If you missed it, please contact the recruiter to reschedule.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={joinMeeting}
                disabled={!interview.can_join}
                className="flex-1 py-4 px-6 text-lg"
                size="lg"
              >
                <Icon icon="logos:google-meet" className="w-6 h-6 mr-3" />
                Join Google Meet (New Window)
              </Button>
              
              <Button
                onClick={joinInCurrentTab}
                disabled={!interview.can_join}
                variant="outline"
                className="flex-1 py-4 px-6 text-lg"
                size="lg"
              >
                <Icon icon="solar:monitor-bold" className="w-6 h-6 mr-3" />
                Join in Current Tab
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon icon="solar:link-bold" className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Meeting Link:</span>
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  {interview.meet_link}
                </code>
              </div>
              <Button
                onClick={copyMeetingLink}
                variant="outline"
                size="sm"
              >
                <Icon icon="solar:copy-bold" className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="solar:lightbulb-bold" className="w-5 h-5 text-yellow-500" />
            Interview Tips
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Ensure you're in a quiet, well-lit environment
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Test your camera and microphone before joining
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Have your resume and portfolio ready
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Join a few minutes early to settle in
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Keep water nearby and maintain good posture
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default InterviewRoom;