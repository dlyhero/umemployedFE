'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import FormNavigation from './FormNavigaton';
import { useCreateJobStep1, useUpdateJobStep2, useUpdateJobStep3, useUpdateJobStep4 } from '@/hooks/jobs/useCreateJob/useJobsSteps';

// Validation schemas for each step
const step1Schema = z.object({
    title: z.string().min(1, 'Job title is required'),
    number_of_hires: z.string().min(1, 'Number of hires is required'),
    job_type: z.string().min(1, 'Job type is required'),
    country: z.string().min(1, 'Country is required'),
    category: z.string().min(1, 'Category is required'),
    salary_range: z.string().min(1, 'Salary range is required'),
    location_type: z.string().min(1, 'Location type is required'),
});

const step2Schema = z.object({
    job_types: z.string().min(1, 'Job type is required'),
    experience_levels: z.string().min(1, 'Experience level is required'),
    weekly_ranges: z.string().min(1, 'Weekly range is required'),
    shifts: z.string().min(1, 'Shift is required'),
    additional_requirements: z.string().optional(),
    special_notes: z.string().optional(),
});

const step3Schema = z.object({
    description: z.string().min(1, 'Job description is required'),
    responsibilities: z.string().min(1, 'Responsibilities are required'),
    benefits: z.string().min(1, 'Benefits information is required'),
});

const step4Schema = z.object({
    requirements: z.array(z.number()).min(1, 'At least one skill is required').max(5, 'Maximum 5 skills allowed'),
    level: z.string().min(1, 'Experience level is required'),
});

type Step4Data = z.infer<typeof step4Schema>;
type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export type JobFormData = Step1Data & Step2Data & Step3Data & Step4Data & {
    // Add fields for step 4 when its schema is defined
};

interface CreatedJob {
    id: number;
    title: string;
    status: string;
}

interface Step3Response {
    job: any;
    extracted_skills: string[];
}

// LocalStorage keys
const STORAGE_KEYS = {
    FORM_DATA: 'job_form_data',
    CURRENT_STEP: 'job_form_current_step',
    CREATED_JOB: 'job_form_created_job',
    STEP3_RESPONSE: 'job_form_step3_response'
};

