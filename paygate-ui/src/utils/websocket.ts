type WebSocketEvent = 'open' | 'message' | 'close' | 'error';
type EventHandler = (event?: any) => void;

export class AnalyticsWebSocket {
  private socket: WebSocket | null = null;
  private eventHandlers: Record<WebSocketEvent, EventHandler[]> = {
    open: [],
    message: [],
    close: [],
    error: []
  };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;
  private token: string | null = null;
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(baseUrl: string, token?: string) {
    this.token = token || null;
    this.url = this.buildWebSocketUrl(baseUrl);
    this.connect();
  }

  private buildWebSocketUrl(baseUrl: string): string {
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/analytics';
    if (this.token) {
      return `${wsUrl}?token=${encodeURIComponent(this.token)}`;
    }
    return wsUrl;
  }

  private connect(): void {
    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = (event) => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.trigger('open', event);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.trigger('message', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.trigger('error', { type: 'parse_error', error });
        }
      };
      
      this.socket.onclose = (event) => {
        this.isConnected = false;
        this.trigger('close', event);
        this.handleReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.trigger('error', { type: 'connection_error', error });
        this.socket?.close();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        30000 // Max 30 seconds
      );
      
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.trigger('error', { 
        type: 'max_reconnect_attempts', 
        message: 'Maximum reconnection attempts reached' 
      });
    }
  }

  on(event: WebSocketEvent, handler: EventHandler): () => void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    this.eventHandlers[event].push(handler);
    
    // Return unsubscribe function
    return () => {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    };
  }

  private trigger(event: WebSocketEvent, data?: any): void {
    if (!this.eventHandlers[event]) return;
    
    for (const handler of this.eventHandlers[event]) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    }
  }

  send(data: any): void {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket is not connected');
      return;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.trigger('error', { type: 'send_error', error });
    }
  }

  close(code?: number, reason?: string): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close(code, reason);
      this.socket = null;
    }
    
    this.isConnected = false;
  }

  get connectionState(): number | null {
    return this.socket?.readyState ?? null;
  }

  get isOpen(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }
}

// Global WebSocket instance
let webSocketInstance: AnalyticsWebSocket | null = null;

export function initWebSocket(baseUrl: string, token?: string): AnalyticsWebSocket {
  // Close existing connection if it exists
  if (webSocketInstance) {
    closeWebSocket();
  }
  webSocketInstance = new AnalyticsWebSocket(baseUrl, token);
  return webSocketInstance;
}

export function getWebSocket(): AnalyticsWebSocket | null {
  return webSocketInstance;
}

export function closeWebSocket(code?: number, reason?: string): void {
  if (webSocketInstance) {
    webSocketInstance.close(code, reason);
    webSocketInstance = null;
  }
}
