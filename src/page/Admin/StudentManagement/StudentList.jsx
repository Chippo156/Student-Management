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
import { departmentService } from '../../../service/departmentService';
import { classService } from '../../../service/classService';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import StudentDetailModal from '../../../component/Admin/StudentManagement/StudentDetailModal';
import StudentEditModal from '../../../component/Admin/StudentManagement/StudentEditModal';
import StudentCreateModal from '../../../component/Admin/StudentManagement/StudentCreateModal';
import { exportStudentsExcel } from '../../../until/exportStudentsExcel';
import { useDebounce } from '../../../hooks/useDebounce';
import SearchableAutocomplete from '../../../component/Common/SearchableAutocomplete';

const yearOptions = [
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020', label: '2020' },
  { value: '2019', label: '2019' },
];

const statusOptions = [
  { value: 1, label: 'Đang học' },
  { value: 2, label: 'Không hoạt động' },
  { value: 3, label: 'Đã tốt nghiệp' },
  { value: 4, label: 'Đình chỉ' },
  { value: 5, label: 'Bảo lưu' },
];

const StudentList = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [filterYearOfAdmission, setFilterYearOfAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const filters = {
        departmentId: filterDepartment?.departmentId,
        className: filterClass?.className,
        yearOfAdmission: filterYearOfAdmission?.value,
        studentStatus: filterStatus?.value,
      };

      const response = await studentServices.getAllStudents(
        page + 1,
        rowsPerPage,
        debouncedSearchTerm,
        filters
      );

      if (response) {
        setStudents(response.items || []);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
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

  // Fetch all classes for filter dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      if (filterDepartment) {
        const result =
          await classService.getClassesDropdownByDepartment(filterDepartment.departmentId);
        if (result && Array.isArray(result)) {
          setClasses(result);
        } else {
          setClasses([]);
        }
        setFilterClass(null);
      } else {
        const result = await classService.getAllClasses(1, 1000, '');
        if (result && result.items && Array.isArray(result.items)) {
          setClasses(result.items);
        } else {
          setClasses([]);
        }
      }
    };
    fetchClasses();
  }, [filterDepartment]);

  // ✅ Fetch students khi debounced search term thay đổi
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [
    page,
    rowsPerPage,
    debouncedSearchTerm,
    filterDepartment,
    filterClass,
    filterYearOfAdmission,
    filterStatus,
  ]);

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.studentStatus === 1).length;
    const graduatedStudents = students.filter(
      (s) => s.studentStatus === 3
    ).length;
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
    setFilterDepartment(null);
    setFilterClass(null);
    setFilterYearOfAdmission(null);
    setFilterStatus(null);
  };

  const handleExportExcel = async () => {
    let filterInfo = '';
    if (searchTerm) filterInfo += `Tìm kiếm: "${searchTerm}"`;
    if (filterDepartment) {
      filterInfo +=
        (filterInfo ? ', ' : '') +
        `Chuyên ngành: ${filterDepartment.departmentName}`;
    }
    if (filterClass)
      filterInfo += (filterInfo ? ', ' : '') + `Lớp: ${filterClass.className}`;
    if (filterYearOfAdmission)
      filterInfo +=
        (filterInfo ? ', ' : '') + `Năm nhập học: ${filterYearOfAdmission.value}`;
    if (filterStatus) {
      filterInfo +=
        (filterInfo ? ', ' : '') +
        `Trạng thái: ${filterStatus.label}`;
    }

    const result = await exportStudentsExcel(students, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      1: 'Đang học', // Active
      2: 'Không hoạt động', // Inactive
      3: 'Đã tốt nghiệp', // Graduated
      4: 'Đình chỉ', // Suspended
      5: 'Bảo lưu', // Reserved
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      1: { label: 'Đang học', color: 'success' }, // Active
      2: { label: 'Không hoạt động', color: 'default' }, // Inactive
      3: { label: 'Đã tốt nghiệp', color: 'primary' }, // Graduated
      4: { label: 'Đình chỉ', color: 'error' }, // Suspended
      5: { label: 'Bảo lưu', color: 'warning' }, // Reserved
    };
    const config = statusConfig[status] || {
      label: 'Không xác định',
      color: 'default',
    };
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
            src={student.user?.avatarUrl}
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
          {student.user?.email || (
            <span style={{ color: theme.palette.text.disabled }}>
              Chưa cập nhật
            </span>
          )}
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
      field: 'department',
      headerName: 'Chuyên ngành',
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
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditStudent(student)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading && students.length === 0) {
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

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Sinh viên"
        onRefresh={fetchStudents}
        actions={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={students.length === 0}
              color="success"
              sx={{
                textTransform: 'none',
                px: 3,
                width: { xs: '100%', sm: 'auto' },
              }}
              size="small"
            >
              Xuất Excel
            </Button>
            {/* <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateStudent}
              sx={{ textTransform: 'none', px: 3, width: { xs: '100%', sm: 'auto' } }}
              size="small"
            >
              Thêm sinh viên
            </Button> */}
          </Box>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<People />}
            value={stats.total}
            label="Tổng sinh viên"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircle />}
            value={stats.active}
            label="Đang học"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<School />}
            value={stats.graduated}
            label="Đã tốt nghiệp"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Business />}
            value={stats.departments}
            label="Chuyên ngành"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={totalCount}>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo MSSV, tên, email..."
            value={searchTerm} // ✅ Vẫn dùng searchTerm để input responsive
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
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  Đang tìm kiếm...
                </span>
              ) : null
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SearchableAutocomplete
            options={departments}
            value={filterDepartment}
            onChange={(newValue) => setFilterDepartment(newValue)}
            getOptionLabel={(option) => option.departmentName}
            isOptionEqualToValue={(option, value) => option?.departmentId === value?.departmentId}
            label="Chuyên ngành"
            placeholder="Tất cả"
            size="small"
            showSearchIcon={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SearchableAutocomplete
            options={classes}
            value={filterClass}
            onChange={(newValue) => setFilterClass(newValue)}
            getOptionLabel={(option) => option.className}
            isOptionEqualToValue={(option, value) => option?.classId === value?.classId}
            label="Lớp"
            placeholder="Tất cả"
            size="small"
            showSearchIcon={false}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <SearchableAutocomplete
            options={yearOptions}
            value={filterYearOfAdmission}
            onChange={(newValue) => setFilterYearOfAdmission(newValue)}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option?.value === value?.value}
            label="Năm"
            placeholder="Tất cả"
            size="small"
            showSearchIcon={false}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={4} lg={2}>
          <SearchableAutocomplete
            options={statusOptions}
            value={filterStatus}
            onChange={(newValue) => setFilterStatus(newValue)}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option?.value === value?.value}
            label="Trạng thái"
            placeholder="Tất cả"
            size="small"
            showSearchIcon={false}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={5} lg={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: '40px' }}
            size="small"
          >
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
            <School
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy sinh viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có sinh viên nào trong hệ thống'}
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
