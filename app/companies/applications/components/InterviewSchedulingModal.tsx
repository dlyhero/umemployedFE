"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { handleApiError, showSuccessMessage } from '@/lib/errorHandling';
import { 
  useGoogleMeetConnection, 
  useCreateGoogleMeetInterview,
  CreateGoogleMeetInterviewData 
} from '@/hooks/companies/useGoogleMeet';
import { toast } from 'sonner';

interface InterviewSchedulingModalProps {
  candidate: ApplicationCandidate;
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

const InterviewSchedulingModal: React.FC<InterviewSchedulingModalProps> = ({
  candidate,
  jobId,
  isOpen,
  onClose
}) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewType, setInterviewType] = useState<'phone' | 'google_meet' | 'in_person'>('google_meet');
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  
  // Google Meet hooks
  const { data: googleConnection, isLoading: checkingConnection } = useGoogleMeetConnection();
  const createGoogleMeetInterview = useCreateGoogleMeetInterview();
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    timezone: 'America/New_York',
    notes: ''
  });

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.timezone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!session?.user?.companyId) {
      toast.error('Company information not found. Please try again.');
      return;
    }

    if (!jobId || jobId === 'null' || jobId === 'undefined' || jobId === '') {
      toast.error('Job information not found. Please select a job first.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (interviewType === 'google_meet') {
        // Check Google Meet connection first
        if (!googleConnection?.connected) {
          setShowConnectPrompt(true);
          return;
        }

        // Use Google Meet API
        const interviewData: CreateGoogleMeetInterviewData = {
          candidate_id: candidate.user_id,
          job_id: parseInt(jobId),
          company_id: parseInt(session?.user?.companyId),
          date: formData.date,
          time: formData.time,
          timezone: formData.timezone,
          notes: formData.notes,
          interview_type: 'google_meet'
        };

        const result = await createGoogleMeetInterview.mutateAsync(interviewData);
        
        showSuccessMessage(
          `Google Meet interview scheduled successfully for ${candidate.full_name}`, 
          `Meeting link: ${result.meeting_link}. Both parties have been notified with calendar invitations.`
        );
        
      } else {
        // Use regular interview API for phone/in-person
        const interviewData = {
          candidate_id: candidate.user_id,
          job_id: jobId,
          company_id: session?.user?.companyId,
          date: formData.date,
          time: formData.time,
          timezone: formData.timezone,
          notes: formData.notes,
          interview_type: interviewType
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/create-interview/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(interviewData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.error || `Failed to schedule interview: ${response.status}`);
          (error as any).response = { 
            status: response.status,
            data: errorData 
          };
          throw error;
        }

        const result = await response.json();
        showSuccessMessage(`Interview scheduled successfully for ${candidate.full_name}`, 'The candidate has been notified about the interview');
      }
      
      // Reset form and close modal
      setFormData({
        date: '',
        time: '',
        timezone: 'America/New_York',
        notes: ''
      });
      onClose();
      
    } catch (error) {
      console.error('Error scheduling interview:', error);
      handleApiError(error, 'scheduling interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Schedule Interview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
              <span className="text-brand font-semibold">
                {candidate.full_name ? 
                  candidate.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
                  candidate.user ? candidate.user.split('@')[0].charAt(0).toUpperCase() : 'U'
                }
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {candidate.full_name || (candidate.user ? candidate.user.split('@')[0].charAt(0).toUpperCase() + candidate.user.split('@')[0].slice(1) : 'Unknown Candidate')}
              </h3>
              <p className="text-sm text-gray-600">{candidate.profile?.jobTitle || 'Job title not specified'}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interview Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interview Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewType('google_meet')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    interviewType === 'google_meet'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      icon="logos:google-meet" 
                      className={`w-6 h-6 ${interviewType === 'google_meet' ? 'text-blue-600' : 'text-gray-500'}`} 
                    />
                    <div>
                      <div className="font-medium text-gray-900">Google Meet</div>
                      <div className="text-sm text-gray-600">Video call with calendar integration</div>
                    </div>
                  </div>
                  {!googleConnection?.connected && (
                    <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                      <Icon icon="solar:danger-triangle-bold" className="w-3 h-3" />
                      Google account required
                    </div>
                  )}
                  {googleConnection?.connected && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
                      Google account connected
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewType('phone')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    interviewType === 'phone'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      icon="solar:phone-bold" 
                      className={`w-6 h-6 ${interviewType === 'phone' ? 'text-blue-600' : 'text-gray-500'}`} 
                    />
                    <div>
                      <div className="font-medium text-gray-900">Phone Call</div>
                      <div className="text-sm text-gray-600">Traditional phone interview</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewType('in_person')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    interviewType === 'in_person'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      icon="solar:users-group-rounded-bold" 
                      className={`w-6 h-6 ${interviewType === 'in_person' ? 'text-blue-600' : 'text-gray-500'}`} 
                    />
                    <div>
                      <div className="font-medium text-gray-900">In-Person</div>
                      <div className="text-sm text-gray-600">Face-to-face meeting</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Google Meet Connection Prompt */}
            {interviewType === 'google_meet' && !googleConnection?.connected && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-800 mb-2">Google Account Required</h4>
                    <p className="text-sm text-orange-700 mb-3">
                      To schedule Google Meet interviews, you need to connect your Google account first. 
                      This enables automatic calendar integration and meeting link generation.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleConnectGoogle}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2"
                      >
                        <Icon icon="logos:google-meet" className="w-4 h-4 mr-2" />
                        Connect Google Account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInterviewType('phone')}
                        className="text-sm px-4 py-2"
                      >
                        Use Phone Instead
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interview Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>

              {/* Interview Time */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone *
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add any additional information about the interview..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="flex-1 bg-brand hover:bg-brand/90"
                disabled={isSubmitting || (interviewType === 'google_meet' && !googleConnection?.connected)}
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    {interviewType === 'google_meet' && !googleConnection?.connected ? (
                      <>
                        <Icon icon="solar:lock-bold" className="w-4 h-4 mr-2" />
                        Connect Google to Continue
                      </>
                    ) : interviewType === 'google_meet' ? (
                      <>
                        <Icon icon="logos:google-meet" className="w-4 h-4 mr-2" />
                        Schedule Google Meet Interview
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:calendar-bold" className="w-4 h-4 mr-2" />
                        Schedule Interview
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSchedulingModal;