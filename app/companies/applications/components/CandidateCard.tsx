"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';
import { Button } from '@/components/ui/button';
import { useShortlistCandidate, useUnshortlistCandidate } from '@/hooks/companies/useShortlist';
import { useStartConversation } from '@/hooks/messaging/useConversations';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CandidateCardProps {
  candidate: ApplicationCandidate;
  jobId: string;
  onViewCandidate: (candidate: ApplicationCandidate) => void;
  onScheduleInterview: (candidate: ApplicationCandidate) => void;
  isShortlistTab?: boolean;
  isShortlisted?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  jobId,
  onViewCandidate,
  onScheduleInterview,
  isShortlistTab = false,
  isShortlisted = false
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const shortlistMutation = useShortlistCandidate();
  const unshortlistMutation = useUnshortlistCandidate();
  const startConversationMutation = useStartConversation();

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

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const handleUnshortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const handleStartConversation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!candidate.user_id) {
      console.error('Candidate user ID not found');
      return;
    }

    startConversationMutation.mutate(candidate.user_id, {
      onSuccess: (data) => {
        // Navigate to messages page with the conversation
        router.push(`/companies/messages?conversation=${data.conversation_id}`);
      },
      onError: (error) => {
        console.error('Failed to start conversation:', error);
      }
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
      onClick={() => onViewCandidate(candidate)}
    >
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          {candidate.profile?.profileImage ? (
            <img
              src={candidate.profile.profileImage}
              alt={getDisplayName()}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center border-2 border-gray-100">
              <span className="text-brand font-semibold text-sm">
                {getInitials(getDisplayName())}
              </span>
            </div>
          )}
          {candidate.isShortlisted && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <Icon icon="solar:star-bold" className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {getDisplayName()}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {candidate.profile?.location || 'Location not specified'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {candidate.profile?.jobTitle || 'Job title not specified'}
          </p>
        </div>
      </div>

      {/* Match Score and Quiz Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Match:</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMatchScoreColor(candidate.overall_match_percentage)}`}>
            {Math.round(candidate.overall_match_percentage)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Quiz:</span>
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-600">
            {Math.round(candidate.quiz_score)}%
          </span>
        </div>
      </div>

      {/* Skills Preview */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {candidate.profile?.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
            >
              {skill}
            </span>
          )) || (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
              No skills listed
            </span>
          )}
          {candidate.profile?.skills && candidate.profile.skills.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
              +{candidate.profile.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs min-w-0"
          onClick={(e) => {
            e.stopPropagation();
            onViewCandidate(candidate);
          }}
        >
          <Icon icon="solar:eye-bold" className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">View</span>
        </Button>
        
        {isShortlistTab ? (
          // In shortlist tab, show message and schedule interview buttons
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-brand border-brand/20 hover:bg-brand/5 min-w-0"
              onClick={handleStartConversation}
              disabled={startConversationMutation.isPending}
            >
              {startConversationMutation.isPending ? (
                <Icon icon="eos-icons:loading" className="w-3 h-3 mr-1 animate-spin flex-shrink-0" />
              ) : (
                <Icon icon="solar:chat-round-dots-bold" className="w-3 h-3 mr-1 flex-shrink-0" />
              )}
              <span className="truncate">Message</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-brand border-brand/20 hover:bg-brand/5 min-w-0"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleInterview(candidate);
              }}
            >
              <Icon icon="solar:calendar-bold" className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">Schedule</span>
            </Button>
          </>
        ) : isShortlisted ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleUnshortlist}
            disabled={shortlistMutation.isPending || unshortlistMutation.isPending}
          >
            {(shortlistMutation.isPending || unshortlistMutation.isPending) ? (
              <Icon icon="eos-icons:loading" className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Icon icon="solar:star-bold" className="w-3 h-3 mr-1" />
            )}
            Unshortlist
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs text-brand border-brand/20 hover:bg-brand/5"
            onClick={handleShortlist}
            disabled={shortlistMutation.isPending || unshortlistMutation.isPending}
          >
            {(shortlistMutation.isPending || unshortlistMutation.isPending) ? (
              <Icon icon="eos-icons:loading" className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Icon icon="solar:star-bold" className="w-3 h-3 mr-1" />
            )}
            Shortlist
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;