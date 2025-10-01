"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGoogleMeetConnection } from '@/hooks/companies/useGoogleMeet';

interface Interview {
  id: number;
  candidate_name: string;
  job_title: string;
  date: string;
  time: string;
  timezone: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_link?: string;
  interview_type: 'google_meet' | 'phone' | 'in_person';
}

export default function InterviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: googleConnection } = useGoogleMeetConnection();

  const handleConnectGoogle = async () => {
    if (!session?.user?.accessToken) {
      toast.error('Authentication required', {
        description: 'Please sign in to connect your Google account.',
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/google/auth-url/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authorization_url) {
          // Redirect to Google OAuth
          window.location.href = data.authorization_url;
        } else {
          throw new Error('No authorization URL received');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast.error('Failed to connect to Google', {
        description: 'Please try again or contact support if the issue persists.',
      });
    }
  };

  // Mock data - replace with actual API call
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInterviews([
        {
          id: 1,
          candidate_name: 'John Doe',
          job_title: 'Software Engineer',
          date: '2024-01-20',
          time: '14:00',
          timezone: 'America/New_York',
          status: 'scheduled',
          meeting_link: 'https://meet.google.com/abc-defg-hij',
          interview_type: 'google_meet'
        },
        {
          id: 2,
          candidate_name: 'Jane Smith',
          job_title: 'Product Manager',
          date: '2024-01-18',
          time: '10:30',
          timezone: 'America/New_York',
          status: 'completed',
          interview_type: 'phone'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleJoinInterview = (interview: Interview) => {
    if (interview.interview_type === 'google_meet' && interview.meeting_link) {
      router.push(`/interviews/${interview.id}/join`);
    } else {
      toast.info('This interview type does not support online joining');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'google_meet':
        return 'logos:google-meet';
      case 'phone':
        return 'solar:phone-bold';
      case 'in_person':
        return 'solar:users-group-rounded-bold';
      default:
        return 'solar:calendar-bold';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
          <p className="text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
            <p className="text-gray-600 mt-2">Manage and join your scheduled interviews</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/companies/applications')}
              variant="outline"
            >
              <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>

        {/* Google Meet Status */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon icon="logos:google-meet" className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Google Meet Integration</h2>
          </div>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon 
                  icon="logos:google-meet" 
                  className={`w-6 h-6 ${googleConnection?.connected ? 'text-green-600' : 'text-gray-400'}`} 
                />
                <div>
                  <div className="font-medium text-gray-900">Google Meet Status</div>
                  <div className={`text-sm ${
                    googleConnection?.connected ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {googleConnection?.connected ? 'Connected and ready' : 'Not connected'}
                  </div>
                </div>
              </div>
              
              {!googleConnection?.connected && (
                <Button 
                  onClick={handleConnectGoogle}
                  size="sm"
                >
                  <Icon icon="solar:link-bold" className="w-4 h-4 mr-2" />
                  Connect Google
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Interviews List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Scheduled Interviews</h2>
          
          {interviews.length === 0 ? (
            <Card className="p-8 text-center">
              <Icon icon="solar:calendar-bold" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
              <p className="text-gray-600 mb-4">
                You don't have any interviews scheduled yet. Schedule interviews from the applications page.
              </p>
              <Button onClick={() => router.push('/companies/applications')}>
                <Icon icon="solar:calendar-add-bold" className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                        <Icon 
                          icon={getInterviewTypeIcon(interview.interview_type)} 
                          className="w-6 h-6 text-brand" 
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{interview.candidate_name}</h3>
                        <p className="text-sm text-gray-600">{interview.job_title}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(interview.date).toLocaleDateString()} at {interview.time}
                          </span>
                          <span className="text-sm text-gray-500">{interview.timezone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                      
                      {interview.status === 'scheduled' && interview.interview_type === 'google_meet' && (
                        <Button
                          onClick={() => handleJoinInterview(interview)}
                          size="sm"
                        >
                          <Icon icon="logos:google-meet" className="w-4 h-4 mr-2" />
                          Join Interview
                        </Button>
                      )}
                      
                      {interview.status === 'scheduled' && interview.interview_type !== 'google_meet' && (
                        <Button
                          onClick={() => handleJoinInterview(interview)}
                          variant="outline"
                          size="sm"
                        >
                          <Icon icon="solar:phone-bold" className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}