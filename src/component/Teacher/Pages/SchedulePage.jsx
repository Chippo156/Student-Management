import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import { Schedule, CalendarToday, AccessTime } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService } from '../../../service';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await teacherService.getTeacherSchedule(lecturerId);
        setSchedule(response.data || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchSchedule();
    }
  }, [lecturerId]);

  const getDayOfWeek = (date) => {
    const days = [
      'Chủ nhật',
      'Thứ hai',
      'Thứ ba',
      'Thứ tư',
      'Thứ năm',
      'Thứ sáu',
      'Thứ bảy',
    ];
    return days[new Date(date).getDay()];
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      upcoming: { label: 'Sắp tới', color: 'warning' },
      ongoing: { label: 'Đang diễn ra', color: 'success' },
      completed: { label: 'Đã kết thúc', color: 'default' },
      cancelled: { label: 'Đã hủy', color: 'error' },
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Nhóm lịch theo ngày
  const groupScheduleByDate = (scheduleData) => {
    const grouped = scheduleData.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Sắp xếp theo ngày
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .reduce((acc, date) => {
        acc[date] = grouped[date].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        return acc;
      }, {});
  };

  const groupedSchedule = groupScheduleByDate(schedule);
  const todaySchedule = schedule.filter(
    (item) => new Date(item.date).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Lịch giảng dạy
      </Typography>

      {/* Today's Schedule Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
              >
                <CalendarToday sx={{ mr: 1 }} />
                Lịch hôm nay
              </Typography>
              {todaySchedule.length > 0 ? (
                todaySchedule.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      backgroundColor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}{' '}
                      | {item.room}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có lịch dạy hôm nay
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: '#e8f5e8', height: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
              >
                <Schedule sx={{ mr: 1 }} />
                Thống kê tuần này
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {schedule.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiết học
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {new Set(schedule.map((item) => item.courseId)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Môn học
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Schedule */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Lịch chi tiết
          </Typography>
        </Box>

        {Object.keys(groupedSchedule).length > 0 ? (
          Object.entries(groupedSchedule).map(([date, daySchedule]) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {getDayOfWeek(date)} -{' '}
                  {new Date(date).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Môn học</TableCell>
                      <TableCell>Phòng học</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {daySchedule.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime
                              sx={{
                                fontSize: 16,
                                mr: 1,
                                color: 'text.secondary',
                              }}
                            />
                            {formatTime(item.startTime)} -{' '}
                            {formatTime(item.endTime)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {item.courseName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.courseCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.room}</TableCell>
                        <TableCell>{getStatusChip(item.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              /* Navigate to class detail */
                            }}
                          >
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Không có lịch giảng dạy nào
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SchedulePage;
