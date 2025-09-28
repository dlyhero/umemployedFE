"use client"
import { Icon } from '@iconify/react'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'

interface GlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
    // Set page title
    React.useEffect(() => {
        document.title = 'Something Went Wrong | UmEmployed'
    }, [])

    return (
    <html>
      <body>
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
            icon="solar:bug-bold-duotone" 
            className='w-24 h-24 md:w-32 md:h-32 text-red-500 mx-auto' 
          />
        </div>

            {/* Error Message */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-bold text-red-500/20 mb-4">
                Oops!
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                We&apos;re sorry, but something unexpected happened on our end. 
                Our engineers have been notified and are working to fix this issue.
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
                  <Link href="/" className="flex items-center justify-center gap-2">
                    <Icon icon="solar:home-bold" className="w-4 h-4" />
                    Go to Homepage
                  </Link>
                </Button>
              </div>

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
            </div>

            {/* Support Information */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 mb-4">
                Still having trouble? Our support team is here to help.
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
                  href="/pricing" 
                  className="text-brand hover:text-brand/80 hover:underline"
                >
                  View Pricing
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
      </body>
    </html>
  )
}