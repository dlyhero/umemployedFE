'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';
import useCategories, { Category } from '@/hooks/jobs/useCategories';
import useJobOptions from '@/hooks/jobs/useJobOptions';

interface CustomCategoryDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const CustomCategoryDropdown: React.FC<CustomCategoryDropdownProps> = ({ 
  value = "", 
  onChange, 
  className = "",
  label = "Category",
  placeholder = "Select category",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(value || "");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData, isLoading, isError, error } = useJobOptions();

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setSelectedValue(value || "");
  }, [value]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter categories based on search term
  const filteredCategories = (categoriesData?.categories || []).map((category: any) => ({
    id: category.id,
    name: category.name,
    dbId: category.db_id,
    jobCount: category.job_count,
    icon: category.icon || '',
  })).filter((category: Category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add empty option for placeholder
  const categoryOptions = [
    { id: -1, name: placeholder, dbId: -1, jobCount: 0, icon: '' },
    ...filteredCategories
  ];

  const handleSelect = (categoryId: string): void => {
    setSelectedValue(categoryId);
    setIsOpen(false);
    setSearchTerm("");
    if (onChange) {
      // Find the category and send its db_id instead of id
      const selectedCategory = filteredCategories.find(cat => cat.id.toString() === categoryId);
      const valueToSend = selectedCategory ? selectedCategory.dbId.toString() : categoryId;
      onChange(valueToSend);
    }
  };

  const getDisplayText = (): string => {
    if (!selectedValue) return placeholder;
    const mappedCategories = (categoriesData?.categories || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      dbId: category.db_id,
      jobCount: category.job_count,
      icon: category.icon || '',
    }));
    // selectedValue now contains db_id, so we need to find by dbId
    const selected = mappedCategories.find((category: Category) => category.dbId.toString() === selectedValue);
    return selected ? selected.name : placeholder;
  };

  const handleButtonClick = (): void => {
    if (isLoading || isError) return;
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const isPlaceholder: boolean = !selectedValue;

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
          {label}{required && '*'}
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
        {label}{required && '*'}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Custom Select Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading || isError}
          className={`
            mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 
            text-left bg-white transition-all duration-200
            hover:border-gray-400 focus:border-brand2 focus:ring focus:ring-brand2/10 
            focus:ring-opacity-50 focus:outline-none
            ${isPlaceholder ? 'text-gray-500' : 'text-gray-900'}
            ${(isLoading || isError) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between">
            <span>{getDisplayText()}</span>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              {isError && <AlertCircle className="h-4 w-4 text-red-500" />}
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </button>

        {/* Error Message */}
        {isError && (
          <div className="mt-1 text-sm text-red-600">
            Failed to load categories. Please try again.
          </div>
        )}

        {/* Dropdown Options */}
        {isOpen && !isLoading && !isError && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 text-sm focus:outline-none  focus:ring-0"
              />
            </div>
            
            {/* Category List */}
            <div className="max-h-48 overflow-auto hide-scrollbar">
              {categoryOptions.length === 1 && searchTerm ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No categories found matching "{searchTerm}"
                </div>
              ) : (
                categoryOptions.map((category, idx) => {
                  // Type guard for Category
                  const isCategory = (cat: any): cat is Category =>
                    'value' in cat && 'label' in cat;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelect(category.id.toString())}
                      className={`
                        w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 
                        focus:outline-none transition-colors duration-150
                        ${category.dbId.toString() === selectedValue ? 'bg-brand2/5 text-brand2' : 'text-gray-900'}
                        ${category.id === -1 ? 'text-gray-500' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {category.dbId.toString() === selectedValue && category.id !== -1 && (
                          <Check className="h-4 w-4 text-brand2" />
                        )}
                      </div>
                      {category.id !== -1 && category.jobCount > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {category.jobCount} job{category.jobCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomCategoryDropdown;