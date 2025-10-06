'use client';

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import CustomJobTypeDropdown from './stepOneComponents/customDropdown';
import CustomCountryDropdown from './stepOneComponents/CustomCountryDropdown';
import CustomCategoryDropdown from './stepOneComponents/CustomCategoryCategory';
import CustomSalaryDropdown from './stepOneComponents/CustomSalaryDropdown';
import CustomLocationDropdown from './stepOneComponents/CustomLocationDropdown';
import { JobFormData } from './Multiform';

interface Step1Props {
  formData: JobFormData;
  updateFormData: (data: Partial<JobFormData>) => void;
  form: UseFormReturn<any>;
}

const Step1: React.FC<Step1Props> = ({ formData, updateFormData, form }) => {
  const { register, formState: { errors }, setValue, watch, trigger } = form;

  // Watch all values for debugging
  const watchedValues = watch();

  useEffect(() => {
    console.log('=== Step1 Debug Info ===');
    console.log('Form Data:', formData);
    console.log('Watched Values:', watchedValues);
    console.log('Form Errors:', errors);
  }, [formData, watchedValues, errors]);

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    console.log(`Step1 - Updating ${field}:`, value);
    updateFormData({ [field]: value });
    setValue(field, value);
    // Trigger validation for this field
    trigger(field);
  };

  const handleDirectInputChange = (field: keyof JobFormData, value: string) => {
    console.log(`Step1 - Direct update ${field}:`, value);
    updateFormData({ [field]: value });
    setValue(field, value);
    trigger(field);
  };

  return (
    <div id='step-1' className="animate-fade-in">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 tracking-wider text-gray-700">
        Basic Information
      </h2>


      <div className="mb-4">
        <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
          Job Title*
        </label>
        <input
          type="text"
          {...register('title')}
          value={watchedValues?.title || ''}
          onChange={(e) => handleDirectInputChange('title', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4
            focus:border-brand focus:ring focus:ring-blue-200 focus:ring-opacity-50
            transition-all duration-200"
          placeholder="e.g., Frontend Developer"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className="mb-4">
          <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
            Number of Hires*
          </label>
          <input
            type="number"
            {...register('number_of_hires')}
            value={watchedValues?.number_of_hires || ''}
            onChange={(e) => handleDirectInputChange('number_of_hires', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4
              focus:border-brand focus:ring focus:ring-blue-200 focus:ring-opacity-50
              transition-all duration-200"
            min="1"
          />
          {errors.number_of_hires && (
            <p className="mt-1 text-sm text-red-600">{errors.number_of_hires.message as string}</p>
          )}
        </div>

        <CustomJobTypeDropdown
          value={watchedValues?.job_type || ''}
          onChange={(value) => handleInputChange('job_type', value)}
        />

        <CustomCountryDropdown
          value={watchedValues?.country || ''}
          onChange={(value) => handleInputChange('country', value)}
        />

        <CustomCategoryDropdown
          value={watchedValues?.category || ''}
          onChange={(value) => handleInputChange('category', value)}
        />

        <CustomSalaryDropdown
          value={watchedValues?.salary_range || ''}
          onChange={(value) => handleInputChange('salary_range', value)}
        />

        <CustomLocationDropdown
          value={watchedValues?.location_type || ''}
          onChange={(value) => handleInputChange('location_type', value)}
        />
      </div>

    </div>
  );
};

export default Step1;