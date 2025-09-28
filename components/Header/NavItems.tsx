// components/Header/NavItems.tsx
"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import GoogleAuth from '@/app/(auth)/components/social-auth/GoogleAuth'
import { useUserProfile } from '@/hooks/profile/useUserProfile'

type NavItemsProps = {
  mobile?: boolean
  isWhite?: boolean
  onMobileItemClick?: () => void
}

const NavItems: React.FC<NavItemsProps> = ({ mobile, isWhite, onMobileItemClick }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { data: profile } = useUserProfile()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<string>('')

  // Check if user is a recruiter
  const isRecruiter = session?.user?.role === 'recruiter' || profile?.is_recruiter

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getTextColorClass = (isActiveLink: boolean): string => {
    if (mobile) {
      return isActiveLink ? 'text-brand' : 'text-gray-800 hover:text-brand'
    }
    
    if (isWhite) {
      return isActiveLink ? 'text-brand ' : 'text-white/90 hover:text-white'
    }
    
    return isActiveLink ? 'text-brand' : 'text-gray-800 hover:text-brand'
  }

  const handleRestrictedClick = (e: React.MouseEvent, action: string, requiredRole?: 'applicant' | 'recruiter') => {
    e.preventDefault()
    e.stopPropagation()

    if (!profile) {
      setPendingAction(action)
      setShowAuthModal(true)
      return
    }

    if (requiredRole === 'recruiter' && !profile.is_recruiter) {
      setPendingAction(action)
      setShowAuthModal(true)
      return
    }

    if (requiredRole === 'applicant' && !profile.is_applicant) {
      setPendingAction(action)
      setShowAuthModal(true)
      return
    }

    if (action === 'post-job') {
      router.push('/post-job')
    } else if (action === 'enhance-resume') {
      router.push('/enhance-resume')
    } else if (action === 'candidates') {
      router.push('/employer/candidates')
    } else if (action === 'pricing') {
      router.push('/pricing')
    } else if (action === 'transactions') {
      router.push('/recruiter/transactions')
    }

    if (mobile && onMobileItemClick) {
      onMobileItemClick()
    }
  }

  const handleCloseModal = () => {
    setShowAuthModal(false)
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (mobile) {
      e.stopPropagation()
      if (onMobileItemClick) {
        onMobileItemClick()
      }
    }
  }

  return (
    <div>
      <ul className={`min-[950px]:flex items-center gap-15 ${mobile ? 'space-y-6' : ''} text-[17px] `}>
        <li>
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`transition-colors duration-200 ${getTextColorClass(isActive('/'))}`}
          >
            Home
          </Link>
        </li>

        <li className='text-wrap'>
          <Link
            href="/jobs"
            onClick={handleLinkClick}
            className={`transition-colors duration-200 ${getTextColorClass(isActive('/jobs'))}`}
          >
            Find Jobs
          </Link>
        </li>

        <li>
          <Link
            href="/employer/listing"
            onClick={handleLinkClick}
            className={`transition-colors duration-200 ${getTextColorClass(isActive('/companies'))}`}
          >
            Companies
          </Link>
        </li>

        {/* Role-based navigation items */}
        {isRecruiter ? (
          <>
            {/* Candidates (replaces Enhance Resume for recruiters) */}
            <li className='text-wrap'>
              <Link
                href="/employer/candidates"
                onClick={handleLinkClick}
                className={`transition-colors duration-200 ${getTextColorClass(isActive('/employer/candidates'))}`}
              >
                Candidates
              </Link>
            </li>

            {/* Post a Job (replaces Upload Resume for recruiters) */}
        

            {/* Pricing */}
            <li className='text-wrap'>
              <Link
                href="/pricing"
                onClick={handleLinkClick}
                className={`transition-colors duration-200 ${getTextColorClass(isActive('/pricing'))}`}
              >
                Pricing
              </Link>
            </li>

            {/* Transactions */}
            <li className='text-wrap'>
              <Link
                href="/recruiter/transactions"
                onClick={handleLinkClick}
                className={`transition-colors duration-200 ${getTextColorClass(isActive('/recruiter/transactions'))}`}
              >
                Transactions
              </Link>
            </li>
          </>
        ) : (
          <>
            {/* Enhance Resume (for applicants) */}
            <li className='text-wrap'>
              {profile?.is_applicant ? (
                <Link
                  href="/applicant/jobs/shortlisted/enhance-resume"
                  onClick={handleLinkClick}
                  className={`transition-colors duration-200 ${getTextColorClass(isActive('/applicant/jobs/shortlisted/enhance-resume'))}`}
                >
                  Enhance Resume
                </Link>
              ) : (
                <Link
                  href={`/applicant/jobs/shortlisted/enhance-resume`}
                  onClick={(e) => {
                    handleLinkClick(e)
                    handleRestrictedClick(e, 'enhance-resume', 'applicant')
                  }}
                  className={`transition-colors duration-200 ${getTextColorClass(isActive('/applicant/jobs/shortlisted/enhance-resume'))}`}
                >
                  Enhance Resume
                </Link>
              )}
            </li>

            {/* Post a Job (for non-recruiters, shows auth modal) */}
            <li className='text-wrap'>
              {!profile?.is_recruiter &&
                <button
                  onClick={(e) => {
                    handleLinkClick(e)
                    handleRestrictedClick(e, 'post-job', 'recruiter')
                  }}
                  className={`transition-colors duration-200 text-left ${
                    mobile ? 'text-gray-800 hover:text-brand' : 
                    isWhite ? 'text-white/90 hover:text-white' : 'text-gray-800 hover:text-brand'
                  }`}
                >
                  Post a Job
                </button>
}
            </li>
          </>
        )}
      </ul>

      {/* Authentication Required Modal */}
      <Dialog open={showAuthModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-2xl md:max-w-xl py-10 md:py-20 mx-auto max-w-[95vw] text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
              <Icon icon="lucide:lock" width="28" height="28" className="text-brand" />
              Authentication Required
            </DialogTitle>
            <DialogDescription className="pt-2 text-[16.5px] md:text-lg text-center">
              {!profile ? (
                "You need to be signed in to access this feature."
              ) : pendingAction === 'post-job' ? (
                "Only recruiters can post jobs. Please contact us if you need to switch your account type."
              ) : pendingAction === 'enhance-resume' ? (
                "Only job seekers can enhance resumes. Please contact us if you need to switch your account type."
              ) : pendingAction === 'candidates' ? (
                "Only recruiters can access candidate listings. Please contact us if you need to switch your account type."
              ) : pendingAction === 'pricing' ? (
                "Only recruiters can access pricing information. Please contact us if you need to switch your account type."
              ) : pendingAction === 'transactions' ? (
                "Only recruiters can access transaction history. Please contact us if you need to switch your account type."
              ) : (
                "You don't have permission to access this feature."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            {!session ? (
              <div className="space-y-3">
                <p className="text-[16px] text-gray-600 mb-4">
                  {pendingAction === 'post-job' || pendingAction === 'candidates' || pendingAction === 'pricing' || pendingAction === 'transactions'
                    ? "Join as a recruiter to post job opportunities and find the best candidates."
                    : "Join as a job seeker to enhance your resume and boost your career prospects."
                  }
                </p>

                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => router.push('/signup')}
                    className="w-full text-white rounded-full p-6 bg-brand hover:bg-brand/90"
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full p-6 border text-brand border-brand rounded-full"
                    variant="outline"
                  >
                    Log In
                  </Button>
                </div>
                <div className='flex gap-3 items-center my-6'>
                  <hr className='flex-1' />
                  or
                  <hr className='flex-1' />
                </div>
                <GoogleAuth />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Your current account type doesn't have access to this feature.
                  Contact our support team if you need to change your account type.
                </p>
                <Button
                  onClick={handleCloseModal}
                  className="w-full rounded-full p-3"
                  variant="outline"
                >
                  Got it
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NavItems