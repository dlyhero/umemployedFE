// hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useRealtimeNotifications } from './useRealtimeNotifications';

// Play notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Gentle notification chime
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export interface Notification {
  id: number;
  user: number;
  notification_type: string;
  message: string;
  action_url: string | null;
  timestamp: string;
  is_read: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  totalCount?: number;
  unreadCount?: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  notification?: Notification;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useNotifications = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  // Initialize real-time notifications
  const { isConnected, connectionError, refreshNotifications } = useRealtimeNotifications();

  // Fetch notifications with pagination
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<NotificationsResponse, AxiosError>({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const response = await axios.get<Notification[]>(
        `${API_URL}/notifications/notifications/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          params: {
            page: pageParam,
            limit: 20,
          },
        }
      );
      
      // Transform the array response to match our interface
      const notifications = response.data;
      const unreadCount = notifications.filter(n => !n.is_read).length;
      
      
      return {
        notifications,
        totalCount: notifications.length,
        unreadCount
      };
    },
    initialPageParam: 1, // Required in TanStack Query v5
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((total, page) => total + page.notifications.length, 0);
      return totalFetched < (lastPage.totalCount || 0) ? allPages.length + 1 : undefined;
    },
    enabled: !!session?.user.accessToken,
  });

  // Flatten all notifications from pages
  const notifications = notificationsData?.pages.flatMap(page => page.notifications) || [];
  const totalCount = notificationsData?.pages[0]?.totalCount || 0;
  const unreadCount = notificationsData?.pages[0]?.unreadCount || 0;

  // Mark notification as read
  const markAsRead = useMutation<MarkAsReadResponse, AxiosError, string>({
    mutationFn: async (notificationId: string) => {
      const response = await axios.post<MarkAsReadResponse>(
        `${API_URL}/notifications/notifications/${notificationId}/read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, notificationId) => {
      // Update the specific notification in the cache
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: NotificationsResponse) => ({
            ...page,
            notifications: page.notifications.map(notification =>
              notification.id.toString() === notificationId
                ? { ...notification, is_read: true }
                : notification
            ),
            unreadCount: Math.max(0, (page.unreadCount || 0) - 1),
          })),
        };
      });
    },
  });

  return {
    notifications,
    totalCount,
    unreadCount,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    markAsRead: markAsRead.mutateAsync,
    isMarkingAsRead: markAsRead.isPending,
    markAsReadError: markAsRead.error,
    // Real-time features
    isRealtimeConnected: isConnected,
    realtimeError: connectionError,
    refreshNotifications,
  };
};