import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * StatsCard - Component card thống kê chung
 * @param {ReactNode} icon - Icon hiển thị
 * @param {string|number} value - Giá trị số
 * @param {string} label - Label mô tả
 * @param {string} color - Màu chủ đạo (primary, success, error, warning, info)
 */
const StatsCard = ({ icon, value, label, color = 'primary' }) => {
  const theme = useTheme();

  const colorMap = {
    primary: {
      bg: theme.palette.mode === 'light' ? theme.palette.primary.light + '20' : theme.palette.primary.dark + '30',
      iconColor: theme.palette.primary.main,
      textColor: theme.palette.primary.main,
    },
    success: {
      bg: theme.palette.mode === 'light' ? theme.palette.success.light + '20' : theme.palette.success.dark + '30',
      iconColor: theme.palette.success.main,
      textColor: theme.palette.success.main,
    },
    error: {
      bg: theme.palette.mode === 'light' ? theme.palette.error.light + '20' : theme.palette.error.dark + '30',
      iconColor: theme.palette.error.main,
      textColor: theme.palette.error.main,
    },
    warning: {
      bg: theme.palette.mode === 'light' ? theme.palette.warning.light + '20' : theme.palette.warning.dark + '30',
      iconColor: theme.palette.warning.main,
      textColor: theme.palette.warning.main,
    },
    info: {
      bg: theme.palette.mode === 'light' ? theme.palette.secondary.light + '20' : theme.palette.secondary.dark + '30',
      iconColor: theme.palette.secondary.main,
      textColor: theme.palette.secondary.main,
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Card
      sx={{
        bgcolor: colors.bg,
        boxShadow: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2.5 }}>
        <Box
          sx={{
            mr: 2,
            color: colors.iconColor,
            fontSize: 48,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: colors.textColor }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
