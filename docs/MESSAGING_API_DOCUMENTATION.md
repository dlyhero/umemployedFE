# Messaging System API Documentation

## Overview
The messaging system provides real-time chat functionality with support for conversations, message reactions, file attachments, typing indicators, and more. It uses both REST API endpoints and WebSocket connections for real-time communication.

## Base URL
```
https://server.umemployed.com/api/messages/
```

## Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer {jwt_token}
```

---

## 📋 REST API Endpoints

### 1. **Conversation Management**

#### **GET /conversations/**
Fetch all conversations for the authenticated user.

**Full URL:** `https://server.umemployed.com/api/messages/conversations/`

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "participant1": 1,
        "participant2": 2,
        "participant1_username": "john_doe",
        "participant2_username": "jane_doe",
        "participant1_full_name": "John Doe",
        "participant2_full_name": "Jane Doe",
        "created_at": "2025-09-25T10:00:00Z",
        "updated_at": "2025-09-25T15:30:00Z",
        "last_message": {
            "id": 45,
            "text": "Hey, how are you?",
            "sender_username": "jane_doe",
            "timestamp": "2025-09-25T15:30:00Z",
            "message_type": "text",
            "is_read": false
        },
        "unread_count": 3,
        "other_participant": {
            "id": 2,
            "username": "jane_doe",
            "full_name": "Jane Doe",
            "email": "jane@example.com"
        },
        "is_archived": false
    }
]
```

#### **POST /conversations/start/**
Start a new conversation with another user.

**Full URL:** `https://server.umemployed.com/api/messages/conversations/start/`

**Request Body:**
```json
{
    "user_id": 2
}
```

**Response (201 Created - New conversation):**
```json
{
    "conversation_id": 1,
    "conversation": {
        "id": 1,
        "participant1": 1,
        "participant2": 2,
        "other_participant": {
            "id": 2,
            "username": "jane_doe",
            "full_name": "Jane Doe",
            "email": "jane@example.com"
        },
        "created_at": "2025-09-25T10:00:00Z",
        "is_archived": false
    },
    "created": true,
    "message": "Conversation started successfully"
}
```

**Response (200 OK - Existing conversation):**
```json
{
    "conversation_id": 1,
    "conversation": { /* same as above */ },
    "created": false,
    "message": "Existing conversation found"
}
```

#### **GET /conversations/{conversation_id}/participants/**
Get participants information for a conversation.

**Response (200 OK):**
```json
{
    "conversation_id": 1,
    "participants": [
        {
            "id": 1,
            "username": "john_doe",
            "full_name": "John Doe",
            "email": "john@example.com",
            "is_current_user": true
        },
        {
            "id": 2,
            "username": "jane_doe",
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "is_current_user": false
        }
    ],
    "other_participant": {
        "id": 2,
        "username": "jane_doe",
        "full_name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

#### **DELETE /conversations/{conversation_id}/delete/**
Delete a conversation permanently.

**Response (200 OK):**
```json
{
    "message": "Conversation deleted successfully."
}
```

---

### 2. **Message Management**

#### **GET /conversations/{conversation_id}/messages/**
Fetch all messages in a conversation.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "conversation": 1,
        "sender": 1,
        "sender_username": "john_doe",
        "sender_full_name": "John Doe",
        "text": "Hello! How are you doing?",
        "message_type": "text",
        "attachment": null,
        "attachment_filename": null,
        "attachment_url": null,
        "timestamp": "2025-09-25T10:00:00Z",
        "updated_at": "2025-09-25T10:00:00Z",
        "is_read": true,
        "read_at": "2025-09-25T10:05:00Z",
        "status": "read",
        "reply_to": null,
        "is_edited": false,
        "is_deleted": false,
        "reactions": [
            {
                "id": 1,
                "user": 2,
                "username": "jane_doe",
                "user_full_name": "Jane Doe",
                "reaction": "like",
                "reaction_emoji": "👍",
                "created_at": "2025-09-25T10:02:00Z"
            }
        ],
        "delivery_status": [
            {
                "user": 2,
                "username": "jane_doe",
                "delivered_at": "2025-09-25T10:00:01Z",
                "read_at": "2025-09-25T10:05:00Z"
            }
        ],
        "replies_count": 0,
        "reaction_summary": {
            "like": {
                "count": 1,
                "users": [
                    {
                        "id": 2,
                        "username": "jane_doe"
                    }
                ],
                "emoji": "👍"
            }
        }
    }
]
```

#### **POST /conversations/{conversation_id}/messages/**
Send a new message in a conversation.

**Request Body (Text Message):**
```json
{
    "text": "Hello! How are you?",
    "message_type": "text"
}
```

