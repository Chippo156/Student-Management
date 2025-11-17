import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
  CircularProgress,
  Chip,
  Slide,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
  Search as SearchIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatModal = ({ open, onClose }) => {
  const {
    currentRoom,
    messages,
    chatRooms,
    typingUsers,
    isLoading,
    openChatRoom,
    closeChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
    isConnected,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Filter chat rooms
  const filteredRooms = chatRooms.filter((room) =>
    room.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentRoom) return;

    const success = await sendMessage(inputMessage.trim());
    if (success) {
      setInputMessage('');
      stopTyping();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Gửi typing indicator
    if (e.target.value.length > 0) {
      startTyping();

      // Clear timeout cũ
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout mới để stop typing sau 2s
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectRoom = async (room) => {
    await openChatRoom(room.participantId, room.participantName);
    setTabValue(1); // Chuyển sang tab chat
  };

  const handleBack = () => {
    closeChatRoom();
    setTabValue(0); // Quay về tab danh sách
  };

  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: vi });
    } catch {
      return '';
    }
  };

  const formatLastMessageTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return format(date, 'HH:mm', { locale: vi });
      } else if (diffDays === 1) {
        return 'Hôm qua';
      } else if (diffDays < 7) {
        return format(date, 'EEEE', { locale: vi });
      } else {
        return format(date, 'dd/MM', { locale: vi });
      }
    } catch {
      return '';
    }
  };

  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getUserInfo();

  if (!open) return null;

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: isMinimized ? -430 : 24,
          right: 100,
          width: 380,
          height: 500,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge
              variant="dot"
              color={isConnected ? 'success' : 'error'}
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'white', color: 'primary.main' }}>
                {currentRoom?.participantName?.[0]?.toUpperCase() || 'C'}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {currentRoom ? currentRoom.participantName : 'Chat'}
              </Typography>
              {isConnected && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {typingUsers.length > 0
                    ? `${typingUsers[0]} đang nhập...`
                    : 'Đang hoạt động'}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <Tooltip title={isMinimized ? 'Mở rộng' : 'Thu gọn'}>
              <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsMinimized(!isMinimized)}>
                <MinimizeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Đóng">
              <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs */}
        {!currentRoom && (
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Danh sách" sx={{ flex: 1 }} />
            <Tab label="Chat" disabled={!currentRoom} sx={{ flex: 1 }} />
          </Tabs>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!currentRoom ? (
            // Danh sách chat rooms
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Search */}
              <Box sx={{ p: 2, pb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Rooms List */}
              <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {filteredRooms.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có cuộc trò chuyện nào
                    </Typography>
                  </Box>
                ) : (
                  filteredRooms.map((room) => (
                    <React.Fragment key={room.chatRoomId}>
                      <ListItemButton onClick={() => handleSelectRoom(room)}>
                        <ListItemAvatar>
                          <Badge
                            badgeContent={room.unreadCount}
                            color="error"
                            max={99}
                            overlap="circular"
                          >
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              {room.participantName?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: room.unreadCount > 0 ? 600 : 400 }}>
                              {room.participantName}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {room.lastMessage || 'Bắt đầu trò chuyện'}
                            </Typography>
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {room.lastMessageAt && formatLastMessageTime(room.lastMessageAt)}
                        </Typography>
                      </ListItemButton>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Box>
          ) : (
            // Chat messages
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Back button */}
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Chip
                  label="← Quay lại"
                  onClick={handleBack}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có tin nhắn nào
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUser?.userId;
                    return (
                      <Box
                        key={msg.messageId || index}
                        sx={{
                          display: 'flex',
                          justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '75%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.5,
                              bgcolor: isMyMessage ? 'primary.main' : 'white',
                              color: isMyMessage ? 'white' : 'text.primary',
                              borderRadius: 2,
                              borderTopRightRadius: isMyMessage ? 0 : 2,
                              borderTopLeftRadius: isMyMessage ? 2 : 0,
                            }}
                          >
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {msg.content}
                            </Typography>
                          </Paper>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
                            {formatMessageTime(msg.timestamp)}
                            {msg.isRead && isMyMessage && ' • Đã xem'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <Box sx={{ px: 2, py: 0.5, bgcolor: '#f5f5f5' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {typingUsers[0]} đang nhập...
                  </Typography>
                </Box>
              )}

              {/* Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Nhập tin nhắn..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={3}
                  disabled={!isConnected}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || !isConnected}
                          size="small"
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Slide>
  );
};

export default ChatModal;
