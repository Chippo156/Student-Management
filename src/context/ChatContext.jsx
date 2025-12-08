import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
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
  const { isAuthenticated, account } = useSelector((state) => state.user);

  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Ref để track trạng thái connecting
  const isConnectingRef = useRef(false);
  const connectionListenersRef = useRef(false);

  /**
   * Khởi tạo kết nối SignalR
   */
  const connectChat = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token found for chat connection');
        return false;
      }

      // ✅ Tránh connect nhiều lần
      if (isConnectingRef.current || chatService.isConnected) {
        console.log('⏭️ Already connecting or connected, skipping...');
        return chatService.isConnected;
      }

      isConnectingRef.current = true;
      console.log('🔌 Connecting to SignalR...');

      await chatService.connect(token);

      // ✅ Đợi connection được establish (timeout 5s)
      const connectionPromise = new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (chatService.isConnected) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);

        // Timeout sau 5s
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(chatService.isConnected);
        }, 5000);
      });

      const connected = await connectionPromise;
      isConnectingRef.current = false;

      if (connected) {
        console.log('✅ SignalR connected successfully');
        setIsConnected(true);
        return true;
      } else {
        console.warn('⚠️ SignalR connection timeout');
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Failed to connect chat:', error);
      isConnectingRef.current = false;
      setIsConnected(false);
      return false;
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
      isConnectingRef.current = false;
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
   */
  const openChatRoom = useCallback(
    async (roomOrId, roomName) => {
      try {
        setIsLoading(true);

        let room;
        let roomId;

        if (typeof roomOrId === 'object') {
          room = roomOrId;
          roomId = room.chatRoomId;
        } else {
          roomId = roomOrId;
          room = chatRooms.find((r) => r.chatRoomId === roomId);
          if (!room) {
            room = {
              chatRoomId: roomId,
              roomName: roomName || `Room ${roomId}`,
            };
          }
        }

        if (isConnected) {
          try {
            await chatService.joinChatRoom(roomId);
          } catch (error) {
            console.warn('Failed to join room via SignalR:', error);
          }
        }

        // ✅ SỬA: Dùng getMessages() thay vì getMessagesByRoom()
        const messagesResponse = await chatApi.getMessages(roomId, 1, 50);
        const roomMessages =
          messagesResponse?.data?.items || messagesResponse?.data || [];

        setCurrentRoom(room);
        setMessages(roomMessages);

        await chatApi.markAsRead(roomId);
        await fetchChatRooms();
      } catch (error) {
        console.error('Failed to open chat room:', error);
        message.error('Không thể mở phòng chat');
      } finally {
        setIsLoading(false);
      }
    },
    [chatRooms, isConnected, fetchChatRooms]
  );

  /**
   * Đóng chat room
   */
  const closeChatRoom = useCallback(async () => {
    if (currentRoom && isConnected) {
      try {
        await chatService.leaveChatRoom(currentRoom.chatRoomId);
      } catch (error) {
        console.warn('Failed to leave room:', error);
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
    async (content, replyToMessageId = null, messageType = 'Text') => {
      if (!currentRoom || !isConnected) {
        message.warning('Vui lòng chờ kết nối được thiết lập');
        return false;
      }

      if (!content?.trim()) {
        return false;
      }

      try {
        await chatService.sendMessage(
          currentRoom.chatRoomId,
          content.trim(),
          replyToMessageId,
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

      const response = await chatApi.getClassTeacherRoom();
      if (!response?.data) {
        message.error('Không thể mở chat với giảng viên chủ nhiệm');
        return null;
      }

      const room = response.data;

      if (isConnected) {
        try {
          await chatService.joinChatRoom(room.chatRoomId);
        } catch (error) {
          console.warn('Failed to join class teacher room:', error);
        }
      }

      // ✅ SỬA: Dùng getMessages() thay vì getMessagesByRoom()
      const messagesResponse = await chatApi.getMessages(
        room.chatRoomId,
        1,
        50
      );
      const roomMessages =
        messagesResponse?.data?.items || messagesResponse?.data || [];

      setCurrentRoom(room);
      setMessages(roomMessages);

      await chatApi.markAsRead(room.chatRoomId);
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
   * ✅ CONNECTION event listeners - CHỈ ĐĂNG KÝ 1 LẦN
   */
  useEffect(() => {
    if (connectionListenersRef.current) {
      return;
    }
    connectionListenersRef.current = true;
    console.log('📡 Registering SignalR CONNECTION event listeners...');

    chatService.addEventListener('connected', () => {
      console.log('✅ Event: connected');
      setIsConnected(true);
      isConnectingRef.current = false;
    });

    chatService.addEventListener('reconnected', () => {
      console.log('✅ Event: reconnected');
      setIsConnected(true);
      isConnectingRef.current = false;
      message.success('Đã kết nối lại chat');
    });

    chatService.addEventListener('closed', () => {
      console.log('❌ Event: closed');
      setIsConnected(false);
      isConnectingRef.current = false;
      message.warning('Mất kết nối chat');
    });

    chatService.addEventListener('reconnecting', () => {
      console.log('🔄 Event: reconnecting');
      setIsConnected(false);
    });
  }, []);

  /**
   * ✅ MESSAGE event listeners
   */
  useEffect(() => {
    console.log('📨 Registering SignalR MESSAGE event listeners...');

    const unsubReceiveMessage = chatService.addEventListener(
      'ReceiveMessage',
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);

        if (!currentRoom || newMessage.chatRoomId !== currentRoom.chatRoomId) {
          setUnreadCount((prev) => prev + 1);
          fetchChatRooms();
        } else {
          chatApi.markAsRead(currentRoom.chatRoomId);
        }
      }
    );

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

    return () => {
      console.log('🔇 Unregistering SignalR MESSAGE event listeners...');
      unsubReceiveMessage();
      unsubTyping();
      unsubStopTyping();
    };
  }, [currentRoom, fetchChatRooms]);

  /**
   * ✅ Auto connect khi user login - WITH PROPER WAITING
   */
  useEffect(() => {
    const initializeChat = async () => {
      if (isAuthenticated && account) {
        console.log('🔄 User authenticated, initializing chat...');

        // ✅ Đợi connection thành công trước khi fetch rooms
        const connected = await connectChat();

        if (connected) {
          console.log('✅ Connection established, fetching chat rooms...');
          await fetchChatRooms();
        } else {
          console.warn('⚠️ Connection failed, will retry on next interaction');
        }
      } else {
        console.log('⏸️ User not authenticated, disconnecting chat...');
        if (isConnected) {
          await disconnectChat();
        }
      }
    };

    initializeChat();

    return () => {
      if (!isAuthenticated) {
        disconnectChat();
      }
    };
  }, [isAuthenticated, account]); // ✅ Chỉ chạy khi auth state thay đổi

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
