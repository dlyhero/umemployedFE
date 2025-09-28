"use client";

import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';
import React, { use, useState } from 'react';
import { toast } from 'sonner';
import LoginModal from '../LoginModal';
import { useSaveJob } from '@/hooks/jobs/useSavedJobs';
import { usePathname } from 'next/navigation';

interface Company {
  name: string;
  logo: string;
  industry: string;
  country: string;
  countryName: string;
}

interface JobDetails {
  responsibilities: string;
  experienceLevel: string;
  workSchedule: string;
  shift: string;
}

interface Job {
  id: number;
  title: string;
  jobType: string;
  locationType: string;
  location: string;
  salary: string;
  company: Company;
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isSaved: boolean;
  hasApplied: boolean;
  details: JobDetails;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { mutate: saveJob } = useSaveJob();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pathname = usePathname()

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    saveJob(job.id, {
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

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className={`${pathname === '/' ? 'bg-white' : 'border bg-white'} p-4 min-w-[250px]  border-gray-300 rounded-lg hover:bg-brand/5 hover:border-brand transition-all h-full flex flex-col`}>
      <div className='flex justify-between items-start mb-3 gap-6'>
        <div className='p-2 bg-brand/5 rounded flex-shrink-0'>
          <img
            src={job.company.logo}
            alt={job.company.name}
            className="size-16 md:size-20 lg:size-23  rounded-md p-1 md:p-2"
          />
        </div>
        <div className='flex flex-col w-full'>
          <div className='flex justify-between items-start'>
            <div className={`p-1 w-fit text-xs font-semibold rounded px-3 ${(() => {
              const jobType = job.jobType?.toLowerCase();
              if (jobType?.includes('internship')) return 'bg-blue-100 text-blue-800/80';
              if (jobType?.includes('part') && jobType?.includes('time')) return 'bg-green-100 text-green-800/80';
              if (jobType?.includes('full') && jobType?.includes('time')) return 'bg-blue-100 text-blue-800/80';
              if (jobType?.includes('contract')) return 'bg-orange-50 text-orange-800/80';
              if (jobType?.includes('freelance')) return 'bg-green-100 text-green-800/80';
              return 'bg-gray-100 text-gray-800/80';
            })()}`}>
              {job.jobType}
            </div>
            <button
              onClick={handleSaveToggle}
              className={`p-3 md:p-4 rounded-full  transition-all duration-200 ${job.isSaved
                ? 'text-white border-brand/30 bg-brand hover:bg-brand/10 hover:text-brand'
                : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                }`}
              title={job.isSaved ? 'Remove from saved' : 'Save job'}
            >
              <Icon
                icon={"circum:bookmark-minus"}
                // icon={job.isSaved ? "heroicons:bookmark-solid" : "heroicons:bookmark"}
                className="size-5 md:size-6"
              />
            </button>
          </div>
          <div className='my-2'>
            <p className='text-lg md:text-xl font-bold text-gray-800 mb-1 dm-serif'>{job.title}</p>
            <p className='text-sm md:text-base text-gray-600'>
              {job.company.name},<br /> <span className='text-gray-500 text-xs md:text-sm flex my-1 items-center gap-1'>
                <Icon icon="radix-icons:calendar" width="15" height="15" />{job.postedDate}</span>
            </p>
          </div>
        </div>
      </div>

      <div className='mt-auto'>
        <p className=''>
          <span className='text-gray-800 text-base md:text-lg font-bold'>${job.salary}</span>
          <span className='text-gray-500 text-xs md:text-sm'>/year</span>
        </p>
        <hr className='my-3' />

        <div className='flex justify-between items-center'>
          <div className='flex gap-1 items-center font-bold text-gray-800'>
            <p className='text-sm md:text-[16px]'>{job.company.countryName || job.location}</p>
          </div>

          <Link
            href={`/jobs/${job.id}`}
            className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${job.hasApplied ? 'bg-transparent border text-brand' : 'bg-brand hover:bg-brand2 text-white'}`}
          >
            {job.hasApplied ? 'Applied' : 'Apply Now'}
          </Link>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
      />
    </div>
  );
}