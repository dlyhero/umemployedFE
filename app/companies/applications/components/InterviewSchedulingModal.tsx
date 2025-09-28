"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { handleApiError, showSuccessMessage } from '@/lib/errorHandling';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.timezone) {
      alert('Please fill in all required fields');
      return;
    }

    if (!session?.user?.companyId) {
      alert('Company information not found. Please try again.');
      return;
    }

    if (!jobId || jobId === 'null' || jobId === 'undefined' || jobId === '') {
      alert('Job information not found. Please select a job first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const interviewData = {
        candidate_id: candidate.user_id,
        job_id: jobId,
        company_id: session?.user?.companyId,
        date: formData.date,
        time: formData.time,
        timezone: formData.timezone,
        notes: formData.notes
      };

      console.log('Scheduling interview with data:', interviewData);
      console.log('Job ID from props:', jobId);
      console.log('Job ID type:', typeof jobId);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/company/create-interview/`);

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
      console.log('Interview scheduled successfully:', result);
      
      showSuccessMessage(`Interview scheduled successfully for ${candidate.full_name}`, 'The candidate has been notified about the interview');
      
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:calendar-bold" className="w-4 h-4 mr-2" />
                    Schedule Interview
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