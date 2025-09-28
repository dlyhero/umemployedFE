'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';
import { Country, useCountries } from '@/hooks/profile/useCountries';

interface CustomCountryDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const CustomCountryDropdown: React.FC<CustomCountryDropdownProps> = ({
  value = '',
  onChange,
  className = '',
  label = 'Country',
  placeholder = 'Select country',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(value);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { countries, isLoading, isError, error } = useCountries();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal state with prop value and map to country code
  useEffect(() => {
    if (typeof value !== 'string') {
      console.warn('CustomCountryDropdown: Expected "value" to be a string, received:', value);
      setSelectedValue('');
      return;
    }

    setSelectedValue(value);

    // Map country name to code if necessary
    if (value && countries.length > 0) {
      const foundCountry = countries.find(
        (country: Country) => country.name.toLowerCase() === value.toLowerCase() || country.code === value
      );
      if (foundCountry && foundCountry.code !== value) {
        setSelectedValue(foundCountry.code);
        if (onChange) {
          onChange(foundCountry.code);
        }
      }
    }
  }, [value, countries, onChange]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter countries based on search term
  const filteredCountries = countries.filter((country: Country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add empty option for placeholder
  const countryOptions = [
    { code: '', name: placeholder, flag_url: '' },
    ...filteredCountries,
  ];

  const handleSelect = (countryCode: string): void => {
    setSelectedValue(countryCode);
    setIsOpen(false);
    setSearchTerm('');
    if (onChange) {
      onChange(countryCode);
    }
  };

  const getDisplayText = (): string => {
    if (!selectedValue) return placeholder;
    const selected = countries.find((country: Country) => country.code === selectedValue);
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

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
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
            <span className="flex items-center gap-2">
              {selectedValue && countries.find((c) => c.code === selectedValue)?.flag_url && (
                <img
                  src={countries.find((c) => c.code === selectedValue)?.flag_url}
                  alt=""
                  className="h-4 w-4"
                />
              )}
              {getDisplayText()}
            </span>
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
          <div className="mt-1 text-sm text-red-500">
            Failed to load countries: {error?.message || 'Unknown error'}
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
                placeholder="Search countries..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-brand2"
              />
            </div>

            {/* Country List */}
            <div className="max-h-48 overflow-auto">
              {countryOptions.length === 1 && searchTerm ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No countries found matching "{searchTerm}"
                </div>
              ) : (
                countryOptions.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 
                      focus:outline-none transition-colors duration-150
                      ${country.code === selectedValue ? 'bg-brand2/5 text-brand2' : 'text-gray-900'}
                      ${country.code === '' ? 'text-gray-500' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {country.flag_url && (
                          <img src={country.flag_url} alt="" className="h-4 w-4" />
                        )}
                        {country.name}
                      </span>
                      {country.code === selectedValue && country.code !== '' && (
                        <Check className="h-4 w-4 text-brand2" />
                      )}
                    </div>
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

export default CustomCountryDropdown;