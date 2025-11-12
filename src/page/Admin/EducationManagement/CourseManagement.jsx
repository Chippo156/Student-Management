import React, { useState, useMemo, useEffect } from 'react';
import { message } from 'antd';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  School,
  CheckCircle,
  Cancel,
  MenuBook,
  Search as SearchIcon,
  FilterList,
  Refresh,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { courseService } from '../../../service/courseService';
import * as XLSX from 'xlsx';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, searchTerm]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await courseService.getAllCourses(page + 1, rowsPerPage, searchTerm);
      if (result) {
        setCourses(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      message.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeCourses = courses.filter((c) => c.status === 'active' || c.isActive).length;
    const completedCourses = courses.filter((c) => c.status === 'completed').length;
    const uniqueDepartments = new Set(
      courses.map((c) => c.departmentName || c.department).filter(Boolean)
    ).size;
    return {
      total: totalCount,
      active: activeCourses,
      completed: completedCourses,
      departments: uniqueDepartments,
    };
  }, [courses, totalCount]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
  };

  const handleExportExcel = () => {
    const dataToExport = courses.map((course, index) => ({
      'STT': index + 1,
      'Mã MH': course.courseCode,
      'Tên môn học': course.courseName,
      'Giảng viên': course.lecturerName || course.instructor || 'N/A',
      'Tín chỉ': course.credits || course.totalCredits,
      'Khoa': course.departmentName || course.department || 'N/A',
      'Học kỳ': course.semester || 'N/A',
      'Năm': course.year || 'N/A',
      'SV đăng ký': course.currentStudents && course.maxStudents
        ? `${course.currentStudents}/${course.maxStudents}`
        : 'N/A',
      'Trạng thái': getStatusText(course.status || (course.isActive ? 'active' : 'inactive')),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Môn học');

    const colWidths = [
      { wch: 5 },
      { wch: 10 },
      { wch: 25 },
      { wch: 20 },
      { wch: 8 },
      { wch: 25 },
      { wch: 10 },
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_mon_hoc_${new Date().getTime()}.xlsx`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang diễn ra';
      case 'inactive':
        return 'Chưa bắt đầu';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return status || 'N/A';
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Đang diễn ra" color="success" size="small" />;
      case 'inactive':
        return <Chip label="Chưa bắt đầu" color="warning" size="small" />;
      case 'completed':
        return <Chip label="Đã kết thúc" color="default" size="small" />;
      default:
        return <Chip label={status || 'N/A'} size="small" />;
    }
  };

  if (loading && courses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Quản lý Môn học
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchCourses}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' }, boxShadow: 1 }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={courses.length === 0}
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' },
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
            }}
          >
            Xuất Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
            }}
          >
            Thêm môn học
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <MenuBook sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng môn học
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Đang diễn ra
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Cancel sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Đã kết thúc
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <School sx={{ fontSize: 50, mr: 2, color: '#f57c00' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#f57c00' }}>
                  {stats.departments}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Khoa
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bộ lọc tìm kiếm
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã môn học, tên, giảng viên, khoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={handleResetFilters} sx={{ height: '40px' }}>
                Đặt lại
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{courses.length}</strong> môn học
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã MH</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tên môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Giảng viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tín chỉ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Khoa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Học kỳ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>SV đăng ký</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.courseId || course.id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background-color 0.2s' }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {course.courseCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.courseName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.lecturerName || course.instructor || <span style={{ color: '#aaa' }}>Chưa phân công</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.credits || course.totalCredits || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.departmentName || course.department || 'N/A'}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.semester ? `${course.semester} ${course.year || ''}` : <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color:
                          course.currentStudents >= course.maxStudents
                            ? '#d32f2f'
                            : '#388e3c',
                      }}
                    >
                      {course.currentStudents !== undefined && course.maxStudents !== undefined
                        ? `${course.currentStudents}/${course.maxStudents}`
                        : <span style={{ color: '#aaa' }}>N/A</span>
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(course.status || (course.isActive ? 'active' : 'inactive'))}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {courses.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy môn học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có môn học nào trong hệ thống'}
            </Typography>
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default CourseManagement;
