import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'instructor' | 'learner' | 'admin';
  recipientId?: string;
  recipientName?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'direct' | 'group' | 'broadcast';
}

interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: string;
  title: string;
  content: string;
  chatId?: string;
  messageId?: string;
  metadata?: any;
  timestamp: string;
}

interface SocketEvents {
  // Incoming events
  new_message: (data: { chatId: string; message: Message; timestamp: string }) => void;
  new_notification: (data: { recipientId: string; notification: Notification }) => void;
  user_typing: (data: { userId: string; userName: string; chatId: string }) => void;
  user_stopped_typing: (data: { userId: string; chatId: string }) => void;
  message_read_receipt: (data: { messageId: string; userId: string; chatId: string }) => void;
  
  // Outgoing events
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;
  typing_start: (data: { chatId: string }) => void;
  typing_stop: (data: { chatId: string }) => void;
  message_read: (data: { messageId: string; chatId: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve) => {
      // WebSocket functionality is disabled for now
      console.log('WebSocket functionality disabled - continuing without real-time features');
      this.isConnected = false;
      resolve();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token).catch(console.error);
        }
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listeners
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    // WebSocket functionality disabled
    console.log('WebSocket event listener disabled:', event);
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
    // WebSocket functionality disabled
    console.log('WebSocket event listener removal disabled:', event);
  }

  // Emit events
  emit<K extends keyof SocketEvents>(event: K, data: Parameters<SocketEvents[K]>[0]) {
    // WebSocket functionality disabled
    console.log('WebSocket emit disabled:', event);
  }

  // Chat management
  joinChat(chatId: string) {
    this.emit('join_chat', chatId);
  }

  leaveChat(chatId: string) {
    this.emit('leave_chat', chatId);
  }

  // Typing indicators
  startTyping(chatId: string) {
    this.emit('typing_start', { chatId });
  }

  stopTyping(chatId: string) {
    this.emit('typing_stop', { chatId });
  }

  // Message read receipts
  markMessageAsRead(messageId: string, chatId: string) {
    this.emit('message_read', { messageId, chatId });
  }

  // Utility methods
  isSocketConnected(): boolean {
    return false; // WebSocket functionality disabled
  }

  getSocketId(): string | undefined {
    return undefined; // WebSocket functionality disabled
  }

  updateToken(newToken: string) {
    this.token = newToken;
    localStorage.setItem('token', newToken);
    // WebSocket functionality disabled - no reconnection needed
    console.log('Token updated, WebSocket functionality disabled');
  }

  // Cleanup
  cleanup() {
    this.disconnect();
    this.token = null;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
export { SocketService };
export type { Message, Notification, SocketEvents };
