"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// WebSocket message types based on API documentation
export interface WebSocketMessage {
  type: 'chat_message' | 'message_status' | 'message_read' | 'typing_indicator' | 'user_status' | 'reaction_added';
  [key: string]: any;
}

export interface ChatMessageEvent {
  type: 'chat_message';
  message: {
    id: number;
    sender: number;
    sender_username: string;
    text: string;
    timestamp: string;
    message_type: string;
    reply_to: any;
    reactions: any[];
  };
}

export interface MessageStatusEvent {
  type: 'message_status';
  message_id: number;
  status: 'delivered' | 'read';
  user_id: number;
  timestamp: string;
}

export interface MessageReadEvent {
  type: 'message_read';
  message_id: number;
  user_id: number;
  read_at: string;
}

export interface TypingIndicatorEvent {
  type: 'typing_indicator';
  user_id: number;
  username: string;
  is_typing: boolean;
}

export interface UserStatusEvent {
  type: 'user_status';
  user_id: number;
  username: string;
  status: 'online' | 'offline';
}

export interface ReactionAddedEvent {
  type: 'reaction_added';
  message_id: number;
  reaction: {
    user_id: number;
    username: string;
    reaction: string;
    emoji: string;
  };
}

// WebSocket hook for real-time messaging
export const useWebSocket = (conversationId?: number) => {
  const { data: session } = useSession();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);

  // Event handlers
  const [onMessage, setOnMessage] = useState<((data: WebSocketMessage) => void) | null>(null);
  const [onTyping, setOnTyping] = useState<((data: TypingIndicatorEvent) => void) | null>(null);
  const [onUserStatus, setOnUserStatus] = useState<((data: UserStatusEvent) => void) | null>(null);
  const [onReaction, setOnReaction] = useState<((data: ReactionAddedEvent) => void) | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!conversationId || !session?.user?.accessToken) {
      console.log('WebSocket: Missing conversationId or token');
      return;
    }

    try {
      // Use production WebSocket URL from documentation
      const wsUrl = `wss://server.umemployed.com/ws/chat/${conversationId}/?token=${session.user.accessToken}`;
      console.log('WebSocket: Connecting to', wsUrl.replace(/token=([^&]+)/, 'token=***'));
      console.log('WebSocket: Token length', session.user.accessToken.length);
      console.log('WebSocket: Conversation ID', conversationId);
      
      // Check if WebSocket is supported
      if (typeof WebSocket === 'undefined') {
        throw new Error('WebSocket not supported in this environment');
      }
      
      ws.current = new WebSocket(wsUrl);

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket: Connection timeout');
          ws.current.close();
          setConnectionError('WebSocket connection timeout');
          setIsConnected(false);
        }
      }, 10000); // 10 second timeout

      ws.current.onopen = () => {
        console.log('WebSocket: Connected');
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        
        // Clear any existing reconnect interval
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current);
          reconnectInterval.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket: Message received', data);
          
          // Call appropriate handler based on message type
          switch (data.type) {
            case 'chat_message':
              onMessage?.(data as ChatMessageEvent);
              break;
            case 'typing_indicator':
              onTyping?.(data as TypingIndicatorEvent);
              break;
            case 'user_status':
              onUserStatus?.(data as UserStatusEvent);
              break;
            case 'reaction_added':
              onReaction?.(data as ReactionAddedEvent);
              break;
            case 'message_status':
            case 'message_read':
              // These can be handled by the general onMessage handler
              onMessage?.(data);
              break;
            default:
              console.log('WebSocket: Unknown message type', data.type);
          }
        } catch (error) {
          console.error('WebSocket: Error parsing message', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket: Disconnected', event.code, event.reason);
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        
        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);
          
          reconnectInterval.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after multiple attempts');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket: Error', error);
        console.error('WebSocket: Error details', {
          type: error.type,
          target: error.target,
          currentTarget: error.currentTarget,
          readyState: ws.current?.readyState,
          url: wsUrl.replace(/token=([^&]+)/, 'token=***')
        });
        clearTimeout(connectionTimeout);
        setConnectionError('WebSocket connection error - real-time features disabled');
        // Don't attempt to reconnect on error, just disable WebSocket features
        setIsConnected(false);
      };

    } catch (error) {
      console.error('WebSocket: Connection error', error);
      setConnectionError('Failed to establish WebSocket connection');
    }
  }, [conversationId, session?.user?.accessToken, reconnectAttempts]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current);
      reconnectInterval.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    
    setIsConnected(false);
    setReconnectAttempts(0);
    setConnectionError(null);
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((messageData: {
    type: 'chat_message' | 'typing_indicator' | 'mark_read' | 'add_reaction';
    text?: string;
    message_type?: string;
    reply_to_id?: number;
    is_typing?: boolean;
    message_ids?: number[];
    message_id?: number;
    reaction?: string;
  }) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Sending message', messageData);
      ws.current.send(JSON.stringify(messageData));
      return true;
    } else {
      console.warn('WebSocket: Cannot send message, connection not open - using REST API fallback');
      return false;
    }
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    return sendMessage({
      type: 'typing_indicator',
      is_typing: isTyping
    });
  }, [sendMessage]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: number[]) => {
    return sendMessage({
      type: 'mark_read',
      message_ids: messageIds
    });
  }, [sendMessage]);

  // Add reaction
  const addReaction = useCallback((messageId: number, reaction: string) => {
    return sendMessage({
      type: 'add_reaction',
      message_id: messageId,
      reaction
    });
  }, [sendMessage]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (conversationId && session?.user?.accessToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, session?.user?.accessToken, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    addReaction,
    setOnMessage,
    setOnTyping,
    setOnUserStatus,
    setOnReaction,
    connect,
    disconnect
  };
};