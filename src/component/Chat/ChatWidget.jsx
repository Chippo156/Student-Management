import React, { useState } from 'react';
import ChatButton from './ChatButton';
import ChatModal from './ChatModal';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

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
