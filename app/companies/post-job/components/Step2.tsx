'use client';

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from './Multiform';
import { Icon } from '@iconify/react/dist/iconify.js';
import useJobOptions from '@/hooks/jobs/useJobOptions';

interface CreatedJob {
  id: number;
  title: string;
  status: string;
}

interface Step2Props {
  formData: JobFormData;
  updateFormData: (data: Partial<JobFormData>) => void;
  form: UseFormReturn<any>;
  createdJob?: CreatedJob | null;
}

const Step2: React.FC<Step2Props> = ({ formData, updateFormData, form, createdJob }) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const watchedValues = watch();
  
  // Use the job options hook
  const { data: jobOptions, isLoading, error } = useJobOptions();

  // Get options from API response
  const dynamicOptions = {
    job_types: jobOptions?.job_types || {},
    experience_levels: jobOptions?.experience_levels || {},
    weekly_ranges: jobOptions?.weekly_ranges || {},
    shifts: jobOptions?.shifts || {},
  };

  // Set default values when options are loaded
  useEffect(() => {
    if (jobOptions) {
      Object.keys(dynamicOptions).forEach((field) => {
        const options = dynamicOptions[field as keyof typeof dynamicOptions];
        if (options && Object.keys(options).length > 0 && !watchedValues[field]) {
          const firstKey = Object.keys(options)[0];
          setValue(field, firstKey);
          updateFormData({ [field]: firstKey });
        }
      });
    }
  }, [jobOptions, setValue, updateFormData, dynamicOptions, watchedValues]);

  // Handle radio button change - send strings to API
  const handleRadioChange = (field: keyof JobFormData, value: string) => {
    setValue(field, value);
    updateFormData({ [field]: value });
  };

  const isSelected = (field: keyof JobFormData, value: string) => {
    const currentValue = watchedValues[field];
    return currentValue === value;
  };

  const CustomRadio = ({ 
    selected, 
    onChange, 
    label,
    name
  }: { 
    selected: boolean; 
    onChange: () => void; 
    label: string;
    name: string;
  }) => (
    <label className="flex items-center p-3 rounded-full border-2 cursor-pointer transition-all duration-200 hover:border-brand2 hover:bg-blue-50 group">
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={onChange}
        className="hidden"
      />
      <div className={`
        w-5 h-5 border-2 rounded-full flex items-center justify-center mr-3 transition-all duration-200
        ${selected 
          ? 'bg-brand border-none' 
          : 'border-gray-300 group-hover:border-brand2'
        }
      `}>
        {selected && (
          <Icon icon="bitcoin-icons:check-outline" className='size-6 text-white'/>
        )}
      </div>
      <span className={`
        text-sm md:text-[16.5px] font-medium transition-colors duration-200
        ${selected ? 'text-brand' : 'text-gray-700'}
      `}>
        {label}
      </span>
    </label>
  );

  const renderRadioGroup = (
    title: string,
    field: keyof JobFormData,
    options: Record<string, string>
  ) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center p-3 rounded-full border-2 border-gray-200">
                <div className="w-5 h-5 border-2 rounded-full bg-gray-200 mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(options).length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(options).map(([key, label]) => (
            <CustomRadio
              key={key}
              selected={isSelected(field, key)}
              onChange={() => handleRadioChange(field, key)}
              label={label}
              name={field}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No options available
        </div>
      )}
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600">{errors[field]?.message as string}</p>
      )}
    </div>
  );

  // Define renderFormContent before using it
  const renderFormContent = (options: typeof dynamicOptions) => (
    <>
      <h2 className="text-xl md:text-2xl font-semibold mb-6 tracking-wider text-gray-700">
        Job Requirements
      </h2>

      <div className="space-y-8">
        {/* Job Types Section */}
        {renderRadioGroup("Job Types", "job_types", options.job_types)}

        {/* Experience Levels Section */}
        {renderRadioGroup("Experience Levels", "experience_levels", options.experience_levels)}

        {/* Weekly Ranges Section */}
        {renderRadioGroup("Weekly Ranges", "weekly_ranges", options.weekly_ranges)}

        {/* Shifts Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Shifts</h3>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center p-3 rounded-full border-2 border-gray-200">
                    <div className="w-5 h-5 border-2 rounded-full bg-gray-200 mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(options.shifts).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(options.shifts).map(([key, label]) => (
                <CustomRadio
                  key={key}
                  selected={isSelected("shifts", key)}
                  onChange={() => handleRadioChange("shifts", key)}
                  label={label}
                  name="shifts"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No shift options available
            </div>
          )}
          {errors.shifts && (
            <p className="mt-1 text-sm text-red-600">{errors.shifts?.message as string}</p>
          )}
        </div>
      </div>
    </>
  );

  if (error) {
    return (
      <div id='step-2' className="animate-fade-in">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            Error loading job options. Please try again later.
          </p>
        </div>
        {/* Show empty state since no fallback values */}
        {renderFormContent(dynamicOptions)}
      </div>
    );
  }

  return (
    <div id='step-2' className="animate-fade-in">
      {renderFormContent(dynamicOptions)}
    </div>
  );
};

export default Step2;