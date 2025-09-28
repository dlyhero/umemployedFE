"use client"
import React, { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useWorkExperiences } from '@/hooks/profile/workExperiences';
import ProfileAvatar from './ProdfileAvater';
import { useEducations } from '@/hooks/profile/useEducation';
import { useSkills } from '@/hooks/profile/useSkills';
import { useSession } from 'next-auth/react';
import { useLanguages } from '@/hooks/profile/useLanguages';
import { useContactInfo } from '@/hooks/profile/useContactInfo';
import { useAbout } from '@/hooks/profile/useAbout';
import { useResumeDetails } from '@/hooks/profile/useResumeDetails';
import { useCountries } from '@/hooks/profile/useCountries';

const proficiencyMap = {
    beginner: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    native: 'Native'
};

export default function ProfileSection() {
    const [showAll, setShowAll] = useState(false);

    // Destructure loading states from all hooks
    const { experiences, isLoading: isLoadingExperiences } = useWorkExperiences();
    const { languages, isLoading: isLoadingLanguages } = useLanguages();
    const { educations, isLoading: isLoadingEducations } = useEducations();
    const { contactInfo, isLoading: isLoadingContactInfo } = useContactInfo();
    const { skills, isLoading: isLoadingSkills } = useSkills();
    const { aboutData, isLoading: isLoadingAbout } = useAbout();
    const { resumeDetails, isLoading: isLoadingResume } = useResumeDetails();

    const { countries } = useCountries()

    // Get country name from country code
    const countryName = useMemo(() => {
        if (!contactInfo?.country || !countries) return null

        const country = countries.find(c => c.code === contactInfo.country)
        return country?.name || null
    }, [contactInfo?.country, countries])

    // Combined loading state
    const isLoading = isLoadingExperiences || isLoadingLanguages ||
        isLoadingEducations || isLoadingContactInfo ||
        isLoadingSkills || isLoadingAbout || isLoadingResume;

    const visibleSkills = showAll ? skills : skills?.slice(0, 10);
    const aboutText = aboutData?.description || aboutData?.bio;

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="mx-auto">
                    {/* Loading skeleton for header */}
                    <div className="bg-white rounded-xl p-4 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                <div className="flex flex-wrap gap-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading skeleton for content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* About Section Skeleton */}
                            <div className="bg-white rounded-xl p-6">
                                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Section Skeleton */}
                            <div className="bg-white rounded-xl p-6">
                                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
                                <div className="space-y-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="relative pl-8 pb-6 border-l-2 border-gray-200">
                                            <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-200 rounded-full border-2 border-white animate-pulse"></div>
                                            <div className="space-y-2">
                                                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Skills Section Skeleton */}
                            <div className="bg-white rounded-xl p-6">
                                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen mt-2 md:mt-0">
            <div className="mx-auto">

                {/* Profile Header */}
                <div className="bg-white rounded-xl p-4 mb-3 w-fit">

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mt-4 md:mt-0">
                        {/* Profile Image */}
                        {/* <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-brand to-brand/80 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                {profileData.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                                <Icon icon="heroicons:check-16-solid" className="text-white text-sm" />
                            </div>
                        </div> */}
                        <ProfileAvatar />

                        {/* Basic Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl tracking-wide font-bold text-gray-800 mb-2">
                                {contactInfo?.name || 'Your Name'}
                            </h1>
                            <p className="text-xl text-brand font-semibold mb-3">
                                {contactInfo?.job_title_name || 'Job Title'}
                            </p>

                            <div className="flex flex-wrap gap-4 text-gray-600">
                                {(contactInfo?.city || countryName) && (
                                    <div className="flex items-center gap-2">
                                        <Icon icon="material-symbols:location-on-outline" className="w-5 h-5" />
                                        <span>
                                            {[contactInfo?.city, countryName]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    </div>
                                )}

                                {contactInfo?.email && (
                                    <div className="flex items-center gap-2">
                                        <Icon icon="material-symbols:mail-outline" className="w-5 h-5" />
                                        <span>{contactInfo.email}</span>
                                    </div>
                                )}

                                {contactInfo?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi-light:phone" className="w-5 h-5" />
                                        <span>{contactInfo.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors">
                <Icon icon="material-symbols:edit-outline" className="w-5 h-5 inline mr-2" />
                Edit Profile
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                <Icon icon="material-symbols:download" className="w-5 h-5 inline mr-2" />
                Download CV
              </button>
            </div> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-3">

                        {/* About Section */}
                        <div className="bg-white rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
                            {aboutText ? (
                                <p className="text-gray-700 leading-relaxed">
                                    {aboutText}
                                </p>
                            ) : (
                                <p className="text-gray-600">No about information added yet</p>
                            )}
                        </div>

                        {/* Work Experience Section */}
                        <div className="bg-white rounded-xl border-gray-200 p-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Work Experience
                            </h2>
                            <div className="space-y-6">
                                {experiences?.length === 0 ? (
                                    <p className="text-gray-600">No work experiences added yet</p>
                                ) : (
                                    experiences?.map((exp, index) => (
                                        <div key={exp.id}>
                                            <div className="relative pl-8 pb-6  border-gray-200">
                                                <div className="absolute -left-6 top-0 w-12 h-12 text-brand text-xl flex items-center justify-center rounded-full border border-brand font-bold bg-white">
                                                    {index + 1}
                                                </div>
                                                   {/* Vertical separator: Only render if not the last item */}
                                                {index < experiences.length - 1 && (
                                                    <div className="absolute left-[0rem] top-[3.5rem] w-[0.125rem] h-[calc(100%-3rem)] bg-gray-300"></div>
                                                )}
                                                <div className="mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">{exp.role}</h3>
                                                    <p className="text-brand font-medium">{exp.company_name}</p>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Icon icon="material-symbols:calendar-today-outline" className="w-4 h-4" />
                                                            {exp.start_date} - {exp.end_date || 'Present'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* If you want to add description later when it's available in the API */}
                                                {/* <p className="text-gray-700">{exp.description}</p> */}
                                            </div>
                                      
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="bg-white rounded-xl border-gray-200 p-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Education
                            </h2>
                            <div className="space-y-6">
                                {educations?.length === 0 ? (
                                    <p className="text-gray-600">No education records found</p>
                                ) : (
                                    educations?.map((edu, index) => (
                                        <div key={edu.id} className="relative">
                                            <div className="relative pl-8 pb-6 border-gray-200">
                                                <div className="absolute -left-6 -top-0 w-12 h-12 text-brand text-xl flex items-center justify-center rounded-full border border-brand font-bold bg-white">
                                                    {index + 1}
                                                </div>
                                                {/* Vertical separator: Only render if not the last item */}
                                                {index < educations.length - 1 && (
                                                    <div className="absolute left-[0rem] top-[3.5rem] w-[0.125rem] h-[calc(100%-3rem)] bg-gray-300"></div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                                                    <p className="text-brand font-medium">{edu.institution_name}</p>
                                                    <div className="flex flex-col gap-4 text-sm text-gray-600 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Icon icon="material-symbols:calendar-today-outline" className="w-4 h-4" />
                                                            Graduated: {edu.graduation_year}
                                                        </span>
                                                        {edu.field_of_study && (
                                                            <div className='flex items-center gap-1'>
                                                                <span>•</span>
                                                                <span>{edu.field_of_study}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">

                        <div className="bg-white rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Icon icon="mdi:skills" className="text-brand" />
                                Skills
                            </h2>

                            {skills?.length === 0 ? (
                                <p className="text-gray-600">No skills added yet</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {visibleSkills?.map((skill) => (
                                            <div key={skill.id} className="group bg-brand/10 text-center rounded-full h-fit max-w-[200px] text-nowrap text-ellipsis p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-center items-center gap-3">

                                                    <span className="text-brand truncate text-sm md:text-[16px]">{skill.name}</span>
                                                </div>

                                            </div>
                                        ))}

                                    </div>
                                    {skills?.length > 10 && (
                                        <button
                                            onClick={() => setShowAll(!showAll)}
                                            className="flex items-center gap-1 text-brand hover:text-brand-dark mt-4 text-sm font-medium w-full  justify-center"
                                        >
                                            {showAll ? (
                                                <>
                                                    <Icon icon="mdi:chevron-up" className="text-lg" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:chevron-down" className="text-lg" />
                                                    View More ({skills.length - 10} hidden)
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Languages
                            </h2>

                            {languages?.length === 0 ? (
                                <p className="text-gray-600">No languages added yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {languages?.map((lang) => (
                                        <div key={lang.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm md:text-[16px]">
                                            <span className="text-gray-800 font-medium">
                                                {lang.language.name}
                                            </span>
                                            {lang.proficiency && (
                                                <span className="text-brand text-sm  bg-brand/10 px-3 py-1 rounded-full">
                                                    {proficiencyMap[lang.proficiency] || lang.proficiency}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resume/CV Section */}
                        <div className="bg-white rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Resume/CV
                            </h2>

                            {resumeDetails?.cv ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <Icon icon="material-symbols:picture-as-pdf" className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        {resumeDetails.cv.split('/').pop() || 'My Resume'}
                                    </h3>
                                    <div className="text-sm text-gray-600 mb-4">
                                        <p>Uploaded: {new Date(resumeDetails.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a
                                            href={resumeDetails.cv}
                                            download
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                                        >
                                            <Icon icon="material-symbols:download" className="w-4 h-4 inline mr-2" />
                                            Download
                                        </a>
                                    </div>
                                    <Link
                                        href={`/applicant/upload-resume`}
                                        className="w-full mt-8 px-4 py-2 text-brand hover:bg-brand/5 rounded-lg transition-colors inline-block"
                                    >
                                        <Icon icon="material-symbols:upload" className="w-4 h-4 inline mr-2" />
                                        Update Resume
                                    </Link>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <Icon icon="material-symbols:picture-as-pdf-outline" className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">No Resume Uploaded</h3>
                                    <Link
                                        href={`/applicant/upload-resume`}
                                        className="mt-4 px-4 py-2 bg-brand text-white rounded-full hover:bg-brand-dark transition-colors inline-flex items-center"
                                    >
                                        <Icon icon="material-symbols:upload" className="w-4 h-4 mr-2" />
                                        Upload Resume
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}