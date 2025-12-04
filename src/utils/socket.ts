import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from './auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

type MessageCallback = (message: unknown) => void;

class SocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private isConnecting = false;
  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkInterval = setInterval(() => {
          if (this.client?.connected) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      const token = getToken();

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${SOCKET_URL}/ws?token=${token || ''}`),
        connectHeaders: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log('[STOMP]', str);
          }
        },
        reconnectDelay: this.getReconnectDelay(),
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.resubscribeAll();
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          this.isConnecting = false;
          reject(new Error(frame.headers['message']));
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed');
          this.handleReconnect();
        },
      });

      this.client.activate();
    });
  }

  private getReconnectDelay(): number {
    // Exponential backoff with jitter
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    const jitter = delay * 0.1 * Math.random();
    return delay + jitter;
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private resubscribeAll(): void {
    // Re-subscribe to all topics after reconnection
    this.messageCallbacks.forEach((callbacks, destination) => {
      callbacks.forEach((callback) => {
        this.subscribeInternal(destination, callback);
      });
    });
  }

  private subscribeInternal(
    destination: string,
    callback: MessageCallback
  ): StompSubscription | null {
    if (!this.client?.connected) {
      return null;
    }

    return this.client.subscribe(destination, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch {
        callback(message.body);
      }
    });
  }

  subscribe(destination: string, callback: MessageCallback): () => void {
    // Store callback for resubscription
    if (!this.messageCallbacks.has(destination)) {
      this.messageCallbacks.set(destination, new Set());
    }
    this.messageCallbacks.get(destination)!.add(callback);

    // Subscribe if connected
    if (this.client?.connected) {
      const subscription = this.subscribeInternal(destination, callback);
      if (subscription) {
        const key = `${destination}-${Date.now()}`;
        this.subscriptions.set(key, subscription);
      }
    }

    // Return unsubscribe function
    return () => {
      this.messageCallbacks.get(destination)?.delete(callback);
      if (this.messageCallbacks.get(destination)?.size === 0) {
        this.messageCallbacks.delete(destination);
      }
    };
  }

  publish(destination: string, body: unknown): void {
    if (!this.client?.connected) {
      console.warn('Cannot publish: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.messageCallbacks.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
