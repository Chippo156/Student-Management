import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
        console.warn('No access token found');
        return;
      }

      await chatService.connect(token);
      setIsConnected(true);
      message.success('Kết nối chat thành công');
    } catch (error) {
      console.error('Failed to connect chat:', error);
      message.error('Không thể kết nối chat');
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
      const result = await chatApi.getChatRooms();
      if (result && result.items) {
        setChatRooms(result.items);
        // Tính tổng số tin nhắn chưa đọc
        const totalUnread = result.items.reduce(
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
   * Mở chat room với user
   */
  const openChatRoom = useCallback(
    async (participantId, participantName) => {
      try {
        setIsLoading(true);

        // Lấy hoặc tạo chat room
        const room = await chatApi.getOrCreateChatRoom(participantId);
        if (!room) {
          message.error('Không thể mở chat room');
          return null;
        }

        // Join room qua SignalR
        if (isConnected) {
          await chatService.joinChatRoom(room.chatRoomId);
        }

        // Lấy lịch sử tin nhắn
        const messagesData = await chatApi.getMessages(room.chatRoomId);
        if (messagesData && messagesData.items) {
          setMessages(messagesData.items.reverse()); // Đảo ngược để tin nhắn cũ ở trên
        } else {
          setMessages([]);
        }

        // Set current room
        setCurrentRoom({
          ...room,
          participantName: participantName || room.participantName,
        });

        // Đánh dấu đã đọc
        await chatApi.markAsRead(room.chatRoomId);

        return room;
      } catch (error) {
        console.error('Failed to open chat room:', error);
        message.error('Không thể mở chat room');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected]
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
      if (!currentRoom || !isConnected) {
        message.error('Chưa kết nối chat');
        return false;
      }

      try {
        await chatService.sendMessage(currentRoom.chatRoomId, content, messageType);
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
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
   * Đăng ký event listeners
   */
  useEffect(() => {
    if (!isConnected) return;

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

    // User typing
    const unsubTyping = chatService.addEventListener('UserTyping', (data) => {
      if (currentRoom && data.ChatRoomId === currentRoom.chatRoomId) {
        setTypingUsers((prev) => new Set(prev).add(data.Username));
      }
    });

    // User stopped typing
    const unsubStopTyping = chatService.addEventListener('UserStoppedTyping', (data) => {
      if (currentRoom && data.ChatRoomId === currentRoom.chatRoomId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.Username);
          return newSet;
        });
      }
    });

    // Connection events
    const unsubReconnected = chatService.addEventListener('reconnected', () => {
      setIsConnected(true);
      message.success('Đã kết nối lại chat');
      // Rejoin current room if any
      if (currentRoom) {
        chatService.joinChatRoom(currentRoom.chatRoomId);
      }
    });

    const unsubClosed = chatService.addEventListener('closed', () => {
      setIsConnected(false);
      message.warning('Mất kết nối chat');
    });

    // Cleanup
    return () => {
      unsubReceiveMessage();
      unsubTyping();
      unsubStopTyping();
      unsubReconnected();
      unsubClosed();
    };
  }, [isConnected, currentRoom, fetchChatRooms]);

  /**
   * Auto connect khi mount
   */
  useEffect(() => {
    connectChat();
    fetchChatRooms();

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
    closeChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
