"use client"

import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useAccountTypeUpdate } from '@/hooks/useAccountTypeUpdate'

interface UpdateAccountTypeRequest {
    account_type: 'recruiter' | 'job_seeker'
}

interface UserProfile {
    id: number
    email: string
    username: string
    is_recruiter: boolean
    is_applicant: boolean
    has_resume: boolean
    has_company: boolean
}

export default function AccountType() {
    const [selectedType, setSelectedType] = useState<string>('')
    const { data: session, status } = useSession()
    const router = useRouter()
    const { updateAccountType, isUpdating } = useAccountTypeUpdate()
    const [isRedirecting, setIsRedirecting] = useState(false)

    // Redirect users who already have a role
    useEffect(() => {
        if (status === 'loading') return;
        
        console.log('Onboarding page - session:', session);
        console.log('Onboarding page - user role:', session?.user?.role);
        console.log('Onboarding page - hasCompany:', session?.user?.hasCompany);
        console.log('Onboarding page - hasResume:', session?.user?.hasResume);
        
        // Only redirect if user has a valid role (not null/undefined)
        if (session?.user?.role && session.user.role !== null) {
            console.log('User already has role:', session.user.role);
            setIsRedirecting(true);
            
            // Redirect based on role and status
            if (session.user.role === 'recruiter') {
                if (session.user.hasCompany) {
                    console.log('Redirecting recruiter with company to dashboard');
                    router.push('/companies/dashboard');
                } else {
                    console.log('Redirecting recruiter without company to create company');
                    router.push('/companies/create');
                }
            } else if (session.user.role === 'job_seeker') {
                if (session.user.hasResume) {
                    console.log('Redirecting job seeker with resume to dashboard');
                    router.push('/applicant/dashboard');
                } else {
                    console.log('Redirecting job seeker without resume to upload resume');
                    router.push('/applicant/upload-resume');
                }
            }
        }
    }, [session, status, router]);

    const accountTypes = [
        {
            id: 'job_seeker',
            title: 'Job Seeker',
            description: 'Looking for work opportunities and career growth',
            icon: 'streamline-freehand:job-search-magnifier-briefcase',
            benefits: [
                'Apply to thousands of jobs',
                'Get matched with top employers',
                'Track your applications',
                'Build your professional profile'
            ]
        },
        {
            id: 'recruiter',
            title: 'Recruiter',
            description: 'Hiring talent and posting job opportunities',
            icon: 'streamline-freehand-color:job-choose-candidate',
            benefits: [
                'Post unlimited job listings',
                'Access top talent pool',
                'Manage candidates easily',
                'Company profile visibility'
            ]
        }
    ]

    const handleTypeSelection = (typeId: string) => {
        setSelectedType(typeId)
    }

    const handleContinue = async () => {
        if (!selectedType) {
            toast.error('Please select an account type')
            return
        }

        const success = await updateAccountType(selectedType as 'recruiter' | 'job_seeker')
        
        if (success) {
            // Redirect based on role
            if (selectedType === 'recruiter') {
                router.push('/companies/create')
            } else {
                router.push('/applicant/upload-resume')
            }
        }
    }

    const isLoading = isUpdating

    if(!session){
        router.push('/')
    }

    // Show loading screen while redirecting
    if (isRedirecting || status === 'loading') {
        return (
            <div className='min-h-[calc(100vh-6.5rem)] flex items-center justify-center p-4 md:p-8'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <h2 className='text-xl font-semibold text-gray-800 mb-2'>Redirecting...</h2>
                    <p className='text-gray-600'>Taking you to your dashboard</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-[calc(100vh-6.5rem)] flex items-start justify-center p-4 md:p-8'>
            <div className='max-w-6xl w-full p-4 md:p-8'>
                <div className='text-center mb-8'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2'>
                        Choose Your Career Path
                    </h1>
                    <p className='text-gray-600 max-w-lg mx-auto'>
                        Select the account type that matches your goals. This helps us personalize your experience.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                    {accountTypes.map((type) => (
                        <label
                            key={type.id}
                            className={`border rounded p-6 cursor-pointer transition-all block ${
                                selectedType === type.id
                                    ? 'border-brand bg-brand/5'
                                    : 'border-gray-300  hover:border-brand hover:bg-brand/5'
                            } ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
                        >
                            <div className='flex flex-col h-full'>
                                <div className='flex justify-between items-start mb-4'>
                                    <div className={`p-3 rounded-full ${selectedType === type.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                        <Icon
                                            icon={type.icon}
                                            width="46"
                                            height="46"
                                            className={selectedType === type.id ? 'text-brand' : 'text-gray-600'}
                                        />
                                    </div>
                                    <input
                                        type='radio'
                                        name='accountType'
                                        value={type.id}
                                        checked={selectedType === type.id}
                                        onChange={() => handleTypeSelection(type.id)}
                                        disabled={isLoading}
                                        className='w-5 h-5 text-brand bg-gray-100 border-gray-300 mt-1'
                                    />
                                </div>

                                <div className='flex-1'>
                                    <h3 className='font-semibold text-gray-800 text-xl md:text-2xl mb-3'>
                                        {type.title}
                                    </h3>
                                    <p className='text-gray-600 mb-4'>
                                        {type.description}
                                    </p>
                                    
                                    <div className='mt-4 space-y-2 border-t pt-3 border-gray-300'>
                                        <h4 className='font-medium text-gray-700'>What you'll get:</h4>
                                        <ul className='space-y-2 text-gray-600'>
                                            {type.benefits.map((benefit, index) => (
                                                <li key={index} className='flex items-start gap-2'>
                                                    <Icon icon="mingcute:check-2-line" width="24" height="24" className='mt-0.5 flex-shrink-0' />
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {isLoading && selectedType === type.id && (
                                    <div className='mt-4 flex justify-end'>
                                        <Icon
                                            icon="eos-icons:loading"
                                            width="20"
                                            height="20"
                                            className='text-brand animate-spin'
                                        />
                                    </div>
                                )}
                            </div>
                        </label>
                    ))}
                </div>

                {selectedType && (
                    <div className='mb-6 flex justify-center'>
                        <button
                            onClick={handleContinue}
                            disabled={isLoading}
                            className='bg-brand text-white py-3 px-8 md:px-12 rounded-full w-full md:w-fit font-semibold hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70'
                        >
                            {isLoading ? (
                                <>
                                    Processing...
                                    <Icon icon="eos-icons:loading" width="20" height="20" className='animate-spin' />
                                </>
                            ) : (
                                'Continue to Dashboard'
                            )}
                        </button>
                    </div>
                )}

                <div className='text-center text-sm text-gray-500 mt-8'>
                    <p>You cannot change your account type later in settings if needed.</p>
                </div>
            </div>
        </div>
    )
}