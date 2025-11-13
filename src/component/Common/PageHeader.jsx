import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * PageHeader - Component header chung cho tất cả các page
 * @param {string} title - Tiêu đề trang
 * @param {function} onRefresh - Callback khi click refresh
 * @param {ReactNode} actions - Các button/action bên phải
 */
const PageHeader = ({ title, onRefresh, actions }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {onRefresh && (
          <Tooltip title="Làm mới">
            <IconButton
              onClick={onRefresh}
              size="medium"
              sx={{
                bgcolor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? theme.palette.primary.light + '20' : theme.palette.background.hover,
                },
                boxShadow: 1,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
        {actions}
      </Box>
    </Box>
  );
};

export default PageHeader;
