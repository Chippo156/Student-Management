import React from 'react';
import { Fab, Badge, Tooltip, Zoom } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';

const ChatButton = ({ onClick }) => {
  const { unreadCount, isConnected } = useChat();

  const fabButton = (
    <Fab
      color="primary"
      onClick={onClick}
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
  );

  return (
    <Zoom in={true}>
      <Tooltip
        title={isConnected ? 'Mở chat' : 'Mở chat (chế độ xem)'}
        placement="left"
      >
        {fabButton}
      </Tooltip>
    </Zoom>
  );
};

export default ChatButton;
