// components/Header/Sidemenu.tsx
"use client"

import { useEffect } from 'react'
import Logo from '@/app/(Home)/Components/Logo'
import NavItems from './NavItems'
import { Icon } from '@iconify/react'
import AuthButton from './AuthButton'
import { useLockBodyScroll } from '@/hooks/lockScroll'

interface SidemenuProps {
  onClose: () => void
}

const Sidemenu = ({ onClose }: SidemenuProps) => {
  // Lock body scroll when menu is open
  useLockBodyScroll()

  // Close menu when clicking on a link
  const handleLinkClick = () => {
    onClose()
  }

  return (
    <div className="h-full bg-white shadow-xl w-80 relative">
      <div className="w-[80vw] h-screen px-4">
        <div className="mb-20 pt-8">
          <Logo />
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Icon icon="heroicons-outline:x" className="size-5 text-gray-800" />
        </button>
        
        <div className='flex flex-col gap-6' onClick={handleLinkClick}>
          <NavItems mobile />
          <AuthButton mobile />
        </div>
      </div>
    </div>
  )
}

export default Sidemenu