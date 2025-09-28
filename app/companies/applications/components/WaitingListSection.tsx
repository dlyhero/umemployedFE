"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';
import CandidateCard from './CandidateCard';

interface WaitingListSectionProps {
  candidates: ApplicationCandidate[];
  jobId: string;
  onViewCandidate: (candidate: ApplicationCandidate) => void;
  onScheduleInterview: (candidate: ApplicationCandidate) => void;
  shortlistedCandidateIds?: Set<number>;
}

const WaitingListSection: React.FC<WaitingListSectionProps> = ({
  candidates,
  jobId,
  onViewCandidate,
  onScheduleInterview,
  shortlistedCandidateIds = new Set()
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Waiting List</h2>
            <p className="text-sm text-gray-600">Additional candidates for review</p>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          {candidates.length} candidates
        </div>
      </div>

      {/* Candidates Grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.user_id}
              candidate={candidate}
              jobId={jobId}
              onViewCandidate={onViewCandidate}
              onScheduleInterview={onScheduleInterview}
              isShortlisted={shortlistedCandidateIds.has(candidate.user_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Waiting List</h3>
          <p className="text-gray-600">All candidates are currently in the top 5 section.</p>
        </div>
      )}
    </div>
  );
};

export default WaitingListSection;