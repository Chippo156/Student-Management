import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme, alpha } from '@mui/material/styles';
import { Schedule, ArrowForward, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import scheduleService from '../../../../service/scheduleService';
import dayjs from 'dayjs';

const TeacherScheduleToday = ({ lecturerId }) => {
  const theme = useTheme();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const colors = useMemo(() => ({
    warning: theme.palette.warning.main,
    warningLight: alpha(theme.palette.warning.main, 0.08),
    warningHover: alpha(theme.palette.warning.main, 0.12),
    disabled: theme.palette.action.disabled,
  }), [theme]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        // Schedule type 1 = lịch lý thuyết (theory schedule)
        const scheduleData = await scheduleService.getSchedulesOfLecturer(today, 1);

        // Filter today's schedules (API might return multiple days based on dayOfWeek)
        const todayDayOfWeek = dayjs().day();
        const todayClasses = scheduleData.filter(
          (item) => item.dayOfWeek === todayDayOfWeek
        );

        setTodaySchedule(todayClasses);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setTodaySchedule([]);
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
          <Schedule sx={{ mr: 1, color: colors.warning }} />
          <Typography variant="h6" fontWeight="bold">
            Lịch dạy hôm nay
          </Typography>
        </Box>

        {todaySchedule.length > 0 ? (
          <>
            <List>
              {todaySchedule
                .sort((a, b) => {
                  // Sort by startTime in ascending order
                  const timeA = a.startTime || '00:00:00';
                  const timeB = b.startTime || '00:00:00';
                  return timeA.localeCompare(timeB);
                })
                .map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderLeft: `3px solid ${colors.warning}`,
                    mb: 1,
                    bgcolor: colors.warningLight,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: colors.warningHover,
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
                          <Typography variant="body2">
                            {item.startTime?.substring(0, 5)} - {item.endTime?.substring(0, 5)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={`Phòng ${item.room}`}
                            size="small"
                            color="warning"
                          />
                          <Chip
                            label={item.courseCode}
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
            <Schedule sx={{ fontSize: 60, color: colors.disabled, mb: 2 }} />
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
