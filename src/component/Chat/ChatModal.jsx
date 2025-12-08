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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
  Search as SearchIcon,
  Circle as CircleIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  School as SchoolIcon,
  DeleteSweep as DeleteSweepIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import { chatApi } from '../../service/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const ChatModal = ({ open, onClose }) => {
  const theme = useTheme();
  const reduxUser = useSelector((state) => state.user?.account);

  // ✅ Lấy role từ Redux
  const userRole = localStorage.getItem('role');

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && !isMinimized && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers, currentRoom, open, isMinimized]);

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

    if (e.target.value.length > 0) {
      startTyping();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

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
    await openChatRoom(room);
    setTabValue(1);
  };

  const handleOpenTeacherChat = async () => {
    await openClassTeacherChat();
    setTabValue(1);
  };

  const handleOpenAIChat = async () => {
    try {
      const response = await chatApi.createAIRoom();
      if (response?.data) {
        await openChatRoom(response.data);
        setTabValue(1);
      }
    } catch (error) {
      console.error('Failed to create AI chat room:', error);
    }
  };

  const handleOpenAcademicStaffChat = async () => {
    try {
      const response = await chatApi.createAcademicStaffRoom();
      if (response?.data) {
        await openChatRoom(response.data);
        setTabValue(1);
      }
    } catch (error) {
      console.error('Failed to create academic staff chat room:', error);
    }
  };

  const handleBack = () => {
    closeChatRoom();
    setTabValue(0);
  };

  const handleClearHistory = async () => {
    if (!currentRoom?.chatRoomId) return;
    setShowDeleteDialog(false);

    try {
      const success = await chatApi.clearHistory(currentRoom.chatRoomId);
      if (success) {
        await closeChatRoom();
        await openChatRoom(currentRoom);
      }
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
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

  // ✅ Render Quick Actions dựa trên role
  const renderQuickActions = () => {
    // Chỉ sinh viên mới thấy quick actions
    if (userRole == 2) {
      return (
        <Box
          sx={{
            px: 2,
            pb: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexShrink: 0,
          }}
        >
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
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SmartToyIcon />}
            onClick={handleOpenAIChat}
            disabled={!isConnected || isLoading}
            size="small"
            color="secondary"
          >
            Chat với AI
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={handleOpenAcademicStaffChat}
            disabled={!isConnected || isLoading}
            size="small"
            color="info"
          >
            Chat với Học vụ
          </Button>
        </Box>
      );
    }

    // Giảng viên và Admin chỉ thấy danh sách chat rooms
    return null;
  };

  // ✅ Get title dựa trên role
  const getChatTitle = () => {
    if (userRole == 3) {
      return 'Tin nhắn từ sinh viên';
    }
    if (userRole == 1) {
      return 'Tin nhắn';
    }
    return 'Chat';
  };

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
                {currentRoom?.roomName ||
                  currentRoom?.lecturerName ||
                  getChatTitle()}
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentRoom &&
              currentRoom.roomName?.toLowerCase().includes('ai') && (
                <Tooltip title="Xóa lịch sử chat">
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              )}
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
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background:
                    theme.palette.mode === 'dark' ? '#2d3748' : '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background:
                    theme.palette.mode === 'dark' ? '#4a5568' : '#888',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background:
                    theme.palette.mode === 'dark' ? '#718096' : '#555',
                },
              }}
            >
              {/* Search */}
              <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
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

              {/* ✅ Quick actions - chỉ hiện cho Student */}
              {renderQuickActions()}

              {/* Rooms List */}
              <List sx={{ p: 0, flexShrink: 0 }}>
                {filteredRooms.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {userRole == 2
                        ? 'Chưa có cuộc trò chuyện nào'
                        : 'Chưa có tin nhắn nào từ sinh viên'}
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
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  maxWidth: 200,
                                }}
                              >
                                {room.roomName}
                              </Typography>
                              {room.lecturerName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    maxWidth: 200,
                                  }}
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
                              sx={{
                                display: '-webkit-box',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxWidth: 200,
                              }}
                            >
                              {room.lastMessage?.content ||
                                'Bắt đầu trò chuyện'}
                            </Typography>
                          }
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '60px',
                          }}
                        >
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
            // Chat messages (giữ nguyên phần này)
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Chip
                  label="← Quay lại"
                  onClick={handleBack}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  overflowY: 'auto',
                  p: 2,
                  bgcolor:
                    theme.palette.mode === 'dark' ? '#1E293B' : 'grey.100',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minHeight: 0,
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
                              bgcolor: isMyMessage
                                ? 'primary.main'
                                : 'background.paper',
                              color: isMyMessage ? 'white' : 'text.primary',
                              borderRadius: 2,
                              borderTopRightRadius: isMyMessage ? 0 : 2,
                              borderTopLeftRadius: isMyMessage ? 2 : 0,
                            }}
                          >
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
                                    : theme.palette.mode === 'dark'
                                      ? 'rgba(255,255,255,0.05)'
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
                            <Box
                              sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                '& p': {
                                  margin: 0,
                                  marginBottom: '8px',
                                  '&:last-child': { marginBottom: 0 },
                                },
                                '& ul, & ol': {
                                  margin: 0,
                                  paddingLeft: '20px',
                                  marginBottom: '8px',
                                },
                                '& li': {
                                  marginBottom: '4px',
                                },
                                '& strong': {
                                  fontWeight: 700,
                                },
                                '& em': {
                                  fontStyle: 'italic',
                                },
                                '& code': {
                                  backgroundColor: isMyMessage
                                    ? 'rgba(255,255,255,0.2)'
                                    : theme.palette.mode === 'dark'
                                      ? 'rgba(255,255,255,0.1)'
                                      : 'rgba(0,0,0,0.1)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.875em',
                                  fontFamily: 'monospace',
                                },
                                '& pre': {
                                  backgroundColor: isMyMessage
                                    ? 'rgba(255,255,255,0.2)'
                                    : theme.palette.mode === 'dark'
                                      ? 'rgba(255,255,255,0.1)'
                                      : 'rgba(0,0,0,0.1)',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  overflow: 'auto',
                                  marginBottom: '8px',
                                  '& code': {
                                    backgroundColor: 'transparent',
                                    padding: 0,
                                  },
                                },
                                '& blockquote': {
                                  borderLeft: '4px solid',
                                  borderColor: isMyMessage
                                    ? 'rgba(255,255,255,0.5)'
                                    : 'primary.main',
                                  paddingLeft: '12px',
                                  margin: '8px 0',
                                  fontStyle: 'italic',
                                  opacity: 0.9,
                                },
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                  margin: '8px 0',
                                  fontWeight: 600,
                                },
                                '& a': {
                                  color: isMyMessage
                                    ? '#e3f2fd'
                                    : 'primary.main',
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                  p: ({ children }) => (
                                    <p style={{ marginBottom: '8px' }}>
                                      {children}
                                    </p>
                                  ),
                                  br: () => <br />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </Box>
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
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            borderTopLeftRadius: 0,
                            minWidth: 60,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
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

              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
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

        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'warning.main',
            }}
          >
            <WarningIcon />
            Xác nhận xóa lịch sử
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử tin nhắn trong phòng
              chat này?
            </Typography>
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 1, fontWeight: 500 }}
            >
              Hành động này không thể hoàn tác!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outlined"
              color="inherit"
            >
              Hủy
            </Button>
            <Button
              onClick={handleClearHistory}
              variant="contained"
              color="error"
              startIcon={<DeleteSweepIcon />}
            >
              Xóa lịch sử
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Slide>
  );
};

export default ChatModal;
