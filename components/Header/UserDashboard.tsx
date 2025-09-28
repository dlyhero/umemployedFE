import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement'

const UserDashboard: React.FC = () => {
  const { data: session, status } = useSession()
  const { data: subscriptionStatus } = useSubscriptionStatus()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Determine dashboard route based on user role
  const getDashboardRoute = (): string => {
    if (!session?.user?.role) return '/login'
    
    return session.user.role === 'recruiter' 
      ? '/companies/dashboard' 
      : '/applicant/dashboard'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    setShowDropdown(false)
    await signOut({ callbackUrl: '/' })
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <Icon icon="svg-spinners:90-ring-with-bg" width="24" height="24" className="text-brand" />
      </div>
    )
  }

  // Not authenticated - show login link
  if (!session) {
    return (
      <Link 
        href="/login"
        className="block transition-transform duration-200 hover:scale-105"
      >
        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500">
          <Icon 
            icon="mdi:account-circle" 
            width="32" 
            height="32" 
            className="text-white"
          />
        </div>
      </Link>
    )
  }

  // Authenticated user - show dropdown menu
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-12 h-12 bg-brand rounded-full flex items-center justify-center  hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        <Icon 
          icon="mdi:account-circle" 
          width="32" 
          height="32" 
          className="text-white"
        />
      </button>

      {/* Dropdown Modal */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-gray-200 py-2 z-50"
        >
          {/* User Info Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user?.name || session.user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {session.user?.role?.replace('_', ' ') || 'User'}
            </p>
            {/* Subscription Status */}
            {subscriptionStatus?.has_active_subscription && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <Icon icon="mdi:crown" width="12" height="12" className="mr-1" />
                  {subscriptionStatus.tier ? subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1) : 'Premium'}
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
             <Link
              href={`/`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="vaadin:home-o" width="18" height="18" />
              Home
            </Link>
            <Link
              href={getDashboardRoute()}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="material-symbols:dashboard-outline" width="18" height="18" />
              Dashboard
            </Link>

            <Link
              href={`${session.user.role === 'recruiter' ? '/companies/profile' : '/applicant/profile'}`}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:account-outline" width="18" height="18" />
              Profile
            </Link>

            <Link
              href="/account-settings"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:cog-outline" width="18" height="18" />
              Account Settings
            </Link>

            <Link
              href="/pricing"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:currency-usd" width="18" height="18" />
              Pricing Plans
            </Link>

            <Link
              href="/transactions"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:history" width="18" height="18" />
              Transaction History
            </Link>

            <Link
              href="/billing"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:credit-card-outline" width="18" height="18" />
              Billing & Subscription
            </Link>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 w-full text-left"
            >
              <Icon icon="mdi:logout" width="18" height="18" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard