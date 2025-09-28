"use client"
import { useState, useMemo, useRef, useEffect } from 'react';
import Search from '@/components/Search';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@iconify/react/dist/iconify.js';
import useCompaniesWithSearch, { CompanySearchParams } from '@/hooks/companies/useCompaniesWithSearch';
import CompanyFilters from './components/Filters';
import CompanyCard from './components/CompanyCard';
import Pagination from '@/app/jobs/components/Pagination';

type SelectedFilters = {
    industry: string[];
    size: string[];
    country: string[];
    hasJobs: string[];
    foundedYear: string[];
};

export default function CompanyListingPage() {
    const companyListingsRef = useRef<HTMLDivElement>(null);

    // API search parameters
    const [apiParams, setApiParams] = useState<CompanySearchParams>({
        page: 1,
        page_size: 10,
        ordering: '-updated_at'
    });

    // UI state for filters that aren't mapped to API yet
    const [filters, setFilters] = useState<SelectedFilters>({
        industry: [],
        size: [],
        country: [],
        hasJobs: [],
        foundedYear: []
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    // Use API search hook
    const { data, isLoading, error } = useCompaniesWithSearch(apiParams);

    // Companies come filtered from API, but we can still apply client-side filtering for UI filters not yet mapped to API
    const companies = data?.companies || [];
    const totalCount = data?.totalCount || 0;
    
    // Check if any filters are actually applied
    const hasActiveFilters = 
        filters.industry.length > 0 ||
        filters.size.length > 0 ||
        filters.country.length > 0 ||
        filters.hasJobs.length > 0 ||
        filters.foundedYear.length > 0;

    // Apply additional client-side filtering only if filters are active
    const filteredCompanies = useMemo(() => {
        // If no UI filters are applied, return all companies from API
        if (!hasActiveFilters) {
            return companies;
        }

        let filtered = [...companies];
        
        // Apply UI filters only when they are selected
        if (filters.industry.length > 0) {
            filtered = filtered.filter(company => filters.industry.includes(company.industry));
        }
        
        if (filters.size.length > 0) {
            filtered = filtered.filter(company => filters.size.includes(company.size));
        }
        
        if (filters.country.length > 0) {
            filtered = filtered.filter(company => filters.country.includes(company.country));
        }
        
        if (filters.hasJobs.length > 0) {
            filtered = filtered.filter(company => {
                const hasJobs = company.jobCount > 0;
                return filters.hasJobs.some(filter => {
                    if (filter === "Companies with jobs") return hasJobs;
                    if (filter === "Companies without jobs") return !hasJobs;
                    return true;
                });
            });
        }
        
        if (filters.foundedYear.length > 0) {
            filtered = filtered.filter(company => {
                return filters.foundedYear.some(range => {
                    if (range === "Before 1990") return company.founded < 1990;
                    if (range === "1990-1999") return company.founded >= 1990 && company.founded <= 1999;
                    if (range === "2000-2009") return company.founded >= 2000 && company.founded <= 2009;
                    if (range === "2010-2019") return company.founded >= 2010 && company.founded <= 2019;
                    if (range === "2020-2024") return company.founded >= 2020 && company.founded <= 2024;
                    return true;
                });
            });
        }
        
        return filtered;
    }, [companies, filters, hasActiveFilters]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setApiParams(prev => ({
            ...prev,
            search: query,
            page: 1
        }));
        scrollToCompanyListings();
    };

    const handleFilterChange = (newFilters: SelectedFilters) => {
        setFilters(newFilters);
        // Note: UI filters will eventually be mapped to API parameters
        scrollToCompanyListings();
    };

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        
        let ordering = '-updated_at';
        if (newSortBy === 'latest') ordering = '-updated_at';
        else if (newSortBy === 'oldest') ordering = 'updated_at';
        else if (newSortBy === 'name-asc') ordering = 'name';
        else if (newSortBy === 'name-desc') ordering = '-name';
        else if (newSortBy === 'founded-asc') ordering = 'founded';
        else if (newSortBy === 'founded-desc') ordering = '-founded';
        else if (newSortBy === 'jobs-desc') ordering = '-job_count';
        
        setApiParams(prev => ({
            ...prev,
            ordering,
            page: 1
        }));
    };

    // For now, show filtered companies (will be all companies from current page once filters are mapped to API)
    const paginatedCompanies = filteredCompanies;
    const currentPage = apiParams.page || 1;
    const pageSize = apiParams.page_size || 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    const scrollToCompanyListings = () => {
        companyListingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        scrollToCompanyListings();
    };

    const setItemsPerPage = (itemsPerPage: number) => {
        setApiParams(prev => ({
            ...prev,
            page_size: itemsPerPage,
            page: 1
        }));
        scrollToCompanyListings();
    };

    return (
        <div className="min-h-screen bg-white">
            <div className='bg-blue-950'>
                <div className=" px-4">
                    <div className="">
                        <div className="flex flex-col items-center justify-center py-24 relative">
                            <div className="text-center text-white">
                                <h3 className="text-3xl md:text-5xl dm-serif tracking-wider">
                                    Find Your Dream Company
                                </h3>
                                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto my-10">
                                    Browse thousands of company listings
                                </p>
                            </div>
                            <Search
                                className="mt-6"
                                onSearch={handleSearch}
                                initialQuery={searchQuery}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 md:px-4 py-12 mt-4 md:mt-18">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:gap-56 items-start">
                    <div className=" lg:col-span-1">
                        <CompanyFilters onFilterChange={handleFilterChange} />
                    </div>

                    <div className="lg:col-span-3" ref={companyListingsRef}>
                        {isLoading ? (
                            <div className='h-[40vh] flex justify-center items-center w-full'>
                                <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" />
                            </div>
                        ) : (
                            <>
                                {filteredCompanies.length === 0 ? (
                                    <div className="text-center py-12">
                                        {searchQuery ? 
                                            `No companies found matching "${searchQuery}"` : 
                                            hasActiveFilters ? 
                                                'No companies match your filters' :
                                                'No companies available'}
                                    </div>
                                ) : (
                                    <>
                                        {/* New Header Section */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                            <div className="flex items-center gap-2 md:text-lg">
                                                <span className="text-gray-500">All</span>
                                                <span className="font-semibold text-lg">
                                                    {totalCount.toLocaleString()}
                                                </span>
                                                <span className="text-gray-500">companies found</span>
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
                                                        <SelectTrigger className="w-[140px] border-gray-300">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="latest">Latest</SelectItem>
                                                            <SelectItem value="oldest">Oldest</SelectItem>
                                                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                                            <SelectItem value="founded-desc">Founded (Newest)</SelectItem>
                                                            <SelectItem value="founded-asc">Founded (Oldest)</SelectItem>
                                                            <SelectItem value="jobs-desc">Most Jobs</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {paginatedCompanies.map((company) => (
                                                <CompanyCard key={company.id} company={company} />
                                            ))}
                                        </div>

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