import React from 'react';
import { Fade, Slide, Box } from '@mui/material';

/**
 * PageTransition component - Wrapper for page animations
 * @param {React.ReactNode} children - The page content
 * @param {string} direction - Animation direction: 'up', 'down', 'left', 'right'
 * @param {number} timeout - Animation duration in ms
 * @param {string} type - Animation type: 'fade', 'slide', 'both'
 */
const PageTransition = ({
  children,
  direction = 'up',
  timeout = 600,
  type = 'fade',
}) => {
  if (type === 'slide') {
    return (
      <Slide direction={direction} in={true} timeout={timeout}>
        <Box>{children}</Box>
      </Slide>
    );
  }

  if (type === 'both') {
    return (
      <Fade in={true} timeout={timeout}>
        <Box>
          <Slide direction={direction} in={true} timeout={timeout}>
            <Box>{children}</Box>
          </Slide>
        </Box>
      </Fade>
    );
  }

  // Default: fade only
  return (
    <Fade in={true} timeout={timeout}>
      <Box>{children}</Box>
    </Fade>
  );
};

export default PageTransition;
