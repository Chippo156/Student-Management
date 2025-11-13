import React, { useEffect, useState, useMemo } from 'react';
import { message } from 'antd';
import {
  Box,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
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
import { studentServices } from '../../../service/studentServices';
import * as XLSX from 'xlsx';
import { PageHeader, StatsCard, DataTable, FilterSection } from '../../../component/Common';
import StudentDetailModal from '../../../component/Admin/StudentManagement/StudentDetailModal';
import StudentEditModal from '../../../component/Admin/StudentManagement/StudentEditModal';
import StudentCreateModal from '../../../component/Admin/StudentManagement/StudentCreateModal';

const StudentList = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await studentServices.getAllStudents(page + 1, rowsPerPage, searchTerm);
    if (res && res.items) {
      setStudents(res.items);
      setTotalCount(res.totalCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [page, rowsPerPage, searchTerm]);

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.studentStatus === 0).length;
    const graduatedStudents = students.filter((s) => s.studentStatus === 2).length;
    const uniqueDepartments = new Set(
      students
        .map((s) => s.class?.program?.department?.departmentName)
        .filter(Boolean)
    ).size;
    return {
      total: totalCount,
      active: activeStudents,
      graduated: graduatedStudents,
      departments: uniqueDepartments,
    };
  }, [students, totalCount]);

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
    const dataToExport = students.map((student, index) => ({
      'STT': index + 1,
      'MSSV': student.mssv,
      'Họ và tên': student.user?.fullName || '',
      'Email': student.user?.email || '',
      'Số điện thoại': student.user?.phone || '',
      'Lớp': student.class?.className || '',
      'Khoa': student.class?.program?.department?.departmentName || '',
      'Năm nhập học': student.yearOfAdmission || '',
      'Trạng thái': getStatusText(student.studentStatus),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sinh viên');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_sinh_vien_${new Date().getTime()}.xlsx`);
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Đang học',
      1: 'Tạm nghỉ',
      2: 'Đã tốt nghiệp',
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      0: { label: 'Đang học', color: 'success' },
      1: { label: 'Tạm nghỉ', color: 'error' },
      2: { label: 'Đã tốt nghiệp', color: 'primary' },
    };
    const config = statusConfig[status] || { label: 'Không xác định', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Modal handlers
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleCreateStudent = () => {
    setCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setDetailModalOpen(false);
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSaveStudent = (savedStudent) => {
    fetchStudents();
    handleCloseModals();
  };

  const columns = [
    {
      field: 'mssv',
      headerName: 'MSSV',
      width: 120,
      renderCell: (student) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {student.mssv}
        </Typography>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Họ và tên',
      width: 250,
      renderCell: (student) => (
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
            {student.user?.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {student.user?.fullName || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      renderCell: (student) => (
        <Typography variant="body2">
          {student.user?.email || <span style={{ color: theme.palette.text.disabled }}>Chưa cập nhật</span>}
        </Typography>
      ),
    },
    {
      field: 'className',
      headerName: 'Lớp',
      width: 150,
      renderCell: (student) => (
        <Chip
          label={student.class?.className || 'N/A'}
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
      field: 'department',
      headerName: 'Khoa',
      width: 200,
      renderCell: (student) => (
        <Typography variant="body2">
          {student.class?.program?.department?.departmentName || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'yearOfAdmission',
      headerName: 'Năm nhập học',
      width: 120,
      align: 'center',
      renderCell: (student) => (
        <Typography variant="body2">
          {student.yearOfAdmission || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      align: 'center',
      renderCell: (student) => getStatusChip(student.studentStatus),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      align: 'center',
      renderCell: (student) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" onClick={() => handleViewStudent(student)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" color="primary" onClick={() => handleEditStudent(student)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Sinh viên"
        onRefresh={fetchStudents}
        actions={
          <>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={students.length === 0}
              color="success"
              sx={{ textTransform: 'none', px: 3, mr: 2 }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateStudent}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Thêm sinh viên
            </Button>
          </>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<People />} value={stats.total} label="Tổng sinh viên" color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<CheckCircle />} value={stats.active} label="Đang học" color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<School />} value={stats.graduated} label="Đã tốt nghiệp" color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<Business />} value={stats.departments} label="Khoa" color="warning" />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={students.length}>
        <Grid item xs={12} md={10}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo MSSV, tên, email..."
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

      {/* Students Table */}
      <DataTable
        columns={columns}
        rows={students}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <School sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy sinh viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có sinh viên nào trong hệ thống'}
            </Typography>
          </>
        }
      />

      {/* Modals */}
      <StudentDetailModal
        open={detailModalOpen}
        onCancel={handleCloseModals}
        student={selectedStudent}
      />

      <StudentEditModal
        open={editModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveStudent}
        student={selectedStudent}
        loading={modalLoading}
      />

      <StudentCreateModal
        open={createModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveStudent}
        loading={modalLoading}
      />
    </Box>
  );
};

export default StudentList;
