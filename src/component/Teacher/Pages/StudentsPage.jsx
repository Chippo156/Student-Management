import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
} from '@mui/material';
import { Table, Space, Tag, Input } from 'antd';
import {
  People,
  School,
  CheckCircle,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService, courseService } from '../../../service';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await teacherService.getTeacherCourses(
          lecturerId
        );
        const coursesData = coursesResponse.data || [];
        setCourses(coursesData);

        // Fetch students from all courses
        if (coursesData.length > 0) {
          const allStudents = [];
          for (const course of coursesData) {
            try {
              const studentsResponse = await courseService.getCourseStudents(
                course.id
              );
              const studentsData = studentsResponse.data || [];
              studentsData.forEach((student) => {
                allStudents.push({
                  ...student,
                  courseId: course.id,
                  courseName: course.name,
                  courseCode: course.code,
                });
              });
            } catch (error) {
              console.error(
                `Error fetching students for course ${course.id}:`,
                error
              );
            }
          }
          setStudents(allStudents);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchData();
    }
  }, [lecturerId]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesCourse =
      selectedCourse === 'all' || student.courseId === selectedCourse;
    const matchesSearch =
      student.studentCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchText.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  // Calculate statistics
  const totalStudents = students.length;
  const uniqueStudents = new Set(students.map((s) => s.studentId)).size;
  const activeCourses = courses.filter((c) => c.status === 'active').length;

  // Ant Design Table columns
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
      render: (text, record) => (
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
      title: 'Môn học',
      key: 'course',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.courseName}</div>
          <Tag color="blue">{record.courseCode}</Tag>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          active: { label: 'Đang học', color: 'success' },
          completed: { label: 'Hoàn thành', color: 'default' },
          dropped: { label: 'Đã bỏ', color: 'error' },
        };
        const config = statusConfig[status || 'active'] || statusConfig.active;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
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
          Quản lý Sinh viên
        </Typography>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                backgroundColor: '#e3f2fd',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {uniqueStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng sinh viên
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                backgroundColor: '#e8f5e9',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ fontSize: 40, color: '#388e3c', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lượt đăng ký
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                backgroundColor: '#fff3e0',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: '#f57c00', mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {activeCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Môn đang dạy
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã SV, tên, email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Môn học</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Môn học"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <MenuItem value="all">Tất cả môn học</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Tìm thấy: {filteredStudents.length} sinh viên
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Students Table */}
      <Fade in={true} timeout={1200}>
        <Card>
          <Table
            columns={columns}
            dataSource={filteredStudents}
            loading={loading}
            rowKey={(record) => `${record.studentId}-${record.courseId}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} sinh viên`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Fade>

      {/* Student Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Thông tin chi tiết sinh viên
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}>
                  {selectedStudent.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {selectedStudent.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent.studentCode}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Môn học:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.courseName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã môn học:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.courseCode}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái:
                </Typography>
                <Chip
                  label={
                    selectedStudent.status === 'active'
                      ? 'Đang học'
                      : 'Hoàn thành'
                  }
                  color={
                    selectedStudent.status === 'active' ? 'success' : 'default'
                  }
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsPage;
