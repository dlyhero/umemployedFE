'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useEditJobStep1, useEditJobStep2, useEditJobStep3, useEditJobStep4 } from '@/hooks/jobs/useCreateJob/useJobsEditSteps';
import EditFormNavigation from './EditFromNavigation';
import Step1 from '@/app/companies/post-job/components/Step1';
import Step2 from '@/app/companies/post-job/components/Step2';
import Step3 from '@/app/companies/post-job/components/Step3';
import Step4 from '@/app/companies/post-job/components/Step4';

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

export type JobFormData = Step1Data & Step2Data & Step3Data & Step4Data;

interface JobData {
    id: number;
    title: string;
    hireNumber: number;
    jobType: string;
    rawJobType: string; // Add raw job type field
    locationType: string;
    location: string;
    salary: string;
    salaryRange: string;
    category: number;
    level: string;
    company: {
        name: string;
        logo: string;
        industry: string;
    };
    postedDate: string;
    description: string;
    requirements: string[];
    benefits: string[];
    details: {
        responsibilities: string;
        experienceLevel: string;
        workSchedule: string;
        shift: string;
    };
}

interface MultiStepJobEditFormProps {
    job?: JobData | null;
    isLoading?: boolean;
}

// LocalStorage keys for edit form
const STORAGE_KEYS = {
    EDIT_FORM_DATA: 'job_edit_form_data',
    EDIT_CURRENT_STEP: 'job_edit_form_current_step',
};

