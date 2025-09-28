"use client"
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import useJobOptions from '@/hooks/jobs/useJobOptions';
import { motion, AnimatePresence } from 'framer-motion';

type FilterOptions = {
  name: string;
  title: string;
  options: string[];
};

type ExpandedFilters = {
  locationType: boolean;
  jobType: boolean;
  salary: boolean;
  industry: boolean;
};

type SelectedFilters = {
  locationType: string[];
  jobType: string[];
  salary: string[];
  industry: string[];
};

interface FiltersProps {
  onFilterChange: (filters: SelectedFilters) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [expandedFilters, setExpandedFilters] = useState<ExpandedFilters>({
    locationType: true,
    jobType: true,
    salary: true,
    industry: true
  });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    locationType: [],
    jobType: [],
    salary: [],
    industry: []
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Get job options from API
  const { data: jobOptions } = useJobOptions();

  // Dynamic filter options with fallback to static options
  const filterOptions: FilterOptions[] = [
    {
      name: 'locationType',
      title: 'Location Type',
      options: jobOptions?.job_location_types 
        ? Object.keys(jobOptions.job_location_types).map(key => key.replace('_', ' '))
        : ['remote', 'onsite', 'hybrid']
    },
    {
      name: 'jobType',
      title: 'Job Type',
      options: jobOptions?.job_types 
        ? Object.keys(jobOptions.job_types).map(key => key.replace('_', ' ').toLowerCase())
        : ['full time', 'part time', 'contract', 'freelance', 'internship']
    },
    {
      name: 'salary',
      title: 'Salary Range',
      options: jobOptions?.salary_ranges 
        ? Object.keys(jobOptions.salary_ranges).map(range => {
            // Convert backend ranges to display format
            if (range === '0-10000') return '$0-$10k';
            if (range === '10001-20000') return '$10k-$20k';
            if (range === '20001-30000') return '$20k-$30k';
            if (range === '30000-50000') return '$30k-$50k';
            if (range === '50001-70000') return '$50k-$70k';
            if (range === '70001-100000') return '$70k-$100k';
            if (range === '100001-150000') return '$100k-$150k';
            if (range === '150001+') return '$150k+';
            return range;
          })
        : ['$0-$50k', '$50k-$100k', '$100k-$150k', '$150k+']
    },
    {
      name: 'industry',
      title: 'Industry',
      options: jobOptions?.categories 
        ? jobOptions.categories.slice(0, 8).map(cat => cat.name)
        : ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail']
    }
  ];

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
          <span className="font-medium">Filters</span>
        </motion.button>
      </div>

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block min-[1024px]:w-60 min-[1200px]:w-72 min-[1400px]:w-82 border-r h-full bg-white">
        <div className="p-4 border-b">
          <p className="text-xl md:text-[26px] font-semibold">Filter By</p>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {filterOptions.map((filter) => (
            <div key={filter.name} className="border-b py-6">
              <motion.button 
                onClick={() => toggleFilterSection(filter.name as keyof ExpandedFilters)}
                className="w-full flex justify-between items-center p-4"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <span className="font-medium">{filter.title}</span>
               <div className='text-white flex items-center justify-center h-5 w-5 bg-brand rounded-full'>
                   <motion.span
                  animate={{ rotate: expandedFilters[filter.name as keyof ExpandedFilters] ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  {expandedFilters[filter.name as keyof ExpandedFilters] ? '−' : '+'}
                </motion.span>
               </div>
              </motion.button>
              
              <AnimatePresence>
                {expandedFilters[filter.name as keyof ExpandedFilters] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-2 px-4">
                      {filter.options.map((option) => (
                        <motion.div 
                          key={option} 
                          className="py-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="flex items-center space-x-2 p-2">
                            <input 
                              type="checkbox"
                              checked={selectedFilters[filter.name as keyof SelectedFilters].includes(option)}
                              onChange={() => handleFilterSelection(filter.name as keyof SelectedFilters, option)}
                              className="w-4 h-4"
                              style={{ transform: 'translateZ(0)' }}
                            />
                            <span>{option}</span>
                          </label>
                        </motion.div>
                      ))}
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
                <h1 className="text-xl font-medium">Filter By</h1>
                <motion.button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2"
                  aria-label="Close filters"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon icon="heroicons:x-mark" className='' width={24} height={24} />
                </motion.button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {filterOptions.map((filter) => (
                  <div key={filter.name} className="border-b py-6">
                    <motion.button 
                      onClick={() => toggleFilterSection(filter.name as keyof ExpandedFilters)}
                      className="w-full flex justify-between items-center p-4"
                      whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    >
                      <span className="font-medium">{filter.title}</span>
                   <div className="w-5 h-5 rounded-full bg-brand text-white">
                       <motion.span
                        animate={{ rotate: expandedFilters[filter.name as keyof ExpandedFilters] ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        {expandedFilters[filter.name as keyof ExpandedFilters] ? '−' : '+'}
                      </motion.span>
                   </div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {expandedFilters[filter.name as keyof ExpandedFilters] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-2 px-4">
                            {filter.options.map((option) => (
                              <motion.div 
                                key={option} 
                                className="py-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <label className="flex items-center space-x-2 p-2">
                                  <input 
                                    type="checkbox"
                                    checked={selectedFilters[filter.name as keyof SelectedFilters].includes(option)}
                                    onChange={() => handleFilterSelection(filter.name as keyof SelectedFilters, option)}
                                    className="w-4 h-4"
                                  />
                                  <span>{option}</span>
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Sticky Apply Button */}
              <div className="p-4 border-t bg-white">
                <motion.button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-brand text-white py-3 rounded-lg font-medium"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}