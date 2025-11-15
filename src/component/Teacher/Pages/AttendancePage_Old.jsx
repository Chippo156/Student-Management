import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Table, Tag, Space, DatePicker } from 'antd';
import {
  EventAvailable,
  EventBusy,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  teacherService,
  courseService,
  gradeService,
  sectionService,
  studentServices,
} from '../../../service';
import dayjs from 'dayjs';

const AttendancePage = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [openCreateSessionModal, setOpenCreateSessionModal] = useState(false);
  const [openSessionDetailModal, setOpenSessionDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionData, setSessionData] = useState({
    sessionName: '',
    startTime: '7:00',
    endTime: '7:00',
    room: '',
    description: '',
    practiceGroupId: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  // Theme-aware colors
  const colors = useMemo(
    () => ({
      bgCard: theme.palette.background.paper,
      bgPage: theme.palette.background.default,
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
      border: theme.palette.divider,
      bgSuccessSoft: alpha(theme.palette.success.main, 0.12),
      bgWarningSoft: alpha(theme.palette.warning.main, 0.12),
      bgErrorSoft: alpha(theme.palette.error.main, 0.12),
      bgPrimarySoft: alpha(theme.palette.primary.main, 0.12),
    }),
    [theme]
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await sectionService.getSectionsIsStartingByLecturer();
        setCourses(response.items || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (lecturerId) {
      fetchCourses();
    }
  }, [lecturerId]);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const params = {
          pageNumber: 1,
          pageSize: 100, // Load nhiều để hiển thị tất cả
          fromDate: fromDate.format('YYYY-MM-DD'),
          toDate: toDate.format('YYYY-MM-DD'),
        };

        if (selectedCourse) {
          params.sectionId = selectedCourse;
        }

        const response = await teacherService.getMySessions(params);
        setSessions(response.items || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải danh sách phiên điểm danh',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [selectedCourse, fromDate, toDate]);

  // Tạo phiên điểm danh mới
  const handleCreateSession = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
      const payload = {
        sectionId: selectedCourse,
        sessionDate: dayjs().format('YYYY-MM-DD'), // Dùng ngày hiện tại
        startTime: sessionData.startTime + ':00',
        endTime: sessionData.endTime + ':00',
        sessionName: sessionData.sessionName || 'Buổi ' + dayjs().format('DD/MM'),
        description: sessionData.description,
        room: sessionData.room,
        practiceGroupId: sessionData.practiceGroupId,
      };

      const response = await teacherService.createAttendanceSession(payload);

      if (response.success) {
        setOpenCreateSessionModal(false);
        // Reset form
        setSessionData({
          sessionName: '',
          startTime: '7:00',
          endTime: '7:00',
          room: '',
          description: '',
          practiceGroupId: null,
        });

        // Load lại danh sách sessions
        const params = {
          pageNumber: 1,
          pageSize: 100,
          fromDate: fromDate.format('YYYY-MM-DD'),
          toDate: toDate.format('YYYY-MM-DD'),
        };

        if (selectedCourse) {
          params.sectionId = selectedCourse;
        }

        const sessionsResponse = await teacherService.getMySessions(params);
        setSessions(sessionsResponse.items || []);

        setSnackbar({
          open: true,
          message: 'Tạo phiên điểm danh thành công!',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tạo phiên điểm danh',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mở modal chi tiết session
  const handleViewSession = (session) => {
    setSelectedSession(session);
    setOpenSessionDetailModal(true);
  };

  // Lấy màu sắc cho trạng thái điểm danh
  const getStatusColor = (status) => {
    const statusColors = {
      0: 'default', // Unknown
      1: 'success', // Present
      2: 'error',   // Absent
      3: 'warning', // Late
      4: 'info',    // Excused
      5: 'secondary', // Left
    };
    return statusColors[status] || 'default';
  };

  // Lấy text tiếng Việt cho trạng thái
  const getStatusText = (status) => {
    const statusTexts = {
      0: 'Chưa điểm danh',
      1: 'Có mặt',
      2: 'Vắng mặt',
      3: 'Đi muộn',
      4: 'Vắng có phép',
      5: 'Về sớm',
    };
    return statusTexts[status] || 'Unknown';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Columns cho bảng sessions
  const sessionColumns = [
    {
      title: 'Mã phiên',
      dataIndex: 'attendanceSessionId',
      key: 'attendanceSessionId',
      width: 80,
    },
    {
      title: 'Tên phiên',
      dataIndex: 'sessionName',
      key: 'sessionName',
      width: 120,
    },
    {
      title: 'Môn học',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 200,
    },
    {
      title: 'Lớp học',
      dataIndex: 'sectionCode',
      key: 'sectionCode',
      width: 120,
    },
    {
      title: 'Ngày',
      dataIndex: 'sessionDate',
      key: 'sessionDate',
      width: 100,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 120,
      render: (_, record) => `${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)}`,
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
      width: 80,
      render: (room) => room || '-',
    },
    {
      title: 'Số SV',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 80,
    },
    {
      title: 'Có mặt',
      dataIndex: 'presentCount',
      key: 'presentCount',
      width: 80,
      render: (count, record) => (
        <span style={{ color: colors.success }}>
          {count} ({record.attendanceRate.toFixed(1)}%)
        </span>
      ),
    },
    {
      title: 'Vắng',
      dataIndex: 'absentCount',
      key: 'absentCount',
      width: 60,
      render: (count) => <span style={{ color: colors.error }}>{count}</span>,
    },
    {
      title: 'Đi muộn',
      dataIndex: 'lateCount',
      key: 'lateCount',
      width: 80,
      render: (count) => <span style={{ color: colors.warning }}>{count}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleViewSession(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          sx={{ mb: 4, fontWeight: 'bold', color: colors.text }}
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
                backgroundColor: colors.bgSuccessSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailable
                  sx={{ fontSize: 40, color: colors.success, mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
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
                backgroundColor: colors.bgErrorSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusy sx={{ fontSize: 40, color: colors.error, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
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
                backgroundColor: colors.bgWarningSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday
                  sx={{ fontSize: 40, color: colors.warning, mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
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
                backgroundColor: colors.bgPrimarySoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: colors.primary, mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
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
                    <MenuItem key={course.sectionId} value={course.sectionId}>
                      {course.courseName} - {course.sectionCode}
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
                {!currentSession && selectedCourse && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenCreateSessionModal(true)}
                    disabled={loading}
                  >
                    Tạo phiên điểm danh
                  </Button>
                )}
                {currentSession && (
                  <Chip
                    label={`Phiên: ${currentSession.sessionName}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
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
      ) : selectedCourse ? (
        <Fade in={true} timeout={1200}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Vui lòng tạo phiên điểm danh để bắt đầu
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => setOpenCreateSessionModal(true)}
              disabled={loading}
            >
              Tạo phiên điểm danh
            </Button>
          </Card>
        </Fade>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn môn học để bắt đầu điểm danh
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

      {/* Create Session Modal */}
      <Dialog
        open={openCreateSessionModal}
        onClose={() => setOpenCreateSessionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo phiên điểm danh</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên phiên điểm danh"
                value={sessionData.sessionName}
                onChange={(e) =>
                  setSessionData({ ...sessionData, sessionName: e.target.value })
                }
                placeholder="Ví dụ: Buổi 1, Tiết 1..."
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Thời gian bắt đầu"
                type="time"
                value={sessionData.startTime}
                onChange={(e) =>
                  setSessionData({ ...sessionData, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Thời gian kết thúc"
                type="time"
                value={sessionData.endTime}
                onChange={(e) =>
                  setSessionData({ ...sessionData, endTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phòng học"
                value={sessionData.room}
                onChange={(e) =>
                  setSessionData({ ...sessionData, room: e.target.value })
                }
                placeholder="Ví dụ: P301, Lab 1..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={2}
                value={sessionData.description}
                onChange={(e) =>
                  setSessionData({ ...sessionData, description: e.target.value })
                }
                placeholder="Thông tin thêm về phiên điểm danh..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateSessionModal(false)}>Hủy</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            color="primary"
            disabled={loading || !sessionData.sessionName}
          >
            {loading ? 'Đang tạo...' : 'Tạo phiên'}
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
