// @/components/CompanyCard.tsx
import { TransformedCompany } from '@/hooks/companies/useCompaniesWithSearch';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';
import React from 'react';

interface CompanyCardProps {
  company: TransformedCompany;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Function to generate acronym from company name
  const generateAcronym = (name: string): string => {
    return name
      .split(' ')
      .filter(word => word.length > 0) // Filter out empty strings
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 3) // Take only first 3 letters for better display
      .join('');
  };

  // Function to generate consistent color based on company name
  const generateColor = (name: string): string => {
    const colors = [
      'bg-blue-500/70',
      'bg-green-500/70', 
      'bg-purple-500/70',
      'bg-red-500/70',
      'bg-yellow-500/70',
      'bg-indigo-500/70',
      'bg-pink-500/70',
      'bg-teal-500/70',
      'bg-orange-500/70',
      'bg-cyan-500/70',
      'bg-emerald-500/70',
      'bg-violet-500/70'
    ];
    
    // Simple hash function to ensure consistent color for same company
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const acronym = generateAcronym(company.name);
  const bgColor = generateColor(company.name);

  return (
    <Link href={`/employer/listing/${company.id}/details`} className="bg-white rounded-lg border overflow-hidden group hover:border-brand transition-all">
      {/* Company Information */}
      <div className="pt-6 flex flex-col md:flex-row gap-4 md:items-center justify-between p-6">
        <div className="flex gap-4">
          {/* Company Logo with Acronym Fallback */}
          <div className="size-16 md:size-20 lg:size-24 rounded-full flex items-center justify-center overflow-hidden ">
            {/* {company.logoUrl && company.logoUrl !== company.logo ? (
              <img 
                src={company.logoUrl} 
                alt={`${company.name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to acronym if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`size-full rounded-full flex items-center justify-center text-white font-bold ${bgColor} ${company.logoUrl && company.logoUrl !== company.logo ? 'hidden' : ''}`}
            >
              <span className="text-[28px] md:text-[36px] lg:text-[45px] font-bold">
                {acronym}
              </span>
            </div> */}
            <Icon icon="openmoji:classical-building" width="72" height="72" />
          </div>
          <div className="text-start">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-brand tracking-wide">{company.name}</h2>
            <div className="text-gray-600 mt-2">
              <div className="flex gap-1 items-center">
                <Icon icon="gridicons:location" className='size-4 text-brand' />
                <span>{company.location}</span>
              </div>
              <p className='text-sm mb-2 flex items-center gap-1 mt-2'>
                <Icon icon="mdi:briefcase" className="size-4 text-brand2" />
                <span>{company.industry}</span>
              </p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 justify-between items-center">
          <div className='px-8 py-2 bg-blue-50 rounded-full'> 
            <span className='text-brand'>
              {company.jobCount} job{company.jobCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div>
            <button className={`p-4 rounded-full bg-brand/10 text-brand`}>
              <Icon
                icon={"circum:bookmark-minus"}
                className="size-5 md:size-6"
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;