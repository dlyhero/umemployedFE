
export const MainContentSkeleton = () => {
  return (
    <div className="w-[90%] lg:w-[85%] mx-auto px-4 animate-pulse">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2">
          {/* Job Description Skeleton */}
          <div className='border-b pb-6 mb-6'>
            <div className='h-7 bg-gray-200 rounded mb-4 w-48'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-gray-200 rounded w-full'></div>
              <div className='h-4 bg-gray-200 rounded w-11/12'></div>
              <div className='h-4 bg-gray-200 rounded w-4/5'></div>
            </div>
          </div>

          {/* Responsibilities Skeleton */}
          <div className='border-b pb-6 mb-6'>
            <div className='h-6 bg-gray-200 rounded mb-4 w-40'></div>
            <div className='space-y-2'>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className='flex items-start gap-2'>
                  <div className='w-2 h-2 bg-gray-200 rounded-full mt-2 flex-shrink-0'></div>
                  <div className='h-4 bg-gray-200 rounded flex-1'></div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Skeleton */}
          <div className='border-b pb-6 mb-6'>
            <div className='h-6 bg-gray-200 rounded mb-4 w-36'></div>
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className='flex items-start gap-2'>
                  <div className='w-2 h-2 bg-gray-200 rounded-full mt-2 flex-shrink-0'></div>
                  <div className='h-4 bg-gray-200 rounded flex-1'></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-1">
          <div className='bg-gray-50 p-6 rounded border-l border-gray-200'>
            <div className='h-6 bg-gray-200 rounded mb-6 w-32'></div>

            <div className='space-y-5'>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className='flex items-start gap-3 border-b p-2'>
                  <div className='w-5 h-5 bg-gray-200 rounded mt-1'></div>
                  <div className='flex-1'>
                    <div className='h-4 bg-gray-200 rounded mb-1 w-16'></div>
                    <div className='h-5 bg-gray-200 rounded w-24'></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits Skeleton */}
            <div className='mt-8'>
              <div className='h-6 bg-gray-200 rounded mb-4 w-20'></div>
              <div className='space-y-2'>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className='flex items-start gap-2'>
                    <div className='w-5 h-5 bg-gray-200 rounded mt-0.5'></div>
                    <div className='h-4 bg-gray-200 rounded flex-1'></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
