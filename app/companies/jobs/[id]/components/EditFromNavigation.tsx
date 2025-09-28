'use client';

import React from 'react';

interface CreatedJob {
  id: number;
  title: string;
  status: string;
}

interface EditFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  createdJob?: CreatedJob | null;
  isEditMode?: boolean;
}

const EditFormNavigation: React.FC<EditFormNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isLoading = false,
  isSuccess = false,
  createdJob,
  isEditMode = false
}) => {
  const getButtonText = () => {
    if (currentStep === totalSteps) {
      if (isSuccess) {
        return (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {isEditMode ? 'Job Updated!' : 'Job Completed!'}
          </>
        );
      }
      if (isLoading) {
        return (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isEditMode ? 'Updating...' : 'Finalizing...'}
          </>
        );
      }
      return isEditMode ? 'Update Job' : 'Complete Job';
    }

    if (isLoading) {
      return (
        <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {isEditMode ? 'Saving Changes...' : (currentStep === 1 ? 'Creating Job...' : 'Saving...')}
        </>
      );
    }

    return isEditMode ? 
      (currentStep === 1 ? 'Save & Continue' : 'Next') : 
      (currentStep === 1 ? 'Create & Continue' : 'Next');
  };

  const getButtonStyle = () => {
    if (currentStep === totalSteps) {
      return "px-6 py-2.5 text-white bg-brand3 rounded-full hover:bg-brand/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
    }
    return "px-6 py-2.5 text-white bg-brand rounded-full hover:bg-brand2 focus:outline-none focus:ring-2 focus:ring-brand3 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  };

  const getStatusText = () => {
    if (isEditMode) {
      return createdJob?.status === 'editing' ? 'Editing' : 'Published';
    }
    return createdJob?.status || '';
  };

  return (
    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
      <div>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="px-6 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-full
              hover:bg-gray-50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50
              disabled:cursor-not-allowed"
          >
            Previous
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Show job info if available */}
        {createdJob && (
          <div className="text-sm text-gray-600 hidden md:block">
            <span className="font-medium">
              {isEditMode ? `Editing Job #${createdJob.id}` : `Job #${createdJob.id}`}
            </span>
            <span className="mx-2">•</span>
            <span className={`${
              isEditMode ? 'text-brand' : 'text-green-600'
            }`}>
              {getStatusText()}
            </span>
          </div>
        )}

        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={isLoading || isSuccess}
          className={getButtonStyle()}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default EditFormNavigation;