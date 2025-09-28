import React from 'react'
import { Icon } from '@iconify/react'

export default function HowItWorks() {
    return (
        <div className='b'>
            <div className=' px-4'>
                <div className='container lg:px-8 mx-auto py-8 md:py-16 border-b md:min-h-[60vh]'>
                    <div className='flex  gap-3'>
                        <h1 className='text-[27px] md:text-[40px] font-semibold text-center'>
                            How it works?
                        </h1>
                    </div>
                    <h3 className='text-lg text-gray-700 my-4'>
                        Streamline your job search or hiring process with our simple 4-step system
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 mt-12'>
                        {/* Step 1 */}
                        <div className=' flex-1 px-2 py-2 md:p-6 rounded-lg text-center h-fit'>
                            <div className='p-4 rounded-full inline-flex'>
                                <Icon icon="mynaui:one" className='text-brand size-8 md:size-12' />
                            </div>
                            <h2 className='text-lg md:text-2xl font-bold text-gray-800  tracking-wide'>Create An Account</h2>
                            <p className='text-gray-600 mt-2 text-sm md:text-lg  line-clamp-3'>
                                Sign up in seconds using your email or social accounts to unlock all features
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className=' flex-1 px-2 py-2 md:p-6 rounded-lg text-center h-fit'>

                            <div className='p-4 rounded-full inline-flex'>
                                <Icon icon="mynaui:two" className='text-brand size-8 md:size-12' />
                            </div>
                            <h2 className='text-lg md:text-2xl font-bold text-gray-800  tracking-wide'>Choose Account Type</h2>
                            <p className='text-gray-600 mt-2 text-sm md:text-lg  line-clamp-3'>
                                Select between Job Seeker or Employer profiles to customize your experience
                            </p>
                        </div>

                        {/* Step 3 */}                    <div className=' flex-1 px-2 py-2 md:p-6 rounded-lg text-center h-fit'>

                            <div className='p-4 rounded-full inline-flex'>
                                <Icon icon="mynaui:three" className='text-brand size-8 md:size-12' />
                            </div>
                            <h2 className='text-lg md:text-2xl font-bold text-gray-800  tracking-wide'>Complete Profile</h2>
                            <p className='text-gray-600 mt-2 text-sm md:text-lg  line-clamp-3'>
                                Add your skills, experience, and preferences to get personalized matches
                            </p>
                        </div>


                        {/* Step 4 */}                
                            {/* <div className=' flex-1 px-2 py-2 md:p-6 rounded-lg text-center h-fit'>

                            <div className='p-4 rounded-full inline-flex'>
                                <Icon icon="mynaui:four" className='text-brand size-8 md:size-12' />
                            </div>
                            <h2 className='text-lg md:text-2xl font-bold text-gray-800  tracking-wide'>Hire or Apply</h2>
                            <p className='text-gray-600 mt-2 text-sm md:text-lg  line-clamp-3'>
                                Employers post jobs or candidates apply with one-click applications
                            </p>
                        </div> */}
                    </div>
                </div>



            </div>
        </div>
    )
}