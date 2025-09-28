"use client"
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HomeHeader from '../(Home)/Components/HomeHeader';
import EnhancedSearch from '@/components/EnhancedSearch';
import Filters from './components/Filters';
import JobCard from '@/components/jobs/JobCard';
import useJobsWithSearch, { JobSearchParams } from '@/hooks/jobs/useJobsWithFilters';
import useCategories from '@/hooks/jobs/useCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@iconify/react/dist/iconify.js';
import Pagination from './components/Pagination';
import JobCardList from '@/components/jobs/JobCardList';

interface SelectedFilters {
  locationType: string[];
  jobType: string[];
  salary: string[];
  industry: string[];
}

export default function JobListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobListingsRef = useRef<HTMLDivElement>(null);
  const initializedFromUrlRef = useRef(false);

  // Set page title
  useEffect(() => {
    document.title = 'Find Jobs | UmEmployed'
  }, []);

  // API search parameters
  const [apiParams, setApiParams] = useState<JobSearchParams>({
    page: 1,
    page_size: 10,
    ordering: '-created_at'
  });

  // UI state (keeping same structure)
  const [filters, setFilters] = useState<SelectedFilters>({
    locationType: [],
    jobType: [],
    salary: [],
    industry: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('latest');

  // Use API search hook
  const { data, isLoading, error } = useJobsWithSearch(apiParams);

  // Get categories data for URL parameter conversion
  const { data: categoriesData } = useCategories();
  
  // Initialize from URL parameters
  useEffect(() => {
    if (initializedFromUrlRef.current) return;
    
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category');
    
    // Set search query
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
    
    // Set category when categories are loaded
    if (categoryFromUrl && categoriesData?.allCategories) {
      const category = categoriesData.allCategories.find(
        cat => cat.name === categoryFromUrl
      );
      if (category) {
        setSelectedCategoryId(category.id);
      } else {
      }
    }

    // Update API params with URL values
    const newApiParams: JobSearchParams = {
      page: 1,
      page_size: 10,
      ordering: '-created_at'
    };

    if (searchFromUrl) {
      newApiParams.search = searchFromUrl;
    }

    if (categoryFromUrl && categoriesData?.allCategories) {
      const category = categoriesData.allCategories.find(cat => cat.name === categoryFromUrl);
      if (category) {
        newApiParams.category = category.id;
      }
    }

    setApiParams(newApiParams);
    initializedFromUrlRef.current = true;
  }, [searchParams, categoriesData]);

  // Jobs come filtered from API, but we still need client-side filtering for the UI filters
  // until we map them to API parameters
  const jobs = data?.jobs || [];
  const totalCount = data?.totalCount || 0;
  
  // Check if any filters are actually applied
  const hasActiveFilters = 
    filters.locationType.length > 0 ||
    filters.jobType.length > 0 ||
    filters.industry.length > 0 ||
    filters.salary.length > 0;

  // Apply additional client-side filtering only if filters are active
  const filteredJobs = useMemo(() => {
    // If no filters are applied, return all jobs from API
    if (!hasActiveFilters) {
      return jobs;
    }

    let filtered = [...jobs];
    
    // Apply UI filters only when they are selected
    if (filters.locationType.length > 0) {
      filtered = filtered.filter(job => filters.locationType.includes(job.locationType));
    }
    
    if (filters.jobType.length > 0) {
      filtered = filtered.filter(job => filters.jobType.includes(job.jobType.toLowerCase()));
    }
    
    if (filters.industry.length > 0) {
      filtered = filtered.filter(job => filters.industry.includes(job.company.industry));
    }
    
    if (filters.salary.length > 0) {
      filtered = filtered.filter(job => {
        return filters.salary.some(range => {
          if (range === '$0-$50k') return job.salary.includes('30') || job.salary.includes('40');
          if (range === '$50k-$100k') return job.salary.includes('60') || job.salary.includes('80');
          if (range === '$100k-$150k') return job.salary.includes('120') || job.salary.includes('140');
          if (range === '$150k+') return job.salary.includes('160') || job.salary.includes('200');
          return true;
        });
      });
    }
    
    return filtered;
  }, [jobs, filters, hasActiveFilters]);

  // Update URL and perform search
  const updateUrlAndSearch = (query: string, categoryId?: number) => {
    const params = new URLSearchParams();
    
    if (query.trim()) {
      params.set('search', query.trim());
    }
    
    if (categoryId && categoriesData?.allCategories) {
      const category = categoriesData.allCategories.find(cat => cat.id === categoryId);
      if (category) {
        params.set('category', category.name);
      }
    }
    
    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : '/jobs';
    
    // Update URL without reloading the page
    router.push(url, { scroll: false });
    
    // Update state
    setSearchQuery(query);
    setSelectedCategoryId(categoryId);
    
    // Update API params
    setApiParams(prev => ({
      ...prev,
      search: query.trim() || undefined,
      category: categoryId,
      page: 1
    }));
  };

  const handleSearch = (query: string, categoryId?: number) => {
    updateUrlAndSearch(query, categoryId);
    scrollToJobListings();
  };

  const handleFilterChange = (newFilters: SelectedFilters) => {
    setFilters(newFilters);
    // Note: UI filters will eventually be mapped to API parameters
    scrollToJobListings();
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    
    let ordering = '-created_at';
    if (newSortBy === 'latest') ordering = '-created_at';
    else if (newSortBy === 'oldest') ordering = 'created_at';
    else if (newSortBy === 'salary-high') ordering = '-salary';
    else if (newSortBy === 'salary-low') ordering = 'salary';
    
    setApiParams(prev => ({
      ...prev,
      ordering,
      page: 1
    }));
  };

  // For now, show filtered jobs (will be all jobs from current page once filters are mapped to API)
  const paginatedJobs = filteredJobs;
  const currentPage = apiParams.page || 1;
  const pageSize = apiParams.page_size || 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  const scrollToJobListings = () => {
    jobListingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePageChange = (page: number) => {
    setApiParams(prev => ({
      ...prev,
      page
    }));
    scrollToJobListings();
  };

  const setItemsPerPage = (itemsPerPage: number) => {
    setApiParams(prev => ({
      ...prev,
      page_size: itemsPerPage,
      page: 1
    }));
    scrollToJobListings();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className='bg-blue-950'>
        <div className=" px-4">
          <div className="">
            <HomeHeader />
            <div className="flex flex-col items-center justify-center py-24 relative">
              <div className="text-center text-white">
                <h3 className="text-3xl  md:text-5xl dm-serif tracking-wider">
                  Find Your Dream Job
                </h3>
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto my-10">
                  Browse thousands of job listings
                </p>
              </div>
               <EnhancedSearch 
                 className="mt-6" 
                 onSearch={handleSearch}
                 initialQuery={searchQuery}
                 initialCategoryId={selectedCategoryId}
               />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 md:px-4 py-12 mt-4 md:mt-18">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:gap-54 items-start">
          <div className=" lg:col-span-1">
            <Filters onFilterChange={handleFilterChange} />
          </div>

          <div className="lg:col-span-3" ref={jobListingsRef}>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="flex items-center gap-2 md:text-lg ">
                 <span className="text-gray-500 ">All</span>
                 <span className="font-semibold text-lg">
                   {totalCount.toLocaleString()}
                 </span>
                 <span className="text-gray-500 ">jobs found</span>
                 {searchQuery && (
                   <span className="text-gray-500">for "{searchQuery}"</span>
                 )}
               </div>
              
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <Select 
                          value={String(pageSize)} 
                          onValueChange={(value) => setItemsPerPage(Number(value))}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="10" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                   <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[120px] border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="salary-high">Salary (High)</SelectItem>
                      <SelectItem value="salary-low">Salary (Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="List View"
                  >
                    <Icon icon="material-symbols:list" width="20" height="20" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Grid View"
                  >
                    <Icon icon="material-symbols:grid-view" width="20" height="20" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className='h-[40vh] flex justify-center items-center w-full'>
                <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" />
              </div>
            ) : (
              <>
                 {filteredJobs.length === 0 ? (
                   <div className="text-center py-12">
                     {searchQuery ? 
                       `No jobs found matching "${searchQuery}"` : 
                       hasActiveFilters ? 
                         'No jobs match your filters' :
                         'No jobs available'}
                   </div>
                 ) : (
                  <>
                    {/* Dynamic Job Display based on view mode */}
                    {viewMode === 'list' ? (
                      <div className="grid grid-cols-1 gap-6 mt-6">
                        {paginatedJobs.map((job: any) => (
                          <JobCardList key={job.id} job={job} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {paginatedJobs.map((job: any) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    )}

                     {/* Enhanced Pagination Component */}
                     {totalPages > 1 && (
                       <Pagination
                         currentPage={currentPage}
                         totalPages={totalPages}
                         onPageChange={handlePageChange}
                         onPrevious={handlePrevious}
                         onNext={handleNext}
                       />
                     )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}