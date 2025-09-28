import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import websocketService, { WebSocketMessage, WebSocketConnectionStatus } from '@/lib/websocketService';

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnectInterval?: number; // ms
  maxRetries?: number;
  pollingFallbackInterval?: number; // ms
  pollingFallbackUrl?: string;
  autoConnect?: boolean;
  taskId?: string; // For enhancement-specific WebSocket connections
}

export const useWebSocket = (options?: WebSocketOptions) => {
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnectInterval = 3000,
    maxRetries = 5,
    pollingFallbackInterval = 5000,
    pollingFallbackUrl,
    autoConnect = true,
    taskId,
  } = options || {};

  const { data: session } = useSession();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>({ status: 'disconnected' });

  const connect = useCallback(() => {
    if (!session?.user?.id || !session?.user?.accessToken) {
      console.error('Cannot connect WebSocket: User not authenticated');
      return;
    }

    // Set up event listeners
    const handleConnection = (data: any) => {
      setIsConnected(data.status === 'connected');
      setConnectionStatus(data);
      if (data.status === 'connected') {
        onOpen?.(new Event('open'));
        stopPolling(); // Stop polling if WebSocket connects
      } else if (data.status === 'disconnected') {
        onClose?.(new CloseEvent('close', { code: data.code }));
      } else if (data.status === 'failed') {
        // Start polling fallback if WebSocket fails
        if (pollingFallbackUrl) {
          startPolling();
        }
      }
    };

    const handleMessage = (data: WebSocketMessage) => {
      setLastMessage(data);
      onMessage?.(data);
    };

    const handleError = (data: any) => {
      setError(data.error);
      onError?.(data.error);
      setIsConnected(false);
    };

    // Add listeners
    websocketService.addEventListener('connection', handleConnection);
    websocketService.addEventListener('notification', handleMessage);
    websocketService.addEventListener('resume_enhancement_completed', handleMessage);
    websocketService.addEventListener('resume_enhancement_failed', handleMessage);
    websocketService.addEventListener('resume_enhancement_started', handleMessage);
    websocketService.addEventListener('resume_enhancement_progress', handleMessage);
    websocketService.addEventListener('error', handleError);

    // Connect to WebSocket
    websocketService.connect(session.user.id, session.user.accessToken, taskId);

    // Cleanup function
    return () => {
      websocketService.removeEventListener('connection', handleConnection);
      websocketService.removeEventListener('notification', handleMessage);
      websocketService.removeEventListener('resume_enhancement_completed', handleMessage);
      websocketService.removeEventListener('resume_enhancement_failed', handleMessage);
      websocketService.removeEventListener('resume_enhancement_started', handleMessage);
      websocketService.removeEventListener('resume_enhancement_progress', handleMessage);
      websocketService.removeEventListener('error', handleError);
    };
  }, [session?.user?.id, session?.user?.accessToken, onOpen, onMessage, onError, onClose, pollingFallbackUrl]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    stopPolling();
    setIsConnected(false);
    setConnectionStatus({ status: 'disconnected' });
  }, []);

  const startPolling = useCallback(() => {
    if (!pollingFallbackUrl || pollingIntervalRef.current) return;

    console.log('Starting polling fallback...');
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(pollingFallbackUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.accessToken && {
              'Authorization': `Bearer ${session.user.accessToken}`,
            }),
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setLastMessage({ type: 'polling_update', data });
        onMessage?.({ type: 'polling_update', data });
      } catch (e) {
        console.error('Polling fallback error:', e);
        setError(e as Event);
        onError?.(e as Event);
      }
    }, pollingFallbackInterval);
  }, [pollingFallbackUrl, pollingFallbackInterval, onMessage, onError, session?.user?.accessToken]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('Polling stopped.');
    }
  }, []);

  const send = useCallback((message: any) => {
    return websocketService.send(message);
  }, []);

  useEffect(() => {
    if (autoConnect && session?.user?.id && session?.user?.accessToken) {
      const cleanup = connect();
      return cleanup;
    }

    return () => {
      stopPolling();
    };
  }, [autoConnect, connect, session?.user?.id, session?.user?.accessToken, stopPolling]);

  return {
    isConnected,
    lastMessage,
    error,
    connectionStatus,
    send,
    disconnect,
    connect,
  };
};

// Note: Resume enhancement WebSocket and polling hooks removed
// Resume enhancement is now synchronous and returns results immediately