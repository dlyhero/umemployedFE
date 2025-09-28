"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ApplicationCandidate } from '@/hooks/companies/useApplications';
import CandidateCard from './CandidateCard';

interface TopCandidatesSectionProps {
  candidates: ApplicationCandidate[];
  jobId: string;
  onViewCandidate: (candidate: ApplicationCandidate) => void;
  onScheduleInterview: (candidate: ApplicationCandidate) => void;
  isShortlistTab?: boolean;
  shortlistedCandidateIds?: Set<number>;
}

const TopCandidatesSection: React.FC<TopCandidatesSectionProps> = ({
  candidates,
  jobId,
  onViewCandidate,
  onScheduleInterview,
  isShortlistTab = false,
  shortlistedCandidateIds = new Set()
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${isShortlistTab ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'} rounded-lg flex items-center justify-center`}>
            <Icon icon={isShortlistTab ? "solar:star-bold-duotone" : "solar:crown-bold-duotone"} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isShortlistTab ? 'Shortlisted Candidates' : 'Top 5 Candidates'}
            </h2>
            <p className="text-sm text-gray-600">
              {isShortlistTab ? 'Candidates ready for interviews' : 'Highest matching candidates'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${isShortlistTab ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
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
              isShortlistTab={isShortlistTab}
              isShortlisted={shortlistedCandidateIds.has(candidate.user_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:users-group-two-rounded-line-duotone" className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Candidates Yet</h3>
          <p className="text-gray-600">Applications will appear here once candidates start applying to your jobs.</p>
        </div>
      )}
    </div>
  );
};

export default TopCandidatesSection;