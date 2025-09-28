"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const forgotPasswordMutation = useForgotPassword();

  // Set page title
  useEffect(() => {
    document.title = 'Forgot Password | UmEmployed'
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Success State */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please check your email and click the reset link to create a new password. 
              If you don't see the email, check your spam folder.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleBackToLogin}
                className="w-full bg-brand hover:bg-brand/90 text-white"
              >
                <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
                Try Different Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:lock-password-bold-duotone" className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            No worries! Enter your email address and we'll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Icon 
                  icon="solar:letter-unread-bold" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={forgotPasswordMutation.isPending || !email.trim()}
              className="w-full bg-brand hover:bg-brand/90 text-white"
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Icon icon="solar:loading-bold" className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Icon icon="solar:letter-unread-bold" className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full"
            >
              <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <button
              onClick={handleBackToLogin}
              className="font-medium text-brand hover:text-brand/80 transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}