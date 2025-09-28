"use client"
import { Icon } from '@iconify/react'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    // Set page title
    React.useEffect(() => {
        document.title = 'Page Not Found | UmEmployed'
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-2xl w-full text-center">
        {/* Logo and 404 Icon */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo/png/logo-color.png" 
              alt="UmEmployed Logo" 
              className="h-12 w-auto"
            />
          </div>
          <Icon 
            icon="solar:danger-triangle-bold-duotone" 
            className='w-24 h-24 md:w-32 md:h-32 text-brand mx-auto' 
          />
        </div>

                {/* Error Code */}
                <div className="mb-6">
                    <h1 className="text-8xl md:text-9xl font-bold text-brand/20 mb-4">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. 
                        The page might have been moved, deleted, or doesn&apos;t exist.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            className="bg-brand hover:bg-brand/90 text-white"
                        >
                            <Link href="/" className="flex items-center justify-center gap-2">
                                <Icon icon="solar:home-bold" className="w-4 h-4" />
                                Go to Homepage
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="flex items-center justify-center gap-2"
                        >
                            <Link href="/jobs" className="flex items-center justify-center gap-2">
                                <Icon icon="solar:briefcase-bold" className="w-4 h-4" />
                                Browse Jobs
                            </Link>
                        </Button>
                    </div>

                    <Button
                        asChild
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Link href="/login" className="flex items-center justify-center gap-2">
                            <Icon icon="solar:login-3-bold" className="w-4 h-4" />
                            Sign In
                        </Link>
                    </Button>
                </div>

                {/* Helpful Links */}
                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm text-gray-500 mb-4">Need help? Try these popular pages:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link 
                            href="/companies/create" 
                            className="text-brand hover:text-brand/80 hover:underline"
                        >
                            Create Company
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href="/applicant/upload-resume" 
                            className="text-brand hover:text-brand/80 hover:underline"
                        >
                            Upload Resume
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href="/pricing" 
                            className="text-brand hover:text-brand/80 hover:underline"
                        >
                            Pricing
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            href="/signup" 
                            className="text-brand hover:text-brand/80 hover:underline"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>

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