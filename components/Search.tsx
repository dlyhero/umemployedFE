"use client"
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

interface SearchProps {
  className?: string;
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function Search({ className = '', onSearch, initialQuery = '' }: SearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch, initialQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div className={`absolute -bottom-10 border-gray-300 w-full max-w-5xl mx-auto ${className}`}>
      <div className="flex items-center">
        <input
          type="text"
          className="w-full md:placeholder:text-lg p-4 md:p-8 pr-36 rounded border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 overflow-hidden truncate"
          placeholder="Search jobs, keywords, or companies"
          aria-label="Search jobs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="absolute right-2 bg-blue-400 text-white cursor-pointer md:px-10 p-2 md:p-4 rounded transition-colors duration-200 hover:bg-blue-500"
          aria-label="Search"
          onClick={() => onSearch(query)}
        >
          Search
        </button>
      </div>
    </div>
  );
}