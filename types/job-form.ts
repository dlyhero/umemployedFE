import { z } from 'zod';

// Base schemas
export const step1Schema = z.object({
    title: z.string().min(1, 'Job title is required'),
    number_of_hires: z.string().min(1, 'Number of hires is required'),
    job_type: z.string().min(1, 'Job type is required'),
    country: z.string().min(1, 'Country is required'),
    category: z.string().min(1, 'Category is required'),
    salary_range: z.string().min(1, 'Salary range is required'),
    location_type: z.string().min(1, 'Location type is required'),
});

export const step2Schema = z.object({
    job_types: z.string().min(1, 'Job type is required'),
    experience_levels: z.string().min(1, 'Experience level is required'),
    weekly_ranges: z.string().min(1, 'Weekly range is required'),
    shifts: z.string().min(1, 'Shift is required'),
    additional_requirements: z.string().optional(),
    special_notes: z.string().optional(),
});

export const step3Schema = z.object({
    description: z.string().min(1, 'Job description is required'),
    responsibilities: z.string().min(1, 'Responsibilities are required'),
    benefits: z.string().min(1, 'Benefits information is required'),
});

export const step4Schema = z.object({
    requirements: z.array(z.string()).min(1, 'At least one skill is required').max(5, 'Maximum 5 skills allowed'),
    level: z.string().min(1, 'Experience level is required'),
});

// Infer types
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;

// Combined type
export type JobFormData = Step1Data & Step2Data & Step3Data & Step4Data;