import React, { useState } from 'react';
import ChatButton from './ChatButton';
import ChatModal from './ChatModal';
import { useChat } from '../../context/ChatContext';
import { message } from 'antd';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useChat();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChatButton onClick={handleToggle} />
      <ChatModal open={isOpen} onClose={handleClose} />
    </>
  );
};

export default ChatWidget;
