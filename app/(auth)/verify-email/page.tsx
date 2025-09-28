"use client"
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from "axios"
import { useState } from 'react'

const sendEmailVerification = async (email: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/resend-confirmation-email/`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate: resendEmail, isPending, error } = useMutation({
    mutationKey: ['resendVerification', email],
    mutationFn: () => {
      if (!email) {
        throw new Error('Email is required');
      }
      return sendEmailVerification(email);
    },
    onSuccess: (data: any) => {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    },
    onError: (error: any) => {
      console.error('Failed to resend verification email:', error);
    }
  });

  const handleResendClick = () => {
    if (email) {
      resendEmail();
    }
  };

  return (
    <div className='flex items-center justify-center p-4'>
      <div className='max-w-md w-full p-8 rounded-lg bg-white shadow-sm'>
        {/* Header */}
        <div className='text-center mb-8'>
      
          <Icon icon="line-md:email-filled"   width="48"
            height="48"
            className='mx-auto text-brand mb-4'/>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>Verify your email</h1>
          <p className='text-gray-600'>We've sent a verification link to your email</p>
          {email && <p className='font-medium mt-2'>{email}</p>}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded text-sm text-center">
            <Icon icon="carbon:checkmark" className="inline mr-2" width="16" />
            Verification email sent successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            <Icon icon="carbon:warning" className="inline mr-2" width="16" />
            {(() => {
              if (axios.isAxiosError(error)) {
                return (error.response?.data?.message as string) || 'Failed to send verification email';
              }
              if (error instanceof Error) {
                return error.message;
              }
              return 'An unexpected error occurred';
            })()}
          </div>
        )}

        {/* Resend Section */}
        <div className='text-center mb-6'>
          <p className='text-gray-600 mb-4'>Didn't receive the email?</p>
          <button 
            onClick={handleResendClick}
            disabled={isPending || !email}
            className={`text-brand font-semibold hover:underline flex items-center justify-center gap-2 mx-auto transition-opacity ${
              isPending || !email ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
            }`}
          >
            {isPending ? (
              <>
                <Icon icon="svg-spinners:90-ring-with-bg" width="20" />
                Sending...
              </>
            ) : (
              <>
                <Icon icon="carbon:reset" width="20" />
                Resend verification email
              </>
            )}
          </button>
        </div>

        {/* No Email Warning */}
        {!email && (
          <div className="mb-6 p-3 bg-yellow-100 text-yellow-700 rounded text-sm text-center">
            <Icon icon="carbon:warning" className="inline mr-2" width="16" />
            No email found. Please sign up again or contact support.
          </div>
        )}

        {/* Additional Instructions */}
        <div className="mb-6 p-4 bg-gray-50 rounded text-sm">
          <p className="text-gray-600 mb-2">
            <strong>Check your spam folder</strong> - Sometimes verification emails end up there.
          </p>
          <p className="text-gray-600">
            <strong>Click the link</strong> in the email to verify your account and complete registration.
          </p>
        </div>

        {/* Footer */}
        <div className='border-t pt-6 text-center text-sm text-gray-500 space-y-1'>
          <p>After sign in <Link href="/login" className='text-brand hover:underline'>Sign in</Link></p>
          <p>Need help? <Link href="/contact" className='text-brand hover:underline'>Contact support</Link></p>
        </div>
      </div>
    </div>
  )
}