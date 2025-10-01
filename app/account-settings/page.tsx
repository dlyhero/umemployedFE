'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import HomeHeader from '../(Home)/Components/HomeHeader';
import { toast } from 'sonner';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useGoogleMeetConnection } from '@/hooks/companies/useGoogleMeet';
import { useSearchParams } from 'next/navigation';

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'security' | 'integrations' | 'billing' | 'danger'>('security');

  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState('');

  // Google Meet connection
  const { data: googleConnection, isLoading: checkingGoogleConnection } = useGoogleMeetConnection();

  // Check for Google OAuth success
  useEffect(() => {
    const googleOAuth = searchParams.get('google_oauth');
    if (googleOAuth === 'success') {
      toast.success('Google Calendar Connected!', {
        description: 'You can now schedule Google Meet interviews with automatic calendar integration.',
      });
      // Switch to integrations tab to show the success
      setActiveTab('integrations');
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('google_oauth');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Modal effects
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEmailConfirmModal) {
          setShowEmailConfirmModal(false);
          setEmailConfirmation('');
        } else if (showDeleteModal) {
          setShowDeleteModal(false);
        }
      }
    };

    if (showDeleteModal || showEmailConfirmModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [showDeleteModal, showEmailConfirmModal]);

  const tabs = [
    { id: 'security', label: 'Security', icon: 'material-symbols:lock-outline' },
    { id: 'integrations', label: 'Integrations', icon: 'material-symbols:extension-outline' },
    { id: 'billing', label: 'Billing', icon: 'material-symbols:credit-card-outline' },
    { id: 'danger', label: 'Danger Zone', icon: 'material-symbols:warning-outline' },
  ];


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${apiUrl}/users/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_new_password: passwordData.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteAccountConfirm = () => {
    setShowDeleteModal(false);
    setShowEmailConfirmModal(true);
  };

  const handleEmailConfirmationSubmit = async () => {
    if (emailConfirmation !== session?.user?.email) {
      toast.error('Email confirmation failed. Please enter your exact email address.');
      return;
    }

    setIsLoading(true);
    setShowEmailConfirmModal(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${apiUrl}/users/delete-account/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      // Redirect to home page after successful deletion
      window.location.href = '/';
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setEmailConfirmation('');
    }
  };

  const handleConnectGoogle = async () => {
    if (!session?.user?.accessToken) {
      toast.error('Authentication required', {
        description: 'Please sign in to connect your Google account.',
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/google/auth-url/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authorization_url) {
          // Redirect to Google OAuth
          window.location.href = data.authorization_url;
        } else {
          throw new Error('No authorization URL received');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast.error('Failed to connect to Google', {
        description: 'Please try again or contact support if the issue persists.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className='bg-blue-950'>
        <div className=" px-4">
          <div className="">
            <HomeHeader />
            <div className="flex flex-col items-center justify-center py-24 relative">
              <div className="text-center text-white">
                <h3 className="text-3xl  md:text-5xl dm-serif tracking-wider">
                  Account Settings
                </h3>
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto my-10">
                  Manage your account information, security settings, and preferences.

                </p>
              </div>

            </div>
          </div>
        </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900"></h1>
            <p className="mt-2 text-base sm:text-lg text-gray-600">
            </p>
          </div>


          {/* Tabs */}
          <div className="mb-6 sm:mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex flex-wrap gap-2 sm:gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === tab.id
                        ? 'border-brand text-brand'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon icon={tab.icon} width="18" height="18" className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Security Settings</h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <Icon icon="material-symbols:info-outline" width="20" height="20" className="text-yellow-600 mr-2 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Password Requirements:</p>
                        <ul className="mt-1 list-disc list-inside">
                          <li>At least 8 characters long</li>
                          <li>Include uppercase and lowercase letters</li>
                          <li>Include at least one number</li>
                          <li>Include at least one special character</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-brand text-white rounded-full hover:bg-brand2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Third-Party Integrations</h2>

                <div className="space-y-6">
                  {/* Google Meet Integration */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon icon="logos:google-meet" className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Meet Integration</h3>
                          <p className="text-gray-600 mb-4">
                            Connect your Google account to enable automatic Google Meet scheduling for interviews.
                            This allows you to create calendar events and generate meeting links automatically.
                          </p>
                          
                          {/* Connection Status */}
                          <div className="flex items-center gap-2 mb-4">
                            {checkingGoogleConnection ? (
                              <div className="flex items-center gap-2">
                                <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin text-gray-500" />
                                <span className="text-sm text-gray-600">Checking connection...</span>
                              </div>
                            ) : googleConnection?.connected ? (
                              <div className="flex items-center gap-2">
                                <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">Connected</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-orange-600" />
                                <span className="text-sm text-orange-700 font-medium">Not Connected</span>
                              </div>
                            )}
                          </div>

                          {/* Benefits List */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-blue-900 mb-2">Benefits of Google Meet Integration:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Automatic calendar event creation for interviews</li>
                              <li>• Google Meet links generated automatically</li>
                              <li>• Email invitations sent to candidates</li>
                              <li>• Seamless interview scheduling workflow</li>
                              <li>• Integration with your existing Google Calendar</li>
                            </ul>
                          </div>

                          {/* Action Button */}
                          <div className="flex gap-3">
                            {googleConnection?.connected ? (
                              <div className="flex items-center gap-2 text-green-700">
                                <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                                <span className="text-sm font-medium">Google account is connected and ready to use</span>
                              </div>
                            ) : (
                              <button
                                onClick={handleConnectGoogle}
                                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Icon icon="logos:google-meet" className="w-4 h-4" />
                                Connect Google Account
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Future Integrations Placeholder */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Icon icon="material-symbols:extension-outline" className="w-8 h-8 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">More Integrations Coming Soon</h3>
                        <p className="text-gray-600">
                          We're working on adding more integrations to make your experience even better.
                          Stay tuned for updates!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Billing & Subscription</h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link
                        href="/pricing"
                        className="flex items-center justify-center px-4 py-2 bg-brand text-white rounded-full   hover:bg-brand2 transition-colors"
                      >
                        View Pricing Plans
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-full  hover:bg-gray-700 transition-colors"
                      >
                        Manage Billing
                      </Link>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="text-sm text-brand">
                        <p className="font-medium">Billing Information</p>
                        <p className="mt-1">
                          For detailed billing management, subscription changes, and transaction history,
                          please visit the dedicated billing page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Danger Zone</h2>

                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <Icon icon="material-symbols:warning-outline" width="24" height="24" className="text-red-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-red-900 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-800 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                          This action will permanently remove all your data, including:
                        </p>
                        <ul className="text-sm text-red-800 list-disc list-inside mb-4">
                          <li>Your profile and personal information</li>
                          <li>All job applications and saved jobs</li>
                          <li>Transaction history and billing data</li>
                          <li>Any uploaded resumes or documents</li>
                        </ul>
                        <button
                          onClick={handleDeleteAccountClick}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Deleting...' : 'Delete My Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
              aria-hidden="true"
            />

            {/* Modal */}
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Close modal"
              >
                <Icon icon="material-symbols:close" className="w-6 h-6" />
              </button>

              {/* Modal content */}
              <div className="p-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Icon icon="material-symbols:warning-outline" className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Account
                </h2>

                {/* Message */}
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                </p>

                {/* Warning box */}
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-red-800 font-medium mb-2">This will permanently delete:</p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>Your profile and personal information</li>
                    <li>All job applications and saved jobs</li>
                    <li>Transaction history and billing data</li>
                    <li>Any uploaded resumes or documents</li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccountConfirm}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Email Confirmation Modal */}
        {showEmailConfirmModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => {
                setShowEmailConfirmModal(false);
                setEmailConfirmation('');
              }}
              aria-hidden="true"
            />

            {/* Modal */}
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowEmailConfirmModal(false);
                  setEmailConfirmation('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Close modal"
              >
                <Icon icon="material-symbols:close" className="w-6 h-6" />
              </button>

              {/* Modal content */}
              <div className="p-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Icon icon="material-symbols:warning-outline" className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Confirm Account Deletion
                </h2>

                {/* Message */}
                <p className="text-gray-600 text-center mb-6">
                  To confirm account deletion, please type your email address below.
                </p>

                {/* Email input */}
                <div className="mb-6">
                  <label htmlFor="email-confirm" className="block text-sm md:text-[16.5px] font-medium text-gray-700 mb-2">
                    Your email address:
                  </label>
                  <input
                    type="email"
                    id="email-confirm"
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    placeholder={session?.user?.email || ''}
                    className="w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Expected: {session?.user?.email}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEmailConfirmModal(false);
                      setEmailConfirmation('');
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmailConfirmationSubmit}
                    disabled={!emailConfirmation}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
      );
}