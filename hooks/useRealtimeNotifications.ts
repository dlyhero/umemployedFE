'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import websocketService from '@/lib/websocketService';
import { useNotificationSound } from './useNotificationSound';

export interface RealtimeNotification {
  id: number;
  user: number;
  notification_type: string;
  message: string;
  action_url: string | null;
  timestamp: string;
  is_read: boolean;
}

export interface NotificationEvent {
  type: 'notification';
  data: RealtimeNotification;
}


export const useRealtimeNotifications = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const wsServiceRef = useRef<typeof websocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { playSound } = useNotificationSound();

  useEffect(() => {
    if (!session?.user?.accessToken || !session?.user?.id) {
      return;
    }

    // Use the singleton WebSocket service
    wsServiceRef.current = websocketService;

    // Connect to WebSocket
    const connect = async () => {
      try {
        await wsServiceRef.current?.connect(
          session.user.accessToken!,
          session.user.id!
        );
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to connect to notifications WebSocket:', error);
        setConnectionError('Failed to connect to real-time notifications');
        setIsConnected(false);
      }
    };

    connect();

    // Listen for notification events
    const handleNotification = (data: NotificationEvent) => {
      console.log('🔔 Real-time notification received:', data);
      
      // Update the notifications cache with the new notification
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        
        // Add the new notification to the first page
        const newNotification = data.data;
        const firstPage = old.pages[0];
        
        if (firstPage) {
          // Check if notification already exists (avoid duplicates)
          const exists = firstPage.notifications.some(
            (n: RealtimeNotification) => n.id === newNotification.id
          );
          
          if (!exists) {
            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  notifications: [newNotification, ...firstPage.notifications],
                  unreadCount: (firstPage.unreadCount || 0) + 1,
                },
                ...old.pages.slice(1),
              ],
            };
          }
        }
        
        return old;
      });

      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('New Notification', {
          body: data.data.message,
          icon: '/favicon.ico',
          tag: `notification-${data.data.id}`,
        });
      }

      // Play notification sound
      playSound();
    };

    // Listen for specific notification types
    const handleJobApplication = (data: any) => {
      console.log('📋 Job application notification:', data);
      handleNotification({ type: 'notification', data });
    };

    const handleMessageNotification = (data: any) => {
      console.log('💬 Message notification:', data);
      handleNotification({ type: 'notification', data });
    };

    // Register event listeners
    wsServiceRef.current?.addEventListener('notification', handleNotification);
    wsServiceRef.current?.addEventListener('job_application', handleJobApplication);
    wsServiceRef.current?.addEventListener('message', handleMessageNotification);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      wsServiceRef.current?.removeEventListener('notification', handleNotification);
      wsServiceRef.current?.removeEventListener('job_application', handleJobApplication);
      wsServiceRef.current?.removeEventListener('message', handleMessageNotification);
      wsServiceRef.current?.disconnect();
    };
  }, [session?.user?.accessToken, session?.user?.id, queryClient]);

  // Manual refresh function
  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return {
    isConnected,
    connectionError,
    refreshNotifications,
  };
};