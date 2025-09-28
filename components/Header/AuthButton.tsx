
// components/Header/AuthButton.tsx (updated)
"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"

interface AuthButtonProps {
  mobile?: boolean
  isWhite?: boolean
  onMobileItemClick?: () => void
}

export default function AuthButton({ mobile, isWhite, onMobileItemClick }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/', redirect: true })
  }

  if (mobile) {
    return (
      <div className="space-y-3">
        {authenticated ? (
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full"
          >
            Logout
          </Button>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              onClick={onMobileItemClick}

              className={`block px-6 py-3 rounded-full text-brand border border-brand font-bold text-center hover:bg-brand/5 transition-colors `}
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={onMobileItemClick}

              className="block px-6 py-3 rounded-full text-white font-bold bg-brand hover:bg-brand/90 text-center transition-colors"
            >
              Join Now
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Desktop version
  if (authenticated) {
    return null // User dropdown handles authenticated state on desktop
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"

        className={`px-6 lg:px-10 py-2 lg:py-3 rounded-full font-bold transition-colors text-sm lg:text-base text-brand`}
      >
        Login
      </Link>
      <Link
        href='/signup'
        className='px-6 lg:px-10 py-2 lg:py-3 rounded-full text-white/90 font-bold bg-brand hover:bg-brand2 transition-colors text-sm lg:text-base whitespace-nowrap'
      >
        Join Now
      </Link>
    </div>
  )
}