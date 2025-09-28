"use client";
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { useCompanyJobs } from '@/hooks/companies/useApplication';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ApplicantCard from './components/ApplicantCard';


export default function Page() {

    const { data: session } = useSession();
    const router = useRouter();
    const { data: jobs = [], isLoading, isError, error } = useCompanyJobs(session?.user?.companyId as string);
    // State for filter modal and filter values
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nameFilter, setNameFilter] = useState('');
    const [applicationFilter, setApplicationFilter] = useState<number | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 8; // Number of jobs per page
    // Filter and paginate jobs
    const filteredJobs = jobs.filter((job) => {
        const matchesName = job.title.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesApplication =
            applicationFilter === '' || job.application_count === Number(applicationFilter);
        return matchesName && matchesApplication;
    });
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [nameFilter, applicationFilter]);
    // Handle modal toggle
    const toggleModal = () => setIsModalOpen(!isModalOpen);
    // Handle filter clear
    const clearFilters = () => {
        setNameFilter('');
        setApplicationFilter('');
        toggleModal();
    };

    // Skeleton Loader Component
    const SkeletonCard = () => (
        <div className="animate-pulse bg-white rounded-lg  p-6 border border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-4/5 mb-4"></div>
            <div className="flex items-center gap-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="lg:p-14 min-[1220px]:p-14 mb-10">
                <h1 className="text-2xl md:text-4xl px-4 mt-4 md:mt-0 mb-10">My Jobs</h1>
                <div className="px-4 mb-6">
                    <button
                        disabled
                        className="flex border gap-2 items-center text-gray-800 px-4 py-2 rounded-lg opacity-50"
                    >
                        Filter
                        <Icon icon="meteor-icons:filter" className="size-5" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: jobsPerPage }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) return <div>Error: {error?.message}</div>;

    return (
        <div className="lg:p-14 min-[1220px]:p-14 mb-10">
            <div className="flex items-center justify-between px-4 mt-4 md:mt-0 mb-10">
                <h1 className="text-4xl">My Jobs</h1>
                <button
                    onClick={() => router.push('/companies/applications')}
                    className="bg-brand3 hover:bg-brand/90 text-white rounded-full p-2 flex gap-2 items-center"
                >
                    <Icon icon="solar:users-group-two-rounded-line-duotone" className="w-4 h-4 mr-2" />
                    View Applications
                </button>
            </div>
            <div className="px-4 mb-6">
                <button
                    onClick={toggleModal}
                    className="flex border gap-2 items-center text-gray-800 px-4 py-2 rounded-lg hover:bg-brand-dark"
                >
                    Filter
                    <Icon icon="meteor-icons:filter" className="size-5" />
                </button>
            </div>
            {/* Filter Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg pb-6 w-96">
                        <div className="flex justify-between items-center border-b p-2">
                            <div className="text-sm md:text-[26px] font-semibold">Filter By</div>
                            <Icon onClick={toggleModal} icon="iconoir:cancel" className="size-7" />
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block md:text-[16.8px] font-medium text-gray-700">
                                        Search by Name
                                    </label>
                                    <div className="mt-1 relative rounded-md border">
                                        <input
                                            type="text"
                                            value={nameFilter}
                                            onChange={(e) => setNameFilter(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 p-2 pl-3 pr-10"
                                            placeholder="Search by Name"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block md:text-[16.8px] font-medium text-gray-700">
                                        Applicant Count
                                    </label>
                                    <input
                                        type="number"
                                        value={applicationFilter}
                                        onChange={(e) =>
                                            setApplicationFilter(
                                                e.target.value === '' ? '' : Number(e.target.value)
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300  border p-2"
                                        placeholder="Enter applicant count"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={toggleModal}
                                    className="bg-brand font-medium text-white px-6 py-2 rounded-full hover:bg-brand2"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentJobs.map((job) => (
                    <ApplicantCard key={job.id} job={job} />
                ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 px-4 gap-3">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 mx-1 text-sm md:text-[16px] disabled:opacity-50 flex items-center gap-2"
                    >
                        <Icon icon="bitcoin-icons:arrow-left-outline" className="size-4 md:size-7" />
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 md:h-12 md:w-12 mx-1 text-xs md:text-[16px] rounded-full ${currentPage === page ? 'bg-brand text-white' : 'bg-gray-200'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 mx-1 text-sm md:text-[16px] disabled:opacity-50 flex items-center gap-2"
                    >
                        Next
                        <Icon icon="bitcoin-icons:arrow-right-outline" className="size-4 md:size-7" />
                    </button>
                </div>
            )}
        </div>
    );
}