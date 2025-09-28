'use client';

import React from 'react';
import MultiStepJobEditForm from './components/EditMultiForm';
import { useParams } from 'next/navigation';
import { useJobDetail } from '@/hooks/jobs/useJobDetails';

export default function EditJobPage() {
    const params = useParams();
    const jobId = params.id as string; 


    const { data: job, isLoading} = useJobDetail(jobId);
    console.log(job);

 


  

    return (
        <div className="p-2 md:p-6 mx-auto rounded-lg ">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-wider">Edit Job</h1>
            <p className="text-gray-600 mb-10">Edit the job details below.</p>

            <div className='bg-white md:p-10 p-4 rounded-lg '>
                <MultiStepJobEditForm
                    job={job}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}