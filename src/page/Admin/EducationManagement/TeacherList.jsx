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
import { PageHeader, StatsCard, DataTable, FilterSection } from '../../../component/Common';
import { lecturerService } from '../../../service/lecturerService';
import * as XLSX from 'xlsx';
import TeacherDetailModal from '../../../component/Admin/TeacherManagement/TeacherDetailModal';
import TeacherEditModal from '../../../component/Admin/TeacherManagement/TeacherEditModal';
import TeacherCreateModal from '../../../component/Admin/TeacherManagement/TeacherCreateModal';

const TeacherList = () => {
  const theme = useTheme();
  const [lecturers, setLecturers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchLecturers = async () => {
    setLoading(true);
    const res = await lecturerService.getAllLecturers(page + 1, rowsPerPage, searchTerm);
    if (res && res.items) {
      setLecturers(res.items);
      setTotalCount(res.totalCount || 0);
    } else {
      setLecturers([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLecturers();
    // eslint-disable-next-line
  }, [page, rowsPerPage, searchTerm]);

  const stats = useMemo(() => {
    const activeLecturers = lecturers.filter((l) => l.user?.accountStatus === 0).length;
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
  };

  const handleExportExcel = () => {
    const dataToExport = lecturers.map((lecturer, index) => ({
      'STT': index + 1,
      'Mã GV': lecturer.lecturerCode,
      'Họ và tên': lecturer.user?.fullName || '',
      'Email': lecturer.user?.email || '',
      'Số điện thoại': lecturer.user?.phone || '',
      'Khoa': lecturer.department?.departmentName || '',
      'Chức vụ': lecturer.position || '',
      'Học hàm': lecturer.academicTitle || '',
      'Trạng thái': getStatusText(lecturer.user?.accountStatus),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Giảng viên');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_giang_vien_${new Date().getTime()}.xlsx`);
  };

  const getStatusText = (status) => {
    return status === 0 ? 'Đang công tác' : 'Nghỉ việc';
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
    return status === 0 ? (
      <Chip label="Đang công tác" color="success" size="small" />
    ) : (
      <Chip label="Nghỉ việc" color="error" size="small" />
    );
  };

  if (loading && lecturers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
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
              bgcolor: theme.palette.mode === 'light'
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
          {lecturer.user?.email || <span style={{ color: theme.palette.text.disabled }}>Chưa cập nhật</span>}
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
            bgcolor: theme.palette.mode === 'light'
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
          {lecturer.position || <span style={{ color: theme.palette.text.disabled }}>Chưa cập nhật</span>}
        </Typography>
      ),
    },
    {
      field: 'academicTitle',
      headerName: 'Học hàm',
      width: 150,
      renderCell: (lecturer) => (
        <Typography variant="body2">
          {lecturer.academicTitle || <span style={{ color: theme.palette.text.disabled }}>Chưa cập nhật</span>}
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
            <IconButton size="small" onClick={() => handleViewTeacher(lecturer)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" color="primary" onClick={() => handleEditTeacher(lecturer)}>
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
          <StatsCard icon={<People />} value={stats.total} label="Tổng giảng viên" color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard icon={<CheckCircle />} value={stats.active} label="Đang công tác" color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard icon={<Business />} value={stats.departments} label="Khoa" color="warning" />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={lecturers.length}>
        <Grid item xs={12} md={10}>
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
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button fullWidth variant="outlined" onClick={handleResetFilters} sx={{ height: '40px' }}>
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
            <School sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy giảng viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có giảng viên nào trong hệ thống'}
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
