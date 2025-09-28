import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import useCategories from '@/hooks/jobs/useCategories'

export default function SearchByCategories() {
    const { data: categoriesData, isLoading, error } = useCategories();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const allCategories = categoriesData?.allCategories || [];
    // Show top 6 categories initially, all when expanded
    const categories = isExpanded ? allCategories : allCategories.slice(0, 6);

    if (isLoading) {
        return (
            <div className='bg-white py-10'>
                <div className='container mx-auto px-4'>
                    <div className='mb-8 md:flex justify-between items-center'>
                        <div>
                            <h2 className='text-[27px] md:text-[40px] font-bold dm-serif text-gray-900'>
                                Search by Categories
                            </h2>
                            <p className='text-gray-600 text-lg md:text-xl mt-4'>
                                Explore thousands of job opportunities across various industries 
                            </p>
                        </div>
                    </div>
                    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className='p-3 md:p-6 rounded-lg border border-gray-200 animate-pulse'>
                                <div className='flex items-center gap-4'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded'></div>
                                    </div>
                                    <div className='flex-1'>
                                        <div className='h-4 bg-gray-200 rounded mb-2'></div>
                                        <div className='h-3 bg-gray-200 rounded w-2/3'></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='bg-white py-10'>
                <div className='container mx-auto px-4'>
                    <div className='mb-8 md:flex justify-between items-center'>
                        <div>
                            <h2 className='text-[27px] md:text-[40px] font-bold dm-serif text-gray-900'>
                                Search by Categories
                            </h2>
                            <p className='text-gray-600 text-lg md:text-xl mt-4'>
                                Unable to load categories at the moment. Please try again later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="all-categories-section" className='bg-white py-10'>
            <div className='container mx-auto px-4'>
                {/* Header */}
                <div className='mb-8 md:flex justify-between items-center'>
                   <div>
                     <h2 className='text-[27px] md:text-[40px] font-bold  dm-serif  text-gray-900'>
                        Search by Categories
                    </h2>
                    <p className='text-gray-600 text-lg md:text-xl mt-4 '>
                        Explore thousands of job opportunities across various industries 
                    </p>
                   </div>
                   {allCategories.length > 6 && (
                       <button 
                           onClick={() => setIsExpanded(!isExpanded)}
                           className='flex items-center gap-2 my-4 font-semibold text-lg hover:text-brand transition-colors duration-300'
                       >
                           {isExpanded ? 'Show Less' : `All Categories (${allCategories.length})`}
                           <ArrowRight className='text-brand' />
                       </button>
                   )}
                </div>

                {/* Categories Grid */}
                <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/jobs?category=${encodeURIComponent(category.name)}`}
                            className='p-3 md:p-6 transform hover:-translate-y-1 rounded-lg border border-gray-200 cursor-pointer transition-all duration-300  group flex items-center gap-4'
                        >
                            {/* Icon - Left Edge */}
                            <div className='flex-shrink-0'>
                                <div className='p-1 md:p-3  group-hover:border-brand/30 transition-colors duration-300'>
                                    <Icon 
                                        icon={category.icon} 
                                        className='size-8 md:size-10 '
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className='flex-1'>
                                {/* Category Name */}
                                <h3 className='text-sm md:text-xl font-bold text-gray-900 mb-1 dm-serif tracking-wider'>
                                    {category.name}
                                </h3>

                                {/* Job Count */}
                                <p className='text-gray-600 text-sm md:text-base'>
                                    {category.jobCount} jobs available
                                </p>
                            </div>

                            {/* Hover Arrow */}
                            <div className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                <Icon 
                                    icon="material-symbols:arrow-forward" 
                                    className='size-5 text-gray-700'
                                />
                            </div>
                        </Link>
                    ))}
                </div>

            
            </div>
        </div>
    )
}