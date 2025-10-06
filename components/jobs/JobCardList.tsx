import { useSaveJob } from '@/hooks/jobs/useSavedJobs';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';

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

interface JobCardListProps {
    job: Job;
    onSave?: (jobId: number) => void;
    onApply?: (jobId: number) => void;
}

export default function JobCardList({ job, onSave, onApply }: JobCardListProps) {
    const { mutate: saveJob } = useSaveJob(); // Removed isPending since we're not using it



    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        saveJob(job.id, {
            onSuccess: (data) => {
                toast.success(data.message);
            },

        });
    };


    const getJobTypeStyle = (jobType: string) => {
        const type = jobType?.toLowerCase();
        if (type?.includes('internship')) return 'bg-blue-50 text-brand border-blue-200';
        if (type?.includes('part') && type?.includes('time')) return 'bg-green-100 text-green-800 border-green-200';
        if (type?.includes('full') && type?.includes('time')) return 'bg-blue-100 text-brand border-blue-200';
        if (type?.includes('contract')) return 'bg-orange-100 text-orange-800 border-orange-200';
        if (type?.includes('freelance')) return 'bg-green-50 text-green-800 border-green-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className='p-3 md:p-4 border border-gray-200 rounded-xl   hover:bg-brand/3 hover:border-brand/30 transition-all duration-300 bg-white '>
            <div className='flex flex-col md:flex-row justify-between gap-4'>
                {/* Company Logo and Basic Info */}
                <div className='flex gap-4'>
                    <div className='flex-shrink-0'>
                        <div className='p-2 md:p-3 rounded-lg '>
                            <img
                                src={job.company.logo}
                                alt={job.company.name}
                                className="size-14 md:size-18 lg:size-20 object-contain rounded-md p-1 md:p-2"
                            />
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className='flex-grow min-w-0 flex flex-col justify-between'>
                        <div className='mb-2'>
                            <h3 className='text-lg md:text-xl font-bold text-gray-900 line-clamp-1'>
                                {job.title}
                            </h3>
                            <p className='text-sm md:text-base text-gray-600 line-clamp-1'>
                                {job.company.name} • {job.company.industry}
                            </p>
                        </div>

                        {/* Job Type and Location */}
                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getJobTypeStyle(job.jobType)}`}>
                                {job.jobType}
                            </span>
                            <div className='flex items-center gap-1 text-gray-500'>
                                <Icon icon="heroicons:map-pin" className="w-3 h-3 md:w-4 md:h-4" />
                                <span className='text-xs md:text-sm'>{job.company.countryName || job.location}</span>
                            </div>
                            <div className='flex items-center gap-1 text-gray-500'>
                                <Icon icon="radix-icons:calendar" width="15" height="15" />
                                <span className='text-xs md:text-sm'>{job.postedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex items-center px-2 md:px-0'>
                    <p className='text-base md:text-lg font-bold text-gray-900'>${job.salary}                     <span className='hidden md:inline text-sm text-gray-500 ml-1 font-light'>/year</span>
                    </p>
                </div>

                {/* Salary and Actions */}
                <div className='flex flex-col  md:flex-row items-start md:items-center justify-between md:justify-end gap-4 md:gap-6'>


                    <div className='flex items-center justify-between md:justify-start  w-full gap-2'>
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

                        <Link
                            href={`/jobs/${job.id}`}
                            className={`px-4 py-3 md:px-5 md:py-4 text-nowrap  rounded-full text-xs md:text-sm font-medium transition-colors ${job.hasApplied ? 'bg-transparent border text-brand' : 'border border-brand text-brand'}`}
                        >
                            {job.hasApplied ? 'Applied' : 'Apply Now'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}