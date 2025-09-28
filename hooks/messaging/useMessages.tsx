"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types based on the API documentation
export interface MessageReaction {
  id: number;
  user: number;
  username: string;
  user_full_name: string;
  reaction: string;
  reaction_emoji: string;
  created_at: string;
}

export interface DeliveryStatus {
  user: number;
  username: string;
  delivered_at: string;
  read_at: string | null;
}

export interface ReactionSummary {
  [key: string]: {
    count: number;
    users: Array<{
      id: number;
      username: string;
    }>;
    emoji: string;
  };
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_username: string;
  sender_full_name: string;
  text: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment: string | null;
  attachment_filename: string | null;
  attachment_url: string | null;
  timestamp: string;
  updated_at: string;
  is_read: boolean;
  read_at: string | null;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  reply_to: Message | null;
  is_edited: boolean;
  is_deleted: boolean;
  reactions: MessageReaction[];
  delivery_status: DeliveryStatus[];
  replies_count: number;
  reaction_summary: ReactionSummary;
}

export interface SendMessageRequest {
  text: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: number;
  attachment?: string;
  attachment_filename?: string;
}

export interface UpdateMessageRequest {
  text: string;
}

export interface ReactionRequest {
  reaction: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
}

export interface BulkDeleteRequest {
  message_ids: number[];
}

// Fetch messages for a conversation
export const fetchMessages = async (token: string, conversationId: number): Promise<Message[]> => {
  const response = await axios.get<Message[]>(
    `${API_URL}/messages/conversations/${conversationId}/messages/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Send a new message
const sendMessage = async (token: string, conversationId: number, messageData: SendMessageRequest): Promise<Message> => {
  const response = await axios.post<Message>(
    `${API_URL}/messages/conversations/${conversationId}/messages/`,
    messageData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Update/edit a message
const updateMessage = async (token: string, messageId: number, messageData: UpdateMessageRequest): Promise<Message> => {
  const response = await axios.put<Message>(
    `${API_URL}/messages/${messageId}/update/`,
    messageData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Delete a message
const deleteMessage = async (token: string, messageId: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/messages/${messageId}/delete/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Bulk delete messages
const bulkDeleteMessages = async (token: string, conversationId: number, messageIds: number[]): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_URL}/messages/conversations/${conversationId}/bulk-delete/`,
    { message_ids: messageIds },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Add reaction to message
const addReaction = async (token: string, messageId: number, reaction: string): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_URL}/messages/${messageId}/reactions/`,
    { reaction },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Remove reaction from message
const removeReaction = async (token: string, messageId: number, reaction: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/messages/${messageId}/reactions/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { reaction }
    }
  );
  return response.data;
};

// Mark messages as read
const markMessagesAsRead = async (token: string, conversationId: number): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_URL}/messages/conversations/${conversationId}/mark-read/`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Hook to get messages for a conversation
export const useMessages = (conversationId?: number) => {
  const { data: session, status } = useSession();

  return useQuery<Message[], Error>({
    queryKey: ['messages', conversationId, session?.user?.accessToken],
    queryFn: () => fetchMessages(session?.user?.accessToken as string, conversationId!),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!conversationId,
    staleTime: 30 * 1000, // 30 seconds - messages change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

// Hook to send a message
export const useSendMessage = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, { conversationId: number; messageData: SendMessageRequest }>({
    mutationFn: ({ conversationId, messageData }) => 
      sendMessage(session?.user?.accessToken as string, conversationId, messageData),
    onMutate: async ({ conversationId, messageData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', conversationId]);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: Date.now(), // Temporary ID
        conversation: conversationId,
        sender: parseInt(session?.user?.id || '0'),
        sender_username: session?.user?.email || '',
        sender_full_name: session?.user?.name || '',
        text: messageData.text,
        message_type: messageData.message_type,
        attachment: messageData.attachment || null,
        attachment_filename: null,
        attachment_url: null,
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        read_at: null,
        status: 'sent',
        reply_to: null,
        is_edited: false,
        is_deleted: false,
        reactions: [],
        delivery_status: [],
        replies_count: 0,
        reaction_summary: {}
      };

      // Optimistically update the messages cache
      queryClient.setQueryData(['messages', conversationId], (oldData: Message[] | undefined) => 
        [...(oldData || []), optimisticMessage]
      );

      // Update conversations list to show new last message
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((conv: any) => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_message: {
                  id: optimisticMessage.id,
                  text: optimisticMessage.text,
                  sender_username: optimisticMessage.sender_username,
                  timestamp: optimisticMessage.timestamp,
                  message_type: optimisticMessage.message_type,
                  is_read: false
                },
                updated_at: optimisticMessage.timestamp
              }
            : conv
        );
      });

      // Return context with the optimistic message
      return { previousMessages, optimisticMessage };
    },
    onSuccess: (data, { conversationId }, context) => {
      // Replace optimistic message with real message from server
      queryClient.setQueryData(['messages', conversationId], (oldData: Message[] | undefined) => 
        oldData?.map(msg => 
          msg.id === (context as any)?.optimisticMessage?.id ? data : msg
        ) || [data]
      );
      
      // Update conversations list with real message data
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((conv: any) => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_message: {
                  id: data.id,
                  text: data.text,
                  sender_username: data.sender_username,
                  timestamp: data.timestamp,
                  message_type: data.message_type,
                  is_read: false
                },
                updated_at: data.timestamp
              }
            : conv
        );
      });
    },
    onError: (error, { conversationId }, context) => {
      // Revert optimistic update on error
      if ((context as any)?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], (context as any).previousMessages);
      }
      console.error('Failed to send message:', error);
    }
  });
};

