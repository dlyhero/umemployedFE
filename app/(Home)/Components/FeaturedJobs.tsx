"use client"
import React, { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import JobCard from '@/components/jobs/JobCard'
import useJobs from '@/hooks/jobs/useJobs'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function FeaturedJobs() {
  const { data, isLoading, error } = useJobs()
  const jobs = data?.allJobs || []
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fixed categories as per design
  const jobCategories = useMemo(() => {
    return [
      { id: 'all', label: 'All Categories' },
      { id: 'full-time', label: 'Full time' },
      { id: 'part-time', label: 'Part time' },
      { id: 'freelance', label: 'Freelance' }
    ];
  }, []);

  // Handle category selection with special case for "All Categories"
  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'all') {
      // Scroll to the SearchByCategories section to show all available categories
      const categoriesSection = document.getElementById('all-categories-section');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setSelectedCategory(categoryId);
    }
  }

  // Filter jobs based on selected category
  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'all') {
      return jobs
    }
    
    // Map category IDs to job type values
    const categoryMapping: { [key: string]: string[] } = {
      'full-time': ['Full time', 'Full-time', 'Full Time', 'FULL_TIME'],
      'part-time': ['Part time', 'Part-time', 'Part Time', 'PART_TIME'],
      'freelance': ['Freelance', 'Contract', 'Contractor', 'FREELANCE']
    };
    
    const jobTypes = categoryMapping[selectedCategory] || [];
    
    return jobs.filter((job: any) => {
      const jobType = String(job.jobType || job.category || job.department || '').toLowerCase();
      return jobTypes.some(type => jobType.includes(type.toLowerCase()));
    });
  }, [jobs, selectedCategory])

  // Function to chunk jobs into groups for multi-row display
  const chunkJobs = (jobs: any[], chunkSize: number) => {
    const chunks = []
    for (let i = 0; i < jobs.length; i += chunkSize) {
      chunks.push(jobs.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Create chunks for different screen sizes
  const desktopChunks = chunkJobs(filteredJobs.slice(0, 12), 6) // 6 jobs per slide (2 rows of 3)
  const tabletChunks = chunkJobs(filteredJobs.slice(0, 8), 4)   // 4 jobs per slide (2 rows of 2)
  const mobileChunks = chunkJobs(filteredJobs.slice(0, 6), 2)   // 2 jobs per slide (2 rows of 1)

  // Custom arrow components
  const NextArrow = (props: any) => {
    const { onClick } = props
    return (
      <button
        onClick={onClick}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10 hidden sm:block"
        aria-label="Next"
      >
        <Icon icon="raphael:arrowright2" width="24" height="24" />
      </button>
    )
  }

  const PrevArrow = (props: any) => {
    const { onClick } = props
    return (
      <button
        onClick={onClick}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10 hidden sm:block"
        aria-label="Previous"
      >
        <Icon icon="raphael:arrowleft2" width="24" height="24" />
      </button>
    )
  }

  // Slider settings for chunked content
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Always show 1 slide (which contains multiple jobs in a grid)
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false
        }
      }
    ]
  }

  // if (isLoading) {
  //   return (
  //     <div className="h-[40vh] flex justify-center items-center w-full">
  //       <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" />
  //     </div>
  //   )
  // }

  if (error) {
    return <div className="text-center py-12">Error loading jobs</div>
  }

  return (
    <div className="py-8 md:py-14 ">
      <div className="container py-12 mx-auto bg-brand/7 rounded-xl">
        <div className="md:w-[90%] mx-auto px-4">
          {/* Header content */}
          <div className='flex flex-col md:flex-row items-center md:items-start md:justify-between'>
            <div className='text-start'>
              <h2 className='text-[27px] md:text-[40px] font-bold dm-serif tracking-wide'>Featured opportunities</h2>
              <h3 className='text-gray-600 text-lg md:text-xl my-2 max-w-2xl'>
                Find the best jobs tailored to your skills and preferences.
              </h3>
            </div>
            {/* Category Tabs */}
            <div className="mt-8 mb-6">
              <div className="flex flex-wrap gap-2 md:gap-4 justify-start">
                {jobCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-4 py-2 rounded-full text-sm md:text-lg font-medium transition-colors duration-200 ${selectedCategory === category.id
                      ? 'bg-brand text-white'
                      : 'text-gray-700'
                      }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>



          <div className="mt-14 relative">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                {selectedCategory === 'all'
                  ? 'No featured jobs available'
                  : `No jobs found in ${jobCategories.find(c => c.id === selectedCategory)?.label} category`
                }
              </div>
            ) : (
              <div className="slider-container">
                {/* Desktop Carousel - 2 rows of 3 */}
                <div className="hidden lg:block">
                  <Slider {...settings}>
                    {desktopChunks.map((chunk, index) => (
                      <div key={index} className="outline-none">
                        <div className="grid grid-cols-2 gap-6">
                          {chunk.map((job) => (
                            <JobCard key={job.id} job={job} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>

                {/* Tablet Carousel - 2 rows of 2 */}
                <div className="hidden md:block lg:hidden">
                  <Slider {...settings}>
                    {tabletChunks.map((chunk, index) => (
                      <div key={index} className="outline-none">
                        <div className="grid grid-cols-2 gap-6">
                          {chunk.map((job) => (
                            <JobCard key={job.id} job={job} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>

                {/* Mobile Carousel - 2 rows of 1 */}
                <div className="block md:hidden">
                  <Slider {...settings}>
                    {mobileChunks.map((chunk, index) => (
                      <div key={index} className="outline-none">
                        <div className="grid grid-cols-1 gap-6">
                          {chunk.map((job) => (
                            <JobCard key={job.id} job={job} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Custom dot styling */
        .slick-dots {
          bottom: -40px !important;
        }
        .slick-dots li button:before {
          color: #d1d5db !important;
          opacity: 1 !important;
          font-size: 10px !important;
        }
        .slick-dots li.slick-active button:before {
          color: #3b82f6 !important;
        }
        
        /* Remove outline on focus */
        .slick-slide:focus {
          outline: none;
        }
        
        /* Ensure proper spacing */
        .slick-slide {
          padding: 0 !important;
        }
        
        /* Mobile-specific adjustments */
        @media (max-width: 640px) {
          .slick-dots {
            bottom: -30px !important;
          }
        }
      `}</style>
    </div>
  )
}