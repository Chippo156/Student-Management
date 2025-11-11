import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Fade,
} from '@mui/material';
import {
  TrendingUp,
  Grade,
  Assignment,
  EventAvailable,
  Upload,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const TeacherRecentActivity = () => {
  // Mock data - sẽ thay bằng API sau
  const activities = [
    {
      type: 'grade',
      icon: <Grade />,
      title: 'Đã chấm điểm',
      description: 'Bài kiểm tra giữa kỳ - Lập trình Web',
      time: dayjs().subtract(2, 'hour'),
      color: '#1976d2',
    },
    {
      type: 'attendance',
      icon: <EventAvailable />,
      title: 'Điểm danh lớp học',
      description: 'Cơ sở dữ liệu - Lớp CNTT-K17',
      time: dayjs().subtract(4, 'hour'),
      color: '#388e3c',
    },
    {
      type: 'assignment',
      icon: <Assignment />,
      title: 'Giao bài tập mới',
      description: 'Bài tập tuần 5 - Lập trình Web',
      time: dayjs().subtract(1, 'day'),
      color: '#f57c00',
    },
    {
      type: 'material',
      icon: <Upload />,
      title: 'Tải lên tài liệu',
      description: 'Slide bài giảng tuần 6',
      time: dayjs().subtract(2, 'day'),
      color: '#7b1fa2',
    },
  ];

  return (
    <Fade in={true} timeout={1600}>
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" fontWeight="bold">
            Hoạt động gần đây
          </Typography>
        </Box>

        <List>
          {activities.map((activity, index) => (
            <ListItem
              key={index}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  transition: 'all 0.2s',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: `${activity.color}15`,
                    color: activity.color,
                  }}
                >
                  {activity.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {activity.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      {activity.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {activity.time.fromNow()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Fade>
  );
};

export default TeacherRecentActivity;
