"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { useRetakeRequest } from '@/hooks/useRequestRetake';

interface RetakeRequestFormProps {
  jobId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RetakeRequestModalProps extends RetakeRequestFormProps {
  isOpen: boolean;
  jobTitle?: string;
}

const RetakeRequestForm: React.FC<RetakeRequestFormProps> = ({ 
  jobId, 
  onClose, 
  onSuccess 
}) => {
  const [reason, setReason] = useState('');

  const retakeRequestMutation = useRetakeRequest(jobId, {
    onSuccess: (data) => {
      setReason(''); // Clear form on success
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      // Error is already handled by the hook (toast shown)
      console.error('Retake request failed:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return; // Hook will handle the validation error
    }

    retakeRequestMutation.mutate({ reason });
  };

  const handleCancel = () => {
    if (retakeRequestMutation.isPending) return;
    setReason('');
    onClose();
  };

  const isSubmitting = retakeRequestMutation.isPending;
  const isReasonTooLong = reason.length > 950;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Icon 
              icon="solar:refresh-circle-bold" 
              className="h-6 w-6 text-orange-600" 
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Request Assessment Retake
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tell us why you need to retake this assessment
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason for Retake Request *
        </label>
        <Textarea
          id="reason"
          placeholder="Please explain your situation in detail. For example: technical issues, internet connectivity problems, unexpected interruptions, etc."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-[200px] md:min-h-[250px] resize-none focus:ring-2 focus:ring-brand focus:border-transparent text-base"
          disabled={isSubmitting}
          maxLength={1000}
          required
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Be specific about the issues you encountered</span>
          <span className={isReasonTooLong ? 'text-orange-600 font-medium' : ''}>
            {reason.length}/1000
          </span>
        </div>
      </div>

      {/* Show error message if submission failed */}
      {retakeRequestMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Icon 
              icon="solar:danger-circle-bold" 
              className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" 
            />
            <div className="text-sm text-red-800">
              <p className="font-medium">Submission Failed</p>
              <p className="mt-1">
                {(retakeRequestMutation.error as any)?.message || 'Please try again or contact support.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon 
            icon="solar:info-circle-bold" 
            className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" 
          />
          <div className="text-sm text-brand">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="space-y-1 text-brand/90">
              <li>• Your request will be reviewed within 24-48 hours</li>
              <li>• You'll receive an email notification with the decision</li>
              <li>• If approved, you'll get a new assessment link</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-brand hover:bg-brand/90 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
          disabled={isSubmitting || !reason.trim()}
        >
          {isSubmitting ? (
            <>
              <Icon 
                icon="svg-spinners:6-dots-rotate" 
                className="h-4 w-4 mr-2" 
              />
              Submitting...
            </>
          ) : (
            <>
              <Icon 
                icon="solar:paper-plane-bold" 
                className="h-4 w-4 mr-2" 
              />
              Submit Request
            </>
          )}
        </Button>
      </div>

      {/* Success indicator for better UX */}
      {retakeRequestMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Icon 
              icon="solar:check-circle-bold" 
              className="h-5 w-5 text-green-600" 
            />
            <p className="text-sm text-green-800 font-medium">
              Request submitted successfully!
            </p>
          </div>
        </div>
      )}
    </form>
  );
};

const RetakeRequestModal: React.FC<RetakeRequestModalProps> = ({
  isOpen,
  jobId,
  jobTitle,
  onClose,
  onSuccess
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[750px] max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Request Assessment Retake{jobTitle ? ` - ${jobTitle}` : ''}
          </DialogTitle>
        </DialogHeader>
        
        <RetakeRequestForm 
          jobId={jobId} 
          onClose={onClose} 
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RetakeRequestModal;