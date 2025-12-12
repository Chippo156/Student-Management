import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import SearchableAutocomplete from '../../Common/SearchableAutocomplete';
import DataTable from '../../Common/DataTable';
import {
  School,
  People,
  Schedule,
  FileDownload,
  Search as SearchIcon,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import sectionService from '../../../service/sectionService';
import CourseDetailModal from '../Components/CourseDetailModal';
import { exportTeacherCoursesExcel } from '../../../until/exportTeacherCoursesExcel';

const CoursesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
      bgPrimarySoft: alpha(theme.palette.primary.main, 0.12),
      bgSuccessSoft: alpha(theme.palette.success.main, 0.12),
      bgWarningSoft: alpha(theme.palette.warning.main, 0.12),
      bgErrorSoft: alpha(theme.palette.error.main, 0.12),
    }),
    [theme]
  );
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await sectionService.getSemesterDropdown();
        if (response) {
          setSemesters(response);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
      }
    };
    fetchSemesters();
  }, []);

  // Debounce search và fetch courses (chỉ khi search/semester thay đổi)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lecturerId) {
        fetchCourses();
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [lecturerId, searchText, semesterFilter]);

  const fetchCourses = async () => {
    if (!lecturerId) return;

    setLoading(true);
    try {
      const params = {
        pageNumber: 1,
        pageSize: 999,
      };

      // Thêm Search parameter nếu có
      if (searchText) {
        params.search = searchText;
      }

      // Thêm SemesterId parameter nếu có (phải là number, không phải string)
      if (semesterFilter !== 'all') {
        const semesterId = typeof semesterFilter === 'number' ? semesterFilter : parseInt(semesterFilter);
        if (!isNaN(semesterId)) {
          params.semesterId = semesterId;
        }
      }

      const response = await sectionService.getSectionsByLecturer(params);
      const sectionsData = response?.items || [];
      setCourses(sectionsData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply local status filter using useMemo (không trigger API call)
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (section) => section.status === parseInt(statusFilter)
      );
    }
    return filtered;
  }, [courses, statusFilter]);

  const handleExportExcel = async () => {
    try {
      const result = await exportTeacherCoursesExcel(filteredCourses, {
        lecturerName: user?.user?.fullName || user?.fullName || 'Giảng viên',
      });

      if (result.success) {
        message.success('Xuất Excel thành công');
      } else {
        message.error(result.error || 'Có lỗi xảy ra khi xuất Excel');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Có lỗi xảy ra khi xuất Excel');
    }
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setSemesterFilter('all');
  };

  const handleViewDetail = (section) => {
    setSelectedCourse(section);
    setDetailModalOpen(true);
  };

  const handleGradeEntry = (section) => {
    navigate('/teacher/grades', { state: { selectedSection: section } });
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Chưa bắt đầu',
      1: 'Đang diễn ra',
      2: 'Đã kết thúc',
      3: 'Đã hủy',
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      0: { label: 'Chưa bắt đầu', color: 'default' },
      1: { label: 'Đang diễn ra', color: 'success' },
      2: { label: 'Đã kết thúc', color: 'default' },
      3: { label: 'Đã hủy', color: 'error' },
    };

    const config = statusConfig[status] || statusConfig[1];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Define table columns
  const columns = [
    {
      field: 'stt',
      headerName: 'STT',
      width: '60px',
      align: 'left',
      renderCell: (row, index) => page * rowsPerPage + index + 1,
    },
    {
      field: 'sectionCode',
      headerName: 'Mã lớp HP',
      width: '120px',
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 600, color: colors.primary }}>
          {row.sectionCode}
        </Typography>
      ),
    },
    {
      field: 'courseCode',
      headerName: 'Mã môn học',
      width: '120px',
      renderCell: (row) => (
        <Chip
          label={row.courseCode}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'courseName',
      headerName: 'Tên môn học',
      width: '240px',
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 500 }}>{row.courseName}</Typography>
      ),
    },
    {
      field: 'enrolledCount',
      headerName: 'Số sinh viên',
      width: '130px',
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: colors.success }}>
            {row.enrolledCount}
          </Typography>
          <Typography color="text.secondary">/</Typography>
          <Typography color="text.secondary">{row.capacity}</Typography>
        </Box>
      ),
    },
    {
      field: 'semesterName',
      headerName: 'Học kỳ',
      width: '150px',
      renderCell: (row) => (
        <Chip
          label={row.semesterName}
          size="small"
          sx={{
            bgcolor: colors.bgPrimarySoft,
            color: colors.primary,
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: '130px',
      renderCell: (row) => getStatusChip(row.status),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: '200px',
      align: 'center',
      headerStyle: { textAlign: 'center' },
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              minWidth: '90px',
            }}
            onClick={() => handleViewDetail(row)}
          >
            Chi tiết
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{
              textTransform: 'none',
              minWidth: '90px',
            }}
            onClick={() => handleGradeEntry(row)}
          >
            Chấm điểm
          </Button>
        </Box>
      ),
    },
  ];

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated data
  const paginatedCourses = filteredCourses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
          Lớp học phần của tôi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchCourses}
              sx={{
                bgcolor: colors.bgCard,
                '&:hover': { bgcolor: colors.bgPrimarySoft },
                boxShadow: 1,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={filteredCourses.length === 0}
            sx={{
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
            }}
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container className="equal-height-cards" spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: colors.bgPrimarySoft,
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <School sx={{ fontSize: 50, mr: 2, color: colors.primary }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: colors.primary }}
                >
                  {courses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng lớp học phần
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <People
                sx={{
                  fontSize: 50,
                  mr: 2,
                  color: theme.palette.secondary.main,
                }}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    mb: 0.5,
                    color: theme.palette.secondary.main,
                  }}
                >
                  {courses.reduce(
                    (total, section) => total + (section.enrolledCount || 0),
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng sinh viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: colors.bgSuccessSoft,
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Schedule sx={{ fontSize: 50, mr: 2, color: colors.success }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: colors.success }}
                >
                  {courses.filter((section) => section.status === 1).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang diễn ra
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
            <FilterList sx={{ mr: 1, color: colors.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bộ lọc tìm kiếm
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã lớp, mã môn, tên môn..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
            <Grid item xs={12} md={3}>
              <SearchableAutocomplete
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: '0', label: 'Chưa bắt đầu' },
                  { value: '1', label: 'Đang diễn ra' },
                  { value: '2', label: 'Đã kết thúc' },
                  { value: '3', label: 'Đã hủy' },
                ]}
                value={
                  statusFilter
                    ? {
                        value: statusFilter,
                        label: {
                          all: 'Tất cả trạng thái',
                          0: 'Chưa bắt đầu',
                          1: 'Đang diễn ra',
                          2: 'Đã kết thúc',
                          3: 'Đã hủy',
                        }[statusFilter],
                      }
                    : null
                }
                onChange={(newValue) => {
                  setStatusFilter(newValue?.value || 'all');
                }}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.value === value?.value
                }
                label="Trạng thái"
                placeholder="Chọn trạng thái..."
                size="small"
                showSearchIcon={false}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SearchableAutocomplete
                options={[
                  { value: 'all', label: 'Tất cả học kỳ' },
                  ...semesters.map((semester) => ({
                    value: semester.id,
                    label: semester.name,
                  })),
                ]}
                value={
                  semesterFilter === 'all'
                    ? { value: 'all', label: 'Tất cả học kỳ' }
                    : semesters.find(s => s.id === semesterFilter)
                      ? { value: semesterFilter, label: semesters.find(s => s.id === semesterFilter).name }
                      : { value: 'all', label: 'Tất cả học kỳ' }
                }
                onChange={(newValue) => {
                  setSemesterFilter(newValue?.value || 'all');
                }}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.value === value?.value
                }
                label="Học kỳ"
                placeholder="Chọn học kỳ..."
                size="small"
                showSearchIcon={false}
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
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{filteredCourses.length}</strong> lớp học phần
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <DataTable
        columns={columns}
        rows={paginatedCourses}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredCourses.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyState={
          <>
            <School
              sx={{ fontSize: 80, color: alpha(colors.text, 0.2), mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học phần nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText || statusFilter !== 'all' || semesterFilter !== 'all'
                ? 'Thử thay đổi bộ lọc để tìm kiếm'
                : 'Bạn chưa có lớp học phần nào được phân công'}
            </Typography>
          </>
        }
      />

      {/* Course Detail Modal */}
      <CourseDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        section={selectedCourse}
      />
    </Box>
  );
};

export default CoursesPage;
