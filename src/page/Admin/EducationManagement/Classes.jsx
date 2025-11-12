import React, { useState, useMemo } from 'react';
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
  Class as ClassIcon,
  School,
  People,
  CheckCircle,
  Search as SearchIcon,
  FilterList,
  Refresh,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

const Classes = () => {
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

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Quản lý Lớp học
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' }, boxShadow: 1 }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={filteredClasses.length === 0}
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
            Thêm lớp học
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <ClassIcon sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng lớp học
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
                  Đang hoạt động
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <People sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
                  {stats.totalStudents}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng sinh viên
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
                  Khoa/Phòng ban
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
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{filteredClasses.length}</strong> lớp học
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã lớp</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tên lớp</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Khoa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Chuyên ngành</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Năm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Giảng viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Sĩ số</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClasses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((classInfo) => (
                  <TableRow key={classInfo.id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background-color 0.2s' }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {classInfo.classCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {classInfo.className}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classInfo.semester}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={classInfo.department}
                        size="small"
                        sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classInfo.major}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {classInfo.year}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classInfo.instructor}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            classInfo.studentCount >= classInfo.maxStudents
                              ? '#d32f2f'
                              : '#388e3c',
                        }}
                      >
                        {classInfo.studentCount}/{classInfo.maxStudents}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {classInfo.status === 'active' ? (
                        <Chip label="Đang hoạt động" color="success" size="small" />
                      ) : (
                        <Chip label="Đã kết thúc" color="default" size="small" />
                      )}
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

        {filteredClasses.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ClassIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có lớp học nào trong hệ thống'}
            </Typography>
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={filteredClasses.length}
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

export default Classes;
