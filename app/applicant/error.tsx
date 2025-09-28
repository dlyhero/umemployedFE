"use client"
import { Icon } from '@iconify/react'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'

interface ApplicantErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ApplicantErrorPage({ error, reset }: ApplicantErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/logo/png/logo-color.png" 
              alt="UmEmployed Logo" 
              className="h-16 w-auto"
            />
          </div>
          <Icon 
            icon="solar:user-bold-duotone" 
            className='w-24 h-24 md:w-32 md:h-32 text-red-500 mx-auto' 
          />
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-7xl font-bold text-red-500/20 mb-4">
            Oops!
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Job Seeker Dashboard Error
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            We&apos;re experiencing technical difficulties with your job seeker dashboard. 
            Our team is working to resolve this issue as quickly as possible.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={reset}
              className="bg-brand hover:bg-brand/90 text-white"
            >
              <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Link href="/applicant/dashboard" className="flex items-center justify-center gap-2">
                <Icon icon="solar:chart-line-duotone" className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <Link href="/jobs" className="flex items-center justify-center gap-2">
                <Icon icon="solar:briefcase-bold" className="w-4 h-4" />
                Browse Jobs
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <Link href="/applicant/profile" className="flex items-center justify-center gap-2">
                <Icon icon="solar:user-bold" className="w-4 h-4" />
                My Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Support Information */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 mb-4">
            Need immediate assistance? Contact our support team.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a 
              href="mailto:support@umemployed.com" 
              className="text-brand hover:text-brand/80 hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:letter-unread-bold" className="w-4 h-4" />
              Email Support
            </a>
            <span className="text-gray-300">•</span>
            <a 
              href="tel:+1-800-UMEMPLOYED" 
              className="text-brand hover:text-brand/80 hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:phone-bold" className="w-4 h-4" />
              Call Support
            </a>
            <span className="text-gray-300">•</span>
            <Link 
              href="/applicant/upload-resume" 
              className="text-brand hover:text-brand/80 hover:underline"
            >
              Upload Resume
            </Link>
          </div>
        </div>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Error Details (Development Only):</h4>
            <pre className="text-xs text-gray-600 overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}