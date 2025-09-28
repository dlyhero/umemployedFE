"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface JobPostingChartsProps {
  jobStats: {
    by_job_type: Array<{ job_type: string; count: number }>;
    by_location_type: Array<{ job_location_type: string; count: number }>;
    by_experience_level: Array<{ experience_levels: string; count: number }>;
    salary_analysis: {
      avg_salary: number;
      min_salary: number;
      max_salary: number;
    };
    popular_job_titles: Array<{ title: string; count: number }>;
    avg_hire_number: number;
  };
}

const JobPostingCharts: React.FC<JobPostingChartsProps> = ({ jobStats }) => {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

  const formatSalary = (salary: number) => {
    if (salary >= 1000) {
      return `$${(salary / 1000).toFixed(0)}k`;
    }
    return `$${salary}`;
  };

  const formatJobType = (jobType: string) => {
    return jobType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatLocationType = (locationType: string) => {
    return locationType.charAt(0).toUpperCase() + locationType.slice(1);
  };

  const formatExperienceLevel = (level: string) => {
    return level.replace(/([A-Z])/g, ' $1').trim();
  };

  // Format data for charts
  const jobTypeData = jobStats.by_job_type.map(item => ({
    name: formatJobType(item.job_type),
    value: item.count,
    percentage: ((item.count / jobStats.by_job_type.reduce((sum, job) => sum + job.count, 0)) * 100).toFixed(1)
  }));

  const locationTypeData = jobStats.by_location_type.map(item => ({
    name: formatLocationType(item.job_location_type),
    value: item.count,
    percentage: ((item.count / jobStats.by_location_type.reduce((sum, loc) => sum + loc.count, 0)) * 100).toFixed(1)
  }));

  const experienceData = jobStats.by_experience_level.map(item => ({
    name: formatExperienceLevel(item.experience_levels),
    value: item.count,
    percentage: ((item.count / jobStats.by_experience_level.reduce((sum, exp) => sum + exp.count, 0)) * 100).toFixed(1)
  }));

  const popularTitlesData = jobStats.popular_job_titles.slice(0, 5).map(item => ({
    name: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
    value: item.count
  }));

  return (
    <div className="bg-white md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Job Posting Analysis</h2>
        <p className="text-gray-600">Distribution and salary insights</p>
      </div>

      {/* Salary Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Analysis</h3>
        <div className="grid grid-cols-3 gap-4 rounded-lg border  p-2 border-brand3">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Average</div>
            <div className="text-2xl font-bold text-brand dm-serif">{formatSalary(jobStats.salary_analysis.avg_salary)}</div>
          </div>
          <div className="text-center border-l border-r border-brand3  px-4">
            <div className="text-sm text-gray-600 mb-2">Minimum</div>
            <div className="text-2xl font-bold text-brand dm-serif">{formatSalary(jobStats.salary_analysis.min_salary)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Maximum</div>
            <div className="text-2xl font-bold text-brand dm-serif">{formatSalary(jobStats.salary_analysis.max_salary)}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Job Type Distribution */}
        <div className="bg-gray-50 rounded-lg md:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={jobTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {jobTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {jobTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Type Distribution */}
        <div className="bg-gray-50 rounded-lg md:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={locationTypeData} layout="horizontal">
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80}
                tick={{ fontSize: 15, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {locationTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Level and Popular Titles */}
      <div className="grid grid-cols-1  gap-8">
        {/* Experience Level Distribution */}
        <div className="bg-gray-50 rounded-lg md:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Level Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={experienceData}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 15, fill: '#1e90ff' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Bar dataKey="value" fill="#10162c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {experienceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Job Titles */}
        <div className="bg-gray-50 rounded-lg md:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Job Titles</h3>
          {/* <ResponsiveContainer width="100%" height={200}>
            <BarChart data={popularTitlesData} layout="horizontal">
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 15, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer> */}
          <div className="mt-4 space-y-2">
            {jobStats.popular_job_titles.slice(0, 5).map((title, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{title.title}</span>
                <span className="font-medium">{title.count} jobs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingCharts;