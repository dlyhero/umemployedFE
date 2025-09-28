"use client"
import React from 'react'
import ProfileSection from './components/ProfileSection'

export default function page() {

  return (
    <div className='px-2 min-[900px]:px-12 lg:py-10 min-[1220px]:p-16 min-h-screen overflow-auto  border-none min-[1220px]:border'>
      <div>
        <ProfileSection />
      </div>
    </div>
  )
}
