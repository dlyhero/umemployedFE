import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useRecommendedJobs } from '@/hooks/jobs/useRecommendedJobs'; // Adjust path as needed
import JobCardList from '@/components/jobs/JobCardList';
import RecommendedJobsFallback from '@/components/RecommendedJobsFallback';

interface RecommendedJobsProps {
  initialPageSize?: number;
  initialMinSkillsMatch?: number;
  showFilters?: boolean;
  className?: string;
}

// Loading Skeleton Component
const JobCardSkeleton = () => (
  <div className='p-6 border border-gray-200 rounded-xl bg-white animate-pulse'>
    <div className='flex items-start gap-4'>
      <div className='flex-shrink-0'>
        <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
      </div>
      <div className='flex-grow'>
        <div className='h-6 bg-gray-200 rounded w-2/3 mb-2'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2 mb-3'></div>
        <div className='flex gap-2 mb-3'>
          <div className='h-6 bg-gray-200 rounded w-20'></div>
          <div className='h-6 bg-gray-200 rounded w-24'></div>
        </div>
        <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
      </div>
      <div className='flex-shrink-0'>
        <div className='h-6 bg-gray-200 rounded w-20 mb-2'></div>
        <div className='h-4 bg-gray-200 rounded w-16'></div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className='text-center py-12'>
    <div className='mb-4'>
      <Icon 
        icon="heroicons:magnifying-glass" 
        className="w-16 h-16 text-gray-300 mx-auto mb-4" 
      />
    </div>
    <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Recommended Jobs Found</h3>
    <p className='text-gray-500 mb-4'>
      We couldn't find any jobs matching your profile at the moment.
    </p>
    <button className='px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors'>
      Update Your Profile
    </button>
  </div>
);

// Error State Component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className='text-center py-12'>
    <div className='mb-4'>
      <Icon 
        icon="heroicons:exclamation-triangle" 
        className="w-16 h-16 text-red-400 mx-auto mb-4" 
      />
    </div>
    <h3 className='text-lg font-semibold text-gray-700 mb-2'>Something went wrong</h3>
    <p className='text-gray-500 mb-4'>
      We couldn't load your recommended jobs. Please try again.
    </p>
    <button 
      onClick={onRetry}
      className='px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors'
    >
      Try Again
    </button>
  </div>
);

export default function RecommendedJobs({
  initialPageSize = 10,
  initialMinSkillsMatch = 0,
  showFilters = true,
  className = ''
}: RecommendedJobsProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [minSkillsMatch, setMinSkillsMatch] = useState(initialMinSkillsMatch);

  const {
    data: jobsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useRecommendedJobs({
    page,
    pageSize,
    minSkillsMatch,
    limit: 100
  });


  const handleSaveJob = (jobId: number) => {
    // Implement save job logic here
    // You can add an API call to save/unsave the job
  };

  const handleApplyJob = (jobId: number) => {
    // Implement apply job logic here
    // You can add navigation to application page or API call
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newMinSkillsMatch: number) => {
    setMinSkillsMatch(newMinSkillsMatch);
    setPage(1); // Reset to first page when filter changes
  };

  // Calculate pagination info
  const totalPages = (jobsData as any)?.total_pages || 0;
  const currentPage = (jobsData as any)?.current_page || 1;
  const totalJobs = (jobsData as any)?.count || (jobsData as any)?.length || 0;
  const jobs = jobsData || [];

  if (isError) {
    return (
      <div className={`bg-white rounded-xl shadow-sm ${className}`}>
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className={` rounded-xl mt-3 p-2 ${className}`}>
      {/* Header */}
      <div className='p-6'>
        <div className='flex items-center justify-between '>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-1'>
              Recommended Jobs
            </h2>
            <p className='text-gray-600'>
              {isLoading ? 'Loading...' : `${totalJobs} jobs found`}
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className='p-2 text-gray-500 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors'
            title='Refresh jobs'
          >
            <Icon 
              icon="heroicons:arrow-path" 
              className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>

        {/* Filters */}
        {/* {showFilters && (
          <div className='flex flex-col md:flex-row items-center gap-4'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Skills Match:
              </label>
              <select
                value={minSkillsMatch}
                onChange={(e) => handleFilterChange(Number(e.target.value))}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand'
              >
                <option value={0}>Any match</option>
                <option value={25}>25% or higher</option>
                <option value={50}>50% or higher</option>
                <option value={75}>75% or higher</option>
                <option value={90}>90% or higher</option>
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Per page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand'
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )} */}
      </div>

      {/* Jobs List */}
      <div className='lg:p-6'>
        {isLoading ? (
          <div className='space-y-4'>
            {[...Array(pageSize)].map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <RecommendedJobsFallback error={error} onRetry={() => (refetch as any)()} />
        ) : (jobs as any).length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className='space-y-4'>
              {(jobs as any).map((job: any) => (
                <JobCardList
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  onApply={handleApplyJob}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-8 flex items-center justify-between'>
                <div className='text-sm text-gray-600'>
                  Showing page {currentPage} of {totalPages}
                </div>
                
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isFetching}
                    className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Previous
                  </button>
                  
                  <div className='flex items-center gap-1'>
                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={isFetching}
                          className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-brand text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isFetching}
                    className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}