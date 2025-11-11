import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  School,
  People,
  Schedule,
  FileDownload,
  Search as SearchIcon,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import sectionService from '../../../service/sectionService';
import * as XLSX from 'xlsx';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  useEffect(() => {
    fetchCourses();
  }, [lecturerId]);

  useEffect(() => {
    applyFilters();
  }, [courses, searchText, statusFilter, semesterFilter]);

  const fetchCourses = async () => {
    if (!lecturerId) return;

    setLoading(true);
    try {
      const response = await sectionService.getSectionsByLecturer({
        pageNumber: 1,
        pageSize: 100, // Get all sections
      });
      const sectionsData = response?.items || [];
      setCourses(sectionsData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (section) =>
          section.sectionCode?.toLowerCase().includes(searchText.toLowerCase()) ||
          section.courseCode?.toLowerCase().includes(searchText.toLowerCase()) ||
          section.courseName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((section) => section.status === parseInt(statusFilter));
    }

    // Semester filter
    if (semesterFilter !== 'all') {
      filtered = filtered.filter((section) => section.semesterName === semesterFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredCourses.map((section, index) => ({
      'STT': index + 1,
      'Mã lớp HP': section.sectionCode,
      'Mã môn học': section.courseCode,
      'Tên môn học': section.courseName,
      'Số SV': `${section.enrolledCount}/${section.capacity}`,
      'Học kỳ': section.semesterName,
      'Trạng thái': getStatusText(section.status),
      'Ngày bắt đầu': section.startDate,
      'Ngày kết thúc': section.endDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lớp học phần');

    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 15 }, // Mã lớp HP
      { wch: 12 }, // Mã môn học
      { wch: 35 }, // Tên môn học
      { wch: 10 }, // Số SV
      { wch: 20 }, // Học kỳ
      { wch: 15 }, // Trạng thái
      { wch: 15 }, // Ngày bắt đầu
      { wch: 15 }, // Ngày kết thúc
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_lop_hoc_phan_${new Date().getTime()}.xlsx`);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setSemesterFilter('all');
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

  const semesters = [...new Set(courses.map((c) => c.semesterName))].filter(Boolean);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Môn học của tôi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchCourses}
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: '#e3f2fd' },
                boxShadow: 1,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={filteredCourses.length === 0}
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
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: '#e3f2fd',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <School sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {courses.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng lớp học phần
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: '#f3e5f5',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <People sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
                  {courses.reduce(
                    (total, section) => total + (section.enrolledCount || 0),
                    0
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng sinh viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: '#e8f5e9',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Schedule sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                  {courses.filter((section) => section.status === 1).length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
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
            <FilterList sx={{ mr: 1, color: '#1976d2' }} />
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
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="0">Chưa bắt đầu</MenuItem>
                  <MenuItem value="1">Đang diễn ra</MenuItem>
                  <MenuItem value="2">Đã kết thúc</MenuItem>
                  <MenuItem value="3">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Học kỳ</InputLabel>
                <Select
                  value={semesterFilter}
                  label="Học kỳ"
                  onChange={(e) => setSemesterFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả học kỳ</MenuItem>
                  {semesters.map((semester) => (
                    <MenuItem key={semester} value={semester}>
                      {semester}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>STT</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã lớp HP</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tên môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Số sinh viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Học kỳ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((section, index) => (
                <TableRow
                  key={section.sectionId}
                  hover
                  sx={{
                    '&:hover': { bgcolor: '#f5f5f5' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {section.sectionCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={section.courseCode} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{section.courseName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {section.enrolledCount}
                      </Typography>
                      <Typography color="text.secondary">/</Typography>
                      <Typography color="text.secondary">{section.capacity}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={section.semesterName}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(section.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          minWidth: '90px',
                        }}
                        onClick={() => {
                          /* Navigate to course detail */
                        }}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          minWidth: '90px',
                          bgcolor: '#4caf50',
                          '&:hover': { bgcolor: '#45a049' },
                        }}
                        onClick={() => {
                          /* Navigate to gradebook */
                        }}
                      >
                        Chấm điểm
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCourses.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học phần nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText || statusFilter !== 'all' || semesterFilter !== 'all'
                ? 'Thử thay đổi bộ lọc để tìm kiếm'
                : 'Bạn chưa có lớp học phần nào được phân công'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CoursesPage;
