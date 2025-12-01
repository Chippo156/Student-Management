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
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  teacherService,
  courseService,
  gradeService,
  sectionService,
  studentServices,
  practiceService,
} from '../../../service';
import dayjs from 'dayjs';
import { exportAttendanceExcel } from '../../../until/exportAttendanceExcel';
import AttendanceStatistics from '../Components/AttendanceStatistics';
const AttendancePage = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Thêm state cho ngày đã chọn
  const [classType, setClassType] = useState(''); // 'theory' hoặc 'practice' hoặc '' (tất cả)
  const [practiceGroups, setPracticeGroups] = useState([]); // Danh sách nhóm thực hành
  const [loading, setLoading] = useState(false);
  const [openCreateSessionModal, setOpenCreateSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // UI cũ cho việc điểm danh
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [originalAttendance, setOriginalAttendance] = useState({}); // Lưu trạng thái gốc để detect thay đổi
  const [hasChanges, setHasChanges] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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
  const [showStatistics, setShowStatistics] = useState(false);

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
        const dateStr = selectedDate.format('YYYY-MM-DD');
        const params = {
          pageNumber: 1,
          pageSize: 100,
          fromDate: dateStr, // Dùng ngày đã chọn
          toDate: dateStr, // Cùng ngày đã chọn
        };

        if (selectedCourse) {
          params.sectionId = selectedCourse;
        }

        // Thêm scheduleTypeId dựa vào classType
        if (classType === 'theory') {
          params.scheduleTypeId = 1; // Lý thuyết
        } else if (classType === 'practice') {
          params.scheduleTypeId = 2; // Thực hành
        }
        // Nếu classType === '' thì không truyền scheduleTypeId (tất cả)

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
  }, [selectedCourse, selectedDate, classType]); // Thêm classType vào dependency

  // Fetch practice groups khi chọn môn học
  useEffect(() => {
    const fetchPracticeGroups = async () => {
      if (selectedCourse) {
        try {
          const response =
            await practiceService.getPracticeGroupsBySection(selectedCourse);
          if (response && Array.isArray(response)) {
            const groups = response.map((group) => ({
              id: group.practiceGroupId,
              groupNumber: group.groupName,
            }));
            setPracticeGroups(groups);
          } else {
            setPracticeGroups([]);
          }
        } catch (error) {
          console.error('Error fetching practice groups:', error);
          setPracticeGroups([]);
        }
      } else {
        setPracticeGroups([]);
      }
    };

    fetchPracticeGroups();
  }, [selectedCourse]);

  // Tạo phiên điểm danh mới
  const handleCreateSession = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
      const payload = {
        sectionId: selectedCourse,
        sessionDate: selectedDate.format('YYYY-MM-DD'), // Dùng ngày đã chọn
        startTime: sessionData.startTime + ':00',
        endTime: sessionData.endTime + ':00',
        sessionName:
          sessionData.sessionName || 'Buổi ' + selectedDate.format('DD/MM'),
        description: sessionData.description,
        room: sessionData.room,
        practiceGroupId: sessionData.practiceGroupId,
      };

      const response = await teacherService.createAttendanceSession(payload);

      // Close modal and reset form
      setOpenCreateSessionModal(false);
      setSessionData({
        sessionName: '',
        startTime: '7:00',
        endTime: '7:00',
        room: '',
        description: '',
        practiceGroupId: null,
      });

      // Load lại danh sách sessions
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const params = {
        pageNumber: 1,
        pageSize: 100,
        fromDate: dateStr, // Dùng ngày đã chọn
        toDate: dateStr, // Cùng ngày đã chọn
      };

      if (selectedCourse) {
        params.sectionId = selectedCourse;
      }

      // Thêm scheduleTypeId dựa vào classType
      if (classType === 'theory') {
        params.scheduleTypeId = 1; // Lý thuyết
      } else if (classType === 'practice') {
        params.scheduleTypeId = 2; // Thực hành
      }

      const sessionsResponse = await teacherService.getMySessions(params);
      setSessions(sessionsResponse.items || []);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Tạo phiên điểm danh thành công!',
        severity: 'success',
      });
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

  // Click vào một phiên để load danh sách sinh viên và điểm danh
  const handleSelectSession = async (session) => {
    setSelectedSession(session);

    // Load danh sách sinh viên của session này
    setLoading(true);
    try {
      const studentsResponse = await studentServices.getStudentsWithSection(
        session.sectionId,
        1,
        1000
      );
      const items = studentsResponse.items || [];

      // Map dữ liệu sinh viên
      const studentsData = items.map((s) => ({
        ...s,
        studentCode: s.mssv || s.studentCode || '',
        fullName: s.studentName || s.fullName || '',
        email: s.email || '',
        className: s.className || '',
      }));

      setStudents(studentsData);

      // Map attendance từ session
      const attendanceMap = {};
      if (session.attendanceRecords) {
        session.attendanceRecords.forEach((record) => {
          // Map status API sang status UI cũ
          let status = null;
          switch (record.status) {
            case 1: // Present
              status = 'present';
              break;
            case 2: // Absent
              status = 'late'; // Map to "Không phép" button
              break;
            case 4: // Excused
              status = 'absent'; // Map to "Có phép" button
              break;
            default:
              status = null;
          }
          attendanceMap[record.studentId] = status;
        });
      }
      setAttendance(attendanceMap);
      // Lưu trạng thái gốc để detect thay đổi
      setOriginalAttendance(JSON.parse(JSON.stringify(attendanceMap)));
      setHasChanges(false); // Reset hasChanges khi load session mới
    } catch (error) {
      console.error('Error fetching students:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải danh sách sinh viên',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // UI cũ: Handle attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => {
      const newAttendance = {
        ...prev,
        [studentId]: status,
      };

      // Kiểm tra có thay đổi so với original không
      const hasChanged =
        JSON.stringify(newAttendance) !== JSON.stringify(originalAttendance);
      setHasChanges(hasChanged);

      return newAttendance;
    });
  };

  const handleMarkAll = (status) => {
    const allAttendance = {};
    students.forEach((student) => {
      allAttendance[student.studentId] = status;
    });
    setAttendance(allAttendance);

    // Kiểm tra có thay đổi so với original không
    const hasChanged =
      JSON.stringify(allAttendance) !== JSON.stringify(originalAttendance);
    setHasChanges(hasChanged);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;

    try {
      setLoading(true);

      // Phân biệt CREATE vs UPDATE dựa trên original attendance
      const createRecords = []; // Các SV chưa có điểm danh (status = 0)
      const updateRecords = []; // Các SV đã có điểm danh cần update

      Object.entries(attendance).forEach(([studentId, currentStatus]) => {
        const originalStatus = originalAttendance[studentId];

        // Map status UI sang status API
        let apiStatus = null;
        switch (currentStatus) {
          case 'present':
            apiStatus = 1; // Present
            break;
          case 'absent': // UI "Có phép" button
            apiStatus = 4; // Excused
            break;
          case 'late': // UI "Không phép" button
            apiStatus = 2; // Absent
            break;
          default:
            apiStatus = 0; // Unknown
        }

        if (originalStatus === null || originalStatus === undefined) {
          // Chưa có trong original -> CREATE
          createRecords.push({
            studentId: parseInt(studentId),
            status: apiStatus,
            note: null,
          });
        } else if (originalStatus !== currentStatus) {
          // Có trong original và đã thay đổi -> UPDATE
          // Tìm attendanceId tương ứng
          const attendanceRecord = selectedSession.attendanceRecords?.find(
            (record) => record.studentId === parseInt(studentId)
          );

          if (attendanceRecord) {
            updateRecords.push({
              attendanceId: attendanceRecord.attendanceId,
              status: apiStatus,
              note: null,
            });
          }
        }
      });

      // Thực hiện API calls
      if (createRecords.length > 0) {
        await teacherService.recordAttendance({
          attendanceSessionId: selectedSession.attendanceSessionId,
          studentAttendances: createRecords,
        });
      }

      // Update từng record (vì API là PUT per record)
      for (const record of updateRecords) {
        await teacherService.updateAttendance(record.attendanceId, {
          status: record.status,
          note: record.note,
        });
      }

      // Cập nhật lại original attendance
      setOriginalAttendance(JSON.parse(JSON.stringify(attendance)));
      setHasChanges(false);

      // Refresh lại sessions để cập nhật thống kê
      const params = {
        pageNumber: 1,
        pageSize: 100,
        fromDate: dayjs().format('YYYY-MM-DD'),
        toDate: dayjs().format('YYYY-MM-DD'),
      };

      if (selectedCourse) {
        params.sectionId = selectedCourse;
      }

      const sessionsResponse = await teacherService.getMySessions(params);
      setSessions(sessionsResponse.items || []);

      // Cập nhật lại selectedSession với data mới
      const updatedSession = sessionsResponse.items?.find(
        (s) => s.attendanceSessionId === selectedSession.attendanceSessionId
      );
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }

      setSnackbar({
        open: true,
        message: `Lưu điểm danh thành công! (${createRecords.length} mới, ${updateRecords.length} cập nhật)`,
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

  const handleExportExcel = async () => {
    if (!selectedCourse) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn môn học để xuất Excel',
        severity: 'warning',
      });
      return;
    }

    try {
      setLoading(true);

      let sectionData = null;

      // Xác định loại lớp và gọi API tương ứng
      if (classType === 'theory') {
        sectionData =
          await sectionService.getSectionTheoryDetail(selectedCourse);
      } else if (classType === 'practice') {
        // Nếu có nhiều nhóm thực hành, cần chọn nhóm
        const practiceGroupId =
          sessionData.practiceGroupId ||
          (practiceGroups.length > 0 ? practiceGroups[0].id : null);

        sectionData = await sectionService.getSectionPracticeDetail(
          selectedCourse,
          practiceGroupId
        );
      } else {
        setSnackbar({
          open: true,
          message: 'Vui lòng chọn loại lớp (Lý thuyết hoặc Thực hành)',
          severity: 'warning',
        });
        setLoading(false);
        return;
      }

      if (
        !sectionData ||
        !sectionData.students ||
        sectionData.students.length === 0
      ) {
        setSnackbar({
          open: true,
          message: 'Không có dữ liệu sinh viên để xuất Excel',
          severity: 'warning',
        });
        setLoading(false);
        return;
      }

      // Prepare data for export
      const exportSectionData = {
        courseName: sectionData.courseName || 'Tên môn học',
        sectionCode: sectionData.sectionCode || selectedCourse,
        className: sectionData.className || 'Lớp',
        semester: 'HK1',
        academicYear: '2025-2026',
        startDate: sectionData.startDate,
        endDate: sectionData.endDate,
        schedules: sectionData.schedules || [],
      };

      // Prepare students with attendance data
      const studentsWithAttendance = sectionData.students.map((student) => {
        const nameParts = (student.fullName || '').trim().split(' ');
        const firstName = nameParts.pop() || '';
        const lastName = nameParts.join(' ') || '';

        return {
          ...student,
          firstName,
          lastName,
          attendances: student.attendances || [],
          totalExcusedAbsences: student.totalExcusedAbsences || 0,
          totalUnexcusedAbsences: student.totalUnexcusedAbsences || 0,
        };
      });

      // Export using new utility (sessions are generated from startDate/endDate/schedules)
      const result = exportAttendanceExcel(
        exportSectionData,
        studentsWithAttendance
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: `Xuất file Excel thành công: ${result.fileName}`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: `Lỗi khi xuất Excel: ${result.error}`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi không xác định khi xuất Excel';
      setSnackbar({
        open: true,
        message: 'Lỗi khi xuất Excel: ' + errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (studentId) => {
    return attendance[studentId] || null;
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
      title: 'Thời gian',
      key: 'time',
      width: 120,
      render: (_, record) =>
        `${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)}`,
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
      title: 'Không phép',
      dataIndex: 'absentCount',
      key: 'absentCount',
      width: 60,
      render: (count) => <span style={{ color: colors.warning }}>{count}</span>,
    },
    {
      title: 'Có phép',
      dataIndex: 'excusedCount',
      key: 'excusedCount',
      width: 80,
      render: (count) => <span style={{ color: colors.error }}>{count}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          variant={
            selectedSession?.attendanceSessionId === record.attendanceSessionId
              ? 'contained'
              : 'outlined'
          }
          size="small"
          onClick={() => handleSelectSession(record)}
        >
          {selectedSession?.attendanceSessionId === record.attendanceSessionId
            ? 'Đang chọn'
            : 'Điểm danh'}
        </Button>
      ),
    },
  ];

  // UI cũ: Columns cho bảng sinh viên
  const studentColumns = [
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
              Không phép
            </Button>
            <Button
              variant={status === 'absent' ? 'contained' : 'outlined'}
              color="error"
              size="small"
              onClick={() => handleAttendanceChange(record.studentId, 'absent')}
            >
              Có phép
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
          late: { label: 'Không phép', color: 'warning' },
          absent: { label: 'Có phép', color: 'error' },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  // Calculate statistics - updated for new button mappings
  const presentCount = Object.values(attendance).filter(
    (s) => s === 'present'
  ).length;
  const excusedCount = Object.values(attendance).filter(
    (s) => s === 'absent' // UI "Có phép" button maps to API Excused (4)
  ).length;
  const absentCount = Object.values(attendance).filter(
    (s) => s === 'late' // UI "Không phép" button maps to API Absent (2)
  ).length;
  const attendanceRate = students.length
    ? ((presentCount / students.length) * 100).toFixed(1)
    : 0;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Fade in={true} timeout={600}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, fontWeight: 'bold', color: colors.text }}
        >
          Điểm danh
          {selectedDate ? ` - ${selectedDate.format('DD/MM/YYYY')}` : ''}
        </Typography>
      </Fade>

      {/* Phần 1: Header với thông tin phiên đang chọn */}
      {selectedSession && (
        <Fade in={true} timeout={800}>
          <Card
            sx={{
              mb: 3,
              border: `2px solid ${colors.primary}`,
              backgroundColor: alpha(colors.primary, 0.05),
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Đang điểm danh: {selectedSession.sessionName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Môn: ${selectedSession.courseName}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Lớp: ${selectedSession.sectionCode}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Thời gian: ${selectedSession.startTime.slice(0, 5)} - ${selectedSession.endTime.slice(0, 5)}`}
                      variant="outlined"
                      size="small"
                    />
                    {selectedSession.room && (
                      <Chip
                        label={`Phòng: ${selectedSession.room}`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={`${presentCount}/${students.length} SV`}
                      color="success"
                      variant="filled"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip
                      label={`${attendanceRate}%`}
                      color="primary"
                      variant="filled"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Phần 2: Toolbars và Actions */}
      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 2 }}>
            <Grid container spacing={2}>
              {/* Row 1: Filters */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Chọn lớp học phần</InputLabel>
                  <Select
                    value={selectedCourse}
                    label="Chọn lớp học phần"
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <MenuItem value="">Tất cả lớp học phần</MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course.sectionId} value={course.sectionId}>
                        {course.courseName} - {course.sectionCode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Loại lớp</InputLabel>
                  <Select
                    value={classType}
                    label="Loại lớp"
                    onChange={(e) => setClassType(e.target.value)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="theory">Lý thuyết</MenuItem>
                    <MenuItem value="practice">Thực hành</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel
                    shrink
                    sx={{ backgroundColor: colors.bgCard, px: 0.5 }}
                  >
                    Ngày điểm danh
                  </InputLabel>
                  <DatePicker
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    format="DD/MM/YYYY"
                    style={{ width: '100%', height: 56 }}
                    placeholder="Chọn ngày điểm danh"
                    disabledDate={(current) =>
                      current && current > dayjs().endOf('day')
                    }
                  />
                </FormControl>
              </Grid>

              {/* Row 2: Actions */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {selectedCourse && (
                    <Button
                      variant={showStatistics ? 'contained' : 'outlined'}
                      color="secondary"
                      onClick={() => setShowStatistics(!showStatistics)}
                      startIcon={<BarChartIcon />}
                    >
                      {showStatistics ? 'Ẩn thống kê' : 'Xem thống kê'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenCreateSessionModal(true)}
                    disabled={loading || !selectedCourse || !classType}
                    startIcon={<CalendarToday />}
                  >
                    Tạo phiên mới
                  </Button>
                  {selectedSession && (
                    <>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => handleMarkAll('present')}
                        disabled={students.length === 0 || loading}
                      >
                        Có mặt tất cả
                      </Button>
                      {/* <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleMarkAll('late')}
                        disabled={students.length === 0 || loading}
                      >
                        Vắng tất cả
                      </Button> */}
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={
                          students.length === 0 ||
                          Object.keys(attendance).length === 0 ||
                          !hasChanges ||
                          loading
                        }
                        onClick={() => setOpenConfirmDialog(true)}
                      >
                        Lưu điểm danh {!hasChanges ? '(không có thay đổi)' : ''}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => handleExportExcel()}
                    disabled={loading}
                    startIcon={<CalendarToday />}
                  >
                    Excel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Phần 2.5: Thống kê điểm danh (nếu được bật) */}
      {showStatistics && selectedCourse && (
        <Fade in={true} timeout={1100}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <AttendanceStatistics
                sectionId={selectedCourse}
                sectionName={
                  courses.find((c) => c.sectionId === selectedCourse)
                    ?.courseName
                }
              />
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Phần 3: Danh sách phiên điểm danh */}
      <Fade in={true} timeout={1200}>
        <Card sx={{ mb: selectedSession ? 3 : 0 }}>
          <CardContent sx={{ pb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              📋 Các phiên điểm danh
              {selectedDate ? ` ${selectedDate.format('DD/MM/YYYY')}` : ''} (
              {sessions.length} phiên)
            </Typography>
            <Table
              columns={sessionColumns}
              dataSource={sessions}
              loading={loading}
              rowKey="attendanceSessionId"
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} phiên`,
                position: ['bottomRight'],
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
              rowClassName={(record) =>
                selectedSession?.attendanceSessionId ===
                record.attendanceSessionId
                  ? 'selected-row'
                  : ''
              }
              sx={{
                '& .selected-row': {
                  backgroundColor: alpha(colors.primary, 0.1),
                  border: `2px solid ${colors.primary}`,
                },
              }}
            />
          </CardContent>
        </Card>
      </Fade>

      {/* Phần 4: Chi tiết điểm danh (chỉ hiện khi có session) */}
      {selectedSession && (
        <Fade in={true} timeout={1400}>
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                👥 Danh sách sinh viên - {selectedSession.sessionName} (
                {students.length} SV)
              </Typography>
              <Table
                columns={studentColumns}
                dataSource={students}
                loading={loading}
                rowKey="studentId"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} sinh viên`,
                  position: ['bottomRight'],
                }}
                scroll={{ x: 'max-content' }}
                size="middle"
              />
            </CardContent>
          </Card>
        </Fade>
      )}

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
                  setSessionData({
                    ...sessionData,
                    sessionName: e.target.value,
                  })
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
            {classType === 'practice' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Nhóm thực hành</InputLabel>
                  <Select
                    value={sessionData.practiceGroupId || ''}
                    label="Nhóm thực hành"
                    onChange={(e) =>
                      setSessionData({
                        ...sessionData,
                        practiceGroupId: e.target.value || null,
                      })
                    }
                  >
                    <MenuItem value="">Chọn nhóm thực hành</MenuItem>
                    {practiceGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        Nhóm {group.groupNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={2}
                value={sessionData.description}
                onChange={(e) =>
                  setSessionData({
                    ...sessionData,
                    description: e.target.value,
                  })
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

      {/* Confirm Save Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Xác nhận lưu điểm danh</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn lưu điểm danh cho phiên "
            {selectedSession?.sessionName}" không?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              - Có mặt: {presentCount} sinh viên
            </Typography>
            <Typography variant="body2">
              - Có phép: {excusedCount} sinh viên
            </Typography>
            <Typography variant="body2">
              - Không phép: {absentCount} sinh viên
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
