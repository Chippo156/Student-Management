import React, { useMemo } from 'react';
import { Paper, Typography, Box, Grid, Button, Fade } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Grade,
  EventAvailable,
  Assignment,
  Folder,
  People,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TeacherQuickActions = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      secondary: theme.palette.secondary.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    }),
    [theme]
  );

  const actions = [
    {
      title: 'Chấm điểm',
      icon: <Grade sx={{ fontSize: 40 }} />,
      color: colors.primary,
      path: '/teacher/grades',
    },
    {
      title: 'Điểm danh',
      icon: <EventAvailable sx={{ fontSize: 40 }} />,
      color: colors.success,
      path: '/teacher/attendance',
    },
    {
      title: 'Bài tập',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: colors.warning,
      path: '/teacher/assignments',
    },
    {
      title: 'Tài liệu',
      icon: <Folder sx={{ fontSize: 40 }} />,
      color: colors.secondary,
      path: '/teacher/materials',
    },
    {
      title: 'Sinh viên',
      icon: <People sx={{ fontSize: 40 }} />,
      color: colors.error,
      path: '/teacher/students',
    },
    {
      title: 'Lịch dạy',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      color: colors.info,
      path: '/teacher/schedule',
    },
  ];

  return (
    <Fade in={true} timeout={1400}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Thao tác nhanh
        </Typography>

        <Grid
          container
          className="equal-height-cards"
          spacing={2}
          sx={{ mt: 1 }}
        >
          {actions.map((action, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(action.path)}
                sx={{
                  height: 120,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: action.color,
                  color: action.color,
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: `${action.color}15`,
                    transform: 'translateY(-5px)',
                    boxShadow: `0 5px 15px ${action.color}40`,
                  },
                }}
              >
                <Box sx={{ color: action.color }}>{action.icon}</Box>
                <Typography variant="caption" fontWeight={600}>
                  {action.title}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Fade>
  );
};

export default TeacherQuickActions;
