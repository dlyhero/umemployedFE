export const OverlayContentSkeleton = () => {
  return (
    <div className='bg-white rounded p-6  lg:w-[90%] mx-auto animate-pulse'>
      <div className='flex flex-col lg:flex-row justify-between items-start gap-6'>
        {/* Left Section Skeleton */}
        <div className='flex gap-4 flex-1'>
          {/* Company Logo Skeleton */}
          <div className='flex-shrink-0'>
            <div className='border border-gray-200 bg-gray-100 p-3 rounded-lg'>
              <div className="size-16 md:size-20 lg:size-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* Job Details Skeleton */}
          <div className='flex-1 min-w-0'>
            {/* Job Title Skeleton */}
            <div className='h-8 bg-gray-200 rounded mb-3 w-3/4'></div>
            
            {/* Company Name Skeleton */}
            <div className='h-6 bg-gray-200 rounded mb-2 w-1/2'></div>
            
            {/* Location & Date Skeleton */}
            <div className='flex flex-wrap items-center gap-4 mb-4'>
              <div className='flex items-center gap-1'>
                <div className='w-4 h-4 bg-gray-200 rounded'></div>
                <div className='h-4 bg-gray-200 rounded w-20'></div>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-4 h-4 bg-gray-200 rounded'></div>
                <div className='h-4 bg-gray-200 rounded w-16'></div>
              </div>
            </div>

            {/* Tags Skeleton */}
            <div className='flex gap-2 flex-wrap'>
              <div className='h-6 bg-gray-200 rounded-full w-16'></div>
              <div className='h-6 bg-gray-200 rounded-full w-20'></div>
              <div className='h-6 bg-gray-200 rounded-full w-24'></div>
            </div>
          </div>
        </div>

        {/* Right Section Skeleton */}
        <div className='flex flex-col gap-4 lg:items-end lg:text-right flex-shrink-0'>
          {/* Action Buttons Skeleton */}
          <div className='flex gap-3'>
            <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
            <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
            <div className='h-12 bg-gray-200 rounded-full w-32'></div>
          </div>

          {/* Salary Skeleton */}
          <div className='text-right'>
            <div className='h-6 bg-gray-200 rounded w-24 ml-auto'></div>
          </div>
        </div>
      </div>
    </div>
  );
};