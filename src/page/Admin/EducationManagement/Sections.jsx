import React, { useState, useMemo, useEffect } from 'react';
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  School,
  Group,
  Assignment,
  People,
  Search as SearchIcon,
  FilterList,
  Refresh,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import sectionService from '../../../service/sectionService';
import { semesterService } from '../../../service/semesterService';
import * as XLSX from 'xlsx';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const statusOptions = [
    { value: 0, label: 'Chưa mở', color: 'default' },
    { value: 1, label: 'Đang chuẩn bị', color: 'warning' },
    { value: 2, label: 'Đang mở đăng ký', color: 'info' },
    { value: 3, label: 'Đang diễn ra', color: 'success' },
    { value: 4, label: 'Đã kết thúc', color: 'error' },
  ];

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await semesterService.getStudentSemesters();
        setSemesters(data || []);
      } catch (error) {
        console.error('Failed to fetch semesters:', error);
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchSections();
  }, [page, rowsPerPage, searchTerm, filterSemester, filterStatus]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const result = await sectionService.getAllSections({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        sectionCode: searchTerm,
        courseName: searchTerm,
        status: filterStatus !== '' ? filterStatus : null,
        semesterId: filterSemester || null,
      });

      if (result) {
        setSections(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterSemester('');
    setFilterStatus('');
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.label : 'Không xác định';
  };

  const stats = useMemo(() => {
    const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 0), 0);
    const totalEnrolled = sections.reduce((sum, s) => sum + (s.enrolledCount || 0), 0);
    const avgEnrollment = sections.length > 0
      ? sections.reduce((sum, s) => sum + (s.enrollmentPercentage || 0), 0) / sections.length
      : 0;

    return {
      total: totalCount,
      capacity: totalCapacity,
      enrolled: totalEnrolled,
      avgEnrollment: Math.round(avgEnrollment),
    };
  }, [sections, totalCount]);

  const handleExportExcel = () => {
    const dataToExport = sections.map((section, index) => ({
      'STT': index + 1,
      'Mã LHP': section.sectionCode,
      'Môn học': section.courseName,
      'Mã môn': section.courseCode,
      'Giảng viên': section.lecturerName,
      'Lớp dự kiến': section.className,
      'Học kỳ': section.semesterName,
      'Sĩ số': `${section.enrolledCount}/${section.capacity}`,
      'Tỷ lệ': `${section.enrollmentPercentage.toFixed(1)}%`,
      'Lịch học': section.scheduleSummary,
      'Phòng': section.roomSummary,
      'Trạng thái': getStatusLabel(section.status),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lớp học phần');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 30 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_lop_hoc_phan_${new Date().getTime()}.xlsx`);
  };

  if (loading && sections.length === 0) {
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
          Quản lý Lớp học phần
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchSections}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' }, boxShadow: 1 }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={sections.length === 0}
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
            Thêm lớp học phần
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <School sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng lớp học phần
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Group sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                  {stats.capacity}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng sĩ số
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
                  {stats.enrolled}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Đã đăng ký
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Assignment sx={{ fontSize: 50, mr: 2, color: '#f57c00' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#f57c00' }}>
                  {stats.avgEnrollment}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tỷ lệ đăng ký TB
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm theo mã lớp, tên môn học..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Học kỳ</InputLabel>
                <Select
                  value={filterSemester}
                  label="Học kỳ"
                  onChange={(e) => setFilterSemester(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {semesters.map((sem) => (
                    <MenuItem key={sem.semesterId} value={sem.semesterId}>
                      {sem.year} - {sem.term}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={handleResetFilters} sx={{ height: '40px' }}>
                Đặt lại
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{sections.length}</strong> lớp học phần
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Sections Table */}
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã LHP</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Giảng viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Lớp dự kiến</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Học kỳ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Sĩ số</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sections.map((section) => (
                <TableRow
                  key={section.sectionId}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background-color 0.2s' }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {section.sectionCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {section.courseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.courseCode} ({section.totalCredits} TC)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {section.lecturerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.lecturerEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={section.className}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {section.semesterName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.startDate} - {section.endDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {section.enrolledCount}/{section.capacity}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={section.enrollmentPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          mt: 0.5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor:
                              section.enrollmentPercentage >= 80
                                ? '#388e3c'
                                : section.enrollmentPercentage >= 50
                                  ? '#f57c00'
                                  : '#d32f2f',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {section.enrollmentPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(section.status)}
                      size="small"
                      color={getStatusColor(section.status)}
                      sx={{ fontWeight: 600 }}
                    />
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

        {sections.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học phần nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có lớp học phần nào trong hệ thống'}
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

export default Sections;
