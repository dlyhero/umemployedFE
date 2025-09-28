"use client";

import { useMutation } from '@tanstack/react-query';
import { handleApiError, showSuccessMessage, withRetry } from '@/lib/errorHandling';

interface PasswordResetData {
  uid: string;
  token: string;
  new_password: string;
  confirm_password: string;
}

const resetPassword = async ({ uid, token, new_password, confirm_password }: PasswordResetData): Promise<any> => {
  if (!uid || !token) {
    throw new Error('UID and token are required');
  }

  if (!new_password || !confirm_password) {
    throw new Error('Password fields are required');
  }

  if (new_password !== confirm_password) {
    throw new Error('Passwords do not match');
  }

  if (new_password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  return withRetry(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/password-reset-confirm/${uid}/${token}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password,
          confirm_password,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.detail || `Failed to reset password: ${response.status}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();
    return result;
  }, 2, 1000, 'resetting password');
};

export const usePasswordReset = () => {
  return useMutation<any, Error, PasswordResetData>({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      showSuccessMessage('Password reset successful! Redirecting to login...');
    },
    onError: (error) => {
      handleApiError(error, 'resetting password');
    },
  });
};