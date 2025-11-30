import React from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';

/**
 * ResponsiveTableContainer - Wrapper for tables to enable horizontal scrolling
 * Prevents tables from breaking the page layout on mobile/tablet devices
 *
 * Usage:
 * <ResponsiveTableContainer>
 *   <Table>...</Table>
 * </ResponsiveTableContainer>
 *
 * Props:
 * - elevation: Paper elevation (default: 2)
 * - noPaper: If true, renders without Paper wrapper
 * - sx: Additional styles
 */
const ResponsiveTableContainer = ({
  children,
  sx,
  elevation = 2,
  noPaper = false,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const containerStyles = {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'visible',
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
    borderRadius: 2,
    // Responsive padding adjustments
    '& .MuiTableCell-root': {
      padding: isMobile
        ? '8px 4px'
        : isTablet
        ? '12px 8px'
        : '16px',
      fontSize: isMobile ? '12px' : '14px',
    },
    // Handle fixed columns z-index
    '& .MuiTableCell-stickyHeader': {
      zIndex: 3,
      backgroundColor: theme.palette.background.paper,
    },
    // Ensure table doesn't break layout
    '& .MuiTable-root': {
      minWidth: isMobile ? '100%' : '650px',
    },
    // Custom scrollbar styling
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(0, 0, 0, 0.3)',
      },
    },
    ...sx,
  };

  if (noPaper) {
    return (
      <Box sx={containerStyles} {...props}>
        {children}
      </Box>
    );
  }

  return (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Box sx={containerStyles} {...props}>
        {children}
      </Box>
    </Paper>
  );
};

export default ResponsiveTableContainer;
