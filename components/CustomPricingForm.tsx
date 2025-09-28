'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useCustomPricingOptions, useCreateCustomPricingInquiry } from '@/hooks/useSubscriptionManagement';
import { CustomPricingInquiry } from '@/types/pricing';
import { toast } from 'sonner';

interface CustomPricingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomPricingForm({ onSuccess, onCancel }: CustomPricingFormProps) {
  const { data: options, isLoading: optionsLoading } = useCustomPricingOptions();
  const createInquiry = useCreateCustomPricingInquiry();
  
  const [formData, setFormData] = useState<Omit<CustomPricingInquiry, 'id' | 'status' | 'created_at' | 'updated_at'>>({
    company_name: '',
    company_size: '',
    contact_name: '',
    work_email: '',
    hiring_volume: '',
    hiring_types: [],
    budget_range: '',
    billing_option: '',
    additional_requirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHiringTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      hiring_types: checked 
        ? [...prev.hiring_types, type]
        : prev.hiring_types.filter(t => t !== type)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createInquiry.mutateAsync(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Custom pricing inquiry failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <span className="ml-2">Loading form options...</span>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load form options. Please try again.</p>
      </div>
    );
  }

  // Add defensive checks for options structure
  console.log('CustomPricingForm - options received:', options);
  
  // Fallback data in case API doesn't return expected structure
  const fallbackOptions = {
    company_size_choices: [
      { value: '1-10', label: '1-10 employees' },
      { value: '11-50', label: '11-50 employees' },
      { value: '51-200', label: '51-200 employees' },
      { value: '201-500', label: '201-500 employees' },
      { value: '500+', label: '500+ employees' }
    ],
    hiring_volume_choices: [
      { value: '1-5', label: '1-5' },
      { value: '6-15', label: '6-15' },
      { value: '16-30', label: '16-30' },
      { value: '31-50', label: '31-50' },
      { value: '50+', label: '50+' }
    ],
    hiring_type_choices: [
      { value: 'full_time', label: 'Full-time' },
      { value: 'part_time', label: 'Part-time' },
      { value: 'contract', label: 'Contract' },
      { value: 'internship', label: 'Internship' },
      { value: 'freelance', label: 'Freelance' }
    ],
    budget_range_choices: [
      { value: 'under_5k', label: 'Under $5,000/month' },
      { value: '5k_10k', label: '$5,000 - $10,000/month' },
      { value: '10k_25k', label: '$10,000 - $25,000/month' },
      { value: '25k_50k', label: '$25,000 - $50,000/month' },
      { value: '50k_plus', label: '$50,000+/month' }
    ],
    billing_option_choices: [
      { value: 'monthly', label: 'Monthly billing' },
      { value: 'quarterly', label: 'Quarterly billing' },
      { value: 'annual', label: 'Annual billing' },
      { value: 'custom', label: 'Custom billing cycle' }
    ]
  };
  
  const safeOptions = {
    company_size_choices: options?.company_size_choices || fallbackOptions.company_size_choices,
    hiring_volume_choices: options?.hiring_volume_choices || fallbackOptions.hiring_volume_choices,
    hiring_type_choices: options?.hiring_type_choices || fallbackOptions.hiring_type_choices,
    budget_range_choices: options?.budget_range_choices || fallbackOptions.budget_range_choices,
    billing_option_choices: options?.billing_option_choices || fallbackOptions.billing_option_choices
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Custom Pricing Inquiry</h2>
        <p className="text-gray-600">
          Tell us about your hiring needs and we'll create a custom plan for your organization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size *
            </label>
            <select
              required
              value={formData.company_size}
              onChange={(e) => handleInputChange('company_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select company size</option>
              {safeOptions.company_size_choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              required
              value={formData.contact_name}
              onChange={(e) => handleInputChange('contact_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Email *
            </label>
            <input
              type="email"
              required
              value={formData.work_email}
              onChange={(e) => handleInputChange('work_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@company.com"
            />
          </div>
        </div>

        {/* Hiring Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Hiring Volume *
            </label>
            <select
              required
              value={formData.hiring_volume}
              onChange={(e) => handleInputChange('hiring_volume', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select hiring volume</option>
              {safeOptions.hiring_volume_choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label} hires/month
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range *
            </label>
            <select
              required
              value={formData.budget_range}
              onChange={(e) => handleInputChange('budget_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select budget range</option>
              {safeOptions.budget_range_choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hiring Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Types of Hiring *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {safeOptions.hiring_type_choices.map((choice) => (
              <label key={choice.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hiring_types.includes(choice.value)}
                  onChange={(e) => handleHiringTypeChange(choice.value, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">{choice.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Billing Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Billing Option *
          </label>
          <select
            required
            value={formData.billing_option}
            onChange={(e) => handleInputChange('billing_option', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select billing option</option>
            {safeOptions.billing_option_choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Requirements
          </label>
          <textarea
            value={formData.additional_requirements}
            onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about any specific needs, integrations, or requirements..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || formData.hiring_types.length === 0}
            className="px-6 py-2 bg-brand text-white rounded-md hover:bg-brand2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
}