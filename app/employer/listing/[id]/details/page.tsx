"use client"
import useCompanyDetails from '@/hooks/companies/useCompanyDetails'
import { useJobsByCompany } from '@/hooks/jobs/useJobsByCompany'
import { useParams } from 'next/navigation'
import { Icon } from '@iconify/react'
import JobCardList from '@/components/jobs/JobCardList'

// Function to generate a color based on the company name
const generateColorFromName = (name: string): string => {
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500',
        'bg-orange-500', 'bg-teal-500', 'bg-cyan-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-yellow-500', 'bg-lime-500', 'bg-amber-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

// Function to get acronym from company name
const getAcronym = (name: string): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);
};

// Skeleton Component
const SkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-white animate-pulse">


            <main className="max-w-[1400px] mx-auto px-6 md:px-4 py-2 mt-4 md:mt-18">
                <div className='flex flex-col md:flex-row gap-24 w-full'>
                    {/* Main Content Skeleton */}
                    <div className='flex-1 order-2 md:order-2'>
                        {/* Our Story Section Skeleton */}
                        <div className="mb-12">
                            <div className="h-9 w-32 bg-gray-300 rounded mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                            </div>
                        </div>

                        {/* Mission Statement Skeleton */}
                        <div className="mb-12">
                            <div className="h-9 w-40 bg-gray-300 rounded mb-6"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        </div>

                        {/* Jobs Section Skeleton */}
                        <div>
                            <div className="h-9 w-32 bg-gray-300 rounded mb-6"></div>
                            <div className="space-y-4">
                                <div className="bg-gray-100 rounded-xl p-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 rounded-xl p-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className='min-w-76 md:max-w-76 p-6 bg-gray-50 order-1 md:order-2'>
                        {/* Company Header Skeleton */}
                        <div className="flex flex-col items-center gap-8 pb-5 mb-8 border-b">
                            <div className="size-16 md:size-20 lg:size-24  bg-gray-300 rounded-xl"></div>
                            
                            <div className="text-center w-full">
                                <div className="h-8 w-48 bg-gray-300 rounded mb-4 mx-auto"></div>
                                
                                <div className="flex flex-wrap justify-center gap-4">
                                    <div className="h-6 w-20 bg-gray-300 rounded"></div>
                                    <div className="h-6 w-24 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <div className="">
                            {/* Contact Information Skeleton */}
                            <div className="space-y-4 mb-6">
                                <div className="flex gap-2">
                                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-40 bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                                </div>
                            </div>

                            {/* Company Facts Skeleton */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 w-28 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 w-18 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-40 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default function CompanyDetailsPage() {
    const { id } = useParams();
    const { data: company, isLoading } = useCompanyDetails(id as string)
    const { data: jobsData, isLoading: isLoadingJobs } = useJobsByCompany(id as string)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                {/* Hero Section - Always visible */}
                <div className='bg-blue-950'>
                    <div className="px-4">
                        <div className="">
                            <div className="flex flex-col items-center justify-center py-32 relative">
                                <div className="text-center text-white">
                                    <h3 className="text-3xl md:text-5xl dm-serif tracking-wider">
                                        Company Details
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SkeletonLoader />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Company not found</h2>
                    <p className="text-gray-600">The company you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className='bg-blue-950'>
                <div className="px-4">
                    <div className="">
                        <div className="flex flex-col items-center justify-center py-32 relative">
                            <div className="text-center text-white">
                                <h3 className="text-3xl md:text-5xl dm-serif tracking-wider">
                                    Company Details
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto  md:px-4 py-2 mt-4 md:mt-18">

                <div className='flex flex-col md:flex-row gap-10 md:gap-24 w-full p-8 md:p-2'>
                    <div className='flex-1 order-2 md:order-2'>
                        {/* Our Story Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 tracking-wider">Our story</h2>
                            <div 
                                className="text-gray-700 leading-relaxed prose prose-gray max-w-none"
                                dangerouslySetInnerHTML={{ __html: company.description || '' }}
                            />
                        </div>


                        {/* Mission Statement */}
                        {company.mission_statement && (
                            <div className="mb-12">
                                <h2 className="text-2xl md:text-3xl  font-bold text-gray-800 mb-6 tracking-wider">
                                    Our Mission
                                </h2>
                                <div 
                                    className="text-gray-700 leading-relaxed italic prose prose-gray max-w-none"
                                    dangerouslySetInnerHTML={{ __html: `"${company.mission_statement || ''}"` }}
                                />
                            </div>
                        )}

                        {/* Jobs Section */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 tracking-wider">
                                Open Positions
                            </h2>
                            {isLoadingJobs ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                                            <div className="flex-1">
                                                <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
                                                <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                                            <div className="flex-1">
                                                <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
                                                <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
                                <div className="space-y-4">
                                    {jobsData.jobs.map((job: any) => (
                                        <JobCardList 
                                            key={job.id} 
                                            job={job}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <Icon icon="material-symbols:work-outline" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Open Positions</h3>
                                    <p className="text-gray-500">This company doesn't have any open positions at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='min-w-76 md:max-w-76 p-6 bg-brand/5 order-1 md:order-2'>
                        {/* Company Header */}
                        <div className="flex flex-col  items-center gap-8 pb-5 mb-8 border-b">
                            <div className={`size-16 md:size-20 lg:size-24 rounded-xl flex items-center justify-center text-white font-bold text-4xl ${generateColorFromName(company.name)}`}>
                                {getAcronym(company.name)}
                            </div>

                            <div className="flex-1 text-center tracking-wider">
                                <h1 className="text-3xl  font-bold text-gray-800 mb-2 tracking-wider">{company.name}</h1>
                   
                                <div className="flex flex-wrap gap-4">
                                    {company.website_url && (
                                        <a
                                            href={company.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-brand hover:text-brand/80"
                                        >
                                            <Icon icon="mdi:web" className="w-5 h-5" />
                                            Website
                                        </a>
                                    )}
                                    {company.linkedin && (
                                        <a
                                            href={company.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-brand hover:text-brand/80"
                                        >
                                            <Icon icon="mdi:linkedin" className="w-5 h-5" />
                                            LinkedIn
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="">
                            {/* Contact Information */}
                            <div className="">

                                <div className="space-y-2">
                                    {company.contact_phone && (
                                        <div className="flex gap-2">
                                            <Icon icon="mdi:phone" className="w-5 h-5 text-gray-500" />
                                            <a href={`tel:${company.contact_phone}`} className="text-gray-700 hover:text-brand">
                                                {company.contact_phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Company Facts */}
                            <div className="mt-3">

                                <div className="space-y-3">
                                   {company.founded && <div className="flex flex-col gap-2 justify-between">
                                        <span className="text-gray-600">Founded:</span>
                                        <span className="font-medium">{company.founded }</span>
                                    </div>}
                                    <div className="flex flex-col gap-2 justify-between">
                                        <span className="text-gray-600">Industry:</span>
                                        <span className="font-medium">{company.industry}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-between">
                                        <span className="text-gray-600">Company Size:</span>
                                        <span className="font-medium">{company.size}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium">{company.location}, {company.country}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}