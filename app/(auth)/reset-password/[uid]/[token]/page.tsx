"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { usePasswordReset } from '@/hooks/auth/usePasswordReset';

interface PasswordResetPageProps {
  params: Promise<{
    uid: string;
    token: string;
  }>;
}

export default function PasswordResetPage({ params }: PasswordResetPageProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState('');
  const [uid, setUid] = useState<string>('');
  const [token, setToken] = useState<string>('');
  
  const passwordResetMutation = usePasswordReset();

  // Set page title
  useEffect(() => {
    document.title = 'Reset Password | UmEmployed'
  }, []);

  // Extract params from Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setUid(resolvedParams.uid);
      setToken(resolvedParams.token);
    });
  }, [params]);

  useEffect(() => {
    if (!uid || !token) {
      router.push('/login');
    }
  }, [uid, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Client-side validation
    if (!newPassword || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await passwordResetMutation.mutateAsync({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      // Error is handled by the hook, but we can also set local error for specific cases
      if (error instanceof Error && error.message.includes('Passwords do not match')) {
        setLocalError('Passwords do not match');
      } else if (error instanceof Error && error.message.includes('at least 8 characters')) {
        setLocalError('Password must be at least 8 characters');
      }
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Success State */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Redirecting you to the login page...
            </p>
            
            <Button
              onClick={handleBackToLogin}
              className="w-full bg-brand hover:bg-brand/90 text-white"
            >
              <Icon icon="solar:login-3-bold" className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password Input */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Icon 
                  icon="solar:lock-password-bold" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon 
                    icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} 
                    className="w-5 h-5" 
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Icon 
                  icon="solar:lock-password-bold" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon 
                    icon={showConfirmPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} 
                    className="w-5 h-5" 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {localError}
            </div>
          )}

          {/* Submit Button */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={passwordResetMutation.isPending || !newPassword || !confirmPassword}
              className="w-full bg-brand hover:bg-brand/90 text-white"
            >
              {passwordResetMutation.isPending ? (
                <>
                  <Icon icon="solar:loading-bold" className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" className="w-4 h-4 mr-2" />
                  Reset Password
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
            Password must be at least 8 characters long
          </p>
        </div>
      </div>
    </div>
  );
}