import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Fade,
} from '@mui/material';
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
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Chấm điểm',
      icon: <Grade sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/teacher/grades',
    },
    {
      title: 'Điểm danh',
      icon: <EventAvailable sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/teacher/attendance',
    },
    {
      title: 'Bài tập',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/teacher/assignments',
    },
    {
      title: 'Tài liệu',
      icon: <Folder sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/teacher/materials',
    },
    {
      title: 'Sinh viên',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/teacher/students',
    },
    {
      title: 'Lịch dạy',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      path: '/teacher/schedule',
    },
  ];

  return (
    <Fade in={true} timeout={1400}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Thao tác nhanh
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
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
