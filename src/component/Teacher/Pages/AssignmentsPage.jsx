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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Grow,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Table, Tag, Space, Progress } from 'antd';
import {
  Assignment,
  Add,
  Edit,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService } from '../../../service';
import dayjs from 'dayjs';

const AssignmentsPage = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 10,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  // Theme-aware colors
  const colors = useMemo(() => ({
    bgCard: theme.palette.background.paper,
    bgPage: theme.palette.background.default,
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    text: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    border: theme.palette.divider,
    bgPrimarySoft: alpha(theme.palette.primary.main, 0.12),
    bgSuccessSoft: alpha(theme.palette.success.main, 0.12),
    bgWarningSoft: alpha(theme.palette.warning.main, 0.12),
    bgErrorSoft: alpha(theme.palette.error.main, 0.12),
  }), [theme]);

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
    const fetchAssignments = async () => {
      if (!selectedCourse) return;

      setLoading(true);
      try {
        const response = await teacherService.getAssignments(selectedCourse);
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        // Mock data if API fails
        setAssignments([
          {
            id: 1,
            title: 'Bài tập 1: Giới thiệu về lập trình',
            description: 'Viết chương trình Hello World',
            dueDate: '2024-12-31',
            maxScore: 10,
            submitted: 25,
            total: 30,
            status: 'active',
          },
          {
            id: 2,
            title: 'Bài tập 2: Cấu trúc dữ liệu',
            description: 'Cài đặt Stack và Queue',
            dueDate: '2024-12-25',
            maxScore: 10,
            submitted: 15,
            total: 30,
            status: 'active',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedCourse]);

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        maxScore: 10,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      maxScore: 10,
    });
  };

  const handleSaveAssignment = async () => {
    try {
      setLoading(true);

      const assignmentData = {
        ...formData,
        courseId: selectedCourse,
      };

      if (editingAssignment) {
        // Update assignment
        await teacherService.updateAssignment(
          editingAssignment.id,
          assignmentData
        );
        setSnackbar({
          open: true,
          message: 'Cập nhật bài tập thành công!',
          severity: 'success',
        });
      } else {
        // Create new assignment
        await teacherService.createAssignment(assignmentData);
        setSnackbar({
          open: true,
          message: 'Tạo bài tập thành công!',
          severity: 'success',
        });
      }

      handleCloseDialog();
      // Refresh assignments list
      const response = await teacherService.getAssignments(selectedCourse);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error saving assignment:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu bài tập',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;

    try {
      setLoading(true);
      await teacherService.deleteAssignment(assignmentId);
      setSnackbar({
        open: true,
        message: 'Xóa bài tập thành công!',
        severity: 'success',
      });

      // Refresh assignments list
      const response = await teacherService.getAssignments(selectedCourse);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi xóa bài tập',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(
    (a) => a.status === 'active'
  ).length;
  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + (a.submitted || 0),
    0
  );
  const avgSubmissionRate = assignments.length
    ? (
        (assignments.reduce(
          (sum, a) => sum + (a.submitted / a.total) * 100,
          0
        ) /
          assignments.length) ||
        0
      ).toFixed(1)
    : 0;

  const columns = [
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: 120,
      render: (score) => <Tag color="blue">{score} điểm</Tag>,
    },
    {
      title: 'Tiến độ nộp bài',
      key: 'progress',
      width: 200,
      render: (_, record) => {
        const percent = ((record.submitted / record.total) * 100).toFixed(0);
        return (
          <div>
            <Progress percent={percent} size="small" />
            <Typography variant="caption">
              {record.submitted}/{record.total} sinh viên
            </Typography>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          active: { label: 'Đang mở', color: 'success' },
          closed: { label: 'Đã đóng', color: 'default' },
          draft: { label: 'Nháp', color: 'warning' },
        };
        const config = statusConfig[status] || statusConfig.active;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: window.innerWidth < 768 ? false : 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={() => handleOpenDialog(record)}
          >
            Sửa
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Delete />}
            onClick={() => handleDeleteAssignment(record.id)}
          >
            Xóa
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
          Quản lý Bài tập
        </Typography>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                backgroundColor: colors.bgPrimarySoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ fontSize: 40, color: colors.primary, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
                  >
                    {totalAssignments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng bài tập
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
                backgroundColor: colors.bgSuccessSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: colors.success, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
                  >
                    {activeAssignments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang mở
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
                <Assignment sx={{ fontSize: 40, color: colors.warning, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
                  >
                    {totalSubmissions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bài nộp
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
                backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: theme.palette.secondary.main, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold', color: colors.text }}
                  >
                    {avgSubmissionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ nộp bài
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
                startIcon={<Add />}
                disabled={!selectedCourse}
                onClick={() => handleOpenDialog()}
              >
                Tạo bài tập mới
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Assignments Table */}
      {selectedCourse ? (
        <Fade in={true} timeout={1200}>
          <Card>
            <Table
              columns={columns}
              dataSource={assignments}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} bài tập`,
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Fade>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn môn học để quản lý bài tập
          </Typography>
        </Card>
      )}

      {/* Assignment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên bài tập"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hạn nộp"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleFormChange('dueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Điểm tối đa"
                type="number"
                value={formData.maxScore}
                onChange={(e) =>
                  handleFormChange('maxScore', parseFloat(e.target.value))
                }
                inputProps={{ min: 0, max: 10, step: 0.5 }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSaveAssignment}
            variant="contained"
            color="primary"
            disabled={!formData.title || !formData.dueDate}
          >
            {editingAssignment ? 'Cập nhật' : 'Tạo mới'}
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

export default AssignmentsPage;
