import React from 'react';
import { Box, Paper } from '@mui/material';

/**
 * ResponsiveTableContainer - Wrapper for tables to enable horizontal scrolling
 * Prevents tables from breaking the page layout on mobile/tablet devices
 *
 * Usage:
 * <ResponsiveTableContainer>
 *   <Table>...</Table>
 * </ResponsiveTableContainer>
 */
const ResponsiveTableContainer = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'auto', // Enable horizontal scroll for table
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveTableContainer;
