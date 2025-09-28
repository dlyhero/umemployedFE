"use client";

import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';
import LoginModal from '../LoginModal';
import { useSaveJob } from '@/hooks/jobs/useSavedJobs';
import { useRouter } from 'next/navigation';

interface Company {
  name: string;
  logo: string;
  industry: string;
}

interface Job {
  id: number;
  title: string;
  jobType: string;
  location: string;
  company: Company;
  isSaved: boolean;
  hasApplied: boolean;
}

interface SuggestedJobCardProps {
  job: Job;
}

export default function SuggestedJobCard({ job }: SuggestedJobCardProps) {
  const { mutate: saveJob } = useSaveJob();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

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
      },
    });
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleCardClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div 
      className="p-3 border bg-white border-gray-300 rounded-md hover:bg-brand/5 hover:border-brand transition-all block cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{job.title}</p>
          <p className="text-xs text-gray-600 mt-1">{job.company.name}</p>
          <p className="text-xs text-gray-500">{job.location}</p>
        </div>
        <div className="flex  gap-2">
          <button
            onClick={handleSaveToggle}
            className={`p-2 rounded-full transition-all w-fit ${
              job.isSaved
                ? 'bg-brand text-white hover:bg-brand/10 hover:text-brand'
                : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
            }`}
            title={job.isSaved ? 'Remove from saved' : 'Save job'}
          >
            <Icon icon="circum:bookmark-minus" className="size-4" />
          </button>
          <Link
            href={`/jobs/${job.id}`}
            className={`p-2 rounded-full text-xs font-medium transition-colors ${
              job.hasApplied
                ? 'bg-transparent border border-brand text-brand'
                : 'bg-brand text-white hover:bg-brand2'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {job.hasApplied ? 'Applied' : 'Apply'}
          </Link>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={handleCloseLoginModal} />
    </div>
  );
}