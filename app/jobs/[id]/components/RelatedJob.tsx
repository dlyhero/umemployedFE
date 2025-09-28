import JobCard from '@/components/jobs/JobCard';
import { useRelatedJobs } from '@/hooks/jobs/useRelatedJob';
import React, { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react'; // Add this import

type RelatedJobProps = {
  jobId: string | number;
};

export default function RelatedJob({ jobId }: RelatedJobProps) {
  const { data: relatedJobs } = useRelatedJobs(Number(jobId));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollCarousel = (direction: 'next' | 'prev'): void => {
    if (!carouselRef.current || !relatedJobs?.length) return;

    const firstChild = carouselRef.current.children[0] as HTMLElement;
    const cardWidth = firstChild?.offsetWidth || 0;
    const gap = 16;
    const scrollAmount = cardWidth + gap;
    const itemsPerView = isDesktop ? 2 : 1;
    const maxIndex = Math.max(0, relatedJobs.length - itemsPerView);

    if (direction === 'next') {
      if (currentIndex < maxIndex) {
        const newIndex = Math.min(currentIndex + itemsPerView, maxIndex);
        setCurrentIndex(newIndex);
        carouselRef.current.scrollTo({
          left: newIndex * scrollAmount,
          behavior: 'smooth'
        });
      }
    } else {
      if (currentIndex > 0) {
        const newIndex = Math.max(currentIndex - itemsPerView, 0);
        setCurrentIndex(newIndex);
        carouselRef.current.scrollTo({
          left: newIndex * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  // Calculate carousel controls state
  const itemsPerView = isDesktop ? 2 : 1;
  const maxIndex = relatedJobs ? Math.max(0, relatedJobs.length - itemsPerView) : 0;
  const canGoNext = relatedJobs && currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;
  const totalDots = relatedJobs ? Math.ceil(relatedJobs.length / itemsPerView) : 0;
  const currentDot = Math.floor(currentIndex / itemsPerView);

  return (
    <div className='container mx-auto my-10'>
      <div className='w-[90%] lg:w-[85%] px-4 mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-xl md:text-3xl font-bold text-gray-800'>Related Jobs</h1>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => scrollCarousel('prev')}
              disabled={!canGoPrev}
              className={`p-2 rounded-full border transition-colors ${
                !canGoPrev
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Previous jobs"
            >
              <Icon icon="material-symbols:chevron-left" className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel('next')}
              disabled={!canGoNext}
              className={`p-2 rounded-full border transition-colors ${
                !canGoNext
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Next jobs"
            >
              <Icon icon="material-symbols:chevron-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className='relative overflow-hidden'>
          <div
            ref={carouselRef}
            className='flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {relatedJobs?.map(job => (
              <div key={job.id} className='flex-shrink-0 w-full lg:w-[calc(50%-8px)]'>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {relatedJobs && relatedJobs.length > 1 && (
          <div className='flex justify-center mt-4 gap-2 px-4'>
            {Array.from({ length: totalDots }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const newIndex = index * itemsPerView;
                  setCurrentIndex(newIndex);
                  if (carouselRef.current) {
                    const firstChild = carouselRef.current.children[0] as HTMLElement;
                    const cardWidth = firstChild?.offsetWidth || 0;
                    const scrollAmount = (cardWidth + 16) * newIndex;
                    carouselRef.current.scrollTo({
                      left: scrollAmount,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentDot ? 'bg-brand' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}