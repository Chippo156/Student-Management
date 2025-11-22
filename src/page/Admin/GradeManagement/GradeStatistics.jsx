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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Assessment as AssessmentIcon,
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

const GradeStatistics = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Single student statistics
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

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
    fetchAllStudentsStats();
  }, [selectedDepartment, selectedSemester]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const result = await studentServices.getAllStudents(1, 1000);
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

  const getTrendIcon = (trend) => {
    if (!trend) return null;

    if (trend.trendDirection === 'Improving') {
      return <TrendingUpIcon color="success" />;
    } else if (trend.trendDirection === 'Declining') {
      return <TrendingDownIcon color="error" />;
    } else {
      return <TrendingFlatIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
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
          <Paper sx={{ p: 3, mb: 3 }}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) =>
            `${option.mssv} - ${option.user?.fullName || ''}`
          }
          value={selectedStudent}
          onChange={handleStudentChange}
          loading={loadingStudents}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn sinh viên"
              placeholder="Tìm theo MSSV hoặc tên..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {loadingStudents ? <CircularProgress size={20} /> : null}
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
          {/* Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        GPA Tích lũy (10)
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {statsData.overallGPA?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tổng tín chỉ
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {statsData.totalCreditsEarned || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Xếp loại
                  </Typography>
                  <Chip
                    label={statsData.academicRank || 'Chưa xếp loại'}
                    color={
                      statsData.academicRank === 'Giỏi'
                        ? 'success'
                        : statsData.academicRank === 'Khá'
                        ? 'info'
                        : 'default'
                    }
                    sx={{ fontSize: '1rem', height: 32, mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Xu hướng
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {statsData.performanceTrend?.trendDirection || 'Stable'}
                      </Typography>
                    </Box>
                    {getTrendIcon(statsData.performanceTrend)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Grade Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Phân bố điểm chữ
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {statsData.gradeDistribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statsData.gradeDistribution}
                        dataKey="count"
                        nameKey="gradeLetter"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.gradeLetter}: ${entry.count}`}
                      >
                        {statsData.gradeDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={GRADE_COLORS[entry.gradeLetter] || '#999'}
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
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Xu hướng GPA theo học kỳ
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {statsData.performanceTrend?.semesterTrends && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={statsData.performanceTrend.semesterTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semesterName" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="gpa"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        name="GPA"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Semester Details */}
          {statsData.semesterStatistics?.map((semester) => (
            <Paper key={semester.semesterId} sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {semester.semesterName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`GPA: ${semester.gpa?.toFixed(2) || '0.00'}`} color="primary" />
                  <Chip label={semester.rank || 'Chưa xếp loại'} color="secondary" />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tín chỉ đăng ký
                    </Typography>
                    <Typography variant="h6">
                      {semester.creditsRegistered || 0} TC
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tín chỉ đạt
                    </Typography>
                    <Typography variant="h6">
                      {semester.creditsEarned || 0} TC
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ hoàn thành
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={
                          semester.creditsRegistered > 0
                            ? (semester.creditsEarned / semester.creditsRegistered) * 100
                            : 0
                        }
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {semester.creditsRegistered > 0
                          ? ((semester.creditsEarned / semester.creditsRegistered) * 100).toFixed(
                              0
                            )
                          : 0}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
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
              <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
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
          {/* Overall Statistics Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={selectedDepartment}
                    label="Khoa"
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <MenuItem value="">Tất cả các khoa</MenuItem>
                    <MenuItem value="1">Công nghệ thông tin</MenuItem>
                    <MenuItem value="2">Kinh tế</MenuItem>
                    <MenuItem value="3">Kỹ thuật</MenuItem>
                    <MenuItem value="4">Khoa học cơ bản</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Học kỳ</InputLabel>
                  <Select
                    value={selectedSemester}
                    label="Học kỳ"
                    onChange={(e) => setSelectedSemester(e.target.value)}
                  >
                    <MenuItem value="">Tất cả học kỳ</MenuItem>
                    <MenuItem value="1">HK1 2024-2025</MenuItem>
                    <MenuItem value="2">HK2 2024-2025</MenuItem>
                    <MenuItem value="3">HK1 2025-2026</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Overall Statistics Content */}
          {allStudentsStats && (
            <>
              {/* Overall Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Tổng số sinh viên
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {allStudentsStats.totalStudents || 0}
                          </Typography>
                        </Box>
                        <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        GPA trung bình
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {allStudentsStats.averageGPA?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Sinh viên đạt
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {allStudentsStats.passingStudents || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {allStudentsStats.passingRate?.toFixed(1) || '0'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Sinh viên không đạt
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {allStudentsStats.failingStudents || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {allStudentsStats.failingRate?.toFixed(1) || '0'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Grade Distribution Chart */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Phân bố điểm chữ (Tất cả sinh viên)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {allStudentsStats.gradeDistribution && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={allStudentsStats.gradeDistribution}
                            dataKey="count"
                            nameKey="gradeLetter"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.gradeLetter}: ${entry.count}`}
                          >
                            {allStudentsStats.gradeDistribution.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={GRADE_COLORS[entry.gradeLetter] || '#999'}
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
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Phân loại học lực
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {allStudentsStats.academicRanking && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={allStudentsStats.academicRanking}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rank" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill={theme.palette.primary.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Department Statistics Table */}
              {allStudentsStats.departmentStats && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Thống kê theo khoa
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Khoa</TableCell>
                          <TableCell align="center">Số SV</TableCell>
                          <TableCell align="center">GPA TB</TableCell>
                          <TableCell align="center">Đạt (%)</TableCell>
                          <TableCell align="center">Xuất sắc</TableCell>
                          <TableCell align="center">Giỏi</TableCell>
                          <TableCell align="center">Khá</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allStudentsStats.departmentStats.map((dept) => (
                          <TableRow key={dept.departmentId}>
                            <TableCell>{dept.departmentName}</TableCell>
                            <TableCell align="center">{dept.totalStudents}</TableCell>
                            <TableCell align="center">{dept.averageGPA?.toFixed(2)}</TableCell>
                            <TableCell align="center">{dept.passingRate?.toFixed(1)}%</TableCell>
                            <TableCell align="center">{dept.excellentCount || 0}</TableCell>
                            <TableCell align="center">{dept.goodCount || 0}</TableCell>
                            <TableCell align="center">{dept.fairCount || 0}</TableCell>
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
              <AssessmentIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
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

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default GradeStatistics;
