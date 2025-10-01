"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import InterviewRoom from '@/components/InterviewRoom';

export default function InterviewJoinPage() {
  const params = useParams();
  const interviewId = parseInt(params.id as string);

  if (isNaN(interviewId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Interview ID</h1>
          <p className="text-gray-600">The interview ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return <InterviewRoom interviewId={interviewId} />;
}