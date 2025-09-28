"use client";

import { useMutation } from '@tanstack/react-query';
import { handleApiError, showSuccessMessage, withRetry } from '@/lib/errorHandling';

interface ForgotPasswordData {
  email: string;
}

const forgotPassword = async (email: string): Promise<any> => {
  if (!email) {
    throw new Error('Email is required');
  }

  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/forgot-password/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.detail || `Failed to send reset email: ${response.status}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();
    return result;
  }, 2, 1000, 'sending password reset email');
};

export const useForgotPassword = () => {
  return useMutation<any, Error, ForgotPasswordData>({
    mutationFn: ({ email }) => forgotPassword(email),
    onSuccess: (data) => {
      showSuccessMessage('Password reset email sent! Please check your email for the reset link.');
    },
    onError: (error) => {
      handleApiError(error, 'sending password reset email');
    },
  });
};