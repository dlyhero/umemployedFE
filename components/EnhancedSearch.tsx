"use client"
import { Icon } from '@iconify/react';
import { useState, useEffect, useRef } from 'react';
import useCategories from '@/hooks/jobs/useCategories';

interface EnhancedSearchProps {
  className?: string;
  onSearch: (query: string, categoryId?: number) => void;
  initialQuery?: string;
  initialCategoryId?: number;
}

export default function EnhancedSearch({
  className = '',
  onSearch,
  initialQuery = '',
  initialCategoryId
}: EnhancedSearchProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(initialCategoryId);
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  
  // Get categories from API
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.allCategories || [];

  // Initialize component with URL parameters
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialCategoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === initialCategoryId);
      if (category) {
        setSelectedCategory(category.name);
        setSelectedCategoryId(category.id);
      }
    }
  }, [initialCategoryId, categories]);

  // Handle search functionality
  const handleSearch = () => {
    // Call the parent's onSearch function with the current values
    onSearch(searchQuery.trim(), selectedCategoryId);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    setSelectedCategory(categoryName);
    setSelectedCategoryId(category?.id);
    setShowCategories(false);
  };

  // Clear category selection
  const handleClearCategory = () => {
    setSelectedCategory("");
    setSelectedCategoryId(undefined);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`absolute -bottom-10 w-full max-w-5xl mx-auto ${className}`}>
      <div className="mb-2 relative">
        <div className="flex flex-col lg:flex-row rounded border-2 border-brand bg-white shadow-sm p-2">
          {/* Search Input */}
          <div className="relative border-b lg:border-b-0 flex-1 min-w-0 flex items-center">
            <Icon
              icon="ion:search"
              className="absolute left-4 text-gray-400 text-xl z-10"
            />
            <input
              type="text"
              placeholder="What is the job title?"
              className="w-full p-6 pl-12 pr-2 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base min-w-0 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative flex-1 flex-shrink-0 lg:border-l border-gray-200 bg-white" ref={dropdownRef}>
            <div
              className="flex items-center justify-between w-full px-3 py-4 cursor-pointer h-full"
              onClick={() => setShowCategories(!showCategories)}
            >
              <span className="text-gray-700 text-lg truncate mr-2">
                {selectedCategory || "Select category"}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedCategory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearCategory();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon="material-symbols:close" className="w-4 h-4" />
                  </button>
                )}
                <Icon
                  icon={showCategories ? "ep:arrow-up" : "ep:arrow-down"}
                  className="text-gray-500"
                />
              </div>
            </div>

            {showCategories && (
              <div className="absolute hide-scrollbar top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 font-medium text-gray-500"
                  onClick={() => {
                    handleClearCategory();
                    setShowCategories(false);
                  }}
                >
                  All Categories
                </div>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="flex-shrink-0 text-white bg-brand hover:bg-brand/90 transition-colors rounded py-4 px-6 dm-serif font-bold tracking-wider text-sm sm:text-base whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}