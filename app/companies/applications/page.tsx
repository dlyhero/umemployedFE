"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useApplications, useJobApplications } from '@/hooks/companies/useApplications';
import { useCompanyJobs } from '@/hooks/companies/useApplication';
import { useShortlistedCandidates } from '@/hooks/companies/useShortlistedCandidates';
import ApplicationStats from './components/ApplicationStats';
import TopCandidatesSection from './components/TopCandidatesSection';
import WaitingListSection from './components/WaitingListSection';
import CandidateDetailsModal from './components/CandidateDetailsModal';
import InterviewSchedulingModal from './components/InterviewSchedulingModal';
import JobCard from './components/JobCard';
import Pagination from './components/Pagination';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ApplicantCard from '../jobs/components/ApplicantCard';

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'jobs' | 'applications'>('jobs');
  const [activeTab, setActiveTab] = useState<'all' | 'shortlist'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch jobs data
  const { 
    data: jobs = [], 
    isLoading: jobsLoading, 
    isError: jobsError, 
    error: jobsErrorMsg 
  } = useCompanyJobs(session?.user?.companyId as string);

  // Fetch applications data for selected job
  const { 
    data: applicationsData, 
    isLoading: applicationsLoading, 
    isError: applicationsError, 
    error: applicationsErrorMsg 
  } = useJobApplications(
    session?.user?.companyId as string, 
    selectedJobId as string,
    currentPage,
    pageSize
  );

  // Fetch shortlisted candidates for accurate count
  const { 
    data: shortlistedCandidates = [], 
    isLoading: shortlistedLoading 
  } = useShortlistedCandidates(
    session?.user?.companyId as string, 
    selectedJobId as string
  );

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
  };

  const handleScheduleInterview = (candidate: any) => {
    console.log('handleScheduleInterview called with selectedJobId:', selectedJobId);
    if (!selectedJobId) {
      alert('No job selected. Please select a job first.');
      return;
    }
    setSelectedCandidate(candidate);
    setIsInterviewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCandidateModalOpen(false);
    setIsInterviewModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setViewMode('applications');
    setCurrentPage(1); // Reset to first page when selecting a new job
  };

  const handleBackToJobs = () => {
    setViewMode('jobs');
    setSelectedJobId(null);
    setCurrentPage(1); // Reset pagination
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading state for jobs
  if (jobsLoading) {
    return (
      <div className="overflow-auto border-none min-[1220px]:border">
        <div className="lg:p-14 min-[1220px]:p-14">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Icon icon="eos-icons:loading" className="w-8 h-8 text-brand animate-spin" />
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for jobs
  if (jobsError) {
    return (
      <div className="overflow-auto border-none min-[1220px]:border">
        <div className="lg:p-14 min-[1220px]:p-14">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Icon icon="material-symbols:error-outline" className="w-8 h-8 text-red-500" />
              <p className="text-gray-600">Error loading jobs</p>
              <p className="text-sm text-gray-500">{jobsErrorMsg?.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allApplications = applicationsData?.top_5_candidates?.concat(applicationsData?.waiting_list_candidates || []) || [];
  const selectedJob = jobs.find(job => job.id.toString() === selectedJobId);
  
  // Create a set of shortlisted candidate IDs for efficient lookup
  const shortlistedCandidateIds = new Set(shortlistedCandidates.map(c => c.candidate_id));
  
  // Filter applications based on active tab
  const applications = activeTab === 'shortlist' 
    ? allApplications.filter(app => shortlistedCandidateIds.has(app.user_id))
    : allApplications;
  
  // For shortlist tab, we don't need to split into top 5 and waiting list
  const topCandidates = activeTab === 'shortlist' 
    ? applications.slice(0, 5) 
    : applications.slice(0, 5);
  const waitingListCandidates = activeTab === 'shortlist' 
    ? applications.slice(5) 
    : applications.slice(5);

  return (
    <div className="border-none min-[1220px]:border">
      <div className="lg:p-14 min-[1220px]:p-14">
        {viewMode === 'jobs' ? (
          // Jobs View
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between px-4 mt-4 md:mt-0">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                    Select Job to View Applications
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Choose a job to review candidate applications
                  </p>
                </div>
                <button
                  onClick={() => router.push('/companies/jobs')}
                  className="border-brand text-brand hover:bg-brand/5 border px-6 py-2 rounded-full"
                >
                  Manage Jobs
                </button>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="px-4">
              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewApplications={() => handleSelectJob(job.id.toString())}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="hugeicons:briefcase-06" className="size-28 md:size-32 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                  <p className="text-gray-600 mb-4">You haven't created any job postings yet.</p>
                  <button
                    onClick={() => router.push('/companies/post-job')}
                    className="bg-brand hover:bg-brand/90 text-white px-12 py-4 rounded-full"
                  >
                    Create Your First Job
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Applications View
          <>
            {/* Header with Back Button */}
            <div className="mb-8">
              <div className="flex items-center justify-between px-4 mt-4 md:mt-0">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                    Applications for {selectedJob?.title}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Review and manage candidate applications
                  </p>
                </div>
                <Button
                  onClick={handleBackToJobs}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
                  Back to Jobs
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'all'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:users-group-two-rounded-line-duotone" className="w-4 h-4" />
                    All Candidates ({allApplications.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('shortlist')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'shortlist'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:star-bold-duotone" className="w-4 h-4" />
                    Shortlist ({shortlistedCandidates.length})
                  </div>
                </button>
              </div>
            </div>

            {/* Loading state for applications */}
            {applicationsLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <Icon icon="eos-icons:loading" className="w-8 h-8 text-brand animate-spin" />
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              </div>
            )}

            {/* Error state for applications */}
            {applicationsError && (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <Icon icon="material-symbols:error-outline" className="w-8 h-8 text-red-500" />
                  <p className="text-gray-600">Error loading applications</p>
                  <p className="text-sm text-gray-500">{applicationsErrorMsg?.message}</p>
                </div>
              </div>
            )}

            {/* Applications Content */}
            {!applicationsLoading && !applicationsError && (
              <>
                {/* Statistics */}
                <div className="px-4 mb-8">
                  <ApplicationStats applications={applications} />
                </div>

                {/* Top Candidates Section */}
                <div className="px-4 mb-8">
                  <TopCandidatesSection 
                    candidates={topCandidates}
                    jobId={selectedJobId as string}
                    onViewCandidate={handleViewCandidate}
                    onScheduleInterview={handleScheduleInterview}
                    isShortlistTab={activeTab === 'shortlist'}
                    shortlistedCandidateIds={shortlistedCandidateIds}
                  />
                </div>

                {/* Waiting List Section - Only show for All Candidates tab */}
                {activeTab === 'all' && waitingListCandidates.length > 0 && (
                  <div className="px-4 mb-8">
                    <WaitingListSection 
                      candidates={waitingListCandidates}
                      jobId={selectedJobId as string}
                      onViewCandidate={handleViewCandidate}
                      onScheduleInterview={handleScheduleInterview}
                      shortlistedCandidateIds={shortlistedCandidateIds}
                    />
                  </div>
                )}

                {/* Pagination */}
                {applicationsData?.pagination && applicationsData.pagination.total_pages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={applicationsData.pagination.total_pages}
                    totalCount={applicationsData.pagination.total_count}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Modals */}
        {selectedCandidate && (
          <>
            <CandidateDetailsModal
              candidate={selectedCandidate}
              jobId={selectedJobId || ''}
              isOpen={isCandidateModalOpen}
              onClose={handleCloseModals}
              onScheduleInterview={() => {
                setIsCandidateModalOpen(false);
                setIsInterviewModalOpen(true);
              }}
            />
            
            <InterviewSchedulingModal
              candidate={selectedCandidate}
              jobId={selectedJobId || ''}
              isOpen={isInterviewModalOpen}
              onClose={handleCloseModals}
            />
          </>
        )}
      </div>
    </div>
  );
}