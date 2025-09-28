"use client"
import React from 'react'
import { useUserProfile } from '@/hooks/profile/useUserProfile'
import RecommendedJobs from '../components/RecommendedJobs'
import { useRouter } from 'next/navigation'
import Stats from '@/components/Dashboard/Stats'

export default function page() {
  const router = useRouter()
  const {data:profile} = useUserProfile()
 
  return (
    <div className='min-h-screen overflow-auto  border-none min-[1220px]:border'>
      <div className="lg:p-14 min-[1220px]:p-14">
        <h1 className='text-4xl px-4 mt-4 md:mt-0'>Dashboard</h1>
        <div className="my-2 px-4 text-gray-900/90">{profile?.first_name} {profile?.last_name}!</div>
        <div>
          <Stats/>
          <RecommendedJobs />
        </div>
      </div>
    </div>
  )
}
