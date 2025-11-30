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
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Table, Tag, Space, Upload } from 'antd';
import {
  Folder,
  Description,
  CloudUpload,
  Delete,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService } from '../../../service';
import dayjs from 'dayjs';

const MaterialsPage = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    file: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  const colors = useMemo(() => ({
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    bgLightBlue: alpha(theme.palette.primary.main, 0.1),
    bgLightGreen: alpha(theme.palette.success.main, 0.1),
    bgLightOrange: alpha(theme.palette.warning.main, 0.1),
    bgLightPurple: alpha(theme.palette.secondary.main, 0.1),
    iconBlue: theme.palette.primary.main,
    iconGreen: theme.palette.success.main,
    iconOrange: theme.palette.warning.main,
    iconPurple: theme.palette.secondary.main,
    iconGray: theme.palette.grey[600],
    iconRed: theme.palette.error.main,
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
    const fetchMaterials = async () => {
      if (!selectedCourse) return;

      setLoading(true);
      try {
        const response = await teacherService.getCourseMaterials(
          selectedCourse
        );
        setMaterials(response.data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
        // Mock data if API fails
        setMaterials([
          {
            id: 1,
            title: 'Bài giảng tuần 1 - Giới thiệu',
            description: 'Slide bài giảng giới thiệu môn học',
            type: 'slide',
            fileName: 'week1_intro.pdf',
            fileSize: '2.5 MB',
            uploadDate: '2024-11-01',
            downloads: 45,
          },
          {
            id: 2,
            title: 'Tài liệu tham khảo',
            description: 'Sách giáo trình chính',
            type: 'document',
            fileName: 'textbook.pdf',
            fileSize: '15.2 MB',
            uploadDate: '2024-11-05',
            downloads: 38,
          },
          {
            id: 3,
            title: 'Source code mẫu',
            description: 'Code mẫu cho bài tập tuần 2',
            type: 'code',
            fileName: 'sample_code.zip',
            fileSize: '1.1 MB',
            uploadDate: '2024-11-08',
            downloads: 52,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedCourse]);

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      type: 'document',
      file: null,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      type: 'document',
      file: null,
    });
  };

  const handleUploadMaterial = async () => {
    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('courseId', selectedCourse);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      await teacherService.uploadCourseMaterial(formDataToSend);

      setSnackbar({
        open: true,
        message: 'Tải lên tài liệu thành công!',
        severity: 'success',
      });

      handleCloseDialog();
      // Refresh materials list
      const response = await teacherService.getCourseMaterials(selectedCourse);
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error uploading material:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải lên tài liệu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    try {
      setLoading(true);
      await teacherService.deleteCourseMaterial(materialId);
      setSnackbar({
        open: true,
        message: 'Xóa tài liệu thành công!',
        severity: 'success',
      });

      // Refresh materials list
      const response = await teacherService.getCourseMaterials(selectedCourse);
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error deleting material:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi xóa tài liệu',
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

  const handleFileChange = (info) => {
    if (info.file) {
      setFormData((prev) => ({ ...prev, file: info.file }));
    }
  };

  // Calculate statistics
  const totalMaterials = materials.length;
  const totalDownloads = materials.reduce(
    (sum, m) => sum + (m.downloads || 0),
    0
  );
  const slideCount = materials.filter((m) => m.type === 'slide').length;
  const documentCount = materials.filter((m) => m.type === 'document').length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'slide':
        return { icon: <Description />, color: colors.iconBlue };
      case 'document':
        return { icon: <Folder />, color: colors.iconGreen };
      case 'code':
        return { icon: <Description />, color: colors.iconOrange };
      case 'video':
        return { icon: <Description />, color: colors.iconRed };
      default:
        return { icon: <Description />, color: colors.iconGray };
    }
  };

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => {
        const { icon, color } = getTypeIcon(type);
        return <IconButton sx={{ color }}>{icon}</IconButton>;
      },
    },
    {
      title: 'Tên tài liệu',
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
      title: 'Tên file',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 200,
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 130,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Lượt tải',
      dataIndex: 'downloads',
      key: 'downloads',
      width: 100,
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: window.innerWidth < 768 ? false : 'right',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <IconButton color="primary" size="small">
            <Visibility />
          </IconButton>
          <IconButton color="success" size="small">
            <Download />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteMaterial(record.id)}
          >
            <Delete />
          </IconButton>
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
          Tài liệu học tập
        </Typography>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                backgroundColor: colors.bgLightBlue,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Folder sx={{ fontSize: 40, color: colors.iconBlue, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {totalMaterials}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tài liệu
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
                backgroundColor: colors.bgLightGreen,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ fontSize: 40, color: colors.iconGreen, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {slideCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bài giảng
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
                backgroundColor: colors.bgLightOrange,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Folder sx={{ fontSize: 40, color: colors.iconOrange, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {documentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tài liệu
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
                backgroundColor: colors.bgLightPurple,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Download sx={{ fontSize: 40, color: colors.iconPurple, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {totalDownloads}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lượt tải xuống
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
                startIcon={<CloudUpload />}
                disabled={!selectedCourse}
                onClick={handleOpenDialog}
              >
                Tải lên tài liệu
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Materials Table */}
      {selectedCourse ? (
        <Fade in={true} timeout={1200}>
          <Card>
            <Table
              columns={columns}
              dataSource={materials}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} tài liệu`,
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Fade>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn môn học để quản lý tài liệu
          </Typography>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tải lên tài liệu mới</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên tài liệu"
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
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại tài liệu</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại tài liệu"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  <MenuItem value="slide">Bài giảng (Slide)</MenuItem>
                  <MenuItem value="document">Tài liệu tham khảo</MenuItem>
                  <MenuItem value="code">Source code</MenuItem>
                  <MenuItem value="video">Video bài giảng</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Upload
                beforeUpload={(file) => {
                  setFormData((prev) => ({ ...prev, file }));
                  return false; // Prevent auto upload
                }}
                maxCount={1}
              >
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Chọn file
                </Button>
              </Upload>
              {formData.file && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  File đã chọn: {formData.file.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleUploadMaterial}
            variant="contained"
            color="primary"
            disabled={!formData.title || !formData.file}
          >
            Tải lên
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

export default MaterialsPage;
