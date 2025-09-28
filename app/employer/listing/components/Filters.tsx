"use client"
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import useCompanyOptions from '@/hooks/companies/useCompanyOptions';

type ExpandedFilters = {
  industry: boolean;
  size: boolean;
  country: boolean;
  hasJobs: boolean;
  foundedYear: boolean;
};

type SelectedFilters = {
  industry: string[];
  size: string[];
  country: string[];
  hasJobs: string[];
  foundedYear: string[];
};

interface FiltersProps {
  onFilterChange: (filters: SelectedFilters) => void;
}

export default function CompanyFilters({ onFilterChange }: FiltersProps) {
  // Get filter options from API
  const { data: companyOptions, isLoading: optionsLoading } = useCompanyOptions();

  const [expandedFilters, setExpandedFilters] = useState<ExpandedFilters>({
    industry: true,
    size: true,
    country: true,
    hasJobs: true,
    foundedYear: true
  });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    industry: [],
    size: [],
    country: [],
    hasJobs: [],
    foundedYear: []
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQueries, setSearchQueries] = useState({
    industry: '',
    size: '',
    country: ''
  });

  // Dynamic filter options from API with fallbacks
  const filterOptions = {
    industry: (companyOptions && typeof companyOptions === 'object' && companyOptions !== null && 'industries' in companyOptions && Array.isArray(companyOptions.industries)) 
      ? companyOptions.industries.map(ind => ind.label) 
      : [
          "Technology", "Finance", "Healthcare", "Education", 
          "Manufacturing", "Retail", "Hospitality", "Construction",
          "Media & Entertainment", "Transportation", "Energy", "Real Estate"
        ],
    size: (companyOptions && typeof companyOptions === 'object' && companyOptions !== null && 'sizes' in companyOptions && Array.isArray(companyOptions.sizes))
      ? companyOptions.sizes.map(size => size.label)
      : [
          "1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees",
          "501-1000 employees", "1001-5000 employees", "5001-10000 employees", "10000+ employees"
        ],
    country: (companyOptions && typeof companyOptions === 'object' && companyOptions !== null && 'countries' in companyOptions && Array.isArray(companyOptions.countries))
      ? companyOptions.countries.map(country => country.name)
      : [
          "United States", "United Kingdom", "Canada", "Germany",
          "France", "Australia", "Japan", "Singapore"
        ],
    hasJobs: [
      "Companies with jobs", "Companies without jobs"
    ],
    foundedYear: [
      "Before 1990", "1990-1999", "2000-2009", "2010-2019", "2020-2024"
    ]
  };

  const toggleFilterSection = (filterName: keyof ExpandedFilters) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleFilterSelection = (filterType: keyof SelectedFilters, value: string) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: selectedFilters[filterType].includes(value)
        ? selectedFilters[filterType].filter(item => item !== value)
        : [...selectedFilters[filterType], value]
    };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      industry: [],
      size: [],
      country: [],
      hasJobs: [],
      foundedYear: []
    };
    setSelectedFilters(clearedFilters);
    setSearchQueries({ industry: '', size: '', country: '' });
    onFilterChange(clearedFilters);
  };

  const handleSearchChange = (filterType: keyof typeof searchQueries, value: string) => {
    setSearchQueries(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Filter options based on search query
  const getFilteredOptions = (filterType: keyof typeof filterOptions) => {
    const query = searchQueries[filterType as keyof typeof searchQueries] || '';
    return filterOptions[filterType]?.filter(option =>
      option && typeof option === 'string' && option.toLowerCase().includes(query.toLowerCase())
    ) || [];
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden">
        <motion.button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center justify-center space-x-2 bg-white border border-gray-300 p-3 rounded-md w-full"
          whileTap={{ scale: 0.98 }}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <Icon icon="heroicons:funnel" width={20} height={20} />
          <span className="font-medium">Company Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-brand text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block min-[1024px]:w-60 min-[1200px]:w-72 min-[1400px]:w-82 border-r h-full bg-white">
        <div className="p-4 border-b flex justify-between items-center">
          <p className="text-xl md:text-[26px] font-semibold">Filter Companies</p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-brand hover:text-brand/80 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="h-fit">
          {Object.entries({
            industry: "Industry",
            size: "Company Size", 
            country: "Country",
            hasJobs: "Job Availability",
            foundedYear: "Founded Year"
          }).map(([key, title]) => (
            <div key={key} className="border-b py-6">
              <motion.button 
                onClick={() => toggleFilterSection(key as keyof ExpandedFilters)}
                className="w-full flex justify-between items-center p-4"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <span className="font-medium">{title}</span>
                <div className='text-white flex items-center justify-center h-5 w-5 bg-brand rounded-full'>
                  <motion.span
                    animate={{ rotate: expandedFilters[key as keyof ExpandedFilters] ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {expandedFilters[key as keyof ExpandedFilters] ? '−' : '+'}
                  </motion.span>
                </div>
              </motion.button>
              
              <AnimatePresence>
                {expandedFilters[key as keyof ExpandedFilters] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className=""
                  >
                    <div className="pb-2 px-4 h-fit">
                      {getFilteredOptions(key as keyof typeof filterOptions).length > 0 ? (
                        getFilteredOptions(key as keyof typeof filterOptions).map((option) => (
                          <motion.div 
                            key={option} 
                            className="py-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <label className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50 rounded">
                              <input 
                                type="checkbox"
                                checked={selectedFilters[key as keyof SelectedFilters].includes(option)}
                                onChange={() => handleFilterSelection(key as keyof SelectedFilters, option)}
                                className="w-4 h-4 text-brand focus:ring-brand"
                                style={{ transform: 'translateZ(0)' }}
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-2 text-center text-gray-500 text-sm">
                          No {title.toLowerCase()} found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Filter Panel - Fixed Position */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              className="lg:hidden fixed inset-0 bg-black/30 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
              style={{ 
                backdropFilter: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            />
            
            <motion.div 
              className="md:hidden fixed inset-y-0 right-0 w-full max-w-xs bg-white z-50 overflow-y-auto flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              style={{
                willChange: 'transform',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h1 className="text-xl font-medium">Filter Companies</h1>
                <motion.button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2"
                  aria-label="Close filters"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon icon="heroicons:x-mark" width={24} height={24} />
                </motion.button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {Object.entries({
                  industry: "Industry",
                  size: "Company Size",
                  country: "Country", 
                  hasJobs: "Job Availability",
                  foundedYear: "Founded Year"
                }).map(([key, title]) => (
                  <div key={key} className="border-b py-6">
                    {/* Search Input for mobile */}
                    {(key === 'industry' || key === 'size' || key === 'country') && (
                      <div className="px-4 pb-3">
                        <div className="relative">
                          <Icon 
                            icon="heroicons:magnifying-glass" 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                          />
                          <input
                            type="text"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            value={searchQueries[key as keyof typeof searchQueries]}
                            onChange={(e) => handleSearchChange(key as keyof typeof searchQueries, e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <motion.button 
                      onClick={() => toggleFilterSection(key as keyof ExpandedFilters)}
                      className="w-full flex justify-between items-center p-4"
                      whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    >
                      <span className="font-medium">{title}</span>
                      <div className="w-5 h-5 rounded-full bg-brand text-white">
                        <motion.span
                          animate={{ rotate: expandedFilters[key as keyof ExpandedFilters] ? 0 : 180 }}
                          transition={{ duration: 0.2 }}
                        >
                          {expandedFilters[key as keyof ExpandedFilters] ? '−' : '+'}
                        </motion.span>
                      </div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {expandedFilters[key as keyof ExpandedFilters] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-2 px-4 max-h-60 overflow-y-auto">
                            {getFilteredOptions(key as keyof typeof filterOptions).length > 0 ? (
                              getFilteredOptions(key as keyof typeof filterOptions).map((option) => (
                                <motion.div 
                                  key={option} 
                                  className="py-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <label className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50 rounded">
                                    <input 
                                      type="checkbox"
                                      checked={selectedFilters[key as keyof SelectedFilters].includes(option)}
                                      onChange={() => handleFilterSelection(key as keyof SelectedFilters, option)}
                                      className="w-4 h-4 text-brand focus:ring-brand"
                                    />
                                    <span className="text-sm">{option}</span>
                                  </label>
                                </motion.div>
                              ))
                            ) : (
                              <div className="py-2 text-center text-gray-500 text-sm">
                                No {title.toLowerCase()} found
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Sticky Apply Button */}
              <div className="p-4 border-t bg-white sticky bottom-0">
                <div className="flex space-x-3">
                  {activeFilterCount > 0 && (
                    <motion.button
                      onClick={clearAllFilters}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Clear All
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 bg-brand text-white py-3 rounded-lg font-medium"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}