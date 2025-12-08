import * as signalR from '@microsoft/signalr';
import axios from '../until/customize-axios';

const CHAT_HUB_URL = import.meta.env?.VITE_APP_BE_CHAT_HUB;

class ChatService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Get real-time connection state
   */
  get connectionState() {
    return this.connection?.state || signalR.HubConnectionState.Disconnected;
  }

  /**
   * Check if really connected
   */
  get isReallyConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Khởi tạo kết nối SignalR
   */
  async connect(token) {
    if (this.connection && this.isConnected) {
      return;
    }

    try {
      const accessToken =
        localStorage.getItem('access_token') ||
        token ||
        localStorage.getItem('access_token');

      if (!accessToken) {
        console.warn('No access token available for SignalR connection');
        this.isConnected = false;
        return;
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(CHAT_HUB_URL, {
          // accessTokenFactory được gọi mỗi khi cần token
          // Token sẽ được thêm vào query string: ?access_token=...
          accessTokenFactory: () => accessToken,
          // Cho phép negotiate trước để server quyết định transport tốt nhất
          // skipNegotiation: true,
          // transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Xử lý sự kiện reconnecting
      this.connection.onreconnecting((error) => {
        this.isConnected = false;
        this.notifyListeners('reconnecting', { error });
      });

      // Xử lý sự kiện reconnected
      this.connection.onreconnected((connectionId) => {
        this.isConnected = true;
        this.notifyListeners('reconnected', { connectionId });
      });

      // Xử lý sự kiện close
      this.connection.onclose((error) => {
        this.isConnected = false;
        this.notifyListeners('closed', { error });
      });

      // Đăng ký các event handlers
      this.registerEventHandlers();

      await this.connection.start();
      this.isConnected = true;
      this.notifyListeners('connected');
    } catch (error) {
      console.error('Failed to connect to ChatHub:', error);
      this.isConnected = false;
      // Không throw error để không crash app, chỉ log
      // throw error;
    }
  }

  /**
   * Đăng ký các event handlers từ server
   */
  registerEventHandlers() {
    if (!this.connection) return;

    // Nhận tin nhắn mới
    this.connection.on('ReceiveMessage', (message) => {
      this.notifyListeners('ReceiveMessage', message);
    });

    // User join room
    this.connection.on('UserJoined', (data) => {
      this.notifyListeners('UserJoined', data);
    });

    // User left room
    this.connection.on('UserLeft', (data) => {
      this.notifyListeners('UserLeft', data);
    });

    // User typing
    this.connection.on('UserTyping', (data) => {
      this.notifyListeners('UserTyping', data);
    });

    // User stopped typing
    this.connection.on('UserStoppedTyping', (data) => {
      this.notifyListeners('UserStoppedTyping', data);
    });

    // Error
    this.connection.on('Error', (error) => {
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
      // Đảm bảo roomId là số nguyên
      const chatRoomId = parseInt(roomId);
      await this.connection.invoke('JoinChatRoom', chatRoomId);
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
      // Đảm bảo roomId là số nguyên
      const chatRoomId = parseInt(roomId);
      await this.connection.invoke('LeaveChatRoom', chatRoomId);
    } catch (error) {
      console.error('Failed to leave chat room:', error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn
   * @param {number} roomId - Chat room ID
   * @param {string} content - Nội dung tin nhắn
   * @param {number} messageType - Loại tin nhắn (1: Text, 2: Image, 3: File)
   * @param {number|null} replyToMessageId - ID tin nhắn được reply (optional)
   */
  async sendMessage(roomId, content, messageType = 1, replyToMessageId = null) {
    // Kiểm tra cả connection state của SignalR
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      const currentState = this.connection?.state || 'No connection';
      console.error('Cannot send message. Connection state:', currentState);
      throw new Error(`Not connected to ChatHub. State: ${currentState}`);
    }
    try {
      // Đảm bảo roomId là số nguyên
      const chatRoomId = parseInt(roomId);

      // ✅ Build payload với optional replyToMessageId
      const payload = {
        chatRoomId: chatRoomId,
        content: content,
        messageType: messageType,
      };

      // Chỉ thêm replyToMessageId nếu có giá trị
      if (replyToMessageId) {
        payload.replyToMessageId = parseInt(replyToMessageId);
      }

      await this.connection.invoke('SendMessage', payload);
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
      const chatRoomId = parseInt(roomId);
      await this.connection.invoke('StartTyping', chatRoomId);
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
      const chatRoomId = parseInt(roomId);
      await this.connection.invoke('StopTyping', chatRoomId);
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
   * Lấy danh sách tất cả chat rooms của user hiện tại
   */
  getMyChatRooms: async () => {
    try {
      const response = await axios.get('/api/v1/Chat/my-rooms');
      return response;
    } catch (error) {
      console.error('Failed to get my chat rooms:', error);
      return null;
    }
  },

  /**
   * Lấy hoặc tạo chat room với giảng viên chủ nhiệm lớp
   */
  getClassTeacherRoom: async () => {
    try {
      const response = await axios.post('/api/v1/Chat/class-teacher');
      return response;
    } catch (error) {
      console.error('Failed to get class teacher room:', error);
      return null;
    }
  },

  /**
   * Lấy lịch sử tin nhắn của một chat room
   * @param {number} chatRoomId - ID của chat room
   * @param {number} pageNumber - Trang hiện tại (mặc định 1)
   * @param {number} pageSize - Số lượng tin nhắn mỗi trang (mặc định 20)
   */
  getMessages: async (chatRoomId, pageNumber = 1, pageSize = 20) => {
    try {
      const response = await axios.get(`/api/v1/Chat/${chatRoomId}/messages`, {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });
      return response;
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
      await axios.post(`/api/v1/Chat/${roomId}/mark-read`);
      return true;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return false;
    }
  },

  /**
   * Tạo chat room với AI
   */
  createAIRoom: async () => {
    try {
      const response = await axios.post('/api/v1/Chat/room/ai');
      return response;
    } catch (error) {
      console.error('Failed to create AI chat room:', error);
      return null;
    }
  },

  /**
   * Xóa lịch sử tin nhắn trong room
   * @param {number} chatRoomId - ID của chat room
   */
  clearHistory: async (chatRoomId) => {
    try {
      await axios.delete(`/api/v1/Chat/rooms/${chatRoomId}/history`);
      return true;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      return false;
    }
  },

  /**
   * Tạo chat room với giảng viên học vụ (admin)
   */
  createAcademicStaffRoom: async () => {
    try {
      const response = await axios.post('/api/v1/Chat/academic-staff');
      return response;
    } catch (error) {
      console.error('Failed to create academic staff chat room:', error);
      return null;
    }
  },

  /**
   * Legacy - Lấy danh sách chat rooms (giữ để tương thích ngược)
   * @deprecated Use getMyChatRooms instead
   */
  getChatRooms: async (pageNumber = 1, pageSize = 20) => {
    console.warn('getChatRooms is deprecated, use getMyChatRooms instead');
    return chatApi.getMyChatRooms();
  },

  /**
   * Legacy - Lấy hoặc tạo chat room giữa 2 users (giữ để tương thích ngược)
   * @deprecated This endpoint may no longer be supported
   */
  getOrCreateChatRoom: async (participantId) => {
    console.warn('getOrCreateChatRoom may be deprecated');
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
};

// Export singleton instance
const chatService = new ChatService();

export { chatService, chatApi };
export default chatService;
