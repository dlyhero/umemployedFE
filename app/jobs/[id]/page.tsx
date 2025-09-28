"use client";

import HomeHeader from '@/app/(Home)/Components/HomeHeader';
import { useJobDetail } from '@/hooks/jobs/useJobDetails';
import { Icon } from '@iconify/react';
import { useParams } from 'next/navigation';
import { OverlayContentSkeleton } from './components/OverlayContentSkeleton';
import { MainContentSkeleton } from './components/MainContentSkeleton';
import { useState } from 'react';
import { useSaveJob } from '@/hooks/jobs/useSavedJobs';
import { toast } from 'sonner';
import LoginModal from '@/components/LoginModal';
import RelatedJob from './components/RelatedJob';
import Link from 'next/link';
import RetakeRequestModal from '@/components/ui/RequestRetake';
import { useSession } from 'next-auth/react';
import { useSubscriptionStatus, useUsageStats } from '@/hooks/useSubscriptionManagement';
import UpgradeModal from '@/components/UpgradeModal';

export default function Page() {
  const { mutate: saveJob } = useSaveJob();
  const { id: jobId } = useParams() as { id: string };
  const { data: job, isLoading, refetch } = useJobDetail(Number(jobId));
  const { data: session } = useSession();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const { data: usageStats } = useUsageStats();
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleRequestRetake = () => {
    setShowRetakeModal(true);
  };

  const handleCloseRetakeModal = () => {
    setShowRetakeModal(false);
  };

  const handleRetakeSuccess = () => {
    // Optionally refetch job data to update any status
    refetch?.();
    toast.success('Your retake request has been submitted successfully!');
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    saveJob(job!.id, {
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        if ((error as Error).message === 'Authentication required') {
          setShowLoginModal(true);
        }
      }
    });
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

    // Check daily action limits for non-premium users
    console.log('Debug - Usage Stats:', usageStats);
    console.log('Debug - Subscription Status:', subscriptionStatus);
    
    if (usageStats && (usageStats.tier === 'basic' || !subscriptionStatus?.has_active_subscription)) {
      const dailyUsed = usageStats.daily_actions_used || 0;
      const dailyLimit = usageStats.daily_actions_limit || 5;
      
      console.log(`Debug - Daily Used: ${dailyUsed}, Daily Limit: ${dailyLimit}`);
      
      if (dailyUsed >= dailyLimit) {
        console.log('Debug - Limit reached, showing upgrade modal');
        setShowUpgradeModal(true);
        return;
      }
    }
    // Standard and Premium tiers have higher or unlimited limits, so no check needed

    // If all checks pass, navigate to assessment instructions
    window.location.href = `/jobs/${job?.id}/assessment-instructions`;
  };


  return (
    <div className='relative'>
      <HomeHeader />
      
      {/* Background Section */}
      <div className="h-[42vh] bg-[url('/images/learn.png')] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-42 h-42 border border-white/20 rounded-full"></div>
          <div className="absolute top-40 right-20 w-30 h-30 border border-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Overlapping Content Section */}
      <div className='relative -mt-[8vh] z-10 px-4 lg:px-8 pb-8'>
        <div className='container mx-auto'>
          {isLoading ? (
            <OverlayContentSkeleton />
          ) : (
            /* White Card Container */
            <div className='bg-white rounded p-6 lg:w-[90%] mx-auto'>
              <div className='flex flex-col lg:flex-row justify-between items-start gap-6'>
                {/* Left Section - Company & Job Info */}
                <div className='flex gap-4 flex-1'>
                  {/* Company Logo */}
                  <div className='flex-shrink-0'>
                    <div className='border border-blue-100 bg-blue-50 p-3 rounded-lg'>
                      <img
                        src={job?.company.logo}
                        alt={job?.company.name}
                        className="size-16 md:size-20 lg:size-24 object-contain rounded-md p-1 md:p-2"
                      />
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className='flex-1 min-w-0'>
                    {/* Job Title */}
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-3'>
                      {job?.title}
                    </h1>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='text-brand font-semibold text-lg'>{job?.company.name}</h3>
                    </div>
                    {/* Location & Date */}
                    <div className='flex flex-wrap items-center gap-4 text-gray-600 mb-4'>
                      <div className='flex items-center gap-1'>
                        <Icon icon="material-symbols:location-on-outline" className="w-4 h-4" />
                        <span className='text-sm'>{job?.company.countryName || job?.location}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Icon icon="material-symbols:calendar-today-outline" className="w-4 h-4" />
                        <span className='text-sm'>{job?.postedDate}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className='flex gap-2 flex-wrap'>
                      <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium'>
                        {job?.jobType}
                      </span>
                      <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium'>
                        {job?.locationType}
                      </span>
                      <span className='bg-purple-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium'>
                        {job?.details.experienceLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions & Details */}
                <div className='flex flex-col gap-4 lg:items-end lg:text-right flex-shrink-0'>
                  {/* Usage Warning Banner */}
                  {usageStats && (usageStats.tier === 'basic' || !subscriptionStatus?.has_active_subscription) && (
                    (() => {
                      const dailyUsed = usageStats.daily_actions_used || 0;
                      const dailyLimit = usageStats.daily_actions_limit || 5;
                      const remaining = dailyLimit - dailyUsed;
                      
                      if (remaining <= 0) {
                        return (
                          <Link href="/pricing" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer block">
                            <div className="flex items-center">
                              <Icon icon="material-symbols:warning" width="20" height="20" className="text-red-600 mr-2" />
                              <span className="text-red-800 text-sm font-medium">
                                Daily limit reached! Upgrade to apply to more jobs.
                              </span>
                              <Icon icon="heroicons:arrow-right" width="16" height="16" className="text-red-600 ml-auto" />
                            </div>
                          </Link>
                        );
                      } else if (remaining <= 1) {
                        return (
                          <Link href="/pricing" className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer block">
                            <div className="flex items-center">
                              <Icon icon="material-symbols:warning" width="20" height="20" className="text-yellow-600 mr-2" />
                              <span className="text-yellow-800 text-sm font-medium">
                                Only {remaining} application{remaining !== 1 ? 's' : ''} left today! Upgrade for unlimited applications.
                              </span>
                              <Icon icon="heroicons:arrow-right" width="16" height="16" className="text-yellow-600 ml-auto" />
                            </div>
                          </Link>
                        );
                      }
                      return null;
                    })()
                  )}

                  {/* Action Buttons */}
                  <div className='flex gap-3'>
                    <button className='p-3 rounded-full flex-shrink-0 border border-gray-300 hover:bg-gray-50 transition-colors'>
                      <Icon icon="material-symbols:share-outline" className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleSaveToggle}
                      className={`p-3 rounded-full flex-shrink-0 border transition-all duration-200 ${
                        job?.isSaved
                          ? 'bg-brand/10 border-brand/30 text-brand hover:bg-brand/20'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      title={job?.isSaved ? 'Remove from saved' : 'Save job'}
                    >
                      <Icon
                        icon={job?.isSaved ? "heroicons:bookmark-solid" : "heroicons:bookmark"}
                        className="size-5 md:size-6"
                      />
                    </button>
                    
                    {/* Apply/Retake Button */}
                    {job?.hasApplied ? (
                      <button 
                        onClick={handleRequestRetake}
                        className='bg-transparent hover:bg-brand/5 text-brand border border-brand px-6 py-2.5 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-md'
                      >
                        Request Retake
                      </button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <button 
                          onClick={handleApplyClick}
                          disabled={usageStats && (usageStats.tier === 'basic' || !subscriptionStatus?.has_active_subscription) && 
                                   (usageStats.daily_actions_used || 0) >= (usageStats.daily_actions_limit || 5)}
                          className={`px-6 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 hover:shadow-md ${
                            usageStats && (usageStats.tier === 'basic' || !subscriptionStatus?.has_active_subscription) && 
                            (usageStats.daily_actions_used || 0) >= (usageStats.daily_actions_limit || 5)
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              : 'bg-brand hover:bg-brand2 text-white'
                          }`}
                        >
                          Apply Now
                        </button>
                        {/* Usage indicator for non-premium users */}
                        {usageStats && (usageStats.tier === 'basic' || !subscriptionStatus?.has_active_subscription) && (
                          <div className="mt-1 text-xs text-gray-500">
                            <div className="flex items-center justify-center gap-1">
                              <span>{usageStats.daily_actions_used || 0}/{usageStats.daily_actions_limit || 5} applications</span>
                              <span className="text-gray-400">•</span>
                              <span className={((usageStats.daily_actions_limit || 5) - (usageStats.daily_actions_used || 0)) <= 1 ? 'text-red-500' : 'text-green-600'}>
                                {(usageStats.daily_actions_limit || 5) - (usageStats.daily_actions_used || 0)} left
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Salary */}
                  <div className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <span className='text-xl font-bold text-gray-900'>{job?.salary}</span>
                      <span className='text-gray-600'>/ year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className='container mx-auto mt-2'>
        {isLoading ? (
          <MainContentSkeleton />
        ) : (
          <div className="w-[90%] lg:w-[85%] mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Column - Job Details */}
              <div className="lg:col-span-2">
                {/* Job Description */}
                <div className='border-b pb-6 mb-6'>
                  <h1 className='text-xl md:text-2xl font-bold text-gray-800 mb-4'>Job Description</h1>
                  <div 
                    className='text-gray-600 prose prose-gray max-w-none'
                    dangerouslySetInnerHTML={{ __html: job?.description || '' }}
                  />
                </div>

                {/* Responsibilities */}
                <div className='border-b pb-6 mb-6'>
                  <h2 className='text-xl font-bold text-gray-800 mb-4'>Responsibilities</h2>
                  <div 
                    className='text-gray-600 prose prose-gray max-w-none'
                    dangerouslySetInnerHTML={{ __html: job?.details.responsibilities || '' }}
                  />
                </div>

                {/* Requirements */}
                <div className='border-b pb-6 mb-6'>
                  <h2 className='text-xl font-bold text-gray-800 mb-4'>Requirements</h2>
                  <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                    {job?.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Job Overview */}
              <div className="lg:col-span-1">
                <div className='bg-gray-50 p-6 rounded border-l'>
                  <h2 className='text-xl font-bold text-gray-800 mb-6'>Job Overview</h2>

                  <div className='space-y-5'>
                    <div className='flex items-start gap-3 pb-3 border-b border-gray-200'>
                      <Icon icon="material-symbols:work-outline" className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <p className='text-sm text-gray-500'>Job Type</p>
                        <p className='font-medium'>{job?.jobType}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 pb-3 border-b border-gray-200'>
                      <Icon icon="material-symbols:location-on-outline" className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <p className='text-sm text-gray-500'>Location</p>
                        <p className='font-medium'>{job?.company.countryName || job?.location}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 pb-3 border-b border-gray-200'>
                      <Icon icon="material-symbols:attach-money" className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <p className='text-sm text-gray-500'>Salary</p>
                        <p className='font-medium'>{job?.salary} per year</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 pb-3 border-b border-gray-200'>
                      <Icon icon="material-symbols:badge-outline" className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <p className='text-sm text-gray-500'>Experience</p>
                        <p className='font-medium'>{job?.details.experienceLevel}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 pb-3 border-b border-gray-200'>
                      <Icon icon="material-symbols:schedule-outline" className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <p className='text-sm text-gray-500'>Work Schedule</p>
                        <p className='font-medium capitalize'>
                          {job?.details.workSchedule.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Icon icon="material-symbols:brightness-5-outline" className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <p className='text-sm text-gray-500'>Shift</p>
                        <p className='font-medium capitalize'>
                          {job?.details.shift.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className='mt-8'>
                    <h2 className='text-xl font-bold text-gray-800 mb-4'>Benefits</h2>
                    <div 
                      className='text-gray-600 prose prose-gray max-w-none'
                      dangerouslySetInnerHTML={{ __html: job?.benefits.join('') || '' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <RelatedJob jobId={jobId} />
      
      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        title="Login Required"
        message="Please log in to save jobs to your favorites and track your applications."
      />

      <RetakeRequestModal
        isOpen={showRetakeModal}
        jobId={jobId}
        jobTitle={job?.title}
        onClose={handleCloseRetakeModal}
        onSuccess={handleRetakeSuccess}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Job Applications"
        description={`You've reached your daily limit of ${usageStats?.daily_actions_limit || 5} job applications. Upgrade to apply to unlimited jobs.`}
      />
    </div>
  );
}