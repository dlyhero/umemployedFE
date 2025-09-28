'use client';
import { useNotifications } from '@/hooks/useNotification';
import { useRecommendedJobs } from '@/hooks/jobs/useRecommendedJobs';
import SuggestedJobCard from '@/components/jobs/jobsuggest';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useNotificationSound } from '@/hooks/useNotificationSound';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const {
    notifications,
    unreadCount,
    isLoading: isNotificationsLoading,
    error: notificationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    isRealtimeConnected,
    realtimeError,
  } = useNotifications();

  // Sound settings
  const { isEnabled: soundEnabled, volume, playSound, toggleSound, updateVolume } = useNotificationSound();

  // Check if user is a recruiter
  const isRecruiter = session?.user?.role === 'recruiter';

  // Only fetch recommended jobs for non-recruiters
  const {
    data: recommendedJobsData,
    isLoading: isJobsLoading,
    error: jobsError,
  } = useRecommendedJobs({
    page: 1,
    pageSize: 5,
    minSkillsMatch: 0,
    enabled: status === 'authenticated' && !isRecruiter,
  });

  const [selectedFilter, setSelectedFilter] = useState('All');
  const filterOptions = [
    { name: 'All', icon: 'material-symbols:notifications' },
    { name: 'Jobs', icon: 'material-symbols:work' },
  ];

  // Filter notifications based on selectedFilter
  const filteredNotifications = notifications.filter((notification) =>
    selectedFilter === 'All' ? true : notification.notification_type === 'job_application'
  );

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await markAsRead(notificationId.toString());
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'job_application':
        return 'material-symbols:work';
      case 'profile_updated':
        return 'material-symbols:person';
      case 'endorsement':
        return 'material-symbols:thumb-up';
      case 'special_offer':
        return 'material-symbols:local-offer';
      default:
        return 'material-symbols:notifications';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'job_application':
        return 'text-brand3';
      case 'profile_updated':
        return 'text-brand';
      case 'endorsement':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle infinite scroll for notifications
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !isFetchingNextPage &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Debug session and notifications
  useEffect(() => {

  }, [status, session, notifications, filteredNotifications, notificationsError, recommendedJobsData]);

  // Check browser notification permissions
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.warn('Browser notifications are not allowed.');
        }
      });
    }
  }, []);

  // Refresh notifications manually
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  // Retry failed notification fetch
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  // Filter jobs to exclude those where hasApplied is true (only for non-recruiters)
  const unappliedJobs = !isRecruiter && recommendedJobsData
    ? (recommendedJobsData as any).filter((job: any) => !job.hasApplied)
    : [];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view notifications and job recommendations.</p>
          <Link
            href="/auth/signin"
            className="text-brand hover:text-brand2 font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand/3">
      <div className={`max-w-[1400px] mx-auto flex flex-col ${!isRecruiter ? 'lg:flex-row' : ''} gap-6 p-4`}>
        {/* Notifications Section */}
        <div className={`${isRecruiter ? 'w-full' : 'lg:w-2/3'} w-full`}>
          {/* Header with New Notifications Badge */}
          <div className="bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-brand text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Icon icon="material-symbols:notifications" width={16} height={16} />
                    <span>New notifications ({unreadCount || 0})</span>
                  </div>
                  {/* Real-time status indicator */}
                  <div className="flex items-center space-x-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      isRealtimeConnected ? 'bg-green-500' : 
                      realtimeError ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className={`${
                      isRealtimeConnected ? 'text-green-600' : 
                      realtimeError ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {isRealtimeConnected ? 'Live' : 
                       realtimeError ? 'Offline' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Sound Settings */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleSound}
                      className={`p-1 rounded ${
                        soundEnabled ? 'text-brand' : 'text-gray-400'
                      } hover:bg-gray-100`}
                      title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
                    >
                      <Icon 
                        icon={soundEnabled ? 'material-symbols:volume-up' : 'material-symbols:volume-off'} 
                        width={16} 
                        height={16} 
                      />
                    </button>
                    {soundEnabled && (
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => updateVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        title={`Volume: ${Math.round(volume * 100)}%`}
                      />
                    )}
                    <button
                      onClick={playSound}
                      className="p-1 text-gray-400 hover:text-brand"
                      title="Test notification sound"
                    >
                      <Icon icon="material-symbols:play-arrow" width={16} height={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleRefresh}
                    className="text-brand hover:text-brand2 font-medium text-sm flex items-center space-x-1"
                  >
                    <Icon icon="material-symbols:refresh" width={16} height={16} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.name)}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors flex items-center space-x-1 ${
                      selectedFilter === filter.name
                        ? 'bg-brand3 text-white border-brand3'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon icon={filter.icon} width={16} height={16} />
                    <span>{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white">
            {isNotificationsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : notificationsError ? (
              <div className="px-6 py-4 text-center">
                <p className="text-red-500 text-sm mb-4">
                  Failed to load notifications: {(notificationsError as Error).message}
                </p>
                <button
                  onClick={handleRetry}
                  className="text-brand hover:text-brand2 font-medium text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <Icon
                  icon="material-symbols:notifications-off"
                  width={64}
                  height={64}
                  className="text-gray-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <>
                {filteredNotifications.map((notification, index) => (
                  <div key={notification.id} className=''>
                    <div
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Blue Dot for Unread */}
                        <div className="flex-shrink-0 pt-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              !notification.is_read ? 'bg-brand' : 'bg-transparent'
                            }`}
                          ></div>
                        </div>

                        {/* Icon based on notification type */}
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon
                              icon={getNotificationIcon(notification.notification_type)}
                              width={24}
                              height={24}
                              className={getNotificationTypeColor(notification.notification_type)}
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={`text-sm leading-5 ${
                                  !notification.is_read
                                    ? 'font-medium text-gray-900'
                                    : 'text-gray-800'
                                }`}
                              >
                                {notification.message}
                              </p>

                              {notification.notification_type === 'job_application' && (
                                <p className="text-sm text-gray-500 mt-1"></p>
                              )}

                              {notification.notification_type === 'endorsement' && (
                                <p className="text-sm text-gray-500 mt-1"></p>
                              )}

                              {(notification.notification_type === 'profile_updated' ||
                                notification.notification_type === 'special_offer') && (
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500"></div>
                              )}

                              {notification.notification_type === 'endorsement' && (
                                <button className="mt-3 px-4 py-1 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"></button>
                              )}
                            </div>

                            <div className="flex items-start space-x-2 ml-4">
                              <span className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(notification.timestamp)}
                              </span>

                              <div className="relative group">
                                <button className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Icon
                                    icon="material-symbols:more-horiz"
                                    width={16}
                                    height={16}
                                    className="text-gray-500"
                                  />
                                </button>

                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                  <div className="py-1">
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                      Hide this notification
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                      Turn off notifications
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {notification.action_url && (
                            <Link
                              href={notification.action_url}
                              className="text-brand border border-brand rounded-full px-4 py-1.5 hover:text-brand2 text-sm mt-2 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Horizontal rule with spacing, except for the last notification */}
                    {index < filteredNotifications.length - 1 && (
                      <hr className="border-gray-200" />
                    )}
                  </div>
                ))}

                {hasNextPage && (
                  <div className="px-6 py-4 text-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="text-brand hover:text-brand2 font-medium text-sm disabled:opacity-50"
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        'Show more notifications'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Suggested Jobs Sidebar - Only show for non-recruiters */}
        {!isRecruiter && (
          <div className="lg:w-1/3 w-full">
            <div className=" p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Suggested Jobs
              </h3>
              {isJobsLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                </div>
              ) : jobsError ? (
                <p className="text-red-500 text-sm">
                  Failed to load jobs. Please try again later.
                </p>
              ) : unappliedJobs.length > 0 ? (
                <div className="space-y-3">
                  {unappliedJobs.map((job: any) => (
                    <SuggestedJobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No unapplied job recommendations available.
                </p>
              )}
              {unappliedJobs.length > 0 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/jobs"
                    className="text-brand hover:text-brand2 font-medium text-sm"
                  >
                    View more jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}