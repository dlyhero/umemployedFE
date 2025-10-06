"use client";
import React, { useState } from 'react';
import useCompanyOptions from '@/hooks/companies/useCompanyOptions';
import { useRouter } from 'next/navigation';
import { useCreateCompany } from '@/hooks/companies/useCompanyCreate';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'sonner'; // Import Sonner toast
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/profile/useUserProfile';

const CreateCompanyPage: React.FC = () => {
  const router = useRouter();
  const { createCompany, isLoading } = useCreateCompany();
  console.log(useCreateCompany());
  const { data: companyOptions, isLoading: optionsLoading } = useCompanyOptions();
 

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    founded: '',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    country: '',
    mission_statement: '',
    linkedin: '',
    video_introduction: '',
    location: '', // Added location field
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Smooth mask for founded date: enforce MM/DD/YYYY with digits and slashes
    if (name === 'founded') {
      // Strip non-digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
      let masked = digitsOnly;
      if (digitsOnly.length >= 3 && digitsOnly.length <= 4) {
        masked = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      } else if (digitsOnly.length >= 5 && digitsOnly.length <= 6) {
        masked = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
      } else if (digitsOnly.length >= 7 && digitsOnly.length <= 8) {
        masked = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: masked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse founded as year from MM/DD/YYYY if present
    let foundedYear: number | null = null;
    if (formData.founded) {
      const digits = formData.founded.replace(/\D/g, '');
      if (digits.length === 8) {
        const year = parseInt(digits.slice(4, 8));
        foundedYear = isNaN(year) ? null : year;
      } else if (digits.length === 4) {
        // Allow plain year entry as a fallback
        const yr = parseInt(digits);
        foundedYear = isNaN(yr) ? null : yr;
      }
    }

    const submitData = {
      ...formData,
      industry: formData.industry || null,
      founded: foundedYear,
      size: formData.size || null,
      location: formData.location, // Include location
    };

    createCompany(submitData, {
      onSuccess: () => {
        toast.success('Company created successfully!'); // Sonner success toast
        // Refresh the page before redirecting
        window.location.reload();
        // Use setTimeout to ensure redirect happens after refresh
        setTimeout(() => {
          router.push('/companies/dashboard');
        }, 100); // Small delay to allow refresh to complete
      },
      onError: (error) => {
        toast.error(error?.message || 'An error occurred while creating the company'); // Sonner error toast
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg md:mt-10">
      <h1 className="text-2xl md:text-5xl font-bold mb-4">Create Company</h1>
      <p className="text-gray-600 mb-10">Complete the form below to create a new company page.</p>

      {/* Progress Steps */}
      <div className="flex justify-between mb-18 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2 z-0 px-10"></div>
        {[1, 2, 3].map((step) => (
          <div key={step} className="relative z-10">
            <div
              className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center md:text-lg ${
                currentStep >= step ? 'bg-brand text-white' : 'bg-white text-brand border-brand border'
              }`}
            >
              {step}
            </div>
            <div className="text-sm md:text-[16.5px] mt-1 text-wrap text-gray-600 absolute left-1/2 -translate-x-1/2 text-center lg:text-nowrap">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Contact Info'}
              {step === 3 && 'About & Additional Info'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
                Employer Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Google"
              />
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Category*</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select category</option>
                {companyOptions?.industries.map((industry) => (
                  <option key={industry?.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Company Size</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select company size</option>
                {companyOptions?.sizes.map((size) => (
                  <option key={size?.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
                Founded Date*
              </label>
              <input
                type="text"
                name="founded"
                value={formData.founded}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="companyinc@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Phone Number*</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="+880 01723801729"
              />
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Website*</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="http://somename.com"
              />
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="https://linkedin.com/company/example"
              />
            </div>
          </div>
        )}

        {/* Step 3: About & Additional Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
                About Company*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Write something interesting about your company..."
              />
              <p className="text-xs text-gray-500 mt-1">Brief description for your company. URLs are hyperlinked.</p>
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Mission Statement</label>
              <textarea
                name="mission_statement"
                value={formData.mission_statement}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Our mission is to..."
              />
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select a country</option>
                {companyOptions?.countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">Location*</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-1">
                Video Introduction URL
              </label>
              <input
                type="url"
                name="video_introduction"
                value={formData.video_introduction}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 md:p-4 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="https://youtube.com/example"
              />
            </div>

          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-200 text-sm md:text-[16.5px] text-gray-800 py-3 px-7 rounded-full hover:bg-gray-300 flex gap-2 items-center"
            >
              <Icon icon="bitcoin-icons:arrow-left-outline" className="size-6 md:size-7" />
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-brand text-sm md:text-[16.5px] text-white py-3 px-7 rounded-full hover:bg-brand2 flex gap-2 items-center"
            >
              Next
              <Icon icon="bitcoin-icons:arrow-right-outline" className="size-6 md:size-7" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="bg-brand text-sm md:text-[16.5px] text-white py-3 px-7 rounded-full hover:bg-brand2 disabled:bg-blue-300"
            >
              {isLoading ? 'Creating...' : 'Create Company'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyPage;