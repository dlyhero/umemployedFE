import React from 'react'

export default function AuthFooter() {
  return (
    <footer className="text-[14px] text-gray-600 py-3 text-center mt-4">
      <div className="container mx-auto px-4">
        {/* Copyright on its own line */}
        <div className="mb-2">
          <span>© {new Date().getFullYear()} UmEmployed</span>
        </div>
        
        {/* Links section that wraps nicely */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
          <a href="/privacy" className="hover:underline ">
            Privacy
          </a>
          <a href="/cookies" className="hover:underline ">
            Cookies
          </a>
          <a href="/terms" className="hover:underline ">
            Terms
          </a>
          <a href="/testimonials" className="hover:underline ">
            Testimonials
          </a>
          <a href="/career" className="hover:underline ">
            Career
          </a>
          <a href="/about" className="hover:underline ">
            About
          </a>
        </div>
      </div>
    </footer>
  )
}