**Request Body (Reply to Message):**
```json
{
    "text": "I'm doing great, thanks!",
    "message_type": "text",
    "reply_to_id": 5
}
```

**Request Body (File/Image Upload):**
```json
{
    "text": "Check out this file",
    "message_type": "file",
    "attachment": "base64_encoded_file_or_file_object"
}
```

**Response (201 Created):**
```json
{
    "id": 2,
    "conversation": 1,
    "sender": 1,
    "sender_username": "john_doe",
    "sender_full_name": "John Doe",
    "text": "Hello! How are you?",
    "message_type": "text",
    "timestamp": "2025-09-25T10:00:00Z",
    "is_read": false,
    "status": "sent",
    "reactions": [],
    "reply_to": null
}
```

#### **PUT /messages/{message_id}/update/**
Update/edit a message (only sender can edit).

**Request Body:**
```json
{
    "text": "Updated message text"
}
```

**Response (200 OK):**
```json
{
    "id": 2,
    "text": "Updated message text",
    "is_edited": true,
    "updated_at": "2025-09-25T10:30:00Z"
}
```

#### **DELETE /messages/{message_id}/delete/**
Delete a message (only sender can delete).

**Response (200 OK):**
```json
{
    "message": "Message deleted successfully."
}
```

#### **POST /conversations/{conversation_id}/bulk-delete/**
Delete multiple messages at once.

**Request Body:**
```json
{
    "message_ids": [1, 2, 3, 4]
}
```

**Response (200 OK):**
```json
{
    "message": "4 messages deleted successfully."
}
```

---

### 3. **Message Actions**

#### **POST /messages/{message_id}/reactions/**
Add a reaction to a message.

**Request Body:**
```json
{
    "reaction": "like"
}
```
**Available reactions:** `like`, `love`, `laugh`, `wow`, `sad`, `angry`

**Response (201 Created):**
```json
{
    "message": "Reaction added successfully."
}
```

#### **DELETE /messages/{message_id}/reactions/**
Remove a reaction from a message.

**Request Body:**
```json
{
    "reaction": "like"
}
```

**Response (200 OK):**
```json
{
    "message": "Reaction removed successfully."
}
```

#### **POST /conversations/{conversation_id}/mark-read/**
Mark all unread messages in a conversation as read.

**Response (200 OK):**
```json
{
    "message": "Messages marked as read."
}
```

---

### 4. **Search & Discovery**

#### **GET /search-inbox/?query={search_term}**
Search conversations by participant name.

**Query Parameters:**
- `query` (required): Search term to filter conversations

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "participant1_username": "john_doe",
        "participant2_username": "jane_doe",
        "other_participant": {
            "id": 2,
            "username": "jane_doe",
            "full_name": "Jane Doe"
        },
        "last_message": {
            "text": "Hey there!",
            "timestamp": "2025-09-25T15:30:00Z"
        }
    }
]
```

---

## 🔌 WebSocket Connection

### **Connection URL:**
```
wss://server.umemployed.com/ws/chat/{conversation_id}/
```

### **Authentication:**
Include JWT token in query parameters:
```
wss://server.umemployed.com/ws/chat/{conversation_id}/?token={jwt_token}
```

### **WebSocket Events:**

#### **Incoming Events (from server):**

**1. New Message Received:**
```json
{
    "type": "chat_message",
    "message": {
        "id": 45,
        "sender": 2,
        "sender_username": "jane_doe",
        "text": "Hello there!",
        "timestamp": "2025-09-25T15:30:00Z",
        "message_type": "text",
        "reply_to": null,
        "reactions": []
    }
}
```

**2. Message Status Update:**
```json
{
    "type": "message_status",
    "message_id": 45,
    "status": "delivered",
    "user_id": 2,
    "timestamp": "2025-09-25T15:30:01Z"
}
```

**3. Message Read Receipt:**
```json
{
    "type": "message_read",
    "message_id": 45,
    "user_id": 2,
    "read_at": "2025-09-25T15:35:00Z"
}
```

**4. Typing Indicator:**
```json
{
    "type": "typing_indicator",
    "user_id": 2,
    "username": "jane_doe",
    "is_typing": true
}
```

**5. User Online Status:**
```json
{
    "type": "user_status",
    "user_id": 2,
    "username": "jane_doe",
    "status": "online"
}
```

**6. Reaction Added:**
```json
{
    "type": "reaction_added",
    "message_id": 45,
    "reaction": {
        "user_id": 2,
        "username": "jane_doe",
        "reaction": "like",
        "emoji": "👍"
    }
}
```

#### **Outgoing Events (to server):**

**1. Send Message:**
```json
{
    "type": "chat_message",
    "text": "Hello there!",
    "message_type": "text",
    "reply_to_id": null
}
```

**2. Typing Indicator:**
```json
{
    "type": "typing_indicator",
    "is_typing": true
}
```

**3. Mark Messages as Read:**
```json
{
    "type": "mark_read",
    "message_ids": [45, 46, 47]
}
```

**4. Add Reaction:**
```json
{
    "type": "add_reaction",
    "message_id": 45,
    "reaction": "like"
}
```

---

## 🎯 Implementation Guide for Next.js

### **1. WebSocket Hook Example:**

```javascript
// hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';

