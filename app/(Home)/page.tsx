"use client"
import React, { useEffect } from 'react'
import HeroSection from './Components/Hero'
import HowItWorks from './Components/HowItWorks'
import FeaturedJObs from './Components/FeaturedJobs'
import SearchByCategories from './Components/Categories'
import TopEmployers from './Components/FeaturedCompanies'
import Banner from './Components/Slider'
import BlogSection from './Components/blogPost'
import QuestionsAndAnswers from './Components/Question&Answers'

export default function page() {
  // Set page title
  useEffect(() => {
    document.title = 'UmEmployed - Find Your Dream Job'
  }, [])

  return (
    <div className='relative overflow-hidden'>
      <HeroSection />
      <SearchByCategories />
      <FeaturedJObs/>
      <HowItWorks />
      <QuestionsAndAnswers />
      <TopEmployers />
      <Banner />
      <BlogSection />

      {/* <Testimonials /> */}
    </div>
  )
}
