import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

/**
 * Reusable Statistics Card Component for Material-UI pages
 * @param {Object} props
 * @param {string} props.label - Label for the statistic
 * @param {number|string} props.value - Value to display
 * @param {React.Component} props.icon - Icon component from @mui/icons-material
 * @param {string} props.color - Color variant (primary, success, info, warning, error, secondary)
 * @param {string} props.trend - Optional trend indicator (e.g., '+12%')
 * @param {boolean} props.showTrend - Whether to show trend chip
 */
const StatCardMUI = ({
  label,
  value,
  icon: IconComponent,
  color = 'primary',
  trend,
  showTrend = false,
}) => {
  const theme = useTheme();

  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    text: theme.palette.text.primary,
  };

  const currentColor = colors[color] || colors.primary;

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(currentColor, 0.05)} 100%)`,
        border: `1px solid ${alpha(currentColor, 0.1)}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: alpha(currentColor, 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {showTrend && trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={trend}
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: alpha(currentColor, 0.1),
              color: currentColor,
            }}
          >
            {IconComponent && <IconComponent fontSize="large" />}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCardMUI;
