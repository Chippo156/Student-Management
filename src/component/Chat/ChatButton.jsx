import React from 'react';
import { Fab, Badge, Tooltip, Zoom } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';

const ChatButton = ({ onClick }) => {
  const { unreadCount, isConnected } = useChat();

  return (
    <Zoom in={true}>
      <Tooltip title={isConnected ? 'Mở chat' : 'Đang kết nối...'} placement="left">
        <Fab
          color="primary"
          onClick={onClick}
          disabled={!isConnected}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: 4,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s',
            },
            animation: isConnected ? 'none' : 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
              },
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <ChatIcon />
          </Badge>
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ChatButton;
