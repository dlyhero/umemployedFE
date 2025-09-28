"use client"
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Logo from './Logo'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import NavItems from '@/components/Header/NavItems'
import AuthButton from '@/components/Header/AuthButton'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useUserProfile } from '@/hooks/profile/useUserProfile'
import { useSubscriptionStatus } from '@/hooks/useSubscriptionManagement'
import Notifications from '@/app/applicant/components/Notifications'

export default function HomeHeader() {
  const { data: session } = useSession()
  const { data: profile } = useUserProfile()
  const { data: subscriptionStatus } = useSubscriptionStatus()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showFixedUserDropdown, setShowFixedUserDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Separate refs for main and fixed headers
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const fixedUserDropdownRef = useRef<HTMLDivElement>(null)
  const fixedUserButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const isWhiteTextPath = pathname.includes('/')

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight
        const scrollPosition = window.scrollY
        setIsScrolled(scrollPosition > headerHeight)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Improved body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isMenuOpen])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Handle main header dropdown
      if (userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }

      // Handle fixed header dropdown
      if (fixedUserDropdownRef.current &&
        !fixedUserDropdownRef.current.contains(event.target as Node) &&
        fixedUserButtonRef.current &&
        !fixedUserButtonRef.current.contains(event.target as Node)) {
        setShowFixedUserDropdown(false)
      }

      // Close mobile menu when clicking outside
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev)
  }

  const toggleUserDropdown = () => {
    setShowUserDropdown(prev => !prev)
    // Close fixed dropdown if open
    if (showFixedUserDropdown) {
      setShowFixedUserDropdown(false)
    }
  }

  const toggleFixedUserDropdown = () => {
    setShowFixedUserDropdown(prev => !prev)
    // Close main dropdown if open
    if (showUserDropdown) {
      setShowUserDropdown(false)
    }
  }

  const getDashboardRoute = (): string => {
    if (!session?.user?.role) return '/login'
    return session.user.role === 'recruiter'
      ? '/companies/dashboard'
      : '/applicant/dashboard'
  }

  const handleLogout = async () => {
    setShowUserDropdown(false)
    setShowFixedUserDropdown(false)
    await signOut({ callbackUrl: '/' })
  }

  const handleMobileLinkClick = (href: string) => {
    setIsMenuOpen(false)
    router.push(href)
  }

  // User dropdown component to avoid duplication
  const UserDropdown = ({
    isFixed = false,
    show,
    dropdownRef
  }: {
    isFixed?: boolean
    show: boolean
    dropdownRef: React.RefObject<HTMLDivElement | null>
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg  border border-gray-200 py-2 z-100"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || session?.user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {session?.user?.role?.replace('_', ' ') || 'User'}
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

          <div className="py-1">
            <Link
              href={getDashboardRoute()}
              onClick={() => {
                setShowUserDropdown(false)
                setShowFixedUserDropdown(false)
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="material-symbols:dashboard-outline" width="18" height="18" />
              Dashboard
            </Link>

            <Link
              href={`${session?.user.role === 'recruiter' ? '/companies/profile' : '/applicant/profile'}`}
              onClick={() => {
                setShowUserDropdown(false)
                setShowFixedUserDropdown(false)
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:account-outline" width="18" height="18" />
              Profile
            </Link>

            <Link
              href="/account-settings"
              onClick={() => {
                setShowUserDropdown(false)
                setShowFixedUserDropdown(false)
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:cog-outline" width="18" height="18" />
              Account Settings
            </Link>

            <Link
              href="/pricing"
              onClick={() => {
                setShowUserDropdown(false)
                setShowFixedUserDropdown(false)
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:currency-usd" width="18" height="18" />
              Pricing Plans
            </Link>

            <Link
              href="/transactions"
              onClick={() => {
                setShowUserDropdown(false)
                setShowFixedUserDropdown(false)
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors duration-200"
            >
              <Icon icon="mdi:history" width="18" height="18" />
              Transaction History
            </Link>

            <Link
              href="/billing"
              onClick={() => {
                setShowUserDropdown(false)
                setShowFixedUserDropdown(false)
              }}
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
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Common header content component
  const HeaderContent = ({ isFixed = false }: { isFixed?: boolean }) => (
    <div className='h-16 md:h-20 flex items-center max-w-[1800px] mx-auto justify-between px-4 lg:px-6 gap-4 lg:gap-10'>
      <div className="flex-shrink-0">
        <Logo isWhite={isFixed ? false : isWhiteTextPath} />
      </div>

      <div className='hidden min-[950px]:block flex-1'>
        <nav className='flex justify-center'>
          <NavItems isWhite={isFixed ? true : isWhiteTextPath} />
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="mr-8"><Notifications /></div>
        {profile?.is_applicant ? (
          <>
            {session && <Link
              href={'/applicant/upload-resume'}
              className={`hidden lg:flex  rounded-full px-8 py-3.5 text-sm xl:text-[15px] transition-colors whitespace-nowrap ${isFixed
                ? ' text-white bg-brand'
                : isWhiteTextPath
                  ? 'bg-brand text-white hover:bg-white/10'
                  : ' text-gray-800 hover:bg-brand/5'
                }`}
            >
              Upload Resume
            </Link>}
          </>
        ): profile?.is_recruiter && (
          <>
            {session && <Link
              href={'/recruiter/post-job'}
              className={`hidden lg:flex  rounded-full px-8 py-3.5 text-sm xl:text-[15px] transition-colors whitespace-nowrap ${isFixed
                ? ' text-white bg-brand'
                : isWhiteTextPath
                  ? 'bg-brand text-white hover:bg-white/10'
                  : ' text-gray-800 hover:bg-brand/5'
                }`}
            >
              Post a Job
            </Link>}
          </>
        )}

        {session ? (
          <div className="relative">
            <button
              ref={isFixed ? fixedUserButtonRef : userButtonRef}
              onClick={isFixed ? toggleFixedUserDropdown : toggleUserDropdown}
              className="w-10 h-10 md:w-12 md:h-12 bg-brand rounded-full flex items-center justify-center  hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              <Icon
                icon="mdi:account-circle"
                width="24"
                height="24"
                className="text-white md:w-8 md:h-8"
              />
            </button>

            <UserDropdown
              isFixed={isFixed}
              show={isFixed ? showFixedUserDropdown : showUserDropdown}
              dropdownRef={isFixed ? fixedUserDropdownRef : userDropdownRef}
            />
          </div>
        ) : (
          <div className="hidden min-[950px]:block">
            <AuthButton isWhite={isFixed ? false : isWhiteTextPath} />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="min-[950px]:hidden p-2 w-10 h-10"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <Icon
            icon={isMenuOpen ? "heroicons-outline:x" : "hugeicons:menu-02"}
            className={`size-6 ${isFixed
              ? 'text-white'
              : isWhiteTextPath
                ? 'text-white'
                : 'text-gray-800'
              }`}
          />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Main Header */}
      <div
        ref={headerRef}
        className={`relative bg-blue-950`}
      >
        <HeaderContent />
      </div>

      {/* Fixed Header - appears when scrolled */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-40 bg-brand3 backdrop-blur-md"
          >
            <HeaderContent isFixed />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 min-[950px]:hidden"
              onClick={toggleMenu}
            />

            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-white z-50 min-[950px]:hidden "
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <Logo />
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close menu"
                  >
                    <Icon icon="heroicons-outline:x" className="w-5 h-5 text-gray-800" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <NavItems
                    mobile
                    onMobileItemClick={() => setIsMenuOpen(false)}
                  />

                  {profile?.is_applicant && (
                    <Button
                      onClick={() => handleMobileLinkClick('/applicant/upload-resume')}
                      variant="outline"
                      className="w-full mt-4 border-brand text-brand hover:bg-brand/5 px-8 py-3.5 rounded-full"
                    >
                      Upload Resume
                    </Button>
                  )}
                </div>

                <div className="p-4 border-t">
                  <AuthButton
                    mobile
                    onMobileItemClick={() => setIsMenuOpen(false)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}