// Hook to update a message
export const useUpdateMessage = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, { messageId: number; messageData: UpdateMessageRequest }>({
    mutationFn: ({ messageId, messageData }) => 
      updateMessage(session?.user?.accessToken as string, messageId, messageData),
    onSuccess: (data, { messageId }) => {
      // Update the message in cache
      queryClient.setQueryData(['messages'], (oldData: Message[] | undefined) => 
        oldData?.map(msg => msg.id === messageId ? { ...msg, ...data } : msg) || []
      );
    },
    onError: (error) => {
      console.error('Failed to update message:', error);
    }
  });
};

// Hook to delete a message
export const useDeleteMessage = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (messageId: number) => deleteMessage(session?.user?.accessToken as string, messageId),
    onSuccess: (data, messageId) => {
      // Remove message from cache
      queryClient.setQueryData(['messages'], (oldData: Message[] | undefined) => 
        oldData?.filter(msg => msg.id !== messageId) || []
      );
      
      console.log('Message deleted successfully:', data.message);
    },
    onError: (error) => {
      console.error('Failed to delete message:', error);
    }
  });
};

// Hook to bulk delete messages
export const useBulkDeleteMessages = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { conversationId: number; messageIds: number[] }>({
    mutationFn: ({ conversationId, messageIds }) => 
      bulkDeleteMessages(session?.user?.accessToken as string, conversationId, messageIds),
    onSuccess: (data, { conversationId, messageIds }) => {
      // Remove messages from cache
      queryClient.setQueryData(['messages', conversationId], (oldData: Message[] | undefined) => 
        oldData?.filter(msg => !messageIds.includes(msg.id)) || []
      );
      
      console.log('Messages deleted successfully:', data.message);
    },
    onError: (error) => {
      console.error('Failed to bulk delete messages:', error);
    }
  });
};

// Hook to add reaction
export const useAddReaction = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { messageId: number; reaction: string }>({
    mutationFn: ({ messageId, reaction }) => 
      addReaction(session?.user?.accessToken as string, messageId, reaction),
    onSuccess: (data, { messageId, reaction }) => {
      // Update message reactions in cache
      queryClient.setQueryData(['messages'], (oldData: Message[] | undefined) => 
        oldData?.map(msg => {
          if (msg.id === messageId) {
            // Add reaction to existing reactions
            const newReaction = {
              id: Date.now(), // Temporary ID
              user: parseInt(session?.user?.id || '0'),
              username: session?.user?.email || '',
              user_full_name: session?.user?.name || '',
              reaction,
              reaction_emoji: getReactionEmoji(reaction),
              created_at: new Date().toISOString()
            };
            
            return {
              ...msg,
              reactions: [...msg.reactions, newReaction],
              reaction_summary: {
                ...msg.reaction_summary,
                [reaction]: {
                  count: (msg.reaction_summary[reaction]?.count || 0) + 1,
                  users: [...(msg.reaction_summary[reaction]?.users || []), {
                    id: parseInt(session?.user?.id || '0'),
                    username: session?.user?.email || ''
                  }],
                  emoji: getReactionEmoji(reaction)
                }
              }
            };
          }
          return msg;
        }) || []
      );
    },
    onError: (error) => {
      console.error('Failed to add reaction:', error);
    }
  });
};

// Hook to remove reaction
export const useRemoveReaction = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { messageId: number; reaction: string }>({
    mutationFn: ({ messageId, reaction }) => 
      removeReaction(session?.user?.accessToken as string, messageId, reaction),
    onSuccess: (data, { messageId, reaction }) => {
      // Update message reactions in cache
      queryClient.setQueryData(['messages'], (oldData: Message[] | undefined) => 
        oldData?.map(msg => {
          if (msg.id === messageId) {
            // Remove reaction from existing reactions
            const filteredReactions = msg.reactions.filter(r => 
              !(r.user === parseInt(session?.user?.id || '0') && r.reaction === reaction)
            );
            
            const updatedSummary = { ...msg.reaction_summary };
            if (updatedSummary[reaction]) {
              updatedSummary[reaction] = {
                ...updatedSummary[reaction],
                count: Math.max(0, updatedSummary[reaction].count - 1),
                users: updatedSummary[reaction].users.filter(u => u.id !== parseInt(session?.user?.id || '0'))
              };
              
              // Remove reaction type if count is 0
              if (updatedSummary[reaction].count === 0) {
                delete updatedSummary[reaction];
              }
            }
            
            return {
              ...msg,
              reactions: filteredReactions,
              reaction_summary: updatedSummary
            };
          }
          return msg;
        }) || []
      );
    },
    onError: (error) => {
      console.error('Failed to remove reaction:', error);
    }
  });
};

// Hook to mark messages as read
export const useMarkMessagesAsRead = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (conversationId: number) => 
      markMessagesAsRead(session?.user?.accessToken as string, conversationId),
    onSuccess: (data, conversationId) => {
      // Update conversation unread count
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((conv: any) => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        );
      });
      
      // Update messages read status
      queryClient.setQueryData(['messages', conversationId], (oldData: Message[] | undefined) => 
        oldData?.map(msg => ({ ...msg, is_read: true, status: 'read' })) || []
      );
      
      console.log('Messages marked as read:', data.message);
    },
    onError: (error) => {
      console.error('Failed to mark messages as read:', error);
    }
  });
};

// Helper function to get reaction emoji
const getReactionEmoji = (reaction: string): string => {
  const emojiMap: { [key: string]: string } = {
    like: '👍',
    love: '❤️',
    laugh: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠'
  };
  return emojiMap[reaction] || '👍';
};