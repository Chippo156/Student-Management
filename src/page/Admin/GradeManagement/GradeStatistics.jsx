import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  Autocomplete,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Assessment as AssessmentIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import statisticsService from '../../../service/statisticsService';
import { studentServices } from '../../../service/studentServices';
import { useDebounce } from '../../../hooks/useDebounce';

const GradeStatistics = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Single student statistics
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchInput = useDebounce(searchInput, 500);

  // Overall statistics
  const [allStudentsStats, setAllStudentsStats] = useState(null);
  const [loadingAllStats, setLoadingAllStats] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchStudents();
    fetchAllStudentsStats();
  }, []);

  useEffect(() => {
    if (debouncedSearchInput !== undefined) {
      fetchStudents(debouncedSearchInput);
    }
  }, [debouncedSearchInput]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchAllStudentsStats();
    }
  }, [selectedDepartment, selectedSemester]);

  const fetchStudents = async (search = '') => {
    setLoadingStudents(true);
    try {
      const result = await studentServices.getAllStudents(1, 50, search, {});
      if (result?.items) {
        setStudents(result.items);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentChange = async (event, value) => {
    setSelectedStudent(value);
    if (value?.mssv) {
      await handleSearch(value.mssv);
    } else {
      setStatsData(null);
    }
  };

  const handleSearch = async (mssv) => {
    if (!mssv) return;

    setLoading(true);
    try {
      const result = await statisticsService.getStudentGrades(mssv);
      if (result) {
        setStatsData(result);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudentsStats = async () => {
    setLoadingAllStats(true);
    try {
      const params = {};
      if (selectedDepartment) params.departmentId = selectedDepartment;
      if (selectedSemester) params.semesterId = selectedSemester;

      const result = await statisticsService.getAllStudentsGrades(params);
      if (result) {
        setAllStudentsStats(result);
      }
    } catch (error) {
      console.error('Error fetching all students stats:', error);
    } finally {
      setLoadingAllStats(false);
    }
  };

  const GRADE_COLORS = {
    A: theme.palette.success.main,
    'B+': theme.palette.info.main,
    B: theme.palette.info.light,
    'C+': theme.palette.warning.main,
    C: theme.palette.warning.light,
    'D+': theme.palette.error.light,
    D: theme.palette.error.main,
    F: theme.palette.error.dark,
  };

  const getTrendIcon = (trendDirection) => {
    if (!trendDirection) return <TrendingFlatIcon color="action" />;

    if (trendDirection === 'Improving') {
      return <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />;
    } else if (trendDirection === 'Declining') {
      return <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />;
    } else {
      return <TrendingFlatIcon color="action" sx={{ fontSize: 40 }} />;
    }
  };

  const getTrendColor = (trendDirection) => {
    if (trendDirection === 'Improving') return 'success.main';
    if (trendDirection === 'Declining') return 'error.main';
    return 'text.secondary';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Thống kê điểm sinh viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Xem phân tích chi tiết và xu hướng học tập của sinh viên
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Theo sinh viên" icon={<SchoolIcon />} />
          <Tab label="Tổng quan tất cả sinh viên" icon={<AssessmentIcon />} />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        <>
          {/* Search Section */}
          <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) =>
                `${option.mssv} - ${option.user?.fullName || ''}`
              }
              value={selectedStudent}
              onChange={handleStudentChange}
              loading={loadingStudents}
              onInputChange={(event, value) => {
                setSearchInput(value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn sinh viên"
                  placeholder="Tìm theo MSSV hoặc tên..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon
                          sx={{ ml: 1, mr: -0.5, color: 'action.active' }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingStudents ? (
                          <CircularProgress size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">{option.mssv}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.user?.fullName || ''}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Paper>

          {/* Statistics Content */}
          {statsData && (
            <>
              {/* Empty State Warning */}
              {statsData.overallStats?.totalSubjects === 0 && (
                <Card sx={{ mb: 3, bgcolor: 'warning.lighter', borderLeft: 4, borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} color="warning.dark">
                          Chưa có dữ liệu điểm
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sinh viên này chưa có điểm môn học nào trong hệ thống.
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Student Info Card */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Mã số sinh viên
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {statsData.mssv}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {statsData.studentName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Lớp
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {statsData.className}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Chương trình đào tạo
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {statsData.programName}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <TrophyIcon
                          sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          GPA (Hệ 10)
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color="primary"
                        >
                          {statsData.overallStats?.currentGPA10?.toFixed(2) ||
                            '0.00'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <TrophyIcon
                          sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          GPA (Hệ 4)
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color="secondary"
                        >
                          {statsData.overallStats?.currentGPA4?.toFixed(2) ||
                            '0.00'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <MenuBookIcon
                          sx={{ fontSize: 40, color: 'info.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Tổng môn học
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {statsData.overallStats?.totalSubjects || 0}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          Đạt: {statsData.overallStats?.passedSubjects || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <SchoolIcon
                          sx={{ fontSize: 40, color: 'success.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Tín chỉ tích lũy
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {statsData.overallStats?.totalCreditsEarned || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /{' '}
                          {statsData.overallStats?.totalCreditsRegistered || 0}{' '}
                          TC
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        {getTrendIcon(
                          statsData.performanceTrend?.trendDirection
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Xu hướng
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          color={getTrendColor(
                            statsData.performanceTrend?.trendDirection
                          )}
                        >
                          {statsData.performanceTrend?.trendDirection ===
                          'Improving'
                            ? 'Tiến bộ'
                            : statsData.performanceTrend?.trendDirection ===
                                'Declining'
                              ? 'Giảm sút'
                              : 'Ổn định'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {statsData.performanceTrend
                            ?.gpaChangeFromFirstSemester >= 0
                            ? '+'
                            : ''}
                          {statsData.performanceTrend?.gpaChangeFromFirstSemester?.toFixed(
                            2
                          ) || 0}{' '}
                          điểm
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Additional Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Điểm trung bình
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {statsData.overallStats?.averageScore?.toFixed(2) ||
                          '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Điểm cao nhất
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="success.main"
                      >
                        {statsData.overallStats?.highestScore?.toFixed(2) ||
                          '0.00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {statsData.overallStats?.highestScoreSubject}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Điểm thấp nhất
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="error.main"
                      >
                        {statsData.overallStats?.lowestScore?.toFixed(2) ||
                          '0.00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {statsData.overallStats?.lowestScoreSubject}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Tỷ lệ đạt
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="success.main"
                      >
                        {statsData.overallStats?.passingRate?.toFixed(1) || '0'}
                        %
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={statsData.overallStats?.passingRate || 0}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Grade Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Phân bố điểm chữ
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {statsData.gradeDistribution && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statsData.gradeDistribution.filter(
                              (item) => item.count > 0
                            )}
                            dataKey="count"
                            nameKey="gradeLetter"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) =>
                              `${entry.gradeLetter}: ${entry.count} (${entry.percentage}%)`
                            }
                          >
                            {statsData.gradeDistribution
                              .filter((item) => item.count > 0)
                              .map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    GRADE_COLORS[entry.gradeLetter] || '#999'
                                  }
                                />
                              ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>

                {/* GPA Trend */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Xu hướng GPA theo học kỳ
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {statsData.performanceTrend?.trendDescription}
                    </Typography>
                    {statsData.performanceTrend?.trendPoints && (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={statsData.performanceTrend.trendPoints}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="semesterName" />
                          <YAxis domain={[0, 4]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="gpa"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            name="GPA (Hệ 4)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Semester Statistics Table */}
              {statsData.semesterStats &&
                statsData.semesterStats.length > 0 && (
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Thống kê theo học kỳ
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Học kỳ</TableCell>
                            <TableCell align="center">Số môn</TableCell>
                            <TableCell align="center">
                              Đạt / Không đạt
                            </TableCell>
                            <TableCell align="center">GPA (Hệ 4)</TableCell>
                            <TableCell align="center">GPA (Hệ 10)</TableCell>
                            <TableCell align="center">Điểm TB</TableCell>
                            <TableCell align="center">TC Đăng ký</TableCell>
                            <TableCell align="center">TC Đạt</TableCell>
                            <TableCell align="center">Xếp loại</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statsData.semesterStats.map((semester) => (
                            <TableRow key={semester.semesterId}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {semester.semesterName}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {semester.subjectsCount}
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Chip
                                    label={semester.passedCount}
                                    size="small"
                                    color="success"
                                  />
                                  <Chip
                                    label={semester.failedCount}
                                    size="small"
                                    color="error"
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight={600} color="primary">
                                  {semester.semesterGPA4?.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight={600} color="secondary">
                                  {semester.semesterGPA10?.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {semester.averageScore?.toFixed(2)}
                              </TableCell>
                              <TableCell align="center">
                                {semester.creditsRegistered}
                              </TableCell>
                              <TableCell align="center">
                                {semester.creditsEarned}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={semester.academicRank}
                                  color={
                                    semester.academicRank === 'Xuất sắc'
                                      ? 'error'
                                      : semester.academicRank === 'Giỏi'
                                        ? 'success'
                                        : semester.academicRank === 'Khá'
                                          ? 'info'
                                          : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}

              {/* Subject Type Statistics */}
              {statsData.subjectTypeStats &&
                statsData.subjectTypeStats.length > 0 && (
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Thống kê theo loại môn học
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Loại môn học</TableCell>
                            <TableCell align="center">Số môn</TableCell>
                            <TableCell align="center">Điểm TB</TableCell>
                            <TableCell align="center">Tỷ lệ đạt (%)</TableCell>
                            <TableCell align="center">Tổng tín chỉ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statsData.subjectTypeStats.map((type, index) => (
                            <TableRow key={index}>
                              <TableCell>{type.subjectType}</TableCell>
                              <TableCell align="center">
                                {type.subjectsCount}
                              </TableCell>
                              <TableCell align="center">
                                {type.averageScore?.toFixed(2)}
                              </TableCell>
                              <TableCell align="center">
                                {type.passingRate?.toFixed(1)}%
                              </TableCell>
                              <TableCell align="center">
                                {type.totalCredits}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
            </>
          )}

          {/* Empty State */}
          {!statsData && !loading && (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <SchoolIcon
                sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chọn sinh viên để xem thống kê điểm
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Sử dụng dropdown phía trên để tìm kiếm sinh viên
              </Typography>
            </Paper>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      ) : (
        <>
          {/* Filters */}
          <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Lọc theo khoa"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="">Tất cả các khoa</MenuItem>
                  {allStudentsStats?.departmentStats?.map((dept) => (
                    <MenuItem key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Lọc theo học kỳ"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <MenuItem value="">Tất cả học kỳ</MenuItem>
                  {allStudentsStats?.semesterStats?.map((semester) => (
                    <MenuItem
                      key={semester.semesterId}
                      value={semester.semesterId}
                    >
                      {semester.semesterName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Overall Statistics Content */}
          {allStudentsStats && (
            <>
              {/* Overall Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <AssessmentIcon
                          sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Tổng số sinh viên
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {allStudentsStats.overallStats?.totalStudents || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Có điểm:{' '}
                          {allStudentsStats.overallStats?.studentsWithGrades ||
                            0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <TrophyIcon
                          sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          GPA trung bình
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color="primary"
                        >
                          {allStudentsStats.overallStats?.systemWideGPA?.toFixed(
                            2
                          ) || '0.00'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Điểm TB:{' '}
                          {allStudentsStats.overallStats?.averageScore?.toFixed(
                            2
                          )}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <MenuBookIcon
                          sx={{ fontSize: 40, color: 'info.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Tổng môn học
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {allStudentsStats.overallStats?.totalSubjects || 0}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          Đạt:{' '}
                          {allStudentsStats.overallStats?.totalPassedSubjects ||
                            0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 40, color: 'success.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Tỷ lệ đạt
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color="success.main"
                        >
                          {allStudentsStats.overallStats?.overallPassingRate?.toFixed(
                            1
                          ) || '0'}
                          %
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={
                            allStudentsStats.overallStats?.overallPassingRate ||
                            0
                          }
                          sx={{
                            mt: 1,
                            width: '100%',
                            height: 8,
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <CancelIcon
                          sx={{ fontSize: 40, color: 'error.main', mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Môn không đạt
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color="error.main"
                        >
                          {allStudentsStats.overallStats?.totalFailedSubjects ||
                            0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tổng số môn thi
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Grade Distribution Chart */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Phân bố điểm chữ (Tất cả sinh viên)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {allStudentsStats.gradeDistribution && (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={allStudentsStats.gradeDistribution.filter(
                              (item) => item.count > 0
                            )}
                            dataKey="count"
                            nameKey="gradeLetter"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) =>
                              `${entry.gradeLetter}: ${entry.count} (${entry.percentage}%)`
                            }
                          >
                            {allStudentsStats.gradeDistribution
                              .filter((item) => item.count > 0)
                              .map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    GRADE_COLORS[entry.gradeLetter] || '#999'
                                  }
                                />
                              ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Phân bố điểm chữ (Bảng thống kê)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Loại điểm</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell align="center">Số lượng</TableCell>
                            <TableCell align="center">Tỷ lệ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allStudentsStats.gradeDistribution
                            ?.filter((item) => item.count > 0)
                            .map((grade, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Chip
                                    label={grade.gradeLetter}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(
                                        GRADE_COLORS[grade.gradeLetter] ||
                                          '#999',
                                        0.2
                                      ),
                                      color:
                                        GRADE_COLORS[grade.gradeLetter] ||
                                        '#999',
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{grade.description}</TableCell>
                                <TableCell align="center">
                                  {grade.count}
                                </TableCell>
                                <TableCell align="center">
                                  {grade.percentage}%
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Department Statistics */}
              {allStudentsStats.departmentStats &&
                allStudentsStats.departmentStats.length > 0 && (
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Thống kê theo khoa
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Khoa</TableCell>
                            <TableCell align="center">Số sinh viên</TableCell>
                            <TableCell align="center">GPA trung bình</TableCell>
                            <TableCell align="center">Tỷ lệ đạt</TableCell>
                            <TableCell align="center">Tổng môn học</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allStudentsStats.departmentStats.map((dept) => (
                            <TableRow key={dept.departmentId}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {dept.departmentName}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {dept.studentsCount}
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight={600} color="primary">
                                  {dept.averageGPA?.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${dept.passingRate?.toFixed(1)}%`}
                                  size="small"
                                  color="success"
                                />
                              </TableCell>
                              <TableCell align="center">
                                {dept.totalSubjects}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}

              {/* Program Statistics */}
              {allStudentsStats.programStats &&
                allStudentsStats.programStats.length > 0 && (
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Thống kê theo chương trình đào tạo
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Chương trình</TableCell>
                            <TableCell>Khoa</TableCell>
                            <TableCell align="center">Số sinh viên</TableCell>
                            <TableCell align="center">GPA trung bình</TableCell>
                            <TableCell align="center">Tỷ lệ đạt</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allStudentsStats.programStats.map((program) => (
                            <TableRow key={program.programId}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {program.programName}
                                </Typography>
                              </TableCell>
                              <TableCell>{program.departmentName}</TableCell>
                              <TableCell align="center">
                                {program.studentsCount}
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight={600} color="primary">
                                  {program.averageGPA?.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${program.passingRate?.toFixed(1)}%`}
                                  size="small"
                                  color="success"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}

              {/* Semester Statistics */}
              {allStudentsStats.semesterStats &&
                allStudentsStats.semesterStats.length > 0 && (
                  <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Thống kê theo học kỳ
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Học kỳ</TableCell>
                            <TableCell align="center">Số sinh viên</TableCell>
                            <TableCell align="center">GPA trung bình</TableCell>
                            <TableCell align="center">Tỷ lệ đạt</TableCell>
                            <TableCell align="center">Tổng môn học</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allStudentsStats.semesterStats.map((semester) => (
                            <TableRow key={semester.semesterId}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {semester.semesterName}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {semester.studentsCount}
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight={600} color="primary">
                                  {semester.averageGPA?.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${semester.passingRate?.toFixed(1)}%`}
                                  size="small"
                                  color="success"
                                />
                              </TableCell>
                              <TableCell align="center">
                                {semester.totalSubjects}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
            </>
          )}

          {/* Empty State for Overall Stats */}
          {!allStudentsStats && !loadingAllStats && (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <AssessmentIcon
                sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không có dữ liệu thống kê
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Vui lòng thử lại hoặc kiểm tra bộ lọc
              </Typography>
            </Paper>
          )}

          {/* Loading State for Overall Stats */}
          {loadingAllStats && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default GradeStatistics;
