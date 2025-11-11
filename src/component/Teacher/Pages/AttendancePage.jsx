import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import { Table, Tag, Space, DatePicker } from 'antd';
import {
  EventAvailable,
  EventBusy,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService, courseService } from '../../../service';
import dayjs from 'dayjs';

const AttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await teacherService.getTeacherCourses(lecturerId);
        setCourses(response.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (lecturerId) {
      fetchCourses();
    }
  }, [lecturerId]);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedCourse) return;

      setLoading(true);
      try {
        // Fetch students
        const studentsResponse = await courseService.getCourseStudents(
          selectedCourse
        );
        const studentsData = studentsResponse.data || [];
        setStudents(studentsData);

        // Fetch attendance records
        try {
          const attendanceResponse =
            await teacherService.getAttendanceRecords(selectedCourse);
          const attendanceData = attendanceResponse.data || [];

          // Filter attendance for selected date
          const dateStr = selectedDate.format('YYYY-MM-DD');
          const todayAttendance = attendanceData.filter(
            (a) => a.date === dateStr
          );

          // Create attendance map
          const attendanceMap = {};
          todayAttendance.forEach((record) => {
            attendanceMap[record.studentId] = record.status;
          });

          setAttendance(attendanceMap);
        } catch (error) {
          console.log('No attendance records found');
          setAttendance({});
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedCourse, selectedDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const allAttendance = {};
    students.forEach((student) => {
      allAttendance[student.studentId] = status;
    });
    setAttendance(allAttendance);
  };

  const handleSaveAttendance = async () => {
    try {
      setLoading(true);

      const attendanceData = {
        courseId: selectedCourse,
        date: selectedDate.format('YYYY-MM-DD'),
        records: Object.entries(attendance).map(([studentId, status]) => ({
          studentId: parseInt(studentId),
          status,
        })),
      };

      await teacherService.takeAttendance(attendanceData);

      setSnackbar({
        open: true,
        message: 'Lưu điểm danh thành công!',
        severity: 'success',
      });
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu điểm danh',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate statistics
  const presentCount = Object.values(attendance).filter(
    (s) => s === 'present'
  ).length;
  const absentCount = Object.values(attendance).filter(
    (s) => s === 'absent'
  ).length;
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length;
  const attendanceRate = students.length
    ? ((presentCount / students.length) * 100).toFixed(1)
    : 0;

  const getAttendanceStatus = (studentId) => {
    return attendance[studentId] || null;
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (text) => (
        <Space>
          <Avatar sx={{ width: 32, height: 32 }}>
            {text?.charAt(0).toUpperCase()}
          </Avatar>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: 'Trạng thái điểm danh',
      key: 'attendance',
      width: 350,
      render: (_, record) => {
        const status = getAttendanceStatus(record.studentId);
        return (
          <Space>
            <Button
              variant={status === 'present' ? 'contained' : 'outlined'}
              color="success"
              size="small"
              onClick={() =>
                handleAttendanceChange(record.studentId, 'present')
              }
            >
              Có mặt
            </Button>
            <Button
              variant={status === 'late' ? 'contained' : 'outlined'}
              color="warning"
              size="small"
              onClick={() => handleAttendanceChange(record.studentId, 'late')}
            >
              Đi muộn
            </Button>
            <Button
              variant={status === 'absent' ? 'contained' : 'outlined'}
              color="error"
              size="small"
              onClick={() => handleAttendanceChange(record.studentId, 'absent')}
            >
              Vắng
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Ghi chú',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getAttendanceStatus(record.studentId);
        if (!status) return <Tag>Chưa điểm danh</Tag>;

        const statusConfig = {
          present: { label: 'Có mặt', color: 'success' },
          late: { label: 'Đi muộn', color: 'warning' },
          absent: { label: 'Vắng', color: 'error' },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Fade in={true} timeout={600}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 4, fontWeight: 'bold' }}
        >
          Điểm danh
        </Typography>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                backgroundColor: '#e8f5e9',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailable
                  sx={{ fontSize: 40, color: '#388e3c', mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {presentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Có mặt
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                backgroundColor: '#ffebee',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusy sx={{ fontSize: 40, color: '#d32f2f', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {absentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vắng
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                backgroundColor: '#fff3e0',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ fontSize: 40, color: '#f57c00', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {lateCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đi muộn
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={1400}>
            <Card
              sx={{
                backgroundColor: '#e3f2fd',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ có mặt
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Chọn môn học</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Chọn môn học"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
              />
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
              <Space>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => handleMarkAll('present')}
                  disabled={!selectedCourse || students.length === 0}
                >
                  Có mặt tất cả
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleMarkAll('absent')}
                  disabled={!selectedCourse || students.length === 0}
                >
                  Vắng tất cả
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    !selectedCourse ||
                    students.length === 0 ||
                    Object.keys(attendance).length === 0
                  }
                  onClick={() => setOpenConfirmDialog(true)}
                >
                  Lưu điểm danh
                </Button>
              </Space>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Attendance Table */}
      {selectedCourse ? (
        <Fade in={true} timeout={1200}>
          <Card>
            <Table
              columns={columns}
              dataSource={students}
              loading={loading}
              rowKey="studentId"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} sinh viên`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Fade>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn môn học và ngày để điểm danh
          </Typography>
        </Card>
      )}

      {/* Confirm Save Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Xác nhận lưu điểm danh</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn lưu điểm danh cho{' '}
            {selectedDate.format('DD/MM/YYYY')} không?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              - Có mặt: {presentCount} sinh viên
            </Typography>
            <Typography variant="body2">
              - Vắng: {absentCount} sinh viên
            </Typography>
            <Typography variant="body2">
              - Đi muộn: {lateCount} sinh viên
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveAttendance}
            variant="contained"
            color="primary"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendancePage;
