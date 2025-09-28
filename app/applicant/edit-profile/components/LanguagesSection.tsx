import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguages } from '@/hooks/profile/useLanguages';
import { Icon } from '@iconify/react/dist/iconify.js';

const LanguagesSection: React.FC = () => {
  const {
    languages,
    availableLanguages,
    isLoading,
    isLoadingAvailable,
    isError,
    error,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLanguages();

  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  const [proficiency, setProficiency] = useState<string>('intermediate');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show all available languages (no filtering)
  const filteredLanguages = availableLanguages;

  // Add or update language handler
  const handleAddLanguage = async () => {
    if (!selectedLanguage) return;

    try {
      // Check if language already exists - try both comparison methods
      const existingLanguage = languages.find(lang => 
        lang.language_id === selectedLanguage || lang.language.id === selectedLanguage
      );
      
      console.log('Selected language ID:', selectedLanguage);
      console.log('Existing languages:', languages.map(l => ({ id: l.id, language_id: l.language_id, language_name: l.language.name })));
      console.log('Found existing language:', existingLanguage);
      
      if (existingLanguage) {
        // Update existing language
        await updateLanguage({
          id: existingLanguage.id,
          data: {
            proficiency: proficiency as any
          }
        });
        toast.success('Language proficiency updated successfully');
      } else {
        // Create new language
        await createLanguage({
          language_id: selectedLanguage,
          proficiency: proficiency as any
        });
        toast.success('Language added successfully');
      }
      
      setSelectedLanguage(null);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding/updating language:', error);
      toast.error('Failed to add/update language');
    }
  };

  // Delete language handler
  const handleDelete = async (id: number) => {
    try {
      await deleteLanguage(id);
      toast.success('Language deleted successfully');
    } catch (error) {
      console.error('Error deleting language:', error);
      toast.error('Failed to delete language');
    }
  };

  // Select language from dropdown
  const handleLanguageSelect = (language: { id: number; name: string }) => {
    setSelectedLanguage(language.id);
    setShowDropdown(false);
  };

  // Get selected language name and existing proficiency for display
  const selectedLanguageName = selectedLanguage 
    ? availableLanguages.find(lang => lang.id === selectedLanguage)?.name 
    : '';
  
  const existingLanguage = selectedLanguage 
    ? languages.find(lang => lang.language_id === selectedLanguage || lang.language.id === selectedLanguage)
    : null;
  
  const isUpdatingExisting = !!existingLanguage;

//   if (isLoading) return <div className="p-4">Loading languages...</div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error?.message || 'An error occurred'}</div>;

  return (
    <div className="rounded-lg w-full bg-white my-3 p-3 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Languages</h1>
      </div>

      {/* Language Selection and Add */}
      <div className="mb-6 relative" ref={dropdownRef}>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Language Dropdown */}
          <div className="flex-1 relative">
            <button
              type="button"
              className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-4 pl-3 pr-10 text-left  focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-haspopup="listbox"
              aria-expanded={showDropdown}
            >
              <span className="block truncate">
                {selectedLanguageName || 'Select a language...'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <Icon 
                  icon="lucide:chevron-down" 
                  className="h-5 w-5 text-gray-400" 
                  aria-hidden="true"
                />
              </span>
            </button>

            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {isLoadingAvailable ? (
                  <div className="py-2 px-3 text-gray-500 text-sm">
                    Loading languages...
                  </div>
                ) : filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => {
                    const existingLang = languages.find(lang => lang.language_id === language.id || lang.language.id === language.id);
                    return (
                      <div
                        key={language.id}
                        className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-100 ${
                          selectedLanguage === language.id ? 'bg-blue-100 font-semibold' : ''
                        }`}
                        onClick={() => handleLanguageSelect(language)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="block truncate">{language.name}</span>
                          {existingLang && (
                            <span className="text-xs text-gray-500 capitalize">
                              ({existingLang.proficiency})
                            </span>
                          )}
                        </div>
                        {selectedLanguage === language.id && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand">
                            <Icon icon="lucide:check" className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2 px-3 text-gray-500 text-sm">
                    No languages available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proficiency Dropdown */}
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-4 px-3  focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="native">Native</option>
          </select>

          {/* Add/Update Button */}
          <button
            onClick={handleAddLanguage}
            disabled={!selectedLanguage || isCreating || isUpdating}
            className={`px-6 py-2 text-xl text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
              isUpdatingExisting 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-brand hover:bg-brand2'
            }`}
          >
            {(isCreating || isUpdating) ? (
              <>
                <Icon icon="svg-spinners:6-dots-rotate" className="h-4 w-4" />
                {isUpdatingExisting ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Icon icon={isUpdatingExisting ? "lucide:edit" : "lucide:plus"} className="h-4 w-4" />
                {isUpdatingExisting ? 'Update' : ''}
              </>
            )}
          </button>
        </div>
        
        {/* Helper message */}
        {isUpdatingExisting && (
          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-orange-700">
              <Icon icon="lucide:info" className="h-4 w-4" />
              <span>
                You already have <strong>{selectedLanguageName}</strong> with proficiency <strong>{existingLanguage?.proficiency}</strong>. 
                Selecting a new proficiency will update your existing entry.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User's Languages List */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Your Languages</h2>
        {languages.length === 0 ? (
          <p className="text-gray-500">No languages added yet. Select a language above to add it.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <div key={language.id} className="relative group">
                <div className="bg-brand/10 text-sm md:text-[16px] text-brand px-8 py-3 rounded-full flex items-center gap-2">
                  <span className="">{language.language.name}</span>
                  <span className="text-gray-500 capitalize">
                    ({language.proficiency})
                  </span>
                  <button
                    onClick={() => handleDelete(language.id)}
                    className="ml-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    disabled={isDeleting}
                    title="Remove language"
                  >
                    {isDeleting ? '...' : '✕'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguagesSection;