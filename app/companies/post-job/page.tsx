'use client';

import React, { useState } from 'react';
import MultiStepJobForm from './components/Multiform';

export default function CreateJobPage() {
  return (
    <div className="p-2 md:p-6 mx-auto rounded-lg min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-wider">Create a Job</h1>
      <p className="text-gray-600 mb-10">Complete the form below to create a new Job for your company.</p>

      <div className='bg-white md:p-10 p-4 rounded-lg '>
        <MultiStepJobForm />
      </div>
    </div>
  );
}