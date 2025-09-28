"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import useCompaniesWithSearch from '@/hooks/companies/useCompaniesWithSearch';
import CompanyCard from '@/app/employer/listing/components/CompanyCard';
import Link from 'next/link';

interface Employer {
  id: number;
  name: string;
  logo: string;
  openings: number;
  industry: string;
  featured?: boolean;
  joinedDate?: string; // Added for calendar icon
}

export default function TopEmployers() {
  const employers: Employer[] = [
    {
      id: 1,
      name: 'Google',
      logo: 'logos:google',
      openings: 145,
      industry: 'Technology',
      joinedDate: '2020-05-15'
    },
    {
      id: 2,
      name: 'Microsoft',
      logo: 'logos:microsoft',
      openings: 98,
      industry: 'Technology',
      joinedDate: '2019-08-22'
    },
    {
      id: 3,
      name: 'Meta',
      logo: 'logos:meta',
      openings: 76,
      industry: 'Technology',
      joinedDate: '2021-03-10'
    },
    {
      id: 4,
      name: 'Apple',
      logo: 'logos:apple',
      openings: 123,
      industry: 'Technology',
      joinedDate: '2018-11-05'
    },
    {
      id: 5,
      name: 'Netflix',
      logo: 'logos:netflix',
      openings: 52,
      industry: 'Entertainment',
      joinedDate: '2022-01-30'
    },
    {
      id: 6,
      name: 'Spotify',
      logo: 'logos:spotify',
      openings: 34,
      industry: 'Music & Streaming',
      joinedDate: '2020-07-18'
    },
    {
      id: 7,
      name: 'Airbnb',
      logo: 'logos:airbnb',
      openings: 67,
      industry: 'Travel & Hospitality',
      joinedDate: '2019-09-12'
    },
    {
      id: 8,
      name: 'Uber',
      logo: 'simple-icons:ubereats',
      openings: 89,
      industry: 'Transportation',
      joinedDate: '2021-06-25'
    },
    {
      id: 9,
      name: 'Adobe',
      logo: 'logos:adobe',
      openings: 45,
      industry: 'Software & Design',
      joinedDate: '2018-04-15'
    },
    {
      id: 10,
      name: 'Slack',
      logo: 'logos:slack',
      openings: 28,
      industry: 'Communication',
      joinedDate: '2020-02-28'
    },
    {
      id: 11,
      name: 'Discord',
      logo: 'logos:discord',
      openings: 19,
      industry: 'Social & Gaming',
      joinedDate: '2022-03-15'
    },
    {
      id: 12,
      name: 'Figma',
      logo: 'logos:figma',
      openings: 31,
      industry: 'Design & Collaboration',
      joinedDate: '2021-10-08'
    }
  ];
    const { data, isLoading, error } = useCompaniesWithSearch({ page_size: 6 });

  return (
    <div className='relative py-8 md:py-16 bg-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12 md:mb-16'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold dm-serif tracking-wider text-gray-900 mb-3 md:mb-4'>
            Top Employers
          </h2>
          <p className='text-gray-600 text-base md:text-lg max-w-2xl mx-auto'>
            Join thousands of professionals at these leading companies
          </p>
        </div>

        {/* Employers Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-4 md:gap-6'>
               {data?.companies.slice(0,6).map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
        </div>

        {/* View All Button */}
        <div className='flex justify-center mt-10 md:mt-12'>
          <Link href={'/employer/listing'} className='text-gray-800 border border-brand px-6 py-2 md:px-8 md:py-3 rounded font-medium md:font-semibold transition-colors duration-300 flex items-center gap-2 hover:bg-brand/5'>
            View All Companies
            <Icon icon="material-symbols:arrow-forward" className="size-5 md:size-6" />
          </Link >
        </div>
      </div>
    </div>
  );
}

function EmployerCard({ employer }: { employer: Employer }) {
  return (
    <div className='group flex gap-3 p-4 bg-white rounded border border-gray-200 hover:border-brand/30 hover:shadow-sm transition-all duration-300'>
      {/* Logo */}
      <div className='flex-shrink-0'>
        <div className='p-3 bg-gray-50 rounded-lg'>
          <Icon
            icon={employer.logo || 'ri:building-2-line'}
            className="size-16 md:size-20 lg:size-24 object-contain rounded-md p-1 md:p-2"

          />
        </div>
      </div>

      <div className='flex flex-col justify-center flex-grow'>
        {/* Company Name */}
        <h3 className='text-lg md:text-xl font-bold text-gray-800 mb-1 group-hover:text-brand transition-colors dm-serif'>
          {employer.name}
        </h3>

        {/* Industry */}
        <p className='text-sm text-brand2 mb-2 flex items-center gap-1'>
          <Icon icon="mdi:briefcase" className="size-4" />
          <span>{employer.industry}</span>
        </p>

        {/* Job Openings */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1 text-sm md:text-base'>
            <span className='text-brand font-medium'>{employer.openings}</span>
            <span className='text-gray-600'>openings</span>
          </div>

          {/* Joined Date with Calendar Icon */}
          {employer.joinedDate && (
            <div className='flex items-center gap-1 text-sm text-gray-500 '>
              <Icon icon="mdi:calendar" className="size-5" />
              <span>{new Date(employer.joinedDate).getFullYear()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}