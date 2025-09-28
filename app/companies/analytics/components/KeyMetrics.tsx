"use client";

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { CompanyAnalytics } from '@/hooks/companies/useCompanyAnalytics';

interface KeyMetricsProps {
  analytics: CompanyAnalytics;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ analytics }) => {
  const metrics = [
    {
      category: "Hiring Performance",
      icon: "solar:target-bold-duotone",
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      items: [
        { 
          label: "Hiring Rate", 
          value: `${analytics.hiring_performance.hiring_rate}%`,
          description: "Percentage of applications that result in hires"
        },
        { 
          label: "Interview to Hire Ratio", 
          value: `${analytics.hiring_performance.interview_to_hire_ratio}%`,
          description: "Percentage of interviews that result in hires"
        },
        { 
          label: "Average Score (Hired)", 
          value: analytics.hiring_performance.avg_score_of_hired.toFixed(1),
          description: "Average quiz score of hired candidates"
        }
      ]
    },
    {
      category: "Application Quality",
      icon: "solar:star-bold-duotone",
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      items: [
        { 
          label: "Completion Rate", 
          value: `${analytics.application_metrics.completion_rate}%`,
          description: "Percentage of applications that complete the quiz"
        },
        { 
          label: "Average Quiz Score", 
          value: analytics.application_metrics.avg_quiz_score.toFixed(1),
          description: "Average quiz score across all applications"
        },
        { 
          label: "Average Matching %", 
          value: `${analytics.application_metrics.avg_matching_percentage}%`,
          description: "Average job-candidate matching percentage"
        }
      ]
    },
    {
      category: "Growth Trends",
      icon: "solar:trend-up-bold-duotone",
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      items: [
        { 
          label: "Job Posting Growth", 
          value: `${analytics.trends.job_posting_growth_rate}%`,
          description: "Month-over-month job posting growth"
        },
        { 
          label: "Application Growth", 
          value: `${analytics.trends.application_growth_rate}%`,
          description: "Month-over-month application growth"
        },
        { 
          label: "Remote Jobs", 
          value: `${analytics.geographic_data.remote_jobs_percentage}%`,
          description: "Percentage of jobs that are remote"
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 ">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-wider text-gray-900">Key Performance Metrics</h2>
          <p className="text-sm md:text-[16.5px] text-gray-600">Critical insights for recruitment success</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics.map((category, categoryIndex) => (
          <div
            key={categoryIndex}
            className={` md:border-r md:p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
            
              <h3 className="dm-serif text-lg md:text-2xl tracking-wider font-bold text-gray-900">{category.category}</h3>
            </div>
            
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="bg-white/50  md:p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg md:text-xl font-medium text-gray-700">{item.label}</span>
                    <span className={`text-2xl text-brand md:text-5xl font-bold dm-serif`}>{item.value}</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyMetrics;