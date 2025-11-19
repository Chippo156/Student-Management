import * as signalR from '@microsoft/signalr';
import axios from '../until/customize-axios';

const CHAT_HUB_URL = 'https://localhost:7061/chathub';

class ChatService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Khởi tạo kết nối SignalR
   */
  async connect(token) {
    if (this.connection && this.isConnected) {
      console.log('Already connected to ChatHub');
      return;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(CHAT_HUB_URL, {
          accessTokenFactory: () => token || localStorage.getItem('access_token'),
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Xử lý sự kiện reconnecting
      this.connection.onreconnecting((error) => {
        console.log('Reconnecting to ChatHub...', error);
        this.isConnected = false;
        this.notifyListeners('reconnecting', { error });
      });

      // Xử lý sự kiện reconnected
      this.connection.onreconnected((connectionId) => {
        console.log('Reconnected to ChatHub:', connectionId);
        this.isConnected = true;
        this.notifyListeners('reconnected', { connectionId });
      });

      // Xử lý sự kiện close
      this.connection.onclose((error) => {
        console.log('Connection closed:', error);
        this.isConnected = false;
        this.notifyListeners('closed', { error });
      });

      // Đăng ký các event handlers
      this.registerEventHandlers();

      await this.connection.start();
      this.isConnected = true;
      console.log('Connected to ChatHub successfully');
      this.notifyListeners('connected');
    } catch (error) {
      console.error('Failed to connect to ChatHub:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Đăng ký các event handlers từ server
   */
  registerEventHandlers() {
    if (!this.connection) return;

    // Nhận tin nhắn mới
    this.connection.on('ReceiveMessage', (message) => {
      console.log('ReceiveMessage:', message);
      this.notifyListeners('ReceiveMessage', message);
    });

    // User join room
    this.connection.on('UserJoined', (data) => {
      console.log('UserJoined:', data);
      this.notifyListeners('UserJoined', data);
    });

    // User left room
    this.connection.on('UserLeft', (data) => {
      console.log('UserLeft:', data);
      this.notifyListeners('UserLeft', data);
    });

    // User typing
    this.connection.on('UserTyping', (data) => {
      console.log('UserTyping:', data);
      this.notifyListeners('UserTyping', data);
    });

    // User stopped typing
    this.connection.on('UserStoppedTyping', (data) => {
      console.log('UserStoppedTyping:', data);
      this.notifyListeners('UserStoppedTyping', data);
    });

    // Error
    this.connection.on('Error', (error) => {
      console.error('SignalR Error:', error);
      this.notifyListeners('Error', error);
    });
  }

  /**
   * Thêm listener cho các events
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Thông báo tất cả listeners
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  /**
   * Join chat room
   */
  async joinChatRoom(roomId) {
    if (!this.connection || !this.isConnected) {
      throw new Error('Not connected to ChatHub');
    }
    try {
      await this.connection.invoke('JoinChatRoom', roomId);
      console.log('Joined chat room:', roomId);
    } catch (error) {
      console.error('Failed to join chat room:', error);
      throw error;
    }
  }

  /**
   * Leave chat room
   */
  async leaveChatRoom(roomId) {
    if (!this.connection || !this.isConnected) {
      throw new Error('Not connected to ChatHub');
    }
    try {
      await this.connection.invoke('LeaveChatRoom', roomId);
      console.log('Left chat room:', roomId);
    } catch (error) {
      console.error('Failed to leave chat room:', error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn
   */
  async sendMessage(roomId, content, messageType = 1) {
    if (!this.connection || !this.isConnected) {
      throw new Error('Not connected to ChatHub');
    }
    try {
      await this.connection.invoke('SendMessage', {
        chatRoomId: roomId,
        content: content,
        messageType: messageType,
      });
      console.log('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Bắt đầu typing
   */
  async startTyping(roomId) {
    if (!this.connection || !this.isConnected) {
      return;
    }
    try {
      await this.connection.invoke('StartTyping', roomId);
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }

  /**
   * Dừng typing
   */
  async stopTyping(roomId) {
    if (!this.connection || !this.isConnected) {
      return;
    }
    try {
      await this.connection.invoke('StopTyping', roomId);
    } catch (error) {
      console.error('Failed to stop typing indicator:', error);
    }
  }

  /**
   * Ngắt kết nối
   */
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('Disconnected from ChatHub');
      } catch (error) {
        console.error('Error disconnecting:', error);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.listeners.clear();
      }
    }
  }
}

// REST API functions
const chatApi = {
  /**
   * Lấy danh sách chat rooms
   */
  getChatRooms: async (pageNumber = 1, pageSize = 20) => {
    try {
      const response = await axios.get('/api/v1/ChatRoom', {
        params: { PageNumber: pageNumber, PageSize: pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get chat rooms:', error);
      return null;
    }
  },

  /**
   * Lấy hoặc tạo chat room giữa 2 users
   */
  getOrCreateChatRoom: async (participantId) => {
    try {
      const response = await axios.post('/api/v1/ChatRoom/get-or-create', {
        participantId,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get or create chat room:', error);
      return null;
    }
  },

  /**
   * Lấy lịch sử tin nhắn
   */
  getMessages: async (roomId, pageNumber = 1, pageSize = 50) => {
    try {
      const response = await axios.get(`/api/v1/ChatRoom/${roomId}/messages`, {
        params: { PageNumber: pageNumber, PageSize: pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      return null;
    }
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  markAsRead: async (roomId) => {
    try {
      await axios.post(`/api/v1/ChatRoom/${roomId}/mark-read`);
      return true;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return false;
    }
  },
};

// Export singleton instance
const chatService = new ChatService();

export { chatService, chatApi };
export default chatService;
