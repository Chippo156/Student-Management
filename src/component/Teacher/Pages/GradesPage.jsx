import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
  Snackbar,
  Alert,
} from '@mui/material';
import { Table, Tag, Space, InputNumber } from 'antd';
import {
  Grade,
  TrendingUp,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService, courseService } from '../../../service';

const GradesPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState('');
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
    const fetchStudentsAndGrades = async () => {
      if (!selectedCourse) return;

      setLoading(true);
      try {
        // Fetch students
        const studentsResponse = await courseService.getCourseStudents(
          selectedCourse
        );
        const studentsData = studentsResponse.data || [];

        // Fetch grades
        try {
          const gradesResponse = await teacherService.getStudentGrades(
            selectedCourse
          );
          const gradesData = gradesResponse.data || [];

          // Merge students with grades
          const mergedData = studentsData.map((student) => {
            const gradeData = gradesData.find(
              (g) => g.studentId === student.studentId
            );
            return {
              ...student,
              midtermScore: gradeData?.midtermScore || null,
              finalScore: gradeData?.finalScore || null,
              labScore: gradeData?.labScore || null,
              attendanceScore: gradeData?.attendanceScore || null,
              totalScore: gradeData?.totalScore || null,
              gradeId: gradeData?.id || null,
            };
          });

          setStudents(mergedData);
        } catch (error) {
          // If no grades exist yet, just show students
          const mergedData = studentsData.map((student) => ({
            ...student,
            midtermScore: null,
            finalScore: null,
            labScore: null,
            attendanceScore: null,
            totalScore: null,
            gradeId: null,
          }));
          setStudents(mergedData);
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

    fetchStudentsAndGrades();
  }, [selectedCourse]);

  const calculateTotalScore = (record) => {
    const midterm = record.midtermScore || 0;
    const final = record.finalScore || 0;
    const lab = record.labScore || 0;
    const attendance = record.attendanceScore || 0;

    // Weighted average: 20% midterm, 40% final, 30% lab, 10% attendance
    return (midterm * 0.2 + final * 0.4 + lab * 0.3 + attendance * 0.1).toFixed(
      2
    );
  };

  const getGradeLevel = (score) => {
    if (score >= 9) return { label: 'A+', color: 'success' };
    if (score >= 8.5) return { label: 'A', color: 'success' };
    if (score >= 8) return { label: 'B+', color: 'success' };
    if (score >= 7) return { label: 'B', color: 'processing' };
    if (score >= 6.5) return { label: 'C+', color: 'processing' };
    if (score >= 5.5) return { label: 'C', color: 'warning' };
    if (score >= 5) return { label: 'D+', color: 'warning' };
    if (score >= 4) return { label: 'D', color: 'error' };
    return { label: 'F', color: 'error' };
  };

  const handleGradeChange = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId === studentId) {
          const updated = { ...student, [field]: value };
          updated.totalScore = calculateTotalScore(updated);
          return updated;
        }
        return student;
      })
    );
  };

  const handleSaveGrades = async () => {
    try {
      setLoading(true);

      // Prepare grades data
      const gradesData = students.map((student) => ({
        studentId: student.studentId,
        courseId: selectedCourse,
        midtermScore: student.midtermScore || 0,
        finalScore: student.finalScore || 0,
        labScore: student.labScore || 0,
        attendanceScore: student.attendanceScore || 0,
        totalScore: student.totalScore || 0,
      }));

      // Save grades
      await teacherService.updateStudentGrades(selectedCourse, gradesData);

      setSnackbar({
        open: true,
        message: 'Lưu điểm thành công!',
        severity: 'success',
      });
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error('Error saving grades:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu điểm',
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
  const passedStudents = students.filter(
    (s) => s.totalScore && s.totalScore >= 5
  ).length;
  const failedStudents = students.filter(
    (s) => s.totalScore && s.totalScore < 5
  ).length;
  const avgScore = students.length
    ? (
        students.reduce((sum, s) => sum + (parseFloat(s.totalScore) || 0), 0) /
        students.length
      ).toFixed(2)
    : 0;

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      fixed: 'left',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      fixed: 'left',
    },
    {
      title: 'Điểm giữa kỳ (20%)',
      dataIndex: 'midtermScore',
      key: 'midtermScore',
      width: 150,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={(val) =>
            handleGradeChange(record.studentId, 'midtermScore', val)
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Điểm cuối kỳ (40%)',
      dataIndex: 'finalScore',
      key: 'finalScore',
      width: 150,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={(val) =>
            handleGradeChange(record.studentId, 'finalScore', val)
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Điểm thực hành (30%)',
      dataIndex: 'labScore',
      key: 'labScore',
      width: 150,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={(val) =>
            handleGradeChange(record.studentId, 'labScore', val)
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Điểm chuyên cần (10%)',
      dataIndex: 'attendanceScore',
      key: 'attendanceScore',
      width: 150,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={(val) =>
            handleGradeChange(record.studentId, 'attendanceScore', val)
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Điểm tổng',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 120,
      fixed: 'right',
      render: (value) => (
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {value ? parseFloat(value).toFixed(2) : '-'}
        </span>
      ),
    },
    {
      title: 'Xếp loại',
      key: 'gradeLevel',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        if (!record.totalScore) return <Tag>-</Tag>;
        const grade = getGradeLevel(parseFloat(record.totalScore));
        return <Tag color={grade.color}>{grade.label}</Tag>;
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
          Quản lý Điểm số
        </Typography>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                backgroundColor: '#e3f2fd',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Grade sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {avgScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm trung bình
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                backgroundColor: '#e8f5e9',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: '#388e3c', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {passedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đạt
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                backgroundColor: '#ffebee',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ fontSize: 40, color: '#d32f2f', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {failedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Không đạt
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={1400}>
            <Card
              sx={{
                backgroundColor: '#fff3e0',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: '#f57c00', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {students.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng sinh viên
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Course Selection */}
      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedCourse || students.length === 0}
                onClick={() => setOpenConfirmDialog(true)}
                sx={{ mr: 1 }}
              >
                Lưu điểm
              </Button>
              <Button
                variant="outlined"
                disabled={!selectedCourse || students.length === 0}
              >
                Xuất Excel
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Grades Table */}
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
              scroll={{ x: 1400 }}
            />
          </Card>
        </Fade>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn môn học để nhập điểm
          </Typography>
        </Card>
      )}

      {/* Confirm Save Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Xác nhận lưu điểm</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn lưu điểm cho {students.length} sinh viên không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveGrades}
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

export default GradesPage;