const MultiStepJobEditForm: React.FC<MultiStepJobEditFormProps> = ({ job, isLoading }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<JobFormData>>({});
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    // Transform job data to form format
    const transformJobDataToFormData = (jobData: JobData | null | undefined): Partial<JobFormData> => {
        if (!jobData) return {};

        console.log('Transforming job data to form data:', {
            jobType: jobData.jobType,
            location: jobData.location,
            salary: jobData.salary,
            salaryRange: jobData.salaryRange,
            locationType: jobData.locationType,
            category: jobData.category,
            hireNumber: jobData.hireNumber,
            level: jobData.level,
            requirements: jobData.requirements,
            benefits: jobData.benefits
        });

        return {
            // Step 1 data
            title: jobData.title || '',
            number_of_hires: jobData.hireNumber?.toString() || '1',
            job_type: jobData.rawJobType || '', // Use raw job type for form
            country: jobData.location || '',
            category: jobData.category?.toString() || '1',
            salary_range: jobData.salaryRange || '',
            location_type: jobData.locationType || '',

            // Step 2 data
            job_types: jobData.rawJobType || '', // Use raw job type for form
            experience_levels: jobData.details?.experienceLevel || '',
            weekly_ranges: jobData.details?.workSchedule || '',
            shifts: jobData.details?.shift || '',

            // Step 3 data
            description: jobData.description || '',
            responsibilities: jobData.details?.responsibilities || '',
            benefits: Array.isArray(jobData.benefits) ? jobData.benefits.join('\n') : jobData.benefits || '',

            // Step 4 data - requirements are now ID strings from the transformer
            requirements: jobData.requirements ? jobData.requirements.map(req => parseInt(req)).filter(id => !isNaN(id)) : [],
            level: jobData.level || '',
        };
    };

    // Initialize forms with empty defaults
    const step1Form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            title: '',
            number_of_hires: '1',
            job_type: '',
            country: '',
            category: '1',
            salary_range: '',
            location_type: '',
        }
    });

    const step2Form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            job_types: '',
            experience_levels: '',
            weekly_ranges: '',
            shifts: '',
            additional_requirements: '',
            special_notes: '',
        }
    });

    const step3Form = useForm<Step3Data>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            description: '',
            responsibilities: '',
            benefits: '',
        }
    });

    const step4Form = useForm<Step4Data>({
        resolver: zodResolver(step4Schema),
        defaultValues: {
            requirements: [],
            level: '',
        }
    });

    // Initialize form data when job loads
    useEffect(() => {
        const initializeForm = async () => {
            if (!job || isInitialized) return;

            console.log('Initializing form with job data');
            
            try {
                // Load saved data from localStorage
                const savedStep = localStorage.getItem(STORAGE_KEYS.EDIT_CURRENT_STEP);
                const savedFormData = localStorage.getItem(STORAGE_KEYS.EDIT_FORM_DATA);

                // Transform job data
                const jobFormData = transformJobDataToFormData(job);
                console.log('Job form data:', jobFormData);

                // Merge with saved data
                const initialFormData = savedFormData 
                    ? { ...jobFormData, ...JSON.parse(savedFormData) } 
                    : jobFormData;

                console.log('Final form data to populate:', initialFormData);
                console.log('Step 1 specific data:', {
                    title: initialFormData.title,
                    number_of_hires: initialFormData.number_of_hires,
                    job_type: initialFormData.job_type,
                    country: initialFormData.country,
                    category: initialFormData.category,
                    salary_range: initialFormData.salary_range,
                    location_type: initialFormData.location_type
                });

                // Reset forms with the actual data - THIS IS THE KEY FIX
                step1Form.reset(initialFormData as Step1Data);
                step2Form.reset(initialFormData as Step2Data);
                step3Form.reset(initialFormData as Step3Data);
                step4Form.reset(initialFormData as Step4Data);

                setFormData(initialFormData);
                setCurrentStep(savedStep ? parseInt(savedStep) : 1);
                setIsInitialized(true);

                // Verify the forms were populated correctly
                setTimeout(() => {
                    console.log('Step 1 form values after reset:', step1Form.getValues());
                    console.log('Step 1 form errors:', step1Form.formState.errors);
                }, 100);

            } catch (error) {
                console.error('Error initializing form:', error);
            }
        };

        initializeForm();
    }, [job, isInitialized]);

    // Update form data when job changes
    useEffect(() => {
        if (job && isInitialized) {
            const newFormData = transformJobDataToFormData(job);
            setFormData(prev => ({ ...prev, ...newFormData }));
            
            // Update forms with new data
            step1Form.reset(prev => ({ ...prev, ...newFormData as Step1Data }));
            step2Form.reset(prev => ({ ...prev, ...newFormData as Step2Data }));
            step3Form.reset(prev => ({ ...prev, ...newFormData as Step3Data }));
            step4Form.reset(prev => ({ ...prev, ...newFormData as Step4Data }));
        }
    }, [job, isInitialized]);

    // Save to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && isInitialized) {
            localStorage.setItem(STORAGE_KEYS.EDIT_CURRENT_STEP, currentStep.toString());
            localStorage.setItem(STORAGE_KEYS.EDIT_FORM_DATA, JSON.stringify(formData));
        }
    }, [currentStep, formData, isInitialized]);

    const clearSavedState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.EDIT_CURRENT_STEP);
            localStorage.removeItem(STORAGE_KEYS.EDIT_FORM_DATA);
        }
    };

    // API hooks
    const editStep1Mutation = useEditJobStep1();
    const editStep2Mutation = useEditJobStep2();
    const editStep3Mutation = useEditJobStep3();
    const editStep4Mutation = useEditJobStep4();

    const steps = [
        { number: 1, title: 'Basic Information', api: editStep1Mutation },
        { number: 2, title: 'Job Details', api: editStep2Mutation },
        { number: 3, title: 'Description & Benefits', api: editStep3Mutation },
        { number: 4, title: 'Skills & Requirements', api: editStep4Mutation },
    ];

    const updateFormData = (data: Partial<JobFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = async () => {
        console.log('=== handleNext called for editing ===');
        console.log('Current step:', currentStep);
        console.log('Job ID:', job?.id);

        setDirection('next');

        try {
            let isValid = false;
            let stepData: any = {};

            switch (currentStep) {
                case 1:
                    console.log('Step 1 form values before validation:', step1Form.getValues());
                    isValid = await step1Form.trigger();
                    stepData = step1Form.getValues();
                    break;
                case 2:
                    console.log('Step 2 form values before validation:', step2Form.getValues());
                    isValid = await step2Form.trigger();
                    stepData = step2Form.getValues();
                    break;
                case 3:
                    console.log('Step 3 form values before validation:', step3Form.getValues());
                    isValid = await step3Form.trigger();
                    stepData = step3Form.getValues();
                    break;
                case 4:
                    console.log('Step 4 form values before validation:', step4Form.getValues());
                    isValid = await step4Form.trigger();
                    stepData = step4Form.getValues();
                    break;
                default:
                    isValid = true;
            }

            if (!isValid) {
                console.log('Validation failed');
                toast.error('Please fill out all required fields');
                return;
            }

            console.log('Updating form data with:', stepData);
            updateFormData(stepData);

            if (!job?.id) {
                toast.error('Job ID is required for editing');
                return;
            }

            // Handle step-specific API calls
            if (currentStep === 1) {
                const apiData = {
                    title: stepData.title,
                    hire_number: parseInt(stepData.number_of_hires) || 1,
                    job_location_type: stepData.location_type,
                    job_type: stepData.job_type, // Fixed: was stepData.jobType
                    location: stepData.country,
                    salary_range: stepData.salary_range, // Fixed: was stepData.salary
                    category: parseInt(stepData.category) || 1,
                };
                console.log('Step 1 API payload:', apiData);

                editStep1Mutation.mutate({ jobId: job.id.toString(), data: apiData }, {
                    onSuccess: () => setCurrentStep(2),
                    onError: () => toast.error('Failed to update job basic details'),
                });
            } else if (currentStep === 2) {
                const apiData = {
                    job_type: stepData.job_types || '',
                    experience_levels: stepData.experience_levels || '',
                    weekly_ranges: stepData.weekly_ranges || '',
                    shifts: stepData.shifts || '',
                };
                editStep2Mutation.mutate({ jobId: job.id.toString(), data: apiData }, {
                    onSuccess: () => setCurrentStep(3),
                    onError: () => toast.error('Failed to update job preferences'),
                });
            } else if (currentStep === 3) {
                const apiData = {
                    description: stepData.description || '',
                    responsibilities: stepData.responsibilities || '',
                    benefits: stepData.benefits || '',
                };
                editStep3Mutation.mutate({ jobId: job.id.toString(), data: apiData }, {
                    onSuccess: () => setCurrentStep(4),
                    onError: () => toast.error('Failed to update job description and benefits'),
                });
            } else if (currentStep === 4) {
                const apiData = {
                    requirements: stepData.requirements || [],
                    level: stepData.level || '',
                };
                editStep4Mutation.mutate({ jobId: job.id.toString(), data: apiData }, {
                    onSuccess: () => {
                        toast.success('Job updated successfully!');
                        clearSavedState();
                    },
                    onError: () => toast.error('Failed to update job requirements'),
                });
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

    const getCurrentMutation = () => steps[currentStep - 1]?.api;
    
    const getStepContent = () => {
        if (isLoading || !isInitialized) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading job details...</p>
                    </div>
                </div>
            );
        }

        const commonProps = {
            formData: formData as JobFormData,
            updateFormData: updateFormData,
        };

        const createdJob = {
            id: job?.id || 0,
            title: job?.title || '',
            status: 'editing',
        };

        const stepProps = {
            step1: { ...commonProps, form: step1Form },
            step2: { ...commonProps, form: step2Form, createdJob },
            step3: { ...commonProps, form: step3Form, createdJob },
            step4: { 
                ...commonProps, 
                form: step4Form, 
                createdJob,
                step3Response: { job, extracted_skills: job?.requirements || [] }
            },
        };

        return (
            <div className={`transition-all duration-500 ease-in-out ${direction === 'next' ? 'slide-in-next' : 'slide-in-prev'}`}>
                {currentStep === 1 && <Step1 {...stepProps.step1} />}
                {currentStep === 2 && <Step2 {...stepProps.step2} />}
                {currentStep === 3 && <Step3 {...stepProps.step3} />}
                {currentStep === 4 && <Step4 {...stepProps.step4} />}
            </div>
        );
    };

    const currentMutation = getCurrentMutation();

    useEffect(() => {
        if (editStep4Mutation.isSuccess) {
            const timer = setTimeout(clearSavedState, 2000);
            return () => clearTimeout(timer);
        }
    }, [editStep4Mutation.isSuccess]);

    if (!job && !isLoading && isInitialized) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No job data available</p>
            </div>
        );
    }

    return (
        <div className="relative">
   
            {/* Form Content */}
            <div className="min-h-[400px]">
                {getStepContent()}
            </div>

            {/* Navigation */}
            <EditFormNavigation
                currentStep={currentStep}
                totalSteps={steps.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLoading={currentMutation?.isPending || false}
                isSuccess={editStep4Mutation.isSuccess}
                createdJob={{
                    id: job?.id || 0,
                    title: job?.title || '',
                    status: 'editing'
                }}
                isEditMode={true}
            />
        </div>
    );
};

export default MultiStepJobEditForm;