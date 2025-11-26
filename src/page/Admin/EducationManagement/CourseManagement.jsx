import React, { useState, useMemo, useEffect } from 'react';
import { message } from 'antd';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
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
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import { courseService } from '../../../service/courseService';
import { exportCoursesExcel } from '../../../until/exportCoursesExcel';
import { useDebounce } from '../../../hooks/useDebounce';

const CourseManagement = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, debouncedSearchTerm]); // ✅ Dùng debouncedSearchTerm

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await courseService.getAllCourses(
        page + 1,
        rowsPerPage,
        debouncedSearchTerm // ✅ Dùng debounced value
      );
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
    const activeCourses = courses.filter(
      (c) => c.status === 'active' || c.isActive
    ).length;
    const completedCourses = courses.filter(
      (c) => c.status === 'completed'
    ).length;
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

  const handleExportExcel = async () => {
    const filterInfo = searchTerm ? `Tìm kiếm: "${searchTerm}"` : '';
    const result = await exportCoursesExcel(courses, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    {
      field: 'courseCode',
      headerName: 'Mã MH',
      width: 110,
      renderCell: (course) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {course.courseCode}
        </Typography>
      ),
    },
    {
      field: 'courseName',
      headerName: 'Tên môn học',
      width: 220,
      renderCell: (course) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {course.courseName}
        </Typography>
      ),
    },
    {
      field: 'lecturerName',
      headerName: 'Giảng viên',
      width: 180,
      renderCell: (course) => (
        <Typography variant="body2">
          {course.lecturerName || course.instructor || (
            <span style={{ color: theme.palette.text.disabled }}>
              Chưa phân công
            </span>
          )}
        </Typography>
      ),
    },
    {
      field: 'credits',
      headerName: 'Tín chỉ',
      width: 80,
      align: 'center',
      renderCell: (course) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {course.credits || course.totalCredits || 0}
        </Typography>
      ),
    },
    {
      field: 'departmentName',
      headerName: 'Khoa',
      width: 150,
      renderCell: (course) => (
        <Chip
          label={course.departmentName || course.department || 'N/A'}
          size="small"
          sx={{
            bgcolor:
              theme.palette.mode === 'light'
                ? theme.palette.primary.light + '30'
                : theme.palette.primary.dark + '40',
            color: theme.palette.primary.main,
          }}
        />
      ),
    },
    {
      field: 'semester',
      headerName: 'Học kỳ',
      width: 140,
      renderCell: (course) => (
        <Typography variant="body2">
          {course.semester ? (
            `${course.semester} ${course.year || ''}`
          ) : (
            <span style={{ color: theme.palette.text.disabled }}>
              Chưa cập nhật
            </span>
          )}
        </Typography>
      ),
    },
    {
      field: 'students',
      headerName: 'SV đăng ký',
      width: 120,
      renderCell: (course) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color:
              course.currentStudents >= course.maxStudents
                ? theme.palette.error.main
                : theme.palette.success.main,
          }}
        >
          {course.currentStudents !== undefined &&
          course.maxStudents !== undefined ? (
            `${course.currentStudents}/${course.maxStudents}`
          ) : (
            <span style={{ color: theme.palette.text.disabled }}>N/A</span>
          )}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 120,
      renderCell: (course) =>
        getStatusChip(
          course.status || (course.isActive ? 'active' : 'inactive')
        ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      align: 'center',
      renderCell: () => (
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
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Môn học"
        onRefresh={fetchCourses}
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={courses.length === 0}
              color="success"
              sx={{ textTransform: 'none', px: 3 }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Thêm môn học
            </Button>
          </Box>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<MenuBook />}
            value={stats.total}
            label="Tổng môn học"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircle />}
            value={stats.active}
            label="Đang diễn ra"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Cancel />}
            value={stats.completed}
            label="Đã kết thúc"
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<School />}
            value={stats.departments}
            label="Khoa"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={courses.length}>
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
            helperText={
              searchTerm !== debouncedSearchTerm && searchTerm ? (
                <span style={{ fontSize: '0.75rem' }}>Đang tìm kiếm...</span>
              ) : null
            }
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: '40px' }}
          >
            Đặt lại
          </Button>
        </Grid>
      </FilterSection>

      {/* Courses Table */}
      <DataTable
        columns={columns}
        rows={courses}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <School
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy môn học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có môn học nào trong hệ thống'}
            </Typography>
          </>
        }
      />
    </Box>
  );
};

export default CourseManagement;
