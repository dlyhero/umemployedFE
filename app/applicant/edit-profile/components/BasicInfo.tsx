import { useContactInfo } from '@/hooks/profile/useContactInfo'
import { useCountries } from '@/hooks/profile/useCountries'
import React, { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useJobTitles } from '@/hooks/profile/userJoTitle'
import { toast } from 'sonner';


// Validation schema
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address').max(254, 'Email must be less than 254 characters'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters'),
  job_title_id: z.number().min(1, 'Please select a job title'),
  country: z.string().optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  date_of_birth: z.string().optional()
})

type BasicInfoForm = z.infer<typeof basicInfoSchema>

export default function BasicInfo() {
  const {
    contactInfo,
    createContactInfo,
    updateContactInfo,
    isCreating,
    isUpdating,
    error
  } = useContactInfo();

  const { jobTitles, isLoading: isLoadingJobTitles } = useJobTitles();
  const { countries, isLoading: isLoadingCountries } = useCountries();

  // Determine if we have existing contact info
  const hasContactInfo = Boolean(contactInfo?.id);
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      job_title_id: 0,
      country: '',
      city: '',
      date_of_birth: ''
    }
  });

  // Populate form with existing contact info
  useEffect(() => {
    if (contactInfo) {
      reset({
        name: contactInfo.name || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        job_title_id: contactInfo.job_title_id || 0,
        country: contactInfo.country || '',
        city: contactInfo.city || '',
        date_of_birth: contactInfo.date_of_birth || ''
      });
    }
  }, [contactInfo, reset]);

  const onSubmit: SubmitHandler<BasicInfoForm> = async (data) => {
    try {
      if (hasContactInfo && contactInfo?.id) {
        await updateContactInfo({ id: contactInfo.id, data });
      } else {
        await createContactInfo(data);
        toast.success('Basic information saved successfully');

      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save basic information');

    }
  };

  // Sort job titles to put user's current job title first
  const sortedJobTitles = React.useMemo(() => {
    if (!jobTitles) return [];

    if (!contactInfo?.job_title_id) return jobTitles;

    const currentJobTitle = jobTitles.find(job => job.id === contactInfo.job_title_id);
    const otherJobTitles = jobTitles.filter(job => job.id !== contactInfo.job_title_id);

    return currentJobTitle ? [currentJobTitle, ...otherJobTitles] : jobTitles;
  }, [jobTitles, contactInfo?.job_title_id]);

  // Get current job title name for display
  const currentJobTitleName = React.useMemo(() => {
    if (!contactInfo?.job_title_id || !jobTitles) return '';
    const currentJob = jobTitles.find(job => job.id === contactInfo.job_title_id);
    return currentJob?.name || contactInfo.job_title_name || '';
  }, [contactInfo, jobTitles]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='p-3 md:p-6 mt-10 rounded-lg w-full bg-white'>
      <h1 className='mb-6 text-2xl md:text-3xl font-semibold'>Basic Information</h1>
      <div className="space-y-6">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Full Name */}
          <div className='flex flex-col gap-1 md:col-span-2'>
            <label htmlFor="name" className='font-bold text-sm'>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              id="name"
              placeholder="Enter your full name"
              className={`border p-4 rounded-lg focus:outline-brand/30 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="email" className='font-bold text-sm'>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              id="email"
              placeholder="Enter your email"
              className={`border p-4 rounded-lg focus:outline-brand/30 ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email.message}</span>
            )}
          </div>

          {/* Phone */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="phone" className='font-bold text-sm'>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('phone')}
              id="phone"
              placeholder="Enter your phone number"
              className={`border p-4 rounded-lg focus:outline-brand/30 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs">{errors.phone.message}</span>
            )}
          </div>

          {/* Job Title Dropdown */}
          <div className='flex flex-col gap-1 md:col-span-2'>
            <label htmlFor="job_title_id" className='font-bold text-sm'>
              Job Title <span className="text-red-500">*</span>
            </label>
            <select
              {...register('job_title_id', { valueAsNumber: true })}
              id="job_title_id"
              disabled={isLoadingJobTitles}
              className={`border p-4 rounded-lg focus:outline-brand/30 bg-white ${errors.job_title_id ? 'border-red-500' : 'border-gray-300'
                } ${isLoadingJobTitles ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value={0} disabled>
                {isLoadingJobTitles ? 'Loading job titles...' : 'Select a job title'}
              </option>
              {sortedJobTitles.map((jobTitle) => (
                <option key={jobTitle.id} value={jobTitle.id}>
                  {jobTitle.name}
                  {contactInfo?.job_title_id === jobTitle.id ? ' (Current)' : ''}
                </option>
              ))}
            </select>
            {errors.job_title_id && (
              <span className="text-red-500 text-xs">{errors.job_title_id.message}</span>
            )}
            {/* Show current selection for better UX */}
            {currentJobTitleName && !isLoadingJobTitles && (
              <span className="text-xs text-gray-600">
                Current: {currentJobTitleName}
              </span>
            )}
          </div>

          {/* Country Dropdown */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="country" className='font-bold text-sm'>
              Country
            </label>
            <select
              {...register('country')}
              id="country"
              disabled={isLoadingCountries}
              className={`border border-gray-300 p-4 rounded-lg focus:outline-brand/30 bg-white ${isLoadingCountries ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <option value="">
                {isLoadingCountries ? 'Loading countries...' : 'Select a country'}
              </option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="city" className='font-bold text-sm'>
              City
            </label>
            <input
              type="text"
              {...register('city')}
              id="city"
              placeholder="Enter your city"
              className="border border-gray-300 p-4 rounded-lg focus:outline-brand/30"
            />
          </div>

          {/* Date of Birth */}
          <div className='flex flex-col gap-1 md:col-span-2'>
            <label htmlFor="date_of_birth" className='font-bold text-sm'>
              Date of Birth
            </label>
            <input
              type="date"
              {...register('date_of_birth')}
              id="date_of_birth"
              className="border border-gray-300 p-4 rounded-lg focus:outline-brand/30"
            />
          </div>
        </div>

        {/* Display errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-600 text-sm">
              Error saving contact info: {error.message}
            </p>
          </div>
        )}

        <div className='flex justify-end mt-10'>
          <button
            type="submit"
            disabled={isSaving || (!isDirty && hasContactInfo)}
            className={`px-8 py-2 rounded-full text-white font-medium ${isSaving || (!isDirty && hasContactInfo)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brand hover:bg-brand2'
              }`}
          >
            {isSaving ? 'Saving...' : hasContactInfo ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}