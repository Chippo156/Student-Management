import React, { useState, useMemo } from 'react';
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
  Avatar,
} from '@mui/material';
import {
  Class as ClassIcon,
  School,
  People,
  CheckCircle,
  Search as SearchIcon,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { PageHeader, StatsCard, DataTable, FilterSection } from '../../../component/Common';
import * as XLSX from 'xlsx';

const Classes = () => {
  const theme = useTheme();
  const [classes] = useState([
    {
      id: '1',
      classCode: 'IT101',
      className: 'Lập trình cơ bản',
      department: 'Công nghệ thông tin',
      major: 'Kỹ thuật phần mềm',
      year: 1,
      semester: 'HK1 2024-2025',
      instructor: 'TS. Nguyễn Văn A',
      studentCount: 35,
      maxStudents: 40,
      schedule: 'Thứ 2, 4, 6 - 7:30-9:30',
      room: 'A101',
      status: 'active',
    },
    {
      id: '2',
      classCode: 'BUS201',
      className: 'Quản trị học đại cương',
      department: 'Kinh tế',
      major: 'Quản trị kinh doanh',
      year: 2,
      semester: 'HK1 2024-2025',
      instructor: 'PGS. Trần Thị B',
      studentCount: 42,
      maxStudents: 45,
      schedule: 'Thứ 3, 5, 7 - 9:30-11:30',
      room: 'B203',
      status: 'active',
    },
    {
      id: '3',
      classCode: 'ENG301',
      className: 'Tiếng Anh chuyên ngành',
      department: 'Ngoại ngữ',
      major: 'Tiếng Anh',
      year: 3,
      semester: 'HK1 2024-2025',
      instructor: 'ThS. Lê Văn C',
      studentCount: 28,
      maxStudents: 30,
      schedule: 'Thứ 2, 4 - 13:30-16:30',
      room: 'C105',
      status: 'active',
    },
    {
      id: '4',
      classCode: 'MATH101',
      className: 'Toán cao cấp 1',
      department: 'Khoa học tự nhiên',
      major: 'Toán học',
      year: 1,
      semester: 'HK2 2023-2024',
      instructor: 'TS. Phạm Thị D',
      studentCount: 38,
      maxStudents: 40,
      schedule: 'Thứ 3, 6 - 7:30-10:30',
      room: 'D201',
      status: 'completed',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter((classInfo) => {
    const matchesSearch =
      classInfo.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const stats = useMemo(() => {
    const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
    const activeClasses = classes.filter((c) => c.status === 'active').length;
    const uniqueDepartments = new Set(classes.map((c) => c.department)).size;
    return {
      total: classes.length,
      active: activeClasses,
      totalStudents: totalStudents,
      departments: uniqueDepartments,
    };
  }, [classes]);

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
    const exportData = filteredClasses.map((classInfo, index) => ({
      STT: index + 1,
      'Mã lớp': classInfo.classCode,
      'Tên lớp': classInfo.className,
      Khoa: classInfo.department,
      'Chuyên ngành': classInfo.major,
      Năm: classInfo.year,
      'Học kỳ': classInfo.semester,
      'Giảng viên': classInfo.instructor,
      'Sĩ số': `${classInfo.studentCount}/${classInfo.maxStudents}`,
      'Lịch học': classInfo.schedule,
      Phòng: classInfo.room,
      'Trạng thái':
        classInfo.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lớp học');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 8 },
      { wch: 18 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_lop_hoc_${new Date().getTime()}.xlsx`);
  };

  if (loading && filteredClasses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    {
      field: 'classCode',
      headerName: 'Mã lớp',
      width: 120,
      renderCell: (classInfo) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {classInfo.classCode}
        </Typography>
      ),
    },
    {
      field: 'className',
      headerName: 'Tên lớp',
      width: 220,
      renderCell: (classInfo) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {classInfo.className}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {classInfo.semester}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Khoa',
      width: 150,
      renderCell: (classInfo) => (
        <Chip
          label={classInfo.department}
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
      field: 'major',
      headerName: 'Chuyên ngành',
      width: 150,
    },
    {
      field: 'year',
      headerName: 'Năm',
      width: 80,
      align: 'center',
    },
    {
      field: 'instructor',
      headerName: 'Giảng viên',
      width: 180,
    },
    {
      field: 'studentCount',
      headerName: 'Sĩ số',
      width: 100,
      renderCell: (classInfo) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color:
              classInfo.studentCount >= classInfo.maxStudents
                ? theme.palette.error.main
                : theme.palette.success.main,
          }}
        >
          {classInfo.studentCount}/{classInfo.maxStudents}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      renderCell: (classInfo) =>
        classInfo.status === 'active' ? (
          <Chip label="Đang hoạt động" color="success" size="small" />
        ) : (
          <Chip label="Đã kết thúc" color="default" size="small" />
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
        title="Quản lý Lớp học"
        onRefresh={() => {}}
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={filteredClasses.length === 0}
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
              Thêm lớp học
            </Button>
          </Box>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<ClassIcon />} value={stats.total} label="Tổng lớp học" color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<CheckCircle />} value={stats.active} label="Đang hoạt động" color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<People />} value={stats.totalStudents} label="Tổng sinh viên" color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<School />} value={stats.departments} label="Khoa/Phòng ban" color="warning" />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={filteredClasses.length}>
        <Grid item xs={12} md={10}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã lớp, tên, giảng viên..."
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

      {/* Classes Table */}
      <DataTable
        columns={columns}
        rows={filteredClasses}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredClasses.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <ClassIcon sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có lớp học nào trong hệ thống'}
            </Typography>
          </>
        }
      />
    </Box>
  );
};

export default Classes;