const useWebSocket = (conversationId, token) => {
    const ws = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!conversationId || !token) return;

        const wsUrl = `wss://server.umemployed.com/ws/chat/${conversationId}/?token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket connected');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');
        };

        return () => {
            ws.current?.close();
        };
    }, [conversationId, token]);

    const sendMessage = (messageData) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(messageData));
        }
    };

    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'chat_message':
                setMessages(prev => [...prev, data.message]);
                break;
            case 'typing_indicator':
                // Handle typing indicator
                break;
            case 'message_read':
                // Update message read status
                break;
            // Handle other event types
        }
    };

    return { isConnected, messages, sendMessage };
};
```

### **2. Message Component Structure:**

```javascript
// Message display structure
const MessageComponent = ({ message, currentUserId }) => {
    const isOwnMessage = message.sender === currentUserId;
    
    return (
        <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
            <div className="message-content">
                {message.reply_to && (
                    <div className="reply-to">
                        Replying to: {message.reply_to.text}
                    </div>
                )}
                <div className="text">{message.text}</div>
                {message.attachment_url && (
                    <div className="attachment">
                        <a href={message.attachment_url} target="_blank">
                            {message.attachment_filename}
                        </a>
                    </div>
                )}
            </div>
            <div className="message-meta">
                <span className="timestamp">
                    {formatTimestamp(message.timestamp)}
                </span>
                <span className="status">{message.status}</span>
            </div>
            <div className="reactions">
                {Object.entries(message.reaction_summary || {}).map(([type, data]) => (
                    <span key={type} className="reaction">
                        {data.emoji} {data.count}
                    </span>
                ))}
            </div>
        </div>
    );
};
```

### **3. API Service Functions:**

```javascript
// services/messagingAPI.js
const BASE_URL = 'https://server.umemployed.com/api/messages';

export const messagingAPI = {
    // Get conversations
    getConversations: async (token) => {
        const response = await fetch(`${BASE_URL}/conversations/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    // Start conversation
    startConversation: async (userId, token) => {
        const response = await fetch(`${BASE_URL}/conversations/start/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });
        return response.json();
    },

    // Get messages
    getMessages: async (conversationId, token) => {
        const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    // Send message
    sendMessage: async (conversationId, messageData, token) => {
        const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        return response.json();
    },

    // Add reaction
    addReaction: async (messageId, reaction, token) => {
        const response = await fetch(`${BASE_URL}/messages/${messageId}/reactions/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reaction })
        });
        return response.json();
    },

    // Mark messages as read
    markAsRead: async (conversationId, token) => {
        const response = await fetch(`${BASE_URL}/conversations/${conversationId}/mark-read/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
};
```

---

## 📱 Key Features

### **Message Types:**
- `text` - Regular text messages
- `image` - Image attachments  
- `file` - File attachments
- `system` - System messages

### **Message Status:**
- `sent` - Message sent successfully
- `delivered` - Message delivered to recipient
- `read` - Message read by recipient
- `failed` - Message failed to send

### **Reaction Types:**
- `like` (👍), `love` (❤️), `laugh` (😂), `wow` (😮), `sad` (😢), `angry` (😠)

### **Real-time Features:**
- ✅ Live message delivery
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message reactions
- ✅ Online status
- ✅ Message replies

### **File Support:**
- Images, documents, and other file types
- Automatic file URL generation
- Original filename preservation

---

## 🔧 Error Handling

### **Common Error Responses:**

**400 Bad Request:**
```json
{
    "error": "Message text is required.",
    "detail": "Request validation failed"
}
```

**403 Forbidden:**
```json
{
    "error": "Unauthorized",
    "detail": "You don't have permission to access this conversation"
}
```

**404 Not Found:**
```json
{
    "error": "Conversation not found",
    "detail": "No conversation found with the given ID"
}
```

---

This messaging system provides a complete real-time chat experience with all modern messaging features. The frontend team can use this documentation to implement a fully functional messaging interface with Next.js! 🚀