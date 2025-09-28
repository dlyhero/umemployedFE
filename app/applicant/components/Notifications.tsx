// components/NotificationBell.tsx
'use client';
import { useNotifications } from '@/hooks/useNotification';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NotificationBell() {
    const { unreadCount, notifications, markAsRead, isRealtimeConnected, realtimeError } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Check if device is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const handleNotificationClick = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleBellClick = () => {
        if (isMobile) {
            // On mobile, navigate directly to notifications page
            router.push('/notifications');
        } else {
            // On desktop, toggle dropdown
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
                className="p-2 rounded-full  relative"
            >
                <Icon
                    icon="hugeicons:notification-01"
                    width="24"
                    height="24"
                    className={`${pathname.includes('/applicant') ||
                            (pathname.startsWith('/companies') && pathname !== '/companies/create')
                            ? 'text-gray-800 max-[1120px]:text-white'
                            : 'text-white'
                        }`}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                {/* Real-time connection indicator */}
                {!isRealtimeConnected && !realtimeError && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                )}
                {realtimeError && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border border-white"></div>
                )}
            </button>

            {/* Notification Dropdown - Only show on desktop */}
            {showDropdown && !isMobile && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    ></div>

                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-600">{unreadCount} unread</p>
                            )}
                        </div>

                        <div className="divide-y">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No notifications
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''
                                            }`}
                                        onClick={() => handleNotificationClick(notification.id.toString())}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.is_read ? 'bg-blue-500' : 'bg-transparent'
                                                }`}></div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.notification_type === 'job_application' ? 'bg-brand3/10 text-brand3' :
                                                        notification.notification_type === 'profile_updated' ? 'bg-blue-100 text-brand2' :
                                                            notification.notification_type === 'special_offer' ? 'bg-purple-100 text-purple-800' :
                                                                notification.notification_type === 'endorsement' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {notification.notification_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                                                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {notification.action_url && (
                                                    <Link
                                                        href={notification.action_url}
                                                        className="text-xs text-brand hover:text-brand2 mt-1 inline-block"
                                                    >
                                                        View Details →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t text-center">
                            <Link
                                href="/notifications"
                                className="text-brand hover:text-brand2 text-sm font-medium"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}