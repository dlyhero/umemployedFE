"use client";

import GoogleAuth from '@/app/(auth)/components/social-auth/GoogleAuth';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  title = "Login Required",
  message = "Please log in to save jobs to your favorites." 
}: LoginModalProps) {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <Icon icon="material-symbols:close" className="w-6 h-6" />
        </button>
        
        {/* Modal content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
              <Icon icon="material-symbols:lock-outline" className="w-8 h-8 text-brand" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <GoogleAuth />
            <Link
              href="/login"
              className="w-full bg-brand hover:bg-brand2 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              onClick={onClose}
            >
              Log In
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
              <span>Don't have an account?</span>
              <Link
                href="/signup"
                className="text-brand hover:text-brand2 font-medium transition-colors"
                onClick={onClose}
              >
                Sign Up
              </Link>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}