const MultiStepJobForm: React.FC = () => {
    // Load initial state from localStorage
    const getInitialState = () => {
        if (typeof window === 'undefined') {
            return {
                currentStep: 1,
                formData: {},
                createdJob: null,
                step3Response: null
            };
        }

        try {
            const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
            const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
            const savedCreatedJob = localStorage.getItem(STORAGE_KEYS.CREATED_JOB);
            const savedStep3Response = localStorage.getItem(STORAGE_KEYS.STEP3_RESPONSE);

            return {
                currentStep: savedStep ? parseInt(savedStep) : 1,
                formData: savedFormData ? JSON.parse(savedFormData) : {},
                createdJob: savedCreatedJob ? JSON.parse(savedCreatedJob) : null,
                step3Response: savedStep3Response ? JSON.parse(savedStep3Response) : null
            };
        } catch (error) {
            console.error('Error loading saved form state:', error);
            return {
                currentStep: 1,
                formData: {},
                createdJob: null,
                step3Response: null
            };
        }
    };

    const initialState = getInitialState();
    const [currentStep, setCurrentStep] = useState(initialState.currentStep);
    const [formData, setFormData] = useState<Partial<JobFormData>>(initialState.formData);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [createdJob, setCreatedJob] = useState<CreatedJob | null>(initialState.createdJob);
    const [step3Response, setStep3Response] = useState<Step3Response | null>(initialState.step3Response);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
            localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
            localStorage.setItem(STORAGE_KEYS.CREATED_JOB, JSON.stringify(createdJob));
            localStorage.setItem(STORAGE_KEYS.STEP3_RESPONSE, JSON.stringify(step3Response));
        }
    }, [currentStep, formData, createdJob, step3Response]);

    // Clear localStorage when form is successfully completed
    const clearSavedState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
            localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
            localStorage.removeItem(STORAGE_KEYS.CREATED_JOB);
            localStorage.removeItem(STORAGE_KEYS.STEP3_RESPONSE);
        }
    };

    // API hooks for each step
    const step1Mutation = useCreateJobStep1();
    const step2Mutation = useUpdateJobStep2();
    const step3Mutation = useUpdateJobStep3();
    const step4Mutation = useUpdateJobStep4();

    const steps = [
        { number: 1, title: 'Basic Information', api: step1Mutation },
        { number: 2, title: 'Job Details', api: step2Mutation },
        { number: 3, title: 'Description & Benefits', api: step3Mutation },
        { number: 4, title: 'Skills & Requirements', api: step4Mutation },
    ];

    // Form handlers for each step
    const step1Form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: formData as Step1Data,
    });

    const step2Form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: formData as Step2Data,
    });

    const step3Form = useForm<Step3Data>({
        resolver: zodResolver(step3Schema),
        defaultValues: formData as Step3Data,
    });

    const step4Form = useForm<Step4Data>({
        resolver: zodResolver(step4Schema),
        defaultValues: formData as Step4Data,
    });

    const updateFormData = (data: Partial<JobFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = async () => {
        console.log('=== handleNext called ===');
        console.log('Current step:', currentStep);

        setDirection('next');

        try {
            let isValid = false;
            let stepData: any = {};

            // Validate current step
            switch (currentStep) {
                case 1:
                    console.log('Validating step 1...');
                    isValid = await step1Form.trigger();
                    stepData = step1Form.getValues();
                    console.log('Step 1 validation result:', isValid);
                    break;
                case 2:
                    console.log('Validating step 2...');
                    isValid = await step2Form.trigger();
                    stepData = step2Form.getValues();
                    console.log('Step 2 validation result:', isValid);
                    console.log('Step 2 form data:', stepData);
                    console.log('Step 2 form errors:', step2Form.formState.errors);
                    break;
                case 3:
                    console.log('Validating step 3...');
                    isValid = await step3Form.trigger();
                    stepData = step3Form.getValues();
                    console.log('Step 3 validation result:', isValid);
                    console.log('Step 3 form data:', stepData);
                    console.log('Step 3 form errors:', step3Form.formState.errors);
                    break;
                case 4:
                    isValid = true;
                    stepData = step4Form.getValues();
                    break;
                default:
                    isValid = true;
            }

            if (!isValid) {
                console.log('Validation failed, stopping here');
                toast.error('Please fill out all required fields');
                return;
            }

            // Update form data
            console.log('Updating form data with:', stepData);
            updateFormData(stepData);

            // Handle step-specific API calls
            if (currentStep === 1) {
                console.log('Creating job with step 1 data...');
                const requiredFields = ['title', 'category', 'salary_range', 'job_type', 'location_type', 'number_of_hires', 'country'];
                const missingFields = requiredFields.filter(field => !stepData[field]);

                if (missingFields.length > 0) {
                    console.error('Missing required fields:', missingFields);
                    toast.error(`Missing required fields: ${missingFields.join(', ')}`);
                    return;
                }

                const apiData = {
                    title: stepData.title,
                    hire_number: parseInt(stepData.number_of_hires),
                    job_location_type: stepData.location_type,
                    job_type: stepData.job_type,
                    location: stepData.country,
                    salary_range: stepData.salary_range,
                    category: parseInt(stepData.category),
                };
                console.log('Final API payload:', JSON.stringify(apiData, null, 2));

                step1Mutation.mutate(apiData, {
                    onSuccess: (data) => {
                        console.log('Step 1 API success:', data);
                        const newCreatedJob = {
                            id: data.id,
                            title: data.title,
                            status: data.status,
                        };
                        setCreatedJob(newCreatedJob);
                        setCurrentStep(2);
                    },
                    onError: (error) => {
                        console.error('Step 1 API error:', error);
                        toast.error('Failed to create job');
                    },
                });
            } else if (currentStep === 2 && createdJob) {
                console.log('Updating job with step 2 data...');
                const apiData = {
                    jobId: createdJob.id.toString(),
                    data: {
                        job_type: stepData.job_types || '',
                        experience_levels: stepData.experience_levels || '',
                        weekly_ranges: stepData.weekly_ranges || '',
                        shifts: stepData.shifts || '',
                    },
                };
                console.log('Step 2 API payload:', apiData);

                step2Mutation.mutate(apiData, {
                    onSuccess: (data) => {
                        console.log('Step 2 API success:', data);
                        setCurrentStep(3);
                    },
                    onError: (error) => {
                        console.error('Step 2 API error:', error);
                        toast.error('Failed to update job details');
                    },
                });
            } else if (currentStep === 3 && createdJob) {
                console.log('Updating job with step 3 data...');
                const apiData = {
                    jobId: createdJob.id.toString(),
                    data: {
                        description: stepData.description || '',
                        responsibilities: stepData.responsibilities || '',
                        benefits: stepData.benefits || '',
                    },
                };
                console.log('Step 3 API payload:', apiData);

                step3Mutation.mutate(apiData, {
                    onSuccess: (data) => {
                        console.log('Step 3 API success:', data);
                        // Store the step 3 response with extracted skills
                        // setStep3Response(data);
                        setCurrentStep(4);
                    },
                    onError: (error) => {
                        console.error('Step 3 API error:', error);
                        toast.error('Failed to update job description and benefits');
                    },
                });
            }
            else if (currentStep === 4 && createdJob) {
                console.log('Updating job with step 4 data...');
                const apiData = {
                    jobId: createdJob.id.toString(),
                    data: {
                        requirements: stepData.requirements || [],
                        level: stepData.level || '',
                    },
                };
                console.log('Step 4 API payload:', apiData);

                step4Mutation.mutate(apiData, {
                    onSuccess: (data) => {
                        console.log('Step 4 API success:', data);
                        // Show success message with redirect info
                        toast.success('Job submitted successfully! Redirecting to dashboard...', {
                            duration: 3000,
                        });
                        
                        // Clear saved state
                        clearSavedState();
                        
                        // Redirect to dashboard after a short delay
                        setTimeout(() => {
                            window.location.href = '/companies/dashboard';
                        }, 2000);
                    },
                    onError: (error) => {
                        console.error('Step 4 API error:', error);
                        toast.error('Failed to complete job posting. Please try again.');
                    },
                });
            }
            else {
                // For other steps, just proceed to next step
                setCurrentStep(prev => Math.min(prev + 1, steps.length));
            }
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('An unexpected error occurred');
        }
    };

    const handlePrevious = () => {
        setDirection('prev');
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const getCurrentMutation = () => {
        return steps[currentStep - 1]?.api;
    };
    
    const getStepContent = () => {
        const commonProps = {
            formData: formData as JobFormData,
            updateFormData: updateFormData,
        };

        const stepProps = {
            step1: {
                ...commonProps,
                form: step1Form,
            },
            step2: {
                ...commonProps,
                form: step2Form,
                createdJob: createdJob,
            },
            step3: {
                ...commonProps,
                form: step3Form,
                createdJob: createdJob,
            },
            step4: {
                ...commonProps,
                form: step4Form,
                createdJob: createdJob,
                step3Response: step3Response, // Pass step3Response to Step4
            },
        };

        return (
            <div className={`transition-all duration-500 ease-in-out ${direction === 'next' ? 'slide-in-next' : 'slide-in-prev'
                }`}>
                {currentStep === 1 && <Step1 {...stepProps.step1} />}
                {currentStep === 2 && <Step2 {...stepProps.step2} />}
                {currentStep === 3 && <Step3 {...stepProps.step3} />}
                {currentStep === 4 && <Step4 {...stepProps.step4} />}
            </div>
        );
    };

    const currentMutation = getCurrentMutation();

    // Clear saved state when form is successfully completed
    useEffect(() => {
        if (currentStep === 4 && step4Mutation.isSuccess) {
            // Optional: Add a delay before clearing to ensure user sees success message
            const timer = setTimeout(() => {
                clearSavedState();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [currentStep, step4Mutation.isSuccess]);

    return (
        <div className="relative">
            {/* Job Creation Status Message */}
            {currentStep === 4 && step4Mutation.isPending && (
                <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">Creating Your Job</h3>
                            <p className="text-blue-700 mt-1">
                                Your job is being processed and this may take up to 3 minutes. 
                                You will be redirected to your dashboard once complete.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="min-h-[400px]">
                {getStepContent()}
            </div>

            {/* Navigation */}
            <FormNavigation
                currentStep={currentStep}
                totalSteps={steps.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLoading={currentMutation?.status === 'pending'}
                isSuccess={currentStep === 4 && step4Mutation.isSuccess}
                createdJob={createdJob}
            />
        </div>
    );
};

export default MultiStepJobForm;