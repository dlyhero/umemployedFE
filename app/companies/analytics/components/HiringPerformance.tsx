"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface HiringPerformanceProps {
  performance: {
    hiring_rate: number;
    rejection_rate: number;
    pending_rate: number;
    interviews_conducted: number;
    interview_to_hire_ratio: number;
    hiring_by_job_title: Array<{
      job__title: string;
      count: number;
      avg_score: number;
    }>;
    accepted_applications: number;
    avg_score_of_hired: number;
  };
}

const HiringPerformance: React.FC<HiringPerformanceProps> = ({ performance }) => {
  // Calculate hiring funnel data
  const totalApplications = performance.accepted_applications + 
    (performance.pending_rate / 100) * 1000 + 
    (performance.rejection_rate / 100) * 1000;

  const funnelData = [
    { stage: 'Applications', count: Math.round(totalApplications), color: 'bg-blue-500' },
    { stage: 'Interviews', count: performance.interviews_conducted, color: 'bg-yellow-500' },
    { stage: 'Hired', count: performance.accepted_applications, color: 'bg-green-500' }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Icon icon="solar:target-bold-duotone" className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hiring Performance</h2>
          <p className="text-sm text-gray-600">Recruitment funnel and success metrics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Hiring Rate</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">{performance.hiring_rate}%</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:video-camera-bold" className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Interview Success</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{performance.interview_to_hire_ratio}%</div>
        </div>
      </div>

      {/* Hiring Funnel */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((stage, index) => {
            const maxCount = Math.max(...funnelData.map(s => s.count));
            const percentage = (stage.count / maxCount) * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-sm text-gray-700">
                  {stage.stage}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className={`${stage.color} h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs font-medium text-white">{stage.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Hired</span>
            </div>
            <span className="text-sm font-bold text-green-900">{performance.hiring_rate}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <span className="text-sm font-bold text-yellow-900">{performance.pending_rate}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Rejected</span>
            </div>
            <span className="text-sm font-bold text-red-900">{performance.rejection_rate}%</span>
          </div>
        </div>
      </div>

      {/* Hiring by Job Title */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring by Job Title</h3>
        <div className="space-y-3">
          {performance.hiring_by_job_title.slice(0, 5).map((job, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">{job.job__title}</div>
                <div className="text-xs text-gray-600">Avg Score: {job.avg_score.toFixed(1)}</div>
              </div>
              <div className="text-sm font-bold text-gray-900">{job.count} hired</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HiringPerformance;