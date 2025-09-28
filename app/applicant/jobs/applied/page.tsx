"use client"
import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { TransformedJob } from '@/utility/jobTransformer';
import JobCardList from '@/components/jobs/JobCardList';
import { useAppliedJobs } from '@/hooks/jobs/useAppliedJobs';
import { useSaveJob } from '@/hooks/jobs/useSavedJobs';

type SortOption = 'newest' | 'oldest' | 'title' | 'company' | 'salary';

export default function AppliedJobs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { 
    appliedJobs, 
    totalCount, 
    isLoading, 
    isError, 
    refetch 
  } = useAppliedJobs({ page: currentPage });


  const { mutate: saveJob } = useSaveJob();

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = appliedJobs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = appliedJobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.company.industry.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'oldest':
          return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'company':
          return a.company.name.localeCompare(b.company.name);
        case 'salary':
          return a.salary.localeCompare(b.salary);
        default:
          return 0;
      }
    });

    return sorted;
  }, [appliedJobs, searchQuery, sortBy]);

  const handleJobSave = (jobId: number) => {
    saveJob(jobId);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Applied Jobs</h3>
        <p className="text-gray-600 mb-4">Something went wrong while fetching your applied jobs.</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-2 md:p-8 lg:p-16  min-h-screen mt-4 md:mt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className='p-2 md:p-0'>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Applied Jobs</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} {totalCount === 1 ? 'job' : 'jobs'} applied
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Icon 
            icon="heroicons:magnifying-glass" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search jobs, companies, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg max-w-md focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Job Title A-Z</option>
            <option value="company">Company A-Z</option>
            <option value="salary">Salary Range</option>
          </select>
          <Icon 
            icon="heroicons:chevron-down" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
          />
        </div>
      </div>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-gray-600 mt-2">
          Showing {filteredAndSortedJobs.length} result{filteredAndSortedJobs.length !== 1 ? 's' : ''} 
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4 my-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && (
        <div className='rounded-xl my-6'>
          {filteredAndSortedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon icon="heroicons:paper-airplane" className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No jobs found' : 'No applied jobs yet'}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery 
                  ? 'Try adjusting your search terms or clearing the search to see all applied jobs.'
                  : 'Start applying to jobs to see them here.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 text-brand hover:bg-brand/10 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedJobs.map((job) => (
                <JobCardList
                  key={job.id}
                  job={job}
                  onSave={handleJobSave}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}