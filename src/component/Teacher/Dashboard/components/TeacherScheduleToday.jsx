import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Fade,
} from '@mui/material';
import { Schedule, ArrowForward, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../../../service';
import dayjs from 'dayjs';

const TeacherScheduleToday = ({ lecturerId }) => {
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await teacherService.getTeacherSchedule(lecturerId);
        const scheduleData = response.data || [];

        // Lọc lịch hôm nay
        const today = dayjs().format('YYYY-MM-DD');
        const todayClasses = scheduleData.filter(
          (item) => dayjs(item.date).format('YYYY-MM-DD') === today
        );

        setTodaySchedule(todayClasses);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        // Mock data if API fails
        setTodaySchedule([
          {
            courseName: 'Lập trình Web',
            time: '07:00 - 09:00',
            room: 'A101',
            class: 'CNTT-K17',
          },
          {
            courseName: 'Cơ sở dữ liệu',
            time: '13:00 - 15:00',
            room: 'B203',
            class: 'CNTT-K18',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchSchedule();
    }
  }, [lecturerId]);

  return (
    <Fade in={!loading} timeout={1200}>
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Schedule sx={{ mr: 1, color: '#f57c00' }} />
          <Typography variant="h6" fontWeight="bold">
            Lịch dạy hôm nay
          </Typography>
        </Box>

        {todaySchedule.length > 0 ? (
          <>
            <List>
              {todaySchedule.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderLeft: '3px solid #f57c00',
                    mb: 1,
                    bgcolor: '#fff3e0',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#ffe0b2',
                      transform: 'translateX(5px)',
                      transition: 'all 0.2s',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600}>
                        {item.courseName}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{item.time}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={`Phòng ${item.room}`}
                            size="small"
                            color="warning"
                          />
                          <Chip
                            label={item.class}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/teacher/schedule')}
              sx={{ mt: 2 }}
            >
              Xem lịch đầy đủ
            </Button>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Schedule sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Không có lịch dạy hôm nay
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default TeacherScheduleToday;
