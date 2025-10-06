'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from './Multiform';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useExtractedSkills } from '@/hooks/jobs/useCreateJob/useExtractedSkill';
import useJobOptions from '@/hooks/jobs/useJobOptions';

interface CreatedJob {
  id: number;
  title: string;
  status: string;
}

interface ExtractedSkill {
  id: number;
  name: string;
}

interface Step4Props {
  formData: JobFormData;
  updateFormData: (data: Partial<JobFormData>) => void;
  form: UseFormReturn<any>;
  createdJob?: CreatedJob | null;
  step3Response?: {
    job?: any;
    extracted_skills: string[];
  } | null;
}

const Step4: React.FC<Step4Props> = ({ formData, updateFormData, form, createdJob, step3Response }) => {
  const { register, formState: { errors }, setValue, watch, trigger } = form;
  
  const [selectedSkills, setSelectedSkills] = useState<number[]>(() => {
    const requirements = formData?.requirements;
    if (Array.isArray(requirements)) {
      // Convert string array to number array if needed
      return requirements.map(req => typeof req === 'string' ? parseInt(req) : req).filter(id => !isNaN(id));
    }
    return [];
  });

  const watchedValues = watch();

  // Fetch extracted skills from API
  const { data: extractedSkillsData, isLoading: isLoadingSkills, error: skillsError } = useExtractedSkills(
    createdJob?.id?.toString() || null
  );

  // Fetch job options for levels
  const { data: jobOptions, isLoading: isLoadingLevels } = useJobOptions();

  // Extract skills from API response
  const extractedSkills = useMemo(() => {
    if (extractedSkillsData?.extracted_skills) {
      return extractedSkillsData.extracted_skills as ExtractedSkill[];
    }
    return [];
  }, [extractedSkillsData]);

  // Extract levels from job options
  const levels = useMemo(() => {
    if (jobOptions?.levels) {
      return Object.entries(jobOptions.levels).map(([key, value]) => ({
        value: key,
        label: String(value)
      }));
    }
    return [];
  }, [jobOptions?.levels]);

  // Debug logging - moved after levels definition
  useEffect(() => {
    console.log('=== Step4 Debug Info ===');
    console.log('Selected Skills:', selectedSkills);
    console.log('Form Data Requirements:', formData?.requirements);
    console.log('Form Data Level:', formData?.level);
    console.log('Available Levels:', levels);
    console.log('Watched Values:', watchedValues);
    console.log('Form Errors:', errors);
  }, [selectedSkills, formData?.requirements, formData?.level, levels, watchedValues, errors]);

  // Initialize experience level from form data
  useEffect(() => {
    if (formData?.level && levels.length > 0) {
      console.log('=== Experience Level Initialization ===');
      console.log('Form Data Level:', formData.level);
      console.log('Available Levels:', levels);
      console.log('Level exists in options:', levels.some(level => level.value === formData.level));
      
      setValue('level', formData.level);
      console.log('Set level value to:', formData.level);
    }
  }, [formData?.level, levels.length, setValue]);

  // Auto-select first 3 skills when extracted skills are available
  useEffect(() => {
    if (extractedSkills.length > 0 && selectedSkills.length === 0) {
      const autoSelected = extractedSkills.slice(0, 3).map(skill => skill.id);
      setSelectedSkills(autoSelected);
      updateFormData({ requirements: autoSelected });
      setValue('requirements', autoSelected);
      // Trigger validation to update form state
      trigger('requirements');
    }
  }, [extractedSkills, selectedSkills.length, updateFormData, setValue, trigger]);

  const toggleSkill = (skillId: number) => {
    const newSelectedSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter(id => id !== skillId)
      : [...selectedSkills, skillId];

    if (newSelectedSkills.length <= 5) {
      setSelectedSkills(newSelectedSkills);
      updateFormData({ requirements: newSelectedSkills });
      setValue('requirements', newSelectedSkills);
      // Trigger validation to update form state
      trigger('requirements');
    }
  };

  return (
    <div className=" mx-auto ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Select Required Skills ({selectedSkills.length}/5)
        </h1>
        <p className="text-gray-600">
          Click on skills to select/deselect them. You can choose up to 5 skills.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="mb-8">
        {isLoadingSkills ? (
          <div className="text-center py-12">
            <Icon icon="ph:spinner" className="text-4xl text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 text-lg">Loading extracted skills...</p>
          </div>
        ) : skillsError ? (
          <div className="text-center py-12">
            <Icon icon="ph:warning" className="text-4xl text-red-400 mx-auto mb-4" />
            <p className="text-red-500 text-lg">Failed to load skills</p>
            <p className="text-sm text-red-400 mt-2">Please try again or contact support</p>
          </div>
        ) : extractedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {extractedSkills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                disabled={!selectedSkills.includes(skill.id) && selectedSkills.length >= 5}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 border ${
                  selectedSkills.includes(skill.id)
                    ? 'bg-brand text-white'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                } ${
                  !selectedSkills.includes(skill.id) && selectedSkills.length >= 5
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon icon="ph:info" className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No skills extracted yet</p>
            <p className="text-sm text-gray-400 mt-2">Complete Step 3 to extract skills from job description</p>
          </div>
        )}
      </div>

      {/* Experience Level Dropdown */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Experience Level
        </h2>
        <p className="text-gray-600 mb-4">
          Select the experience level required for this position.
        </p>

        <div className="relative">
          <select
            {...register('level')}
            value={formData?.level || ''}
            onChange={(e) => {
              updateFormData({ level: e.target.value });
              setValue('level', e.target.value);
            }}
            className="w-full p-4 pr-10 border border-gray-300 rounded-lg bg-white appearance-none focus:border-brand focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
            disabled={isLoadingLevels}
          >
            <option value="">Select experience level</option>
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isLoadingLevels ? (
              <Icon icon="ph:spinner" className="text-gray-400 animate-spin" />
            ) : (
              <Icon icon="ph:caret-down" className="text-gray-400" />
            )}
          </div>
        </div>

        {errors.level && (
          <p className="mt-2 text-sm text-red-600">{errors.level.message as string}</p>
        )}
      </div>

      {/* Selected Skills Summary */}
      {selectedSkills.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Skills Summary
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skillId) => {
              const skill = extractedSkills.find(s => s.id === skillId);
              return (
                <div
                  key={skillId}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 "
                >
                  <span className="text-sm font-medium text-gray-900">{skill?.name || `Skill ${skillId}`}</span>
                  <button
                    type="button"
                    onClick={() => toggleSkill(skillId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Icon icon="ph:x" className="text-sm" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {selectedSkills.length} of 5 skills selected
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.requirements && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.requirements.message as string}</p>
        </div>
      )}
    </div>
  );
};

export default Step4;