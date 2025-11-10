import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Avatar,
  TablePagination,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import sectionService from '../../../service/sectionService';
import { semesterService } from '../../../service/semesterService';

const Sections = () => {
  const theme = useTheme();
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      background: theme.palette.background.default,
      paper: theme.palette.background.paper,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
    }),
    [theme]
  );

  const statusOptions = [
    { value: 0, label: 'Chưa mở', color: 'default' },
    { value: 1, label: 'Đang chuẩn bị', color: 'warning' },
    { value: 2, label: 'Đang mở đăng ký', color: 'info' },
    { value: 3, label: 'Đang diễn ra', color: 'success' },
    { value: 4, label: 'Đã kết thúc', color: 'error' },
  ];

  // Fetch semesters for filter
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

  // Fetch sections
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

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: colors.text, mb: 1 }}
        >
          Quản lý lớp học phần
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin lớp học phần và đăng ký
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tổng lớp học phần
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                  }}
                >
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.success, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tổng sĩ số
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.capacity}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                  }}
                >
                  <GroupIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.info, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Đã đăng ký
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.enrolled}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.info, 0.1),
                    color: colors.info,
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.warning, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tỷ lệ đăng ký TB
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.avgEnrollment}%
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.warning, 0.1),
                    color: colors.warning,
                  }}
                >
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Học kỳ</InputLabel>
                <Select
                  value={filterSemester}
                  label="Học kỳ"
                  onChange={(e) => setFilterSemester(e.target.value)}
                  sx={{ borderRadius: 2 }}
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
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
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
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  height: 56,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Thêm lớp học phần
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sections Table */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{ backgroundColor: alpha(colors.primary, 0.05) }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>Mã LHP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Môn học</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Giảng viên</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Lớp dự kiến</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Học kỳ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sĩ số</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Lịch học</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow
                      key={section.sectionId}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(colors.primary, 0.02),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.primary }}
                        >
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
                          sx={{
                            backgroundColor: alpha(colors.info, 0.1),
                            color: colors.info,
                            fontWeight: 600,
                          }}
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
                              backgroundColor: alpha(colors.primary, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                backgroundColor:
                                  section.enrollmentPercentage >= 80
                                    ? colors.success
                                    : section.enrollmentPercentage >= 50
                                      ? colors.warning
                                      : colors.error,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {section.enrollmentPercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {section.scheduleSummary}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Phòng: {section.roomSummary}
                        </Typography>
                        {section.hasPracticeGroups && (
                          <Chip
                            label={`${section.practiceGroupCount} nhóm TH`}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: 10,
                              backgroundColor: alpha(colors.warning, 0.1),
                              color: colors.warning,
                            }}
                          />
                        )}
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
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </>
        )}
      </Card>
    </Box>
  );
};

export default Sections;