"use client"
import React from 'react'
import { useUserProfile } from '@/hooks/profile/useUserProfile'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button } from '@/components/ui/button'
import Stats from '@/components/Dashboard/Stats'
import { useCompanyAnalytics } from '@/hooks/companies/useCompanyAnalytics'
import ApplicationTrends from '../analytics/components/ApplicationTrends'
import JobPostingCharts from '../analytics/components/JobPostingCharts'

// Explicitly typed default values
const defaultTrends = {
  monthly_job_posting: [] as { month: string; jobs_posted: number }[],
  weekly_applications: [] as { week: string; applications: number }[],
  job_posting_growth_rate: 0,
  application_growth_rate: 0,
  jobs_this_month: 0,
  jobs_last_month: 0,
  apps_this_month: 0,
  apps_last_month: 0,
};

const defaultJobStats = {
  by_job_type: [] as { job_type: string; count: number }[],
  by_location_type: [] as { job_location_type: string; count: number }[],
  by_experience_level: [] as { experience_levels: string; count: number }[],
  salary_analysis: {} as Record<string, any>, // or more specific type if you know the structure
  popular_job_titles: [] as { title: string; count: number }[], // adjust based on actual structure
  avg_hire_number: 0,
};

export default function Page() {
  const router = useRouter()
  const { data: profile } = useUserProfile()
  const { data: session } = useSession()
  const { data: analytics } = useCompanyAnalytics(session?.user?.companyId as string);

  if (session?.user.hasCompany === false) {
    router.push('/companies/create')
  }

  return (
    <div className='border-none min-[1220px]:border'>
      <div className="lg:p-14 min-[1220px]:p-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className='text-2xl md:text-4xl px-4 mt-4 md:mt-0'>Dashboard</h1>
            <div className="my-2 px-4 text-gray-900/90">{profile?.first_name} {profile?.last_name}!</div>
          </div>
          <div className="px-4">
            <button
              onClick={() => router.push('/companies/update')}
              className="text-brand flex items-center"
            >
              <Icon icon="solar:refresh-line-duotone" className="w-4 h-4 mr-2" />
              Update Company
            </button>
          </div>
        </div>
        <div>
          <Stats />
          <div className="grid grid-cols-1 mt-6 gap-8 mb-4 md:mb-8">
            {/* Application Trends */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit">
              <ApplicationTrends trends={analytics?.trends || defaultTrends} />
            </div>

      
          </div>
        </div>
      </div>
    </div>
  )
}