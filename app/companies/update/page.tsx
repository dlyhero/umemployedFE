"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'sonner';
import { useCompanyDetails } from '@/hooks/companies/useCompanyDetails';
import { useCompanyUpdate } from '@/hooks/companies/useCompanyUpdate';
import { stripHtmlTags, getCountryName, getCountryFlag } from '@/lib/textUtils';
import GoogleMeetStatus from '@/components/GoogleMeetStatus';

export default function CompanyUpdatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    location: '',
    founded: '',
    website_url: '',
    country: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    mission_statement: '',
    linkedin: '',
    video_introduction: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for Google OAuth success
  useEffect(() => {
    const googleOAuth = searchParams.get('google_oauth');
    if (googleOAuth === 'success') {
      toast.success('Google Calendar Connected!', {
        description: 'You can now schedule Google Meet interviews with automatic calendar integration.',
      });
      // Clean up the URL
      router.replace('/companies/update');
    }
  }, [searchParams, router]);

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      toast.error('Please sign in to update company information.');
      router.push('/login');
      return;
    }
    
    if (session?.user?.role !== 'recruiter') {
      toast.error('Only recruiters can update company profiles.');
      router.push('/select-role');
      return;
    }
  }, [session, status, router]);

  // Fetch company data
  const { 
    data: companyData, 
    isLoading: companyLoading, 
    isError: companyError 
  } = useCompanyDetails(session?.user?.companyId as string);

  // Company update mutation
  const updateMutation = useCompanyUpdate();

  // Populate form with company data
  useEffect(() => {
    if (companyData) {
      setFormData({
        name: companyData.name || '',
        industry: companyData.industry || '',
        size: companyData.size || '',
        location: companyData.location || '',
        founded: companyData.founded?.toString() || '',
        website_url: companyData.website_url || '',
        country: companyData.country || '',
        contact_email: companyData.contact_email || '',
        contact_phone: companyData.contact_phone || '',
        description: stripHtmlTags(companyData.description),
        mission_statement: stripHtmlTags(companyData.mission_statement),
        linkedin: companyData.linkedin || '',
        video_introduction: companyData.video_introduction || '',
      });
    }
  }, [companyData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.companyId) {
      toast.error('Company ID not found.');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Company name is required.');
      return;
    }

    if (!formData.country) {
      toast.error('Country is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload (remove empty values, convert founded to integer)
      const payload: any = {};
      for (const key in formData) {
        if (formData[key as keyof typeof formData] !== '' && 
            formData[key as keyof typeof formData] !== null && 
            formData[key as keyof typeof formData] !== undefined) {
          payload[key] = key === 'founded' ? parseInt(formData[key as keyof typeof formData]) : formData[key as keyof typeof formData];
        }
      }

      await updateMutation.mutateAsync({
        companyId: session.user.companyId,
        data: payload
      });

      toast.success('Company updated successfully!');
      router.push('/companies/dashboard');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Industry options
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 
    'Manufacturing', 'Retail', 'Hospitality', 'Construction', 
    'Transportation', 'Media', 'Real Estate', 'Energy', 'Government'
  ];

  // Company size options
  const sizes = [
    '1-10', '11-50', '51-200', '201-500', 
    '501-1000', '1001-5000', '5001-10000', '10001+'
  ];

  // Country options with names and flags
  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
    { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
    { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
    { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
    { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
    { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
    { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴' },
    { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
    { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: 'TD', name: 'Chad', flag: '🇹🇩' },
    { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
    { code: 'LY', name: 'Libya', flag: '🇱🇾' },
    { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
    { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
    { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
    { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
    { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
    { code: 'CD', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
    { code: 'CG', name: 'Republic of the Congo', flag: '🇨🇬' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
    { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
    { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
    { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
    { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
    { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
    { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
    { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
    { code: 'YT', name: 'Mayotte', flag: '🇾🇹' },
    { code: 'RE', name: 'Réunion', flag: '🇷🇪' },
    { code: 'SH', name: 'Saint Helena', flag: '🇸🇭' },
    { code: 'AC', name: 'Ascension Island', flag: '🇦🇨' },
    { code: 'TA', name: 'Tristan da Cunha', flag: '🇹🇦' },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
    { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' }
  ];

  if (status === 'loading' || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Icon icon="solar:loading-bold" className="w-6 h-6 animate-spin text-brand" />
          <Icon icon="line-md:loading-alt-loop" className='size-9' />
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:danger-circle-bold" className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Company</h3>
          <p className="text-gray-600 mb-4">Unable to load company information. Please try again.</p>
          <button onClick={() => window.location.reload()} >
            <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-none min-[1220px]:border">
      <div className="lg:p-14 min-[1220px]:p-14">
         <button
          className='py-2 flex items-center gap-2 mb-10 cursor-pointer'
            onClick={() => router.push('/companies/dashboard')}
          >
            <Icon icon="mynaui:arrow-long-left" className='size-6'/>
            Back to Dashboard
          </button>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
          
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Update Company</h1>
              <p className="text-gray-600">Update your company information and settings</p>
            </div>
          </div>
         
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <div className="flex items-center gap-3 mb-6">
          
              <div>
                <h2 className="text-xl tracking-wider font-bold text-gray-900">Company Information</h2>
                <p className="text-sm md:text-[16px] mb-2 text-gray-600">Basic company details and information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Industry</label>
                <div className="relative">
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={(e) => handleSelectChange('industry', e.target.value)}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors appearance-none bg-white"
                  >
                    <option value="">Select industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Company Size</label>
                <div className="relative">
                  <select
                    name="size"
                    value={formData.size}
                    onChange={(e) => handleSelectChange('size', e.target.value)}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors appearance-none bg-white"
                  >
                    <option value="">Select company size</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="City, State/Province"
                  />
                </div>
              </div>

              {/* Founded Year */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Founded Year</label>
                <div className="relative">
                  <input
                    type="number"
                    name="founded"
                    value={formData.founded}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="e.g., 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Website URL</label>
                <div className="relative">
                  <Icon icon="solar:globe-bold" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="https://company.com"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => handleSelectChange('country', e.target.value)}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors appearance-none bg-white"
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Current Country Display */}
                {formData.country && (
                  <div className="mt-2 flex items-center gap-2 text-sm md:text-[16px] mb-2 text-gray-600">
                    <span>Selected:</span>
                    <span className="flex items-center gap-1">
                      <span>{getCountryFlag(formData.country)}</span>
                      <span className="font-medium">{getCountryName(formData.country)}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <div className="flex items-center gap-3 mb-6">
                
              <div>
                <h2 className="text-xl tracking-wider font-bold text-gray-900">Contact Information</h2>
                <p className="text-sm md:text-[16px] mb-2 text-gray-600">How people can reach your company</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Email */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Contact Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Contact Phone</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Description Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <div className="flex items-center gap-3 mb-6">
            
              <div>
                <h2 className="text-xl tracking-wider font-bold text-gray-900">Company Description</h2>
                <p className="text-sm md:text-[16px] mb-2 text-gray-600">Tell people about your company</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Company Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
                  placeholder="Describe your company, what you do, and what makes you unique..."
                />
              </div>

              {/* Mission Statement */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Mission Statement</label>
                <textarea
                  name="mission_statement"
                  value={formData.mission_statement}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
                  placeholder="What is your company's mission and vision?"
                />
              </div>
            </div>
          </div>

          {/* Social Links & Media Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 ">
            <div className="flex items-center gap-3 mb-6">
          
              <div>
                <h2 className="text-xl tracking-wider font-bold text-gray-900">Social Links & Media</h2>
                <p className="text-sm md:text-[16px] mb-2 text-gray-600">Connect your social presence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LinkedIn */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">LinkedIn URL</label>
                <div className="relative">
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full pl-10  py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>

              {/* Video Introduction */}
              <div className="space-y-2">
                <label className="text-sm md:text-[16px] mb-2 font-medium text-gray-700">Video Introduction URL</label>
                <div className="relative">
                  <input
                    type="url"
                    name="video_introduction"
                    value={formData.video_introduction}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Google Meet Integration Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="logos:google-meet" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl tracking-wider font-bold text-gray-900">Google Meet Integration</h2>
                <p className="text-sm md:text-[16px] mb-2 text-gray-600">Connect your Google Calendar for automatic interview scheduling</p>
              </div>
            </div>

            <div className="space-y-4">
              <GoogleMeetStatus />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:info-circle-bold" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Benefits of Google Meet Integration:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Automatic calendar event creation for interviews</li>
                      <li>• Google Meet links generated automatically</li>
                      <li>• Email invitations sent to candidates</li>
                      <li>• Seamless interview scheduling workflow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-4">
            <button
            className='border px-6 py-2 rounded-full  '
              type="button"
              onClick={() => router.push('/companies/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand hover:bg-brand/90 text-white flex items-center px-6 py-2 rounded-full"
            >
              {isSubmitting ? (
                <>
                  Updating...
                </>
              ) : (
                <>
                  Update Company
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}