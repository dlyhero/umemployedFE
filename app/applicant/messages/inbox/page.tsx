"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useConversations, useSearchConversations } from '@/hooks/messaging/useConversations';
import { useMessages, useSendMessage, useAddReaction, useRemoveReaction, useUpdateMessage, useDeleteMessage } from '@/hooks/messaging/useMessages';
import { useWebSocket } from '@/hooks/messaging/useWebSocket';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface InboxProps {
    userType?: 'applicant' | 'company';
}

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Message</h3>
                            <p className="text-sm text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <p className="text-base text-gray-700">
                        Are you sure you want to delete this message? This action cannot be reversed.
                    </p>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {isDeleting ? (
                            <>
                                <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                <span>Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Edit Message Modal Component
const EditMessageModal = ({
    isOpen,
    onClose,
    message,
    editText,
    setEditText,
    onSave,
    onCancel,
    isSaving
}: {
    isOpen: boolean;
    onClose: () => void;
    message: any;
    editText: string;
    setEditText: (text: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icon icon="heroicons:pencil-16-solid" className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Edit Message</h3>
                            <p className="text-sm text-gray-600">Update your message text</p>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand resize-none text-base"
                        autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        {editText.length}/1000 characters
                    </p>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving || !editText.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand border border-transparent rounded-full hover:bg-brand3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {isSaving ? (
                            <>
                                <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Inbox({ userType = 'applicant' }: InboxProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [activeCategory, setActiveCategory] = useState<'read' | 'unread' | 'primary'>('read');
    const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [replyToMessage, setReplyToMessage] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
    const [editingMessage, setEditingMessage] = useState<any>(null);
    const [editText, setEditText] = useState('');
    const [showMessageMenu, setShowMessageMenu] = useState<number | null>(null);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

    // Get conversation ID from URL params
    const conversationId = searchParams.get('conversation');

    // Fetch conversations
    const {
        data: conversations = [],
        isLoading: conversationsLoading,
        error: conversationsError
    } = useConversations();

    // Search conversations
    const {
        data: searchResults = [],
        isLoading: searchLoading
    } = useSearchConversations(searchQuery);

    // Get messages for selected conversation
    const {
        data: messages = [],
        isLoading: messagesLoading
    } = useMessages(selectedMessage || undefined);

    // Send message mutation
    const sendMessageMutation = useSendMessage();
    const addReactionMutation = useAddReaction();
    const removeReactionMutation = useRemoveReaction();
    const updateMessageMutation = useUpdateMessage();
    const deleteMessageMutation = useDeleteMessage();

    // WebSocket connection for real-time updates
    const {
        isConnected,
        connectionError,
        setOnMessage,
        setOnTyping,
        setOnUserStatus
    } = useWebSocket(selectedMessage || undefined);

    // Set selected conversation from URL or first conversation
    useEffect(() => {
        if (conversationId) {
            setSelectedMessage(parseInt(conversationId));
        } else if (conversations.length > 0 && !selectedMessage) {
            setSelectedMessage(conversations[0].id);
        }
    }, [conversationId, conversations, selectedMessage]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showMessageMenu !== null && !target.closest('.message-menu')) {
                setShowMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMessageMenu]);

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearching(query.length > 0);
    };

    // Filter conversations based on active category
    const filteredConversations = isSearching ? searchResults : conversations.filter(conv => {
        switch (activeCategory) {
            case 'unread':
                return conv.unread_count > 0;
            case 'primary':
                return !conv.is_archived;
            default:
                return true;
        }
    });

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Get display name for conversation
    const getConversationDisplayName = (conversation: any) => {
        console.log('Conversation data:', conversation);

        if (conversation.other_participant?.full_name) {
            return conversation.other_participant.full_name;
        }
        if (conversation.other_participant?.username) {
            return conversation.other_participant.username;
        }
        if (conversation.participant1_full_name && conversation.participant2_full_name) {
            const currentUserId = parseInt(session?.user?.id || '0');
            if (conversation.participant1 === currentUserId) {
                return conversation.participant2_full_name;
            } else {
                return conversation.participant1_full_name;
            }
        }
        if (conversation.participant1_username && conversation.participant2_username) {
            const currentUserId = parseInt(session?.user?.id || '0');
            if (conversation.participant1 === currentUserId) {
                return conversation.participant2_username;
            } else {
                return conversation.participant1_username;
            }
        }
        return 'Unknown User';
    };

    // Get conversation preview
    const getConversationPreview = (conversation: any) => {
        if (conversation.last_message) {
            return conversation.last_message.text || 'No message content';
        }
        return 'No messages yet';
    };

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    // Handle sending reply
    const handleSendReply = async () => {
        if ((replyText.trim() || selectedFile) && selectedMessage) {
            try {
                setIsUploading(true);
                let messageData: any = {
                    text: replyText || '',
                    message_type: selectedFile ? 'file' : 'text'
                };

                if (selectedFile) {
                    const base64File = await fileToBase64(selectedFile);
                    messageData.attachment = base64File;
                    messageData.attachment_filename = selectedFile.name;

                    if (selectedFile.type.startsWith('image/')) {
                        messageData.message_type = 'image';
                    } else {
                        messageData.message_type = 'file';
                    }
                }

                if (replyToMessage) {
                    messageData.reply_to_id = replyToMessage.id;
                }

                await sendMessageMutation.mutateAsync({
                    conversationId: selectedMessage,
                    messageData
                });

                setReplyText('');
                setSelectedFile(null);
                setReplyToMessage(null);
            } catch (error) {
                console.error('Failed to send message:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Handle reply to message
    const handleReplyToMessage = (message: any) => {
        setReplyToMessage(message);
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.focus();
        }
    };

    // Handle typing indicator
    const handleTyping = (isTyping: boolean) => {
        setIsTyping(isTyping);
        if (selectedMessage && isConnected) {
            // WebSocket implementation would go here
        }
    };

    // Handle edit message with modal
    const handleEditMessage = (message: any) => {
        setEditingMessage(message);
        setEditText(message.text);
        setShowEditModal(true);
        setShowMessageMenu(null);
    };

    // Handle save edit with modal
    const handleSaveEdit = async () => {
        if (editingMessage && editText.trim()) {
            try {
                await updateMessageMutation.mutateAsync({
                    messageId: editingMessage.id,
                    messageData: {
                        text: editText
                    }
                });
                setShowEditModal(false);
                setEditingMessage(null);
                setEditText('');
            } catch (error) {
                console.error('Failed to update message:', error);
            }
        }
    };

    // Handle cancel edit with modal
    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingMessage(null);
        setEditText('');
    };

    // Handle delete message with modal
    const handleDeleteMessage = (messageId: number) => {
        setMessageToDelete(messageId);
        setShowDeleteModal(true);
        setShowMessageMenu(null);
    };

    // Confirm delete message
    const handleConfirmDelete = async () => {
        if (messageToDelete) {
            try {
                await deleteMessageMutation.mutateAsync(messageToDelete);
                setShowDeleteModal(false);
                setMessageToDelete(null);
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }
    };

    // Cancel delete message
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setMessageToDelete(null);
    };

    // Handle reaction
    const handleReaction = async (messageId: number, reaction: string) => {
        try {
            const message = messages.find(m => m.id === messageId);
            const hasReacted = message?.reactions?.some(r =>
                r.user === parseInt(session?.user?.id || '0') && r.reaction === reaction
            );

            if (hasReacted) {
                await removeReactionMutation.mutateAsync({
                    messageId,
                    reaction
                });
            } else {
                await addReactionMutation.mutateAsync({
                    messageId,
                    reaction
                });
            }
        } catch (error) {
            console.error('Failed to handle reaction:', error);
        }
    };

    // Get reaction emoji
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

    // Get selected conversation data
    const selectedConversation = conversations.find(c => c.id === selectedMessage);

    if (conversationsError) {
        return (
            <div className="min-h-screen p-6 mb-20 overflow-auto">
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="solar:danger-circle-bold-duotone" className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg  text-gray-900 mb-2">Error Loading Messages</h3>
                        <p className="text-gray-600">Failed to load your conversations. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-6 mb-20 overflow-auto ">
                <div className="container mx-auto">
                    <div className="p-4 flex items-center justify-between mb-6 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="text-3xl md:text-4xl dm-serif font-bold text-brand3">Messages</div>
                            {connectionError && (
                                <div className="flex items-center space-x-2 text-amber-600 text-base">
                                    <Icon icon="solar:warning-circle-bold-duotone" className="w-4 h-4" />
                                    <span>Real-time features unavailable</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 bg-white  rounded-4xl border border-white h-fit">
                        {/* Left Sidebar - Inbox */}
                        <div className="lg:col-span-1  lg:border-r border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className=' flex items-center justify-between mb-4'>
                                    <h2 className="text-lg font-semibold text-gray-900 ">Inbox</h2>
                                    <button className="bg-brand rounded-full w-6 h-6 flex items-center justify-center">
                                        <Icon icon="heroicons:plus-16-solid" className="text-white size-6" />
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative mb-4">
                                    <Icon
                                        icon="heroicons:magnifying-glass-16-solid"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-6"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search contacts"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand2"
                                    />
                                </div>

                                {/* Categories */}
                                <div className="flex space-x-4 mb-4">
                                    {(['read', 'unread', 'primary'] as const).map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className={`px-3 py-1 rounded-full text-base   capitalize ${activeCategory === category
                                                ? 'bg-blue-100 text-brand'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="divide-y divide-gray-200 max-h-96 lg:h-96 overflow-auto hide-scrollbar">
                                {conversationsLoading ? (
                                    <div className="p-4 text-center">
                                        <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        <p className="text-base  text-gray-500">Loading conversations...</p>
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Icon icon="solar:chat-round-dots-bold-duotone" className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-base  text-gray-500">
                                            {isSearching ? 'No conversations found' : 'No conversations yet'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => {
                                                setSelectedMessage(conversation.id);
                                                const basePath = userType === 'company' ? '/companies/messages' : '/applicant/messages/inbox';
                                                router.push(`${basePath}?conversation=${conversation.id}`);
                                            }}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedMessage === conversation.id
                                                ? 'bg-blue-50 border-r-4 border-blue-500'
                                                : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-brand">
                                                    {getConversationDisplayName(conversation)}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    {conversation.last_message && (
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimestamp(conversation.last_message.timestamp)}
                                                        </span>
                                                    )}
                                                    {conversation.unread_count > 0 && (
                                                        <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                                            {conversation.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className=" text-gray-800 mb-1">
                                                {conversation.last_message?.message_type === 'file' ? 'File attachment' : ''}
                                            </h3>
                                            <p className="text-[15px] poppins-thin text-gray-600 mb-2 line-clamp-2 text-lg md:base">
                                                {getConversationPreview(conversation)}
                                            </p>

                                            {conversation.last_message?.message_type === 'file' && (
                                                <div className="flex items-center space-x-1">
                                                    <Icon icon="heroicons:paper-clip-16-solid" className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">File attachment</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Side - Message Thread */}
                        <div className="lg:col-span-2 border-gray-200 h-fit">
                            {selectedMessage && selectedConversation ? (
                                <div className="p-6">
                                    {/* Message Header */}
                                    <div className="border-b border-gray-200 pb-4 mb-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {getConversationDisplayName(selectedConversation)}
                                                </h2>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="font-semibold text-gray-900">
                                                        {selectedConversation.other_participant?.username ||
                                                            selectedConversation.other_participant?.email ||
                                                            'User'}
                                                    </span>
                                                    {isConnected ? (
                                                        <div className="flex items-center space-x-1 text-green-600">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-xs">Online</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1 text-gray-500">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                            <span className="text-xs">Offline</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 hover:bg-gray-100 rounded-full">
                                                    <Icon icon="heroicons:ellipsis-vertical-16-solid" className="size-6 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="mb-6  max-h-96 lg:h-96 hide-scrollbar overflow-y-auto">
                                        {messagesLoading ? (
                                            <div className="text-center py-8">
                                                <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                <p className="text-base  text-gray-500">Loading messages...</p>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Icon icon="solar:chat-round-dots-bold-duotone" className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg  text-gray-900 mb-2">No Messages Yet</h3>
                                                <p className="text-gray-600">Start the conversation by sending a message below.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {messages.map((message) => {
                                                    const isOwnMessage = message.sender === parseInt(session?.user?.id || '0');
                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
                                                                {!isOwnMessage && (
                                                                    <p className="text-xs text-gray-500 mb-1 px-1">
                                                                        {message.sender_full_name || message.sender_username}
                                                                    </p>
                                                                )}

                                                                {/* Reply Reference */}
                                                                {message.reply_to && (
                                                                    <div className="mb-2 p-2 bg-gray-50 border-l-4 border-gray-300 rounded text-xs ">
                                                                        <p className="text-gray-600 ">Replying to:</p>
                                                                        <p className="text-gray-500 truncate">{message.reply_to.text}</p>
                                                                    </div>
                                                                )}

                                                                <div
                                                                    className={`px-4 py-2 rounded-lg ${isOwnMessage
                                                                        ? 'bg-brand text-white'
                                                                        : 'bg-gray-100 text-gray-900'
                                                                        }`}
                                                                >
                                                                    {/* Message Text */}
                                                                    {message.text && (
                                                                        <p className="text-base poppins-thin">{message.text}</p>
                                                                    )}

                                                                    {/* File Attachment */}
                                                                    {message.attachment_url && (
                                                                        <div className="mt-2">
                                                                            {message.message_type === 'image' ? (
                                                                                <img
                                                                                    src={message.attachment_url}
                                                                                    alt={message.attachment_filename || 'Attachment'}
                                                                                    className="max-w-full h-auto rounded cursor-pointer"
                                                                                    onClick={() => message.attachment_url && window.open(message.attachment_url, '_blank')}
                                                                                />
                                                                            ) : (
                                                                                <a
                                                                                    href={message.attachment_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center space-x-2 p-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
                                                                                >
                                                                                    <Icon icon="heroicons:document-16-solid" className="w-4 h-4" />
                                                                                    <span className="text-base truncate">{message.attachment_filename}</span>
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                                                        }`}>
                                                                        {isOwnMessage && 'You • '}
                                                                        {formatTimestamp(message.timestamp)}
                                                                        {message.is_edited && (
                                                                            <span className="ml-1 italic">(edited)</span>
                                                                        )}
                                                                        {isOwnMessage && (
                                                                            <span className="ml-2">
                                                                                {message.status === 'sent' && '✓'}
                                                                                {message.status === 'delivered' && '✓✓'}
                                                                                {message.status === 'read' && '✓✓'}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                {/* Reactions */}
                                                                {message.reaction_summary && Object.keys(message.reaction_summary).length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {Object.entries(message.reaction_summary).map(([reaction, data]: [string, any]) => (
                                                                            <button
                                                                                key={reaction}
                                                                                onClick={() => handleReaction(message.id, reaction)}
                                                                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${data.users.some((u: any) => u.id === parseInt(session?.user?.id || '0'))
                                                                                    ? 'bg-blue-100 text-blue-700'
                                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                                    }`}
                                                                            >
                                                                                <span>{data.emoji}</span>
                                                                                <span>{data.count}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Message Actions */}
                                                                <div className="mt-2 flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        {/* Reply Button */}
                                                                        <button
                                                                            onClick={() => handleReplyToMessage(message)}
                                                                            className="text-gray-400 hover:text-gray-600 text-base "
                                                                            title="Reply"
                                                                        >
                                                                            <Icon icon="quill:reply" className='size-7' />
                                                                        </button>

                                                                        {/* Reaction Button */}
                                                                        <button
                                                                            onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                                                                            className="text-gray-400 hover:text-gray-600 text-base"
                                                                            title="React"
                                                                        >
                                                                            <Icon icon="solar:emoji-smile-circle-line-duotone" className="w-4 h-4" />
                                                                        </button>

                                                                        {/* Reaction Picker */}
                                                                        {showReactionPicker === message.id && (
                                                                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                                                                                {['like', 'love', 'laugh', 'wow', 'sad', 'angry'].map((reaction) => (
                                                                                    <button
                                                                                        key={reaction}
                                                                                        onClick={() => {
                                                                                            handleReaction(message.id, reaction);
                                                                                            setShowReactionPicker(null);
                                                                                        }}
                                                                                        className="p-1 hover:bg-gray-100 rounded text-lg"
                                                                                        title={reaction}
                                                                                    >
                                                                                        {getReactionEmoji(reaction)}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Message Menu (only for own messages) */}
                                                                    {isOwnMessage && (
                                                                        <div className="relative message-menu">
                                                                            {/* <button
                                                                                onClick={() => setShowMessageMenu(showMessageMenu === message.id ? null : message.id)}
                                                                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                                                                title="More options"
                                                                            >
                                                                                <Icon icon="heroicons:ellipsis-vertical-16-solid" className="w-4 h-4" />
                                                                            </button> */}
                                                                        <div className="flex gap-1 items-center">
                                                                                {/* Edit Option */}
                                                                            <button
                                                                                onClick={() => handleEditMessage(message)}
                                                                                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg "
                                                                            >
                                                                        <Icon icon="fluent:edit-20-regular" className='size-6' />
                                                                            </button>

                                                                            {/* Delete Option */}
                                                                            <button
                                                                                onClick={() => handleDeleteMessage(message.id)}
                                                                                disabled={deleteMessageMutation.isPending}
                                                                                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 last:rounded-b-lg border-t border-gray-100 text-red-600 disabled:opacity-50"
                                                                            >
                                                                                <Icon icon="solar:trash-bin-2-line-duotone" className='size-6'/>
                                                                            
                                                                            </button>
                                                                        </div>

                                                                            {/* WhatsApp-style Menu Dropdown */}
                                                                            {showMessageMenu === message.id && (
                                                                                <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px] z-20">
                                                                                    {/* Edit Option */}
                                                                                    <button
                                                                                        onClick={() => handleEditMessage(message)}
                                                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg"
                                                                                    >
                                                                                        <Icon icon="heroicons:pencil-16-solid" className="w-4 h-4 text-gray-600" />
                                                                                        <span className="text-sm text-gray-700">Edit</span>
                                                                                    </button>

                                                                                    {/* Delete Option */}
                                                                                    <button
                                                                                        onClick={() => handleDeleteMessage(message.id)}
                                                                                        disabled={deleteMessageMutation.isPending}
                                                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 last:rounded-b-lg border-t border-gray-100 text-red-600 disabled:opacity-50"
                                                                                    >
                                                                                        <Icon icon="heroicons:trash-16-solid" className="w-4 h-4" />
                                                                                        <span className="text-sm">
                                                                                            Delete
                                                                                        </span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Typing Indicator */}
                                    {typingUsers.size > 0 && (
                                        <div className="px-4 py-2 text-base text-gray-500 italic">
                                            {Array.from(typingUsers).map(userId => {
                                                const user = selectedConversation?.other_participant;
                                                return user?.id === userId ? user.full_name || user.username : 'Someone';
                                            }).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                                        </div>
                                    )}

                                    {/* Reply Section */}
                                    <div className="border-t pt-6">
                                        <div className="flex items-center space-x-2 mb-4 text-base">
                                            <span className="text-gray-600">To</span>
                                            <span className="text-brand">
                                                {getConversationDisplayName(selectedConversation)}
                                            </span>
                                        </div>

                                        {/* Reply Reference Display */}
                                        {replyToMessage && (
                                            <div className="mb-4 p-3 bg-gray-50 border-l-4 border-brand rounded w-full">
                                                <div className="flex items-center justify-between w-ful">
                                                    <div className='w-full'>
                                                        <p className="text-xs text-gray-600 ">Replying to:</p>
                                                        <p className="text-base text-wrap w-full  text-gray-800 line-clamp-3">{replyToMessage.text}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setReplyToMessage(null)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Icon icon="heroicons:x-mark-16-solid" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* File Preview */}
                                        {selectedFile && (
                                            <div className="mb-4 p-3 bg-gray-50 border rounded">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="heroicons:document-16-solid" className="w-4 h-4 text-gray-600" />
                                                        <span className="text-base  text-gray-800">{selectedFile.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedFile(null)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Icon icon="heroicons:x-mark-16-solid" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border border-gray-300 rounded-lg">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => {
                                                    setReplyText(e.target.value);
                                                    handleTyping(e.target.value.length > 0);
                                                }}
                                                placeholder={replyToMessage ? "Type your reply..." : "Type a message..."}
                                                className="w-full h-24 p-4 focus:outline-none resize-none text-base  bg-transparent"
                                            />

                                            <div className="flex justify-between items-center p-3 border-t border-gray-300">
                                                <div className="flex items-center space-x-2">
                                                    {/* File Upload Button */}
                                                    <label className="p-1 hover:bg-gray-200 rounded cursor-pointer">
                                                        <Icon icon="heroicons:paper-clip-16-solid" className="size-6 text-gray-600" />
                                                        <input
                                                            type="file"
                                                            onChange={handleFileSelect}
                                                            className="hidden"
                                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                                        />
                                                    </label>

                                                    <button className="p-1 hover:bg-gray-200 rounded">
                                                        <Icon icon="heroicons:face-smile-16-solid" className="size-6 text-gray-600" />
                                                    </button>

                                                    {/* Clear Reply Button */}
                                                    {replyToMessage && (
                                                        <button
                                                            onClick={() => setReplyToMessage(null)}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                            title="Clear reply"
                                                        >
                                                            <Icon icon="heroicons:arrow-uturn-left-16-solid" className="size-6 text-gray-600" />
                                                            <Icon icon="quill:reply" width="32" height="32" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleSendReply}
                                                    disabled={sendMessageMutation.isPending || isUploading || (!replyText.trim() && !selectedFile)}
                                                    className="bg-brand text-white px-6 py-2.5 rounded-full hover:bg-brand3 transition-colors text-base  disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {(sendMessageMutation.isPending || isUploading) ? (
                                                        <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        'Send'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden p-6 text-center lg:min-h-screen lg:flex flex-col justify-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon icon="solar:chat-round-dots-bold-duotone" className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg  text-gray-900 mb-2">Select a Conversation</h3>
                                    <p className="text-gray-600">Choose a conversation from the sidebar to start messaging.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMessageMutation.isPending}
            />

            {/* Edit Message Modal */}
            <EditMessageModal
                isOpen={showEditModal}
                onClose={handleCancelEdit}
                message={editingMessage}
                editText={editText}
                setEditText={setEditText}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                isSaving={updateMessageMutation.isPending}
            />
        </>
    );
}