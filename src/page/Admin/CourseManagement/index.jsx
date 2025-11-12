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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  MenuBook,
  Assignment,
  Category,
  School,
  Search as SearchIcon,
  FilterList,
  Refresh,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import curriculumCourseService from '../../../service/curriculumCourseService';
import academicProgramService from '../../../service/academicProgramService';
import * as XLSX from 'xlsx';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCourseType, setFilterCourseType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch programs for filter
  useEffect(() => {
    const fetchPrograms = async () => {
      const result = await academicProgramService.getAllPrograms({
        pageSize: 100,
      });
      if (result) {
        setPrograms(result.items || []);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, searchTerm, filterProgram, filterDepartment]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await curriculumCourseService.getAllCurriculumCourses({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        courseCode: searchTerm,
        courseName: searchTerm,
        programId: filterProgram || null,
        departmentId: filterDepartment || null,
      });

      if (result) {
        setCourses(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCourseType =
        !filterCourseType ||
        (filterCourseType === 'required' && course.isRequired) ||
        (filterCourseType === 'elective' && !course.isRequired);
      return matchesCourseType;
    });
  }, [courses, filterCourseType]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterProgram('');
    setFilterDepartment('');
    setFilterCourseType('');
  };

  const handleExportExcel = () => {
    const exportData = filteredCourses.map((course, index) => ({
      'STT': index + 1,
      'Mã môn học': course.courseCode,
      'Tên môn học': course.courseName,
      'Chương trình': course.programName,
      'Bậc đào tạo': course.degreeLevel,
      'Chuyên ngành': course.departmentName,
      'Tổng tín chỉ': course.totalCredits,
      'Tín chỉ lý thuyết': course.creditsTheory,
      'Tín chỉ thực hành': course.creditsLab,
      'Học kỳ đề xuất': course.semesterSuggested,
      'Loại môn học': course.courseType,
      'Môn tiên quyết': course.prerequisites
        .map((p) => p.courseCode)
        .join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách môn học');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_mon_hoc_${new Date().getTime()}.xlsx`);
  };

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(courses.map((c) => c.departmentName));
    return Array.from(depts);
  }, [courses]);

  const stats = useMemo(() => {
    return {
      total: totalCount,
      required: courses.filter((c) => c.isRequired).length,
      elective: courses.filter((c) => !c.isRequired).length,
      departments: uniqueDepartments.length,
    };
  }, [courses, totalCount, uniqueDepartments]);

  if (loading && courses.length === 0) {
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
          Quản lý Môn học
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchCourses}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' }, boxShadow: 1 }}
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
            Thêm môn học
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <MenuBook sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng môn học
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Assignment sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                  {stats.required}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Môn bắt buộc
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', boxShadow: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Category sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
                  {stats.elective}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Môn tự chọn
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
                  Chuyên ngành
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
                placeholder="Tìm theo mã môn học, tên môn học..."
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
              <FormControl fullWidth size="small">
                <InputLabel>Chương trình</InputLabel>
                <Select
                  value={filterProgram || ''}
                  label="Chương trình"
                  onChange={(e) => setFilterProgram(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {programs.map((prog) => (
                    <MenuItem
                      key={prog.academicProgramId}
                      value={prog.academicProgramId}
                    >
                      {prog.programName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Chuyên ngành</InputLabel>
                <Select
                  value={filterDepartment || ''}
                  label="Chuyên ngành"
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {uniqueDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại môn học</InputLabel>
                <Select
                  value={filterCourseType || ''}
                  label="Loại môn học"
                  onChange={(e) => setFilterCourseType(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="required">Bắt buộc</MenuItem>
                  <MenuItem value="elective">Tự chọn</MenuItem>
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
              Tìm thấy: <strong>{filteredCourses.length}</strong> môn học
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
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Mã môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tên môn học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Chương trình</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Chuyên ngành</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tín chỉ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Học kỳ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow
                  key={course.curriculumCourseId}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background-color 0.2s' }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {course.courseCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.courseName}
                    </Typography>
                    {course.prerequisites && course.prerequisites.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Tiên quyết: {course.prerequisites.map((p) => p.courseCode).join(', ')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.programName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.degreeLevel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.departmentName}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.totalCredits}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      LT: {course.creditsTheory} | TH: {course.creditsLab}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      HK {course.semesterSuggested}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.courseType}
                      size="small"
                      color={course.isRequired ? 'success' : 'warning'}
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

        {filteredCourses.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <MenuBook sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy môn học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có môn học nào trong hệ thống'}
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

export default CourseManagement;
