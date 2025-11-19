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
  Person as PersonIcon,
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';

const ChatModal = ({ open, onClose }) => {
  // ✅ Lấy user từ Redux
  const reduxUser = useSelector((state) => state.user?.account);

  const {
    currentRoom,
    messages,
    chatRooms,
    typingUsers,
    isLoading,
    openChatRoom,
    openClassTeacherChat,
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

  // Auto scroll to bottom khi:
  // 1. Có tin nhắn mới
  // 2. Có người đang typing (typingUsers thay đổi)
  // 3. Mở room mới (currentRoom thay đổi)
  // 4. Mở modal (open thay đổi từ false -> true)
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers, currentRoom, open, isMinimized]);

  // Filter chat rooms - tìm theo tên room hoặc tên giảng viên
  const filteredRooms = chatRooms.filter((room) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.roomName?.toLowerCase().includes(searchLower) ||
      room.lecturerName?.toLowerCase().includes(searchLower) ||
      room.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentRoom) {
      return;
    }

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
    await openChatRoom(room); // Truyền toàn bộ room object
    setTabValue(1); // Chuyển sang tab chat
  };

  const handleOpenTeacherChat = async () => {
    await openClassTeacherChat();
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
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));

        const userId =
          payload[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ] ||
          payload.sub ||
          payload.userId;

        const username =
          payload[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
          ] || payload.username;

        return {
          id: parseInt(userId),
          userId: parseInt(userId),
          username: username,
          fullName: reduxUser?.user?.fullName || reduxUser?.fullName,
          avatarUrl: reduxUser?.user?.avatarUrl || reduxUser?.avatarUrl,
        };
      }

      if (reduxUser?.userId) {
        return {
          id: reduxUser.userId,
          userId: reduxUser.userId,
          username: reduxUser.username,
          ...reduxUser,
        };
      }

      return null;
    } catch (error) {
      console.error('getUserInfo error:', error);
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
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'white',
                  color: 'primary.main',
                }}
              >
                {currentRoom?.roomName?.[0]?.toUpperCase() ||
                  currentRoom?.lecturerName?.[0]?.toUpperCase() ||
                  'C'}
              </Avatar>
            </Badge>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {currentRoom?.roomName || currentRoom?.lecturerName || 'Chat'}
              </Typography>
              {isConnected && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {typingUsers?.size > 0
                    ? `đang nhập...`
                    : currentRoom?.lecturerName
                      ? `GV: ${currentRoom.lecturerName}`
                      : 'Đang hoạt động'}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <Tooltip title={isMinimized ? 'Mở rộng' : 'Thu gọn'}>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <MinimizeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Đóng">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={onClose}
              >
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
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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

              {/* Quick action: Chat với giảng viên chủ nhiệm */}
              <Box sx={{ px: 2, pb: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  onClick={handleOpenTeacherChat}
                  disabled={!isConnected || isLoading}
                  size="small"
                >
                  Chat với giảng viên chủ nhiệm
                </Button>
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
                              {room.roomName?.[0]?.toUpperCase() ||
                                room.lecturerName?.[0]?.toUpperCase() ||
                                '?'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: room.unreadCount > 0 ? 600 : 400,
                                }}
                              >
                                {room.roomName}
                              </Typography>
                              {room.lecturerName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  GV: {room.lecturerName}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {room.lastMessage?.content ||
                                'Bắt đầu trò chuyện'}
                            </Typography>
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {room.lastMessage?.sentAt &&
                            formatLastMessageTime(room.lastMessage.sentAt)}
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
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
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
                  overflowY: 'auto',
                  p: 2,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minHeight: 0, // Important for flex scrolling
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
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
                    const isMyMessage =
                      msg.senderId === currentUser?.id ||
                      msg.senderId === currentUser?.userId;

                    return (
                      <Box
                        key={msg.chatMessageId || index}
                        sx={{
                          display: 'flex',
                          justifyContent: isMyMessage
                            ? 'flex-end'
                            : 'flex-start',
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
                          {/* Hiển thị tên người gửi nếu không phải tin nhắn của mình */}
                          {!isMyMessage && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ px: 1, mb: 0.5 }}
                            >
                              {msg.senderName} • {msg.senderRole}
                            </Typography>
                          )}
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
                            {/* Reply indicator */}
                            {msg.replyToMessage && (
                              <Box
                                sx={{
                                  mb: 1,
                                  p: 1,
                                  borderLeft: 3,
                                  borderColor: isMyMessage
                                    ? 'rgba(255,255,255,0.3)'
                                    : 'primary.main',
                                  bgcolor: isMyMessage
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(0,0,0,0.05)',
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.8, display: 'block' }}
                                >
                                  {msg.replyToMessage.senderName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.9 }}
                                >
                                  {msg.replyToMessage.content}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              variant="body2"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {msg.content}
                            </Typography>
                            {msg.editedAt && (
                              <Typography
                                variant="caption"
                                sx={{
                                  opacity: 0.7,
                                  fontStyle: 'italic',
                                  display: 'block',
                                  mt: 0.5,
                                }}
                              >
                                (đã chỉnh sửa)
                              </Typography>
                            )}
                          </Paper>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, px: 1 }}
                          >
                            {formatMessageTime(msg.sentAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}

                {/* Typing indicator as message bubble - Zalo/Messenger style */}
                {typingUsers?.length > 0 &&
                  typingUsers.map((username) => (
                    <Box
                      key={`typing-${username}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        mb: 1,
                        animation: 'fadeIn 0.3s ease-in',
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'translateY(10px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ px: 1, mb: 0.5 }}
                        >
                          {username}
                        </Typography>
                        <Paper
                          elevation={1}
                          sx={{
                            py: 1.5,
                            px: 2,
                            bgcolor: 'white',
                            borderRadius: 2,
                            borderTopLeftRadius: 0,
                            minWidth: 60,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* Wave animation dots - Zalo style */}
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.75,
                              alignItems: 'center',
                              height: 16,
                              '& > span': {
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#90a4ae',
                                animation: 'wave 1.4s ease-in-out infinite',
                                '&:nth-of-type(1)': { animationDelay: '0s' },
                                '&:nth-of-type(2)': { animationDelay: '0.2s' },
                                '&:nth-of-type(3)': { animationDelay: '0.4s' },
                              },
                              '@keyframes wave': {
                                '0%, 60%, 100%': {
                                  transform: 'translateY(0)',
                                  opacity: 0.6,
                                },
                                '30%': {
                                  transform: 'translateY(-8px)',
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            <span />
                            <span />
                            <span />
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  ))}

                <div ref={messagesEndRef} />
              </Box>

              {/* Input */}
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  bgcolor: 'white',
                  flexShrink: 0,
                }}
              >
                {!isConnected && (
                  <Box
                    sx={{
                      mb: 1,
                      p: 1,
                      bgcolor: 'warning.light',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Đang kết nối real-time... Bạn có thể xem tin nhắn nhưng
                      chưa thể gửi.
                    </Typography>
                  </Box>
                )}
                <TextField
                  fullWidth
                  size="small"
                  placeholder={
                    isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'
                  }
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
