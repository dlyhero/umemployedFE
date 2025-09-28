"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { fetchMessages } from './useMessages';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types based on the API documentation
export interface ConversationParticipant {
  id: number;
  username: string;
  full_name: string;
  email: string;
  is_current_user?: boolean;
}

export interface LastMessage {
  id: number;
  text: string;
  sender_username: string;
  timestamp: string;
  message_type: string;
  is_read: boolean;
}

export interface Conversation {
  id: number;
  participant1: number;
  participant2: number;
  participant1_username: string;
  participant2_username: string;
  participant1_full_name: string;
  participant2_full_name: string;
  created_at: string;
  updated_at: string;
  last_message: LastMessage | null;
  unread_count: number;
  other_participant: ConversationParticipant;
  is_archived: boolean;
}

export interface StartConversationRequest {
  user_id: number;
}

export interface StartConversationResponse {
  conversation_id: number;
  conversation: Conversation;
  created: boolean;
  message: string;
}

export interface ParticipantsResponse {
  conversation_id: number;
  participants: ConversationParticipant[];
  other_participant: ConversationParticipant;
}

// Fetch all conversations
const fetchConversations = async (token: string): Promise<Conversation[]> => {
  const response = await axios.get<Conversation[]>(
    `${API_URL}/messages/conversations/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Start a new conversation
const startConversation = async (token: string, userId: number): Promise<StartConversationResponse> => {
  const response = await axios.post<StartConversationResponse>(
    `${API_URL}/messages/conversations/start/`,
    { user_id: userId },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Get conversation participants
const fetchConversationParticipants = async (token: string, conversationId: number): Promise<ParticipantsResponse> => {
  const response = await axios.get<ParticipantsResponse>(
    `${API_URL}/messages/conversations/${conversationId}/participants/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Delete conversation
const deleteConversation = async (token: string, conversationId: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/messages/conversations/${conversationId}/delete/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Search conversations
const searchConversations = async (token: string, query: string): Promise<Conversation[]> => {
  const response = await axios.get<Conversation[]>(
    `${API_URL}/messages/search-inbox/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { query }
    }
  );
  return response.data;
};

// Hook to get all conversations
export const useConversations = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  return useQuery<Conversation[], Error>({
    queryKey: ['conversations', session?.user?.accessToken],
    queryFn: () => fetchConversations(session?.user?.accessToken as string),
    enabled: status === 'authenticated' && !!session?.user?.accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

// Hook to start a conversation
export const useStartConversation = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<StartConversationResponse, Error, number>({
    mutationFn: (userId: number) => startConversation(session?.user?.accessToken as string, userId),
    onSuccess: (data) => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Optionally prefetch the new conversation's messages
      if (data.conversation_id) {
        queryClient.prefetchQuery({
          queryKey: ['messages', data.conversation_id],
          queryFn: () => fetchMessages(session?.user?.accessToken as string, data.conversation_id),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to start conversation:', error);
    }
  });
};

// Hook to get conversation participants
export const useConversationParticipants = (conversationId?: number) => {
  const { data: session, status } = useSession();

  return useQuery<ParticipantsResponse, Error>({
    queryKey: ['conversationParticipants', conversationId, session?.user?.accessToken],
    queryFn: () => fetchConversationParticipants(session?.user?.accessToken as string, conversationId!),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Hook to delete conversation
export const useDeleteConversation = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (conversationId: number) => deleteConversation(session?.user?.accessToken as string, conversationId),
    onSuccess: (data, conversationId) => {
      // Remove conversation from cache
      queryClient.setQueryData(['conversations'], (oldData: Conversation[] | undefined) => 
        oldData?.filter(conv => conv.id !== conversationId) || []
      );
      
      // Remove messages from cache
      queryClient.removeQueries({ queryKey: ['messages', conversationId] });
      
      console.log('Conversation deleted successfully:', data.message);
    },
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
    }
  });
};

// Hook to search conversations
export const useSearchConversations = (query: string) => {
  const { data: session, status } = useSession();

  return useQuery<Conversation[], Error>({
    queryKey: ['searchConversations', query, session?.user?.accessToken],
    queryFn: () => searchConversations(session?.user?.accessToken as string, query),
    enabled: status === 'authenticated' && !!session?.user?.accessToken && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
