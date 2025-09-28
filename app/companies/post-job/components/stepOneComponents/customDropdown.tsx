'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import useJobOptions from '@/hooks/jobs/useJobOptions';

interface CustomJobTypeDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const CustomJobTypeDropdown: React.FC<CustomJobTypeDropdownProps> = ({ 
  value = "", 
  onChange, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use the hook to get job options
  const { data: jobOptions, isLoading, error } = useJobOptions();

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update internal state when prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Transform the job_types object from API into the format needed for the dropdown
  const jobTypes = React.useMemo(() => {
    // If we have job types from the API, use them
    if (jobOptions?.job_types) {
      const apiJobTypes = Object.entries(jobOptions.job_types).map(([key, value]) => ({
        value: key,
        label: String(value)
      }));
      
      return [
        { value: "", label: "Select job type" },
        ...apiJobTypes
      ];
    }

    // Return empty array with just placeholder if no data
    return [
      { value: "", label: "Select job type" }
    ];
  }, [jobOptions?.job_types]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const getDisplayText = () => {
    const selected = jobTypes.find(type => type.value === selectedValue);
    return selected ? selected.label : "Select job type";
  };

  const isPlaceholder = !selectedValue;

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
          Job type*
        </label>
        <div className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 bg-gray-100 animate-pulse">
          <div className="h-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show loading state if needed
  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
          Job type*
        </label>
        <div className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 bg-gray-100 animate-pulse">
          <div className="h-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
        Job type*
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Custom Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 
            text-left bg-white transition-all duration-200
            hover:border-gray-400 focus:border-brand2 focus:ring focus:ring-brand2/10 
            focus:ring-opacity-50 focus:outline-none
            ${isPlaceholder ? 'text-gray-500' : 'text-gray-900'}
            ${error ? 'border-red-300' : ''}
          `}
          disabled={!!error || jobTypes.length <= 1}
        >
          <div className="flex items-center justify-between">
            <span>
              {error ? "Error loading job types" : 
               jobTypes.length <= 1 ? "No job types available" : 
               getDisplayText()}
            </span>
            {!error && jobTypes.length > 1 && (
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`} 
              />
            )}
          </div>
        </button>

        {/* Dropdown Options */}
        {isOpen && !error && jobTypes.length > 1 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {jobTypes.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 
                  focus:outline-none transition-colors duration-150
                  ${option.value === selectedValue ? 'bg-brand2/5 text-brand2' : 'text-gray-900'}
                  ${option.value === "" ? 'text-gray-500' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {option.value === selectedValue && option.value !== "" && (
                    <Check className="h-4 w-4 text-brand2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">Error loading job types</p>
      )}
    </div>
  );
};

export default CustomJobTypeDropdown;