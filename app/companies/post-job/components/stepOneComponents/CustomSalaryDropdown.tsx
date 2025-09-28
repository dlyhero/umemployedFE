'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';
import useJobOptions from '@/hooks/jobs/useJobOptions';

interface CustomSalaryDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

interface SalaryRange {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

const CustomSalaryDropdown: React.FC<CustomSalaryDropdownProps> = ({ 
  value = "", 
  onChange, 
  className = "",
  label = "Salary Range",
  placeholder = "Select salary range",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(value || "");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: jobOptions, isLoading, isError, error } = useJobOptions();

  console.log('💰 Salary dropdown props:', { value });
  console.log('💰 Job options from hook:', jobOptions);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update internal state when prop changes
  useEffect(() => {
    console.log('🔄 Salary dropdown value changed:', value);
    setSelectedValue(value || "");
  }, [value]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Transform salary ranges from API - NO FALLBACK, ONLY HOOK DATA
  const getSalaryRanges = (): SalaryRange[] => {
    if (!jobOptions?.salary_ranges) {
      console.log('❌ No salary ranges found in jobOptions');
      return [{ id: "", label: placeholder }];
    }

    console.log('✅ Salary ranges from API:', jobOptions.salary_ranges);

    // Convert the salary_ranges object to array format
    const apiRanges: SalaryRange[] = Object.entries(jobOptions.salary_ranges).map(([id, data]) => ({
      id: id,
      label: data.label || data.name || String(id),
      min: data.min,
      max: data.max
    }));

    // Add placeholder option at the beginning
    return [
      { id: "", label: placeholder },
      ...apiRanges
    ];
  };

  const salaryRanges = getSalaryRanges();
  const filteredRanges = salaryRanges.filter((range: SalaryRange) =>
    range.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (rangeId: string): void => {
    console.log('🎯 Salary range selected:', rangeId);
    setSelectedValue(rangeId);
    setIsOpen(false);
    setSearchTerm("");
    if (onChange) {
      onChange(rangeId);
    }
  };

  const getDisplayText = (): string => {
    if (!selectedValue) return placeholder;
    
    const selected = salaryRanges.find((range: SalaryRange) => range.id === selectedValue);
    const displayText = selected ? selected.label : placeholder;
    
    console.log('📋 Salary display text for', selectedValue, ':', displayText);
    return displayText;
  };

  const handleButtonClick = (): void => {
    if (isLoading || isError) return;
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const isPlaceholder: boolean = !selectedValue;

  console.log('🎨 Salary dropdown rendering with:', {
    selectedValue,
    displayText: getDisplayText(),
    salaryRangesCount: salaryRanges.length,
    isOpen,
    isLoading,
    isError
  });

  if (isError) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
          {label}{required && '*'}
        </label>
        <div className="mt-1 p-3 border border-red-300 rounded-md bg-red-50 text-red-700">
          <AlertCircle className="inline h-4 w-4 mr-2" />
          Failed to load salary ranges
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
        {label}{required && '*'}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className={`
            mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 
            text-left bg-white transition-all duration-200
            hover:border-gray-400 focus:border-brand2 focus:ring focus:ring-brand2/10 
            focus:ring-opacity-50 focus:outline-none
            ${isPlaceholder ? 'text-gray-500' : 'text-gray-900'}
            ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between">
            <span>{getDisplayText()}</span>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </button>

        {isOpen && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search salary ranges..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-brand2"
              />
            </div>
            
            {/* Salary Range List */}
            <div className="max-h-48 overflow-auto">
              {filteredRanges.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No salary ranges found matching "{searchTerm}"
                </div>
              ) : (
                filteredRanges.map((range: SalaryRange) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => handleSelect(range.id)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 
                      focus:outline-none transition-colors duration-150
                      ${range.id === selectedValue ? 'bg-brand2/5 text-brand2' : 'text-gray-900'}
                      ${range.id === "" ? 'text-gray-500' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{range.label}</span>
                      {range.id === selectedValue && range.id !== "" && (
                        <Check className="h-4 w-4 text-brand2" />
                      )}
                    </div>
                    {range.id !== "" && (range.min !== undefined || range.max !== undefined) && (
                      <div className="text-xs text-gray-600 mt-1">
                        {range.min !== undefined && `$${range.min.toLocaleString()}`}
                        {range.min !== undefined && range.max !== undefined && ' - '}
                        {range.max !== undefined && `$${range.max.toLocaleString()}`}
                        {range.min === undefined && range.max !== undefined && `Up to $${range.max.toLocaleString()}`}
                        {range.min !== undefined && range.max === undefined && `$${range.min.toLocaleString()}+`}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSalaryDropdown;