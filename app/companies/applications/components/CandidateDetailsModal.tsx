"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';
import { Button } from '@/components/ui/button';
import { useShortlistCandidate, useUnshortlistCandidate } from '@/hooks/companies/useShortlist';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';

interface CandidateDetailsModalProps {
  candidate: ApplicationCandidate;
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduleInterview: () => void;
}

const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  candidate,
  jobId,
  isOpen,
  onClose,
  onScheduleInterview
}) => {
  const { data: session } = useSession();
  const shortlistMutation = useShortlistCandidate();
  const unshortlistMutation = useUnshortlistCandidate();

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get display name from email or full_name
  const getDisplayName = () => {
    if (candidate.full_name) return candidate.full_name;
    if (candidate.user) {
      // Extract name from email (before @)
      const emailName = candidate.user.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Unknown Candidate';
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default to 'U' for User
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleShortlist = async () => {
    if (!session?.user?.companyId) {
      console.error('Company ID not found');
      return;
    }

    shortlistMutation.mutate({
      companyId: session.user.companyId,
      jobId,
      candidateId: candidate.user_id
    });
  };

  const handleUnshortlist = async () => {
    if (!session?.user?.companyId) {
      console.error('Company ID not found');
      return;
    }

    unshortlistMutation.mutate({
      companyId: session.user.companyId,
      jobId,
      candidateId: candidate.user_id
    });
  };

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
              <Icon icon="solar:user-bold-duotone" className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Candidate Profile</h2>
              <p className="text-sm text-gray-600">Detailed candidate information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
            <div className="relative">
              {candidate.profile?.profileImage ? (
                <img
                  src={candidate.profile.profileImage}
                  alt={getDisplayName()}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center border-4 border-gray-100">
                  <span className="text-brand font-bold text-xl">
                    {getInitials(getDisplayName())}
                  </span>
                </div>
              )}
              {candidate.isShortlisted && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Icon icon="solar:star-bold" className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getDisplayName()}
              </h2>
              <p className="text-gray-600 mb-1">{candidate.profile?.location || 'Location not specified'}</p>
              <p className="text-gray-500 mb-4">{candidate.profile?.jobTitle || 'Job title not specified'}</p>
              
              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:letter-unread-bold" className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{candidate.profile?.contacts?.email || candidate.user}</span>
                </div>
                {candidate.profile?.contacts?.phone && (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:phone-bold" className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{candidate.profile.contacts.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match Scores */}
            <div className="flex flex-col gap-3">
              <div className="text-center">
                <div className={`text-lg font-bold px-3 py-2 rounded-lg ${getMatchScoreColor(candidate.overall_match_percentage)}`}>
                  {Math.round(candidate.overall_match_percentage)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Match Score</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold px-3 py-2 rounded-lg bg-blue-100 text-blue-600">
                  {Math.round(candidate.quiz_score)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Quiz Score</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          {candidate.profile?.coverLetter && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">
                {candidate.profile.coverLetter}
              </p>
            </div>
          )}

          {/* Skills Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.profile?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              )) || (
                <span className="text-gray-500 text-sm">No skills listed</span>
              )}
            </div>
          </div>

          {/* Languages Section */}
          {candidate.profile?.languages && candidate.profile.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.profile.languages.map((language, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {candidate.profile?.experiences && candidate.profile.experiences.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
              <div className="space-y-4">
                {candidate.profile.experiences.map((experience, index) => (
                  <div key={index} className="border-l-2 border-brand/20 pl-4">
                    <h4 className="font-semibold text-gray-900">{experience.position}</h4>
                    <p className="text-brand font-medium">{experience.company}</p>
                    <p className="text-sm text-gray-600 mb-2">{experience.duration}</p>
                    <p className="text-gray-700 text-sm">{experience.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <Icon icon="solar:close-circle-bold" className="w-4 h-4 mr-2" />
              Close
            </Button>
            
            {candidate.isShortlisted ? (
              <>
                <Button
                  onClick={onScheduleInterview}
                  className="flex-1 bg-brand hover:bg-brand/90"
                >
                  <Icon icon="solar:calendar-bold" className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button
                  onClick={handleUnshortlist}
                  disabled={shortlistMutation.isPending || unshortlistMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  {(shortlistMutation.isPending || unshortlistMutation.isPending) ? (
                    <Icon icon="solar:loading-bold" className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Icon icon="solar:star-bold" className="w-4 h-4 mr-2" />
                  )}
                  Unshortlist
                </Button>
              </>
            ) : (
              <Button
                onClick={handleShortlist}
                disabled={shortlistMutation.isPending || unshortlistMutation.isPending}
                className="flex-1 bg-brand hover:bg-brand/90"
              >
                {(shortlistMutation.isPending || unshortlistMutation.isPending) ? (
                  <Icon icon="solar:loading-bold" className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Icon icon="solar:star-bold" className="w-4 h-4 mr-2" />
                )}
                Add to Shortlist
              </Button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CandidateDetailsModal;