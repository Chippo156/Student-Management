import React, { useEffect, useState, useMemo } from 'react';
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
  Avatar,
  TablePagination,
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
  FilterList,
  Refresh,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { lecturerService } from '../../../service/lecturerService';
import * as XLSX from 'xlsx';

const TeacherList = () => {
  const [lecturers, setLecturers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Quản lý Giảng viên
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchLecturers}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' }, boxShadow: 1 }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={lecturers.length === 0}
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
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <People sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng giảng viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: '#e8f5e9', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Đang công tác
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: '#f3e5f5', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Business sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
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
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{lecturers.length}</strong> giảng viên
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Lecturers Table */}
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã GV</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Họ và tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Khoa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Chức vụ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Học hàm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lecturers.map((lecturer) => (
                <TableRow key={lecturer.lecturerId} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background-color 0.2s' }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {lecturer.lecturerCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#e3f2fd', color: '#1976d2' }}>
                        {lecturer.user?.fullName?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {lecturer.user?.fullName || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {lecturer.user?.email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lecturer.department?.departmentName || 'N/A'}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {lecturer.position || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {lecturer.academicTitle || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(lecturer.user?.accountStatus)}</TableCell>
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

        {lecturers.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy giảng viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có giảng viên nào trong hệ thống'}
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

export default TeacherList;
