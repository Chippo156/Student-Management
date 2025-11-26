import React, { useEffect, useState, useMemo } from 'react';
import { message } from 'antd';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  School,
  People,
  CheckCircle,
  Business,
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
import { lecturerService } from '../../../service/lecturerService';
import { departmentService } from '../../../service/departmentService';
import TeacherDetailModal from '../../../component/Admin/TeacherManagement/TeacherDetailModal';
import TeacherEditModal from '../../../component/Admin/TeacherManagement/TeacherEditModal';
import TeacherCreateModal from '../../../component/Admin/TeacherManagement/TeacherCreateModal';
import { exportLecturersExcel } from '../../../until/exportLecturersExcel';
import { useDebounce } from '../../../hooks/useDebounce';

const TeacherList = () => {
  const theme = useTheme();
  const [lecturers, setLecturers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterAcademicTitle, setFilterAcademicTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [departments, setDepartments] = useState([]);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchLecturers = async () => {
    setLoading(true);
    const filters = {
      departmentId: filterDepartment || undefined,
      position: filterPosition || undefined,
      academicTitle: filterAcademicTitle || undefined,
      lecturerStatus: filterStatus !== '' ? filterStatus : undefined,
    };
    const res = await lecturerService.getAllLecturers(
      page + 1,
      rowsPerPage,
      debouncedSearchTerm,
      filters
    ); // ✅ Dùng debounced value
    if (res && res.items) {
      setLecturers(res.items);
      setTotalCount(res.totalCount || 0);
    } else {
      setLecturers([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await departmentService.getDepartmentsDropdown();
      if (result && Array.isArray(result)) {
        setDepartments(result);
      } else {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchLecturers();
    // eslint-disable-next-line
  }, [
    page,
    rowsPerPage,
    debouncedSearchTerm,
    filterDepartment,
    filterPosition,
    filterAcademicTitle,
    filterStatus,
  ]); // ✅ Dùng debouncedSearchTerm

  const stats = useMemo(() => {
    const activeLecturers = lecturers.filter(
      (l) => l.user?.accountStatus === 1
    ).length;
    const uniqueDepartments = new Set(
      lecturers.map((l) => l.department?.departmentName).filter(Boolean)
    ).size;
    return {
      total: totalCount,
      active: activeLecturers,
      departments: uniqueDepartments,
    };
  }, [lecturers, totalCount]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterPosition('');
    setFilterAcademicTitle('');
    setFilterStatus('');
  };

  const handleExportExcel = async () => {
    let filterInfo = '';
    if (searchTerm) filterInfo += `Tìm kiếm: "${searchTerm}"`;
    if (filterDepartment) {
      const dept = departments.find((d) => d.departmentId === filterDepartment);
      filterInfo +=
        (filterInfo ? ', ' : '') + `Khoa: ${dept?.departmentName || ''}`;
    }
    if (filterPosition)
      filterInfo += (filterInfo ? ', ' : '') + `Chức vụ: ${filterPosition}`;
    if (filterAcademicTitle)
      filterInfo +=
        (filterInfo ? ', ' : '') + `Học hàm: ${filterAcademicTitle}`;
    if (filterStatus !== '') {
      const statusLabel =
        filterStatus === 1 ? 'Đang công tác' : 'Không hoạt động';
      filterInfo += (filterInfo ? ', ' : '') + `Trạng thái: ${statusLabel}`;
    }

    const result = await exportLecturersExcel(lecturers, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      1: 'Đang công tác', // Active
      2: 'Không hoạt động', // Inactive
    };
    return statusMap[status] || 'Không xác định';
  };

  // Modal handlers
  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setDetailModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setEditModalOpen(true);
  };

  const handleCreateTeacher = () => {
    setCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setDetailModalOpen(false);
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleSaveTeacher = (savedTeacher) => {
    fetchLecturers();
    handleCloseModals();
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      1: { label: 'Đang công tác', color: 'success' }, // Active
      2: { label: 'Không hoạt động', color: 'error' }, // Inactive
    };
    const config = statusConfig[status] || {
      label: 'Không xác định',
      color: 'default',
    };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading && lecturers.length === 0) {
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
      field: 'lecturerCode',
      headerName: 'Mã GV',
      width: 120,
      renderCell: (lecturer) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {lecturer.lecturerCode}
        </Typography>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Họ và tên',
      width: 220,
      renderCell: (lecturer) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor:
                theme.palette.mode === 'light'
                  ? theme.palette.primary.light + '40'
                  : theme.palette.primary.dark,
              color: theme.palette.primary.main,
            }}
          >
            {lecturer.user?.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {lecturer.user?.fullName || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      renderCell: (lecturer) => (
        <Typography variant="body2">
          {lecturer.user?.email || (
            <span style={{ color: theme.palette.text.disabled }}>
              Chưa cập nhật
            </span>
          )}
        </Typography>
      ),
    },
    {
      field: 'department',
      headerName: 'Khoa',
      width: 180,
      renderCell: (lecturer) => (
        <Chip
          label={lecturer.department?.departmentName || 'N/A'}
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
      field: 'position',
      headerName: 'Chức vụ',
      width: 150,
      renderCell: (lecturer) => (
        <Typography variant="body2">
          {lecturer.position || (
            <span style={{ color: theme.palette.text.disabled }}>
              Chưa cập nhật
            </span>
          )}
        </Typography>
      ),
    },
    {
      field: 'academicTitle',
      headerName: 'Học hàm',
      width: 150,
      renderCell: (lecturer) => (
        <Typography variant="body2">
          {lecturer.academicTitle || (
            <span style={{ color: theme.palette.text.disabled }}>
              Chưa cập nhật
            </span>
          )}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      renderCell: (lecturer) => getStatusChip(lecturer.user?.accountStatus),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      align: 'center',
      renderCell: (lecturer) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => handleViewTeacher(lecturer)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditTeacher(lecturer)}
            >
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
        title="Quản lý Giảng viên"
        onRefresh={fetchLecturers}
        actions={
          <>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={lecturers.length === 0}
              color="success"
              sx={{ textTransform: 'none', px: 3, mr: 2 }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTeacher}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Thêm giảng viên
            </Button>
          </>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<People />}
            value={stats.total}
            label="Tổng giảng viên"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<CheckCircle />}
            value={stats.active}
            label="Đang công tác"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<Business />}
            value={stats.departments}
            label="Khoa"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={lecturers.length}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã GV, tên, email..."
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
          <FormControl fullWidth size="small">
            <InputLabel>Khoa</InputLabel>
            <Select
              value={filterDepartment}
              label="Khoa"
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Chức vụ</InputLabel>
            <Select
              value={filterPosition}
              label="Chức vụ"
              onChange={(e) => setFilterPosition(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Giảng viên">Giảng viên</MenuItem>
              <MenuItem value="Trưởng khoa">Trưởng khoa</MenuItem>
              <MenuItem value="Phó khoa">Phó khoa</MenuItem>
              <MenuItem value="Trưởng bộ môn">Trưởng bộ môn</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Học hàm</InputLabel>
            <Select
              value={filterAcademicTitle}
              label="Học hàm"
              onChange={(e) => setFilterAcademicTitle(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Giáo sư">Giáo sư</MenuItem>
              <MenuItem value="Phó giáo sư">Phó giáo sư</MenuItem>
              <MenuItem value="Tiến sĩ">Tiến sĩ</MenuItem>
              <MenuItem value="Thạc sĩ">Thạc sĩ</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={1.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              label="Trạng thái"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value={1}>Đang công tác</MenuItem>
              <MenuItem value={2}>Không hoạt động</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={1.5}>
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

      {/* Lecturers Table */}
      <DataTable
        columns={columns}
        rows={lecturers}
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
              Không tìm thấy giảng viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có giảng viên nào trong hệ thống'}
            </Typography>
          </>
        }
      />

      {/* Modals */}
      <TeacherDetailModal
        open={detailModalOpen}
        onCancel={handleCloseModals}
        lecturer={selectedTeacher}
      />

      <TeacherEditModal
        open={editModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveTeacher}
        lecturer={selectedTeacher}
        loading={modalLoading}
      />

      <TeacherCreateModal
        open={createModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveTeacher}
        loading={modalLoading}
      />
    </Box>
  );
};

export default TeacherList;
