// WebSocket Service - Refactored to match our architecture
// Converted from the provided WebSocket service code

// Types
export interface WebSocketMessage {
  type: string;
  data?: any;
  notification_type?: string;
  enhancement_id?: string;
  job_id?: number;
  user_id?: number;
  message?: string;
  error_code?: string;
  progress?: number;
  stage?: string;
}

export interface WebSocketConnectionStatus {
  status: 'connected' | 'disconnected' | 'failed' | 'connecting';
  code?: number;
  error?: any;
}

export interface WebSocketConfig {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private userId: string | null = null;
  private token: string | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting: boolean = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private config: WebSocketConfig;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      pingInterval: 30000,
      ...config,
    };
  }

  /**
   * Construct WebSocket URL based on environment
   */
  private constructWebSocketUrl(userId: string, token: string, taskId?: string): string {
    // Use environment variable for WebSocket URL or derive from API URL
    let baseUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (!baseUrl && process.env.NEXT_PUBLIC_API_URL) {
      // Convert API URL to WebSocket URL by removing /api suffix
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let domain = apiUrl;
      
      // Remove /api suffix if present
      if (domain.endsWith('/api')) {
        domain = domain.replace('/api', '');
      }
      
      if (domain.startsWith('https://')) {
        baseUrl = domain.replace('https://', 'wss://');
      } else if (domain.startsWith('http://')) {
        baseUrl = domain.replace('http://', 'ws://');
      } else {
        baseUrl = `wss://${domain}`;
      }
    }
    
    // Fallback for development
    if (!baseUrl) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      baseUrl = isDevelopment ? 'ws://localhost:8000' : 'wss://your-domain.com';
    }
    
    // Use enhancement-specific WebSocket endpoint if taskId is provided
    const wsUrl = taskId 
      ? `${baseUrl}/ws/enhancement/${taskId}/`
      : `${baseUrl}/ws/user/${userId}/`;

    // Add JWT token as query parameter
    if (token) {
      return `${wsUrl}?token=${encodeURIComponent(token)}`;
    }

    return wsUrl;
  }

  /**
   * Connect to WebSocket
   */
  connect(userId: string, token: string, taskId?: string): void {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    // Resume enhancement uses HTTP REST API polling, not WebSocket
    // WebSocket is only available for chat and notifications
    console.log("Resume enhancement uses HTTP polling, not WebSocket");
    this.notifyListeners('connection', { status: 'disconnected', error: 'Resume enhancement uses HTTP polling' });
    return;

    this.isConnecting = true;
    this.userId = userId;
    this.token = token;

    try {
      const wsUrl = this.constructWebSocketUrl(userId, token, taskId);

      console.log("WebSocket Configuration:");
      console.log("- NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("- NEXT_PUBLIC_WS_URL:", process.env.NEXT_PUBLIC_WS_URL);
      console.log("- Constructed WebSocket URL:", wsUrl.replace(/token=([^&]+)/, "token=***"));

      this.ws = new WebSocket(wsUrl);

      this.ws!.onopen = (event) => {
        console.log("WebSocket connected successfully");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = this.config.reconnectDelay || 1000;

        // Start ping interval to keep connection alive
        this.startPing();

        // Notify listeners of connection
        this.notifyListeners("connection", { status: "connected" });
      };

      this.ws!.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log("WebSocket message received:", data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws!.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        this.isConnecting = false;
        this.stopPing();

        // Notify listeners of disconnection
        this.notifyListeners("connection", {
          status: "disconnected",
          code: event.code,
        });

        // Attempt to reconnect if it wasn't a clean close
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
        ) {
          this.scheduleReconnect();
        }
      };

      this.ws!.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.notifyListeners("error", { error });
        
        // WebSocket not supported for resume enhancement
        console.log("WebSocket not supported for resume enhancement, using API polling");
        this.notifyListeners('connection', { status: 'disconnected', error: 'WebSocket not supported for resume enhancement' });
        return;
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.isConnecting = false;
      this.notifyListeners("error", { error });
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    // Skip reconnection for resume enhancement (WebSocket not supported)
    console.log("Skipping WebSocket reconnection for resume enhancement");
    this.notifyListeners("connection", { status: "disconnected" });
    return;
    
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.log("Max reconnection attempts reached");
      this.notifyListeners("connection", { status: "failed" });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.userId && this.token) {
        this.connect(this.userId, this.token);
      }
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, this.config.pingInterval || 30000);
  }

  /**
   * Stop ping interval
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocketMessage): void {
    console.log("📢 WebSocket message received:", data);

    switch (data.type) {
      case "notification":
        // General notification with notification_type field
        this.notifyListeners("notification", data);
        // Also emit specific type for backwards compatibility
        if (data.notification_type) {
          this.notifyListeners(data.notification_type, data);
        }
        break;

      case "resume_enhancement_completed":
        this.notifyListeners("resume_enhancement_completed", data);
        break;

      case "resume_enhancement_failed":
        this.notifyListeners("resume_enhancement_failed", data);
        break;

      case "resume_enhancement_started":
        this.notifyListeners("resume_enhancement_started", data);
        break;

      case "resume_enhancement_progress":
        this.notifyListeners("resume_enhancement_progress", data);
        break;

      case "pong":
        // Handle ping/pong for keepalive
        console.log("🏓 Pong received");
        break;

      default:
        console.log("Unknown message type:", data.type);
        // Fallback: treat as general notification
        this.notifyListeners("notification", data);
        break;
    }
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, callback: (data: any) => void): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.delete(callback);
    }
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(eventType: string, data: any): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in WebSocket listener:", error);
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopPing();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.userId = null;
    this.token = null;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    if (this.isConnecting) {
      return { status: 'connecting' };
    }
    
    if (this.isConnected()) {
      return { status: 'connected' };
    }
    
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      return { status: 'failed' };
    }
    
    return { status: 'disconnected' };
  }

  /**
   * Send message through WebSocket
   */
  send(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;