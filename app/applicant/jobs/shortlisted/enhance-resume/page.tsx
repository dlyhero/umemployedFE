"use client";
import { useShortlistedJobs } from '@/hooks/jobs/useShortListed';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement';
import { useEnhancedResume } from '@/hooks/useEnhancedResume';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UpgradeModal from '@/components/UpgradeModal';

const ShortlistedJobs = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { shortlistedJobs, isLoading, isError, error } = useShortlistedJobs();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      if (openDropdown) {
        document.removeEventListener('click', handleClickOutside);
      }
    };
  }, [openDropdown]);

  const SkeletonLoader = () => (
    <div className="space-y-4 p-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-2 md:p-3 bg-gray-200 rounded-lg w-12 h-12 md:w-16 md:h-16 animate-pulse"></div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-full w-8 md:w-10 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl p-2 md:p-8 lg:p-16 min-h-screen mt-5 md:mt-0">
        <div className="bg-white rounded-xl border border-gray-100 mt-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-wide px-6">
            Recent Shortlisted Jobs
          </h2>
          <hr />
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error?.message ?? 'An error occurred'}</p>
      </div>
    );
  }

  const getJobIcon = (company?: string) => {
    // Normalize company name to lowercase and remove spaces for icon lookup
    const normalizedCompany = company?.toLowerCase().replace(/\s+/g, '');
    
    const companyLogos: Record<string, string> = {
      google: 'logos:google',
      amazon: 'logos:amazon',
      microsoft: 'logos:microsoft',
      apple: 'logos:apple',
      facebook: 'logos:facebook',
      twitter: 'logos:twitter',
      linkedin: 'logos:linkedin',
      netflix: 'logos:netflix',
      // Add more company-to-logo mappings as needed
    };

    return normalizedCompany && normalizedCompany in companyLogos 
      ? companyLogos[normalizedCompany]
      : 'logos:dailydev-icon'; // Fallback icon for unknown companies
  };

  const getJobIconColor = (company?: string) => {
    // Use subtle background for logos; avoid heavy color theming to preserve logo appearance
    return 'bg-gray-50'; // Consistent background for all logos
  };

  const handleDropdownClick = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === jobId ? null : jobId);
  };

  const handleActionClick = async (action: string, jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(null);

    switch (action) {
      case 'view':
        router.push(`/jobs/${jobId}`);
        break;
      case 'enhance':
        await handleEnhanceResume(jobId);
        break;
      case 'share':
        // Handle share
        toast.info('Share functionality coming soon');
        break;
      case 'edit':
        // Handle edit
        toast.info('Edit functionality coming soon');
        break;
      case 'archive':
        // Handle archive
        toast.info('Archive functionality coming soon');
        break;
      case 'delete':
        // Handle delete
        toast.info('Delete functionality coming soon');
        break;
    }
  };

  const handleEnhanceResume = async (jobId: number) => {
    // Check subscription status first
    if (!subscriptionStatus?.has_active_subscription || subscriptionStatus.tier !== 'premium') {
      setShowUpgradeModal(true);
      return;
    }

    if (!session?.user.id) {
      toast.error('Please log in to enhance your resume');
      return;
    }

    try {
      // Check if enhanced resume already exists
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resume/check-enhanced-resume/${session.user.id}/${jobId}/`,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );

      if (response.ok) {
        // Enhanced resume exists, redirect to view page
        router.push(`/applicant/resume/enhanced/${jobId}`);
      } else if (response.status === 404) {
        // No enhanced resume exists, redirect to upload page
        router.push(`/applicant/resume/upload/${jobId}`);
      } else {
        throw new Error('Failed to check enhanced resume status');
      }
    } catch (error) {
      console.error('Error checking enhanced resume:', error);
      toast.error('Failed to check resume status. Please try again.');
    }
  };

  return (
    <div className="rounded-2xl p-2 md:p-8 lg:p-16 min-h-screen mt-5 md:mt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="p-2 md:p-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">Enhance Resume</h1>
          <p className="text-gray-700">Enhance your resume based on shortlisted jobs</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 mt-6 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-wide px-6">Recent Shortlisted Jobs</h2>
        <hr />
        <div className="space-y-4 p-6">
          {shortlistedJobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`p-2 md:p-3 rounded-lg flex items-center justify-center ${getJobIconColor(job.company)}`}
                >
                  <Icon 
                    icon={getJobIcon(job.company)} 
                    className="size-6 md:size-10" 
                    aria-label={`Logo for ${job.company || 'company'}`} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-1 truncate tracking-wide">{job.title}</h2>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    {job.job_type ?? 'Fulltime'} • {job.location} • {job.company ?? 'Unknown Company'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <button
                  onClick={(e) => handleActionClick('enhance', job.id, e)}
                  className="px-4 border border-brand text-brand hover:text-brand2 hover:bg-blue-50 rounded-full py-2 text-sm font-medium transition-colors flex items-center gap-2"
                  title="Enhance your resume for this job"
                >
                  <Icon icon="lucide:sparkles" className="h-4 w-4" />
                  Enhance Resume
                  {(!subscriptionStatus?.has_active_subscription || subscriptionStatus.tier !== 'premium') && (
                    <Icon icon="lucide:crown" className="h-3 w-3" />
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => handleDropdownClick(job.id, e)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="More options"
                  >
                    <Icon icon="hugeicons:more-horizontal" className="text-gray-400 size-8 md:size-10" />
                  </button>
                  {openDropdown === job.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                      <button
                        onClick={(e) => handleActionClick('view', job.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon icon="hugeicons:view" className="size-4 md:size-5" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={(e) => handleActionClick('enhance', job.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon icon="hugeicons:file-star" className="size-4 md:size-5" />
                        <span>Enhance Resume</span>
                      </button>
                      <button
                        onClick={(e) => handleActionClick('share', job.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon icon="hugeicons:share-01" className="size-4 md:size-5" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={(e) => handleActionClick('edit', job.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon icon="hugeicons:edit-02" className="size-4 md:size-5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleActionClick('archive', job.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon icon="hugeicons:archive" className="size-4 md:size-5" />
                        <span>Archive</span>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={(e) => handleActionClick('delete', job.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Icon icon="hugeicons:delete-02" className="size-4 md:size-5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {shortlistedJobs.length === 0 && (
            <div className="text-center py-12">
              <Icon 
                icon="hugeicons:folder-open" 
                width={48} 
                height={48} 
                className="text-gray-300 mx-auto mb-4" 
                aria-label="No jobs icon"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applied jobs yet</h3>
              <p className="text-gray-500">Jobs you apply to will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Resume Enhancement"
        description="AI-powered resume enhancement helps you tailor your resume to specific job requirements, increasing your chances of getting noticed by employers."
      />
    </div>
  );
};

export default ShortlistedJobs;