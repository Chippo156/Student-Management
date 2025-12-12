import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Fade,
  Grow,
  CircularProgress,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import PageTransition from '../../component/PageTransition';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  MenuBook as BookIcon,
  Grade as GradeIcon,
  Campaign as AnnouncementIcon,
  Description as DocumentIcon,
  EmojiEvents as TrophyIcon,
  BusinessCenter as DepartmentIcon,
  PersonAdd as PersonAddIcon,
  LibraryBooks as LibraryIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import statisticsService from '../../service/statisticsService';
import announcementService from '../../service/announcementService';
import { userService } from '../../service/userService';

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State cho các thống kê
  const [overviewData, setOverviewData] = useState(null);
  const [studentStatusData, setStudentStatusData] = useState(null);
  const [yearlyGrowthData, setYearlyGrowthData] = useState(null);
  const [graduationData, setGraduationData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ State cho 2 API mới
  const [studentsByYearData, setStudentsByYearData] = useState(null);
  const [studentsByDepartmentData, setStudentsByDepartmentData] =
    useState(null);

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

  // Fetch tất cả dữ liệu
  const fetchAllData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');

      const [
        overview,
        studentStatus,
        yearlyGrowth,
        graduation,
        userData,
        byYear,
        byDepartment,
      ] = await Promise.all([
        statisticsService.getOverview(),
        statisticsService.getStudentStatus(),
        statisticsService.getYearlyGrowth(7),
        statisticsService.getGraduationYearly(),
        userService.getUserInfo(),
        statisticsService.getStudentsByYear(), // ✅ API mới 1
        statisticsService.getStudentsByDepartment(), // ✅ API mới 2
      ]);

      console.log('📊 Overview data:', overview);
      console.log('👥 Student status data:', studentStatus);
      console.log('📈 Yearly growth data:', yearlyGrowth);
      console.log('🎓 Graduation data:', graduation);
      console.log('👤 User data:', userData);
      console.log('📅 Students by year data:', byYear);
      console.log('🏢 Students by department data:', byDepartment);

      setOverviewData(overview);
      setStudentStatusData(studentStatus);
      setYearlyGrowthData(yearlyGrowth);
      setGraduationData(graduation);
      setCurrentUser(userData);
      setStudentsByYearData(byYear);
      setStudentsByDepartmentData(byDepartment);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // Transform data cho Stats Cards
  const statsData = useMemo(() => {
    if (!overviewData) return [];

    return [
      {
        label: 'Tổng sinh viên',
        value: overviewData.totalStudents || 0,
        icon: PeopleIcon,
        color: 'primary',
        trend: '+12%',
        description: 'So với năm trước',
      },
      {
        label: 'Giảng viên',
        value: overviewData.totalLecturers || 0,
        icon: SchoolIcon,
        color: 'success',
        trend: '+5%',
        description: 'Đang hoạt động',
      },
      {
        label: 'Môn học',
        value: overviewData.totalCourses || 0,
        icon: MenuBookIcon,
        color: 'info',
        trend: '+8%',
        description: 'Đang giảng dạy',
      },
      {
        label: 'Tỷ lệ đạt',
        value: `${overviewData.passingRate || 0}%`,
        icon: AssessmentIcon,
        color: 'warning',
        trend: '+3%',
        description: 'Học kỳ hiện tại',
      },
    ];
  }, [overviewData]);

  // Transform data cho Yearly Growth Chart
  const enrollmentData = useMemo(() => {
    if (!yearlyGrowthData?.data) return [];

    return yearlyGrowthData.data.map((item) => ({
      year: item.year.toString(),
      students: item.studentCount,
      teachers: item.lecturerCount,
    }));
  }, [yearlyGrowthData]);

  // Transform data cho Student Status Pie Chart
  const studentStatusPieData = useMemo(() => {
    if (!studentStatusData) return [];

    return [
      {
        name: 'Đang học',
        value: studentStatusData.activeStudents,
        color: '#4caf50',
      },
      {
        name: 'Tạm nghỉ',
        value: studentStatusData.inactiveStudents,
        color: '#ff9800',
      },
      {
        name: 'Đã tốt nghiệp',
        value: studentStatusData.graduatedStudents,
        color: '#2196f3',
      },
      {
        name: 'Bảo lưu',
        value: studentStatusData.reservedStudents,
        color: '#9c27b0',
      },
      {
        name: 'Đình chỉ',
        value: studentStatusData.suspendedStudents,
        color: '#f44336',
      },
    ];
  }, [studentStatusData]);

  // Transform data cho Graduation Chart
  const graduationChartData = useMemo(() => {
    if (!graduationData?.yearlyStats) return [];

    return graduationData.yearlyStats.map((item) => ({
      year: item.year.toString(),
      onTime: item.onTimeGraduates,
      late: item.lateGraduates,
      total: item.onTimeGraduates + item.lateGraduates,
    }));
  }, [graduationData]);

  // ✅ Transform data cho Students by Year Pie Chart (API mới)
  const studentsByYear = useMemo(() => {
    if (!studentsByYearData?.yearDistribution) return [];

    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];

    return studentsByYearData.yearDistribution.map((item, index) => ({
      name: item.yearName,
      value: item.studentCount,
      percentage: item.percentage.toFixed(1),
      color: colors[index % colors.length],
    }));
  }, [studentsByYearData]);

  // ✅ Transform data cho Department Distribution Bar Chart (API mới)
  const departmentData = useMemo(() => {
    if (!studentsByDepartmentData) return [];

    const colors = [
      '#1976d2',
      '#2e7d32',
      '#ed6c02',
      '#9c27b0',
      '#d32f2f',
      '#00acc1',
    ];

    return studentsByDepartmentData.map((item, index) => ({
      departmentName: item.departmentName,
      studentCount: item.studentCount,
      color: colors[index % colors.length],
    }));
  }, [studentsByDepartmentData]);

  // Component cho Stats Card
  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon;

    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, ${alpha(colors[stat.color], 0.15)} 0%, ${alpha(colors[stat.color], 0.05)} 100%)`,
          border: `1px solid ${alpha(colors[stat.color], 0.2)}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 28px ${alpha(colors[stat.color], 0.3)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, ${alpha(colors[stat.color], 0.2)} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 'bold', mb: 1, color: colors[stat.color] }}
              >
                {stat.value}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={stat.trend}
                  size="small"
                  sx={{
                    bgcolor: alpha(colors.success, 0.1),
                    color: colors.success,
                    fontWeight: 600,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
              </Stack>
            </Box>
            <Avatar
              sx={{
                bgcolor: colors[stat.color],
                width: 64,
                height: 64,
                boxShadow: `0 4px 12px ${alpha(colors[stat.color], 0.4)}`,
              }}
            >
              <IconComponent sx={{ fontSize: 36 }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <PageTransition>
      <Box
        sx={{
          p: { xs: 2, sm: 2, md: 3 },
          bgcolor: colors.background,
          minHeight: '100vh',
        }}
      >
        {/* Hero Banner */}
        <Fade in={true} timeout={400}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.8)} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: alpha('#fff', 0.25),
                        color: 'white',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {currentUser?.fullName?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        Xin chào, {currentUser?.fullName || 'Admin'}!
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.95 }}>
                        {currentUser?.email || 'Quản trị viên hệ thống'} •{' '}
                        {currentUser?.roleName || 'Administrator'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <IconButton
                      onClick={handleRefresh}
                      disabled={refreshing}
                      size="large"
                      sx={{
                        bgcolor: alpha('#fff', 0.2),
                        color: 'white',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) },
                        mb: 1,
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontWeight: 500 }}
                    >
                      {new Date().toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 600 }}>
                      {new Date().toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Fade>

        {/* Stats Cards */}
        <Grid
          container
          className="equal-height-cards"
          spacing={3}
          sx={{ mb: 4 }}
        >
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in={true} timeout={600 + index * 200}>
                <Box>
                  <StatCard stat={stat} />
                </Box>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row 1: Enrollment & Student Status */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Yearly Growth Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3, height: '450px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Thống kê tăng trưởng theo năm
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(colors.text, 0.1)}
                  />
                  <XAxis dataKey="year" stroke={colors.textSecondary} />
                  <YAxis stroke={colors.textSecondary} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.text, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill={colors.primary}
                    name="Sinh viên"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="teachers"
                    fill={colors.success}
                    name="Giảng viên"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Student Status Distribution */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '450px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Phân bố trạng thái sinh viên
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={studentStatusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentStatusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.text, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2: Graduation Trends */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, height: '400px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Thống kê tốt nghiệp hàng năm
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={graduationChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(colors.text, 0.1)}
                  />
                  <XAxis dataKey="year" stroke={colors.textSecondary} />
                  <YAxis stroke={colors.textSecondary} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.text, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="onTime"
                    stroke={colors.success}
                    strokeWidth={2}
                    name="Tốt nghiệp đúng hạn"
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="late"
                    stroke={colors.warning}
                    strokeWidth={2}
                    name="Tốt nghiệp trễ"
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={colors.primary}
                    strokeWidth={2}
                    name="Tổng"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* ✅ Charts Row 3: Students by Year & Department Distribution */}
        <Grid container spacing={3}>
          {/* Students by Academic Year */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, height: '450px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Phân bố sinh viên theo năm học
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={studentsByYear}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentsByYear?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.text, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Department Distribution */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, height: '450px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Phân bố sinh viên theo chuyên ngành
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(colors.text, 0.1)}
                  />
                  <XAxis type="number" stroke={colors.textSecondary} />
                  <YAxis
                    type="category"
                    dataKey="departmentName"
                    stroke={colors.textSecondary}
                    width={200}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.text, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar
                    dataKey="studentCount"
                    name="Số sinh viên"
                    radius={[0, 8, 8, 0]}
                  >
                    {departmentData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTransition>
  );
};

export default AdminDashboard;
