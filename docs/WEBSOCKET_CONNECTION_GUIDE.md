# WebSocket Connection Guide

## Overview
The UmEmployed platform provides real-time communication through WebSocket connections for chat messaging and notifications. This guide covers all WebSocket endpoints, authentication, and implementation details.

## Available WebSocket Endpoints

### 1. Chat/Messaging WebSocket
**Path:** `ws://localhost:8000/ws/chat/{conversation_id}/`

**Purpose:** Real-time messaging between users in a conversation

**URL Parameters:**
- `conversation_id` (integer): The ID of the conversation to connect to

### 2. Notifications WebSocket  
**Path:** `ws://localhost:8000/ws/notifications/{user_id}/`

**Purpose:** Real-time notifications for user activities

**URL Parameters:**
- `user_id` (integer): The ID of the user to receive notifications for

---

## Authentication

Both WebSocket endpoints require JWT authentication. The JWT token must be included in the connection request.

### Method 1: Query Parameter (Recommended)
```javascript
const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${jwtToken}`;
const websocket = new WebSocket(wsUrl);
```

### Method 2: WebSocket Headers (if supported by client)
```javascript
const websocket = new WebSocket(wsUrl, [], {
    headers: {
        'Authorization': `Bearer ${jwtToken}`
    }
});
```

---

## Chat WebSocket Implementation

### Connection Example
```javascript
const connectToChatWebSocket = (conversationId, jwtToken) => {
    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${jwtToken}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
        console.log('Chat WebSocket connected');
    };
    
    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleChatMessage(data);
    };
    
    websocket.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
    };
    
    websocket.onclose = (event) => {
        console.log('Chat WebSocket closed:', event.code, event.reason);
        // Implement reconnection logic here
    };
    
    return websocket;
};
```

### Sending Messages
```javascript
const sendMessage = (websocket, messageData) => {
    const payload = {
        type: 'chat_message',
        message: messageData.message,
        message_type: messageData.type || 'text',
        // Add other message properties as needed
    };
    
    websocket.send(JSON.stringify(payload));
};
```

### Incoming Message Types
The chat WebSocket receives various message types:

#### New Message
```json
{
    "type": "chat_message",
    "message": {
        "id": 123,
        "content": "Hello there!",
        "sender": {
            "id": 456,
            "first_name": "John",
            "last_name": "Doe"
        },
        "timestamp": "2025-09-24T10:30:00Z",
        "message_type": "text"
    }
}
```

#### Typing Indicator
```json
{
    "type": "typing_indicator",
    "user": {
        "id": 456,
        "first_name": "John",
        "last_name": "Doe"
    },
    "is_typing": true
}
```

#### User Status Update
```json
{
    "type": "user_status",
    "user_id": 456,
    "status": "online"
}
```

#### Message Read Receipt
```json
{
    "type": "message_read",
    "message_id": 123,
    "read_by": {
        "id": 456,
        "first_name": "John",
        "last_name": "Doe"
    },
    "read_at": "2025-09-24T10:35:00Z"
}
```

### Chat Features Supported
- Real-time messaging
- Typing indicators
- Message read receipts
- User online/offline status
- File attachments
- Message reactions
- Message replies
- Message editing
- Message deletion

---

## Notifications WebSocket Implementation

### Connection Example
```javascript
const connectToNotificationsWebSocket = (userId, jwtToken) => {
    const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/?token=${jwtToken}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
        console.log('Notifications WebSocket connected');
    };
    
    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleNotification(data);
    };
    
    websocket.onerror = (error) => {
        console.error('Notifications WebSocket error:', error);
    };
    
    websocket.onclose = (event) => {
        console.log('Notifications WebSocket closed:', event.code, event.reason);
        // Implement reconnection logic here
    };
    
    return websocket;
};
```

### Incoming Notification Types
```json
{
    "type": "notification",
    "notification": {
        "id": 789,
        "title": "New Message",
        "message": "You have a new message from John Doe",
        "notification_type": "message",
        "timestamp": "2025-09-24T10:30:00Z",
        "is_read": false,
        "data": {
            "conversation_id": 123,
            "sender_id": 456
        }
    }
}
```

---

## Connection Validation

### Chat WebSocket Validation
The chat WebSocket validates:
1. **User Authentication**: JWT token must be valid
2. **Conversation Access**: User must be a participant in the conversation
3. **Conversation Existence**: Conversation must exist in the database

### Notifications WebSocket Validation
The notifications WebSocket validates:
1. **User Authentication**: JWT token must be valid
2. **User ID Match**: The user_id in the URL must match the authenticated user

---

## Environment-Specific URLs

### Development
```javascript
const CHAT_WS_BASE = 'ws://localhost:8000/ws/chat/';
const NOTIFICATIONS_WS_BASE = 'ws://localhost:8000/ws/notifications/';
```

### Production (HTTPS)
```javascript
const CHAT_WS_BASE = 'wss://yourdomain.com/ws/chat/';
const NOTIFICATIONS_WS_BASE = 'wss://yourdomain.com/ws/notifications/';
```

---

## Error Handling & Reconnection

### Connection Error Handling
```javascript
const connectWithRetry = (wsUrl, maxRetries = 5, retryDelay = 1000) => {
    let retryCount = 0;
    
    const connect = () => {
        const websocket = new WebSocket(wsUrl);
        
        websocket.onopen = () => {
            console.log('WebSocket connected');
            retryCount = 0; // Reset retry count on successful connection
        };
        
        websocket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying connection... Attempt ${retryCount}/${maxRetries}`);
                setTimeout(connect, retryDelay * retryCount); // Exponential backoff
            } else {
                console.error('Max reconnection attempts reached');
            }
        };
        
        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        return websocket;
    };
    
    return connect();
};
```

### Common Error Scenarios

#### Authentication Errors
- **Invalid JWT Token**: WebSocket will close with code 4001
- **Expired JWT Token**: WebSocket will close with code 4002
- **Missing JWT Token**: WebSocket will close with code 4003

#### Access Denied Errors
- **No Conversation Access**: WebSocket will close with code 4004
- **User ID Mismatch**: WebSocket will close with code 4005

#### Connection Errors
- **Server Unavailable**: Connection will fail to establish
- **Network Issues**: Connection may drop unexpectedly

---

## React Hook Example

### useWebSocket Hook
```javascript
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url, onMessage, shouldConnect = true) => {
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastMessage, setLastMessage] = useState(null);
    const websocketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    
    const connect = () => {
        if (!shouldConnect || !url) return;
        
        try {
            websocketRef.current = new WebSocket(url);
            
            websocketRef.current.onopen = () => {
                setConnectionStatus('Connected');
                console.log('WebSocket connected');
            };
            
            websocketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setLastMessage(data);
                onMessage?.(data);
            };
            
            websocketRef.current.onclose = (event) => {
                setConnectionStatus('Disconnected');
                console.log('WebSocket disconnected:', event.code, event.reason);
                
                // Attempt to reconnect after 3 seconds
                if (shouldConnect) {
                    reconnectTimeoutRef.current = setTimeout(connect, 3000);
                }
            };
            
            websocketRef.current.onerror = (error) => {
                setConnectionStatus('Error');
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionStatus('Error');
        }
    };
    
    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        
        if (websocketRef.current) {
            websocketRef.current.close();
            websocketRef.current = null;
        }
        
        setConnectionStatus('Disconnected');
    };
    
    const sendMessage = (message) => {
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected');
        }
    };
    
    useEffect(() => {
        if (shouldConnect) {
            connect();
        } else {
            disconnect();
        }
        
        return () => {
            disconnect();
        };
    }, [url, shouldConnect]);
    
    return {
        connectionStatus,
        lastMessage,
        sendMessage,
        connect,
        disconnect
    };
};
```

### Usage Example
```javascript
import { useWebSocket } from './hooks/useWebSocket';

const ChatComponent = ({ conversationId, jwtToken }) => {
    const chatWsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${jwtToken}`;
    
    const { connectionStatus, sendMessage } = useWebSocket(
        chatWsUrl,
        (message) => {
            console.log('Received message:', message);
            // Handle incoming messages
        },
        !!conversationId && !!jwtToken
    );
    
    const handleSendMessage = (messageText) => {
        sendMessage({
            type: 'chat_message',
            message: messageText,
            message_type: 'text'
        });
    };
    
    return (
        <div>
            <div>Connection Status: {connectionStatus}</div>
            {/* Your chat UI here */}
        </div>
    );
};
```

---

## Debugging & Troubleshooting

### Enable WebSocket Logging
The Django backend has detailed logging for WebSocket connections. Check the server logs for:
- Connection attempts
- Authentication failures
- Access denied errors
- Message sending/receiving

### Browser Developer Tools
1. Open **Network** tab in Developer Tools
2. Filter by **WS** (WebSocket) connections
3. Click on the WebSocket connection to see:
   - Connection status
   - Messages sent/received
   - Close codes and reasons

### Common Issues & Solutions

#### 1. Connection Refused
**Problem**: `WebSocket connection to 'ws://localhost:8000/...' failed`
**Solution**: Ensure Django server is running with WebSocket support (using Daphne/Uvicorn)

#### 2. Authentication Failed
**Problem**: WebSocket closes immediately after connection
**Solution**: Verify JWT token is valid and properly formatted in the URL

#### 3. Access Denied
**Problem**: WebSocket closes with 4004 code
**Solution**: Ensure user has access to the conversation/notification channel

#### 4. Intermittent Disconnections
**Problem**: WebSocket disconnects randomly
**Solution**: Implement reconnection logic with exponential backoff

---

## Production Considerations

### SSL/TLS (WSS)
For production deployments with HTTPS, use WSS instead of WS:
```javascript
const wsUrl = `wss://yourdomain.com/ws/chat/${conversationId}/?token=${jwtToken}`;
```

### Load Balancing
When using multiple server instances, ensure:
- Sticky sessions are configured
- Redis is properly configured for channel layers
- WebSocket connections are properly distributed

### Monitoring
Monitor WebSocket connections for:
- Connection success/failure rates
- Message delivery rates
- Connection duration
- Reconnection frequency

---

## Security Considerations

1. **JWT Token Expiry**: Handle token refresh for long-lived connections
2. **Rate Limiting**: Implement client-side message rate limiting
3. **Data Validation**: Validate all incoming WebSocket messages
4. **Connection Limits**: Implement reasonable connection limits per user
5. **CORS Configuration**: Properly configure CORS for WebSocket connections

---

## Quick Reference

### WebSocket URLs
| Service | Development URL | Production URL |
|---------|----------------|----------------|
| Chat | `ws://localhost:8000/ws/chat/{conversation_id}/` | `wss://domain.com/ws/chat/{conversation_id}/` |
| Notifications | `ws://localhost:8000/ws/notifications/{user_id}/` | `wss://domain.com/ws/notifications/{user_id}/` |

### Authentication
- **Required**: JWT token in query parameter `?token={jwt_token}`
- **Format**: `Bearer {token}` format in Authorization header (if supported)

### Connection States
- **CONNECTING** (0): Connection is being established
- **OPEN** (1): Connection is open and ready to communicate
- **CLOSING** (2): Connection is in the process of closing
- **CLOSED** (3): Connection is closed

### Close Codes
- **1000**: Normal closure
- **4001**: Invalid JWT token
- **4002**: Expired JWT token
- **4003**: Missing JWT token
- **4004**: Access denied
- **4005**: User ID mismatch

This documentation provides everything needed to implement WebSocket functionality in your frontend application.
