"use client"
import React from 'react'
import ProfileAvatar from '../profile/components/ProdfileAvater'
import BasicInfo from './components/BasicInfo'
import AboutSection from './components/AboutSection'
import Experiences from './components/Experiences'
import Education from './components/Education' // Remove 'type' if it was there
import Skills from './components/SkillsSection'
import LanguagesSection from './components/LanguagesSection'

export default function page() {
  
  return (
    <div className='rounded-2xl p-2 md:p-8 lg:p-16  min-h-screen '>
      <ProfileAvatar/>
      <BasicInfo />
      <AboutSection />
      <Experiences />
      <Education />
      <Skills/>
      <LanguagesSection />
    </div>
  )
}