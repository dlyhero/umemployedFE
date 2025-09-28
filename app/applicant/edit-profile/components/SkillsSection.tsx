// components/Skills.tsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSkills, Skill } from '@/hooks/profile/useSkills';
import { useAvailableSkills } from '@/hooks/profile/useAvailableSkills';

interface AvailableSkill {
  id: number;
  name: string;
}

const Skills: React.FC = () => {
  const {
    skills,
    isLoading,
    isError,
    error,
    createSkill,
    deleteSkill,
    isCreating,
    isDeleting,
  } = useSkills();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<AvailableSkill | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { data: availableSkillsData, isLoading: isSearchLoading } = useAvailableSkills(searchQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Filter out skills already added by user
  const filteredSkills = availableSkillsData?.results?.filter((skill: AvailableSkill) => 
    !skills?.some((userSkill: Skill) => userSkill.id === skill.id)
  ) || [];

  // Add new skill handler
  const handleAddSkill = async (): Promise<void> => {
    if (!selectedSkill) return;

    try {
      await createSkill({ skill_id: selectedSkill.id });
      toast.success('Skill added successfully');
      setSelectedSkill(null);
      setSearchQuery('');
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    }
  };

  // Delete skill handler
  const handleDelete = async (id: number | undefined): Promise<void> => {
    if (!id) return;
    
    try {
      console.log('Attempting to delete skill with ID:', id);
      await deleteSkill(id);
      console.log('Skill deletion successful');
      toast.success('Skill deleted successfully');
    } catch (error) {
      console.error('Error deleting skill:', error);
      console.error('Error details:', error);
      toast.error('Failed to delete skill');
    }
  };

  // Select skill from dropdown
  const handleSkillSelect = (skill: AvailableSkill): void => {
    setSelectedSkill(skill);
    setSearchQuery(skill.name);
    setShowDropdown(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    // Clear selected skill if user is typing something different
    if (selectedSkill && selectedSkill.name !== value) {
      setSelectedSkill(null);
    }
  };

  // Handle input focus
  const handleInputFocus = (): void => {
    setShowDropdown(true);
  };

//   if (isLoading) return <div className="p-4">Loading skills...</div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error?.message || 'An error occurred'}</div>;

  return (
    <div className="rounded-lg w-full bg-white my-6 p-3 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Skills</h1>
      </div>

      {/* Skill Search and Add */}
      <div className="mb-6 relative" ref={dropdownRef}>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-md border border-gray-300 bg-white py-4 pl-3 pr-10  focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Search for skills..."
            />
            {showDropdown && searchQuery.length > 0 && (
              <>
                {isSearchLoading ? (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-2 px-3 shadow-lg ring-1 ring-black ring-opacity-5 text-gray-500 text-sm">
                    Searching skills...
                  </div>
                ) : filteredSkills.length > 0 ? (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredSkills.map((skill: AvailableSkill) => (
                      <div
                        key={skill.id}
                        className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-200 ${
                          selectedSkill?.id === skill.id ? 'bg-gray-100 font-semibold' : ''
                        }`}
                        onClick={() => handleSkillSelect(skill)}
                      >
                        <span className="block truncate">{skill.name}</span>
                        {selectedSkill?.id === skill.id && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand2">
                            ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-2 px-3 shadow-lg ring-1 ring-black ring-opacity-5 text-gray-500 text-sm">
                    No skills found matching "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </div>
          <button
            onClick={handleAddSkill}
            disabled={!selectedSkill || isCreating}
            className="px-6 py-2 bg-brand text-xl text-white rounded-full hover:bg-brand2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Adding...' : '+'}
          </button>
        </div>
      </div>

      {/* User's Skills List */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Your Skills</h2>
        {!skills || skills.length === 0 ? (
          <p className="text-gray-500">No skills added yet. Search above to add skills.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: Skill) => (
              <div key={skill.id} className="relative group">
                <div className="bg-brand/10 text-sm md:text-[16px] text-brand px-8 py-3 rounded-full flex items-center gap-2">
                  <span className="">{skill.name}</span>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="ml-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    disabled={isDeleting}
                    title="Remove skill"
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

export default Skills;