"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Job {
  id: number;
  title: string;
  application_count: number;
}

interface ApplicantCardProps {
  job: Job;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ job}) => {

  const router = useRouter()
  // Get initials for avatar
  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on job title
  const getColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-500/80',
      'bg-green-500/80',
      'bg-purple-500/80',
      'bg-red-500/80',
      'bg-brand/80',
      'bg-pink-500/80',
      'bg-teal-500/80',
      'bg-orange-500/80',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getColorFromString(job.title);
  const initials = getInitials(job.title);

  return (
    <div className="bg-white   rounded-xl p-6  transition-all duration-300 group h-fit">
      {/* Header with Avatar and Title */}
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className={`size-16 md:size-20 lg:size-23  rounded-md p-1 md:p-2 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-xl  md:text-3xl">
            {initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 dm-serif text-center tracking-wide">
            {job.title}
          </h3>
  
        </div>
      </div>

      {/* Application Count */}
      <div className="mb-6">
        <div className="flex items-center justify-center md:text-lg">
          <div className="flex items-center gap-2">
            <Icon icon="solar:users-group-two-rounded-line-duotone" className="w-5 h-5 text-gray-500" />
              <div className="bg-brand/10 text-brand px-3 py-1 rounded-full  font-medium">
            {job.application_count}
          </div>
            <span className=" text-gray-600">Applications</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => router.push(`/companies/jobs/${job.id}`)}
        className="w-full border border-brand hover:bg-brand/90 hover:text-white text-brand rounded-full py-3 transition-colors"
      >
        Edit Job
      </button>

      {/* Empty State Message */}
      {job.application_count === 0 && (
        <p className="text-sm md:text-[15px] text-gray-500 text-center mt-2">
          No applications received yet
        </p>
      )}
    </div>
  );
};

export default ApplicantCard;