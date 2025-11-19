import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { chatService, chatApi } from '../service/chatService';
import { message } from 'antd';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Khởi tạo kết nối SignalR
   */
  const connectChat = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token found for chat connection');
        return;
      }

      await chatService.connect(token);
    } catch (error) {
      console.error('Failed to connect chat:', error);
      setIsConnected(false);
    }
  }, []);

  /**
   * Ngắt kết nối
   */
  const disconnectChat = useCallback(async () => {
    try {
      await chatService.disconnect();
      setIsConnected(false);
      setCurrentRoom(null);
      setMessages([]);
      setTypingUsers(new Set());
    } catch (error) {
      console.error('Failed to disconnect chat:', error);
    }
  }, []);

  /**
   * Lấy danh sách chat rooms
   */
  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await chatApi.getMyChatRooms();
      if (response?.data) {
        const rooms = Array.isArray(response.data) ? response.data : [];
        setChatRooms(rooms);
        // Tính tổng số tin nhắn chưa đọc
        const totalUnread = rooms.reduce(
          (sum, room) => sum + (room.unreadCount || 0),
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  }, []);

  /**
   * Mở chat room
   * @param {number|object} roomOrId - Room object hoặc chatRoomId
   * @param {string} roomName - Tên room (optional, dùng khi truyền roomId)
   */
  const openChatRoom = useCallback(
    async (roomOrId, roomName) => {
      try {
        setIsLoading(true);

        let room;
        let roomId;

        // Kiểm tra nếu truyền vào là object (room từ danh sách)
        if (typeof roomOrId === 'object' && roomOrId !== null) {
          room = roomOrId;
          roomId = room.chatRoomId;
        } else {
          // Truyền vào là ID - legacy support
          roomId = roomOrId;
          // Tìm room trong danh sách
          const existingRoom = chatRooms.find((r) => r.chatRoomId === roomId);
          if (existingRoom) {
            room = existingRoom;
          } else {
            // Fallback: tạo room object tạm
            room = { chatRoomId: roomId, roomName: roomName || 'Chat' };
          }
        }

        // Join room qua SignalR (chỉ khi đã kết nối)
        if (isConnected) {
          try {
            await chatService.joinChatRoom(roomId);
          } catch (error) {
            console.warn(
              'Failed to join room via SignalR, continuing with REST API only:',
              error
            );
            // Không throw error, vẫn cho phép xem tin nhắn qua REST API
          }
        } else {
          console.warn('SignalR not connected, using REST API only');
        }

        // Lấy lịch sử tin nhắn
        const response = await chatApi.getMessages(roomId);
        if (response?.data?.items) {
          // API đã trả về sorted theo sentAt, giữ nguyên thứ tự
          setMessages(response.data.items);
        } else {
          setMessages([]);
        }

        // Set current room
        setCurrentRoom(room);

        // Đánh dấu đã đọc
        await chatApi.markAsRead(roomId);

        return room;
      } catch (error) {
        console.error('Failed to open chat room:', error);
        message.error('Không thể mở chat room');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, chatRooms]
  );

  /**
   * Đóng chat room
   */
  const closeChatRoom = useCallback(async () => {
    if (currentRoom && isConnected) {
      try {
        await chatService.leaveChatRoom(currentRoom.chatRoomId);
      } catch (error) {
        console.error('Failed to leave chat room:', error);
      }
    }
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers(new Set());
  }, [currentRoom, isConnected]);

  /**
   * Gửi tin nhắn
   */
  const sendMessage = useCallback(
    async (content, messageType = 1) => {
      if (!currentRoom) {
        console.error('No current room');
        message.error('Chưa mở chat room');
        return false;
      }

      if (!isConnected) {
        console.error('Not connected to SignalR');
        message.error(
          'Chưa kết nối real-time chat. Vui lòng đợi kết nối hoặc tải lại trang.'
        );
        return false;
      }

      try {
        await chatService.sendMessage(
          currentRoom.chatRoomId,
          content,
          messageType
        );
        return true;
      } catch (error) {
        message.error('Gửi tin nhắn thất bại');
        return false;
      }
    },
    [currentRoom, isConnected]
  );

  /**
   * Bắt đầu typing
   */
  const startTyping = useCallback(() => {
    if (currentRoom && isConnected) {
      chatService.startTyping(currentRoom.chatRoomId);
    }
  }, [currentRoom, isConnected]);

  /**
   * Dừng typing
   */
  const stopTyping = useCallback(() => {
    if (currentRoom && isConnected) {
      chatService.stopTyping(currentRoom.chatRoomId);
    }
  }, [currentRoom, isConnected]);

  /**
   * Mở chat với giảng viên chủ nhiệm lớp
   */
  const openClassTeacherChat = useCallback(async () => {
    try {
      setIsLoading(true);

      // Lấy hoặc tạo chat room với giảng viên chủ nhiệm
      const response = await chatApi.getClassTeacherRoom();
      if (!response?.data) {
        message.error('Không thể mở chat với giảng viên chủ nhiệm');
        return null;
      }

      const room = response.data;

      // Join room qua SignalR (chỉ khi đã kết nối)
      if (isConnected) {
        try {
          await chatService.joinChatRoom(room.chatRoomId);
        } catch (error) {
          console.warn(
            'Failed to join room via SignalR, continuing with REST API only:',
            error
          );
          // Không throw error, vẫn cho phép xem tin nhắn qua REST API
        }
      } else {
        console.warn('SignalR not connected, using REST API only');
      }

      // Lấy lịch sử tin nhắn
      const messagesResponse = await chatApi.getMessages(room.chatRoomId);
      if (messagesResponse?.data?.items) {
        // API đã trả về sorted theo sentAt, giữ nguyên thứ tự
        setMessages(messagesResponse.data.items);
      } else {
        setMessages([]);
      }

      // Set current room
      setCurrentRoom(room);

      // Đánh dấu đã đọc
      await chatApi.markAsRead(room.chatRoomId);

      // Refresh danh sách rooms
      await fetchChatRooms();

      return room;
    } catch (error) {
      console.error('Failed to open class teacher chat:', error);
      message.error('Không thể mở chat với giảng viên chủ nhiệm');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, fetchChatRooms]);

  /**
   * Đăng ký CONNECTION event listeners - CHỈ ĐĂNG KÝ 1 LẦN KHI MOUNT
   * ⚠️ Sử dụng useRef để tránh cleanup trong StrictMode
   */
  const connectionListenersRef = React.useRef(false);

  useEffect(() => {
    // ✅ Chỉ đăng ký 1 lần duy nhất, ngay cả trong StrictMode
    if (connectionListenersRef.current) {
      return;
    }

    connectionListenersRef.current = true;
    console.log('Registering SignalR CONNECTION event listeners...');

    // Connection events - Đăng ký TRƯỚC khi connect
    chatService.addEventListener('connected', () => {
      console.log('Event: connected received');
      setIsConnected(true);
    });

    chatService.addEventListener('reconnected', () => {
      console.log('Event: reconnected received');
      setIsConnected(true);
      message.success('Đã kết nối lại chat');
    });

    chatService.addEventListener('closed', () => {
      console.log('Event: closed received');
      setIsConnected(false);
      message.warning('Mất kết nối chat');
    });

    chatService.addEventListener('reconnecting', () => {
      console.log('Event: reconnecting received');
      setIsConnected(false);
    });

    // ✅ KHÔNG cleanup - để listeners tồn tại suốt đời app
  }, []); // ✅ KHÔNG có dependencies - chỉ đăng ký 1 lần

  /**
   * Đăng ký MESSAGE event listeners - Phụ thuộc vào currentRoom
   */
  useEffect(() => {
    console.log('Registering SignalR MESSAGE event listeners...');

    // Nhận tin nhắn mới
    const unsubReceiveMessage = chatService.addEventListener(
      'ReceiveMessage',
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);

        // Cập nhật unread count nếu không phải room hiện tại
        if (!currentRoom || newMessage.chatRoomId !== currentRoom.chatRoomId) {
          setUnreadCount((prev) => prev + 1);
          // Refresh chat rooms list
          fetchChatRooms();
        } else {
          // Đánh dấu đã đọc nếu đang mở room này
          chatApi.markAsRead(currentRoom.chatRoomId);
        }
      }
    );

    // User typing - Backend chỉ gửi username, vì user chỉ typing trong room họ đang join
    const unsubTyping = chatService.addEventListener('UserTyping', (data) => {
      const username = data.username || data.Username;
      if (username && currentRoom) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(username);
          return newSet;
        });
      }
    });

    // User stopped typing
    const unsubStopTyping = chatService.addEventListener(
      'UserStoppedTyping',
      (data) => {
        const username = data.username || data.Username;
        if (username && currentRoom) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(username);
            return newSet;
          });
        }
      }
    );

    // Cleanup
    return () => {
      console.log('Unregistering SignalR MESSAGE event listeners...');
      unsubReceiveMessage();
      unsubTyping();
      unsubStopTyping();
    };
  }, [currentRoom, fetchChatRooms]); // Phụ thuộc vào currentRoom

  /**
   * Auto connect khi mount
   */
  useEffect(() => {
    const initializeChat = async () => {
      await connectChat();
      // Chỉ fetch chat rooms nếu kết nối thành công
      if (chatService.isConnected) {
        await fetchChatRooms();
      }
    };

    initializeChat();

    return () => {
      disconnectChat();
    };
  }, []);

  const value = {
    isConnected,
    currentRoom,
    messages,
    chatRooms,
    unreadCount,
    typingUsers: Array.from(typingUsers),
    isLoading,
    connectChat,
    disconnectChat,
    fetchChatRooms,
    openChatRoom,
    openClassTeacherChat,
    closeChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
