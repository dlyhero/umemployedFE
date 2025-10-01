"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useInterviews } from '@/hooks/interviews/useInterviews';

const InterviewDebug: React.FC = () => {
  const { data: session, status } = useSession();
  const { data: interviews, isLoading, error } = useInterviews('recruiter');

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Session Status:</strong> {status}
        </div>
        <div>
          <strong>Has Session:</strong> {session ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Access Token:</strong> {session?.user?.accessToken ? 'Present' : 'Missing'}
        </div>
        <div>
          <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Error:</strong> {error ? error.message : 'None'}
        </div>
        <div>
          <strong>Interviews Count:</strong> {interviews?.length || 0}
        </div>
      </div>
    </div>
  );
};

export default InterviewDebug;