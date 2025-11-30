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

  // State cho mock statistics
  const [studentsByYear, setStudentsByYear] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [gpaByDepartment, setGpaByDepartment] = useState(null);
  const [tuitionStats, setTuitionStats] = useState(null);

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
        departments,
        gpaData,
        tuition,
      ] = await Promise.all([
        statisticsService.getOverview(),
        statisticsService.getStudentStatus(),
        statisticsService.getYearlyGrowth(7),
        statisticsService.getGraduationYearly(),
        userService.getUserInfo(),
        statisticsService.getStudentsByYear(),
        statisticsService.getDepartmentDistribution(),
        statisticsService.getGPAByDepartment(),
        statisticsService.getTuitionStatistics(),
      ]);

      console.log('📊 Overview data:', overview);
      console.log('👥 Student status data:', studentStatus);
      console.log('📈 Yearly growth data:', yearlyGrowth);
      console.log('🎓 Graduation data:', graduation);
      console.log('👤 User data:', userData);

      setOverviewData(overview);
      setStudentStatusData(studentStatus);
      setYearlyGrowthData(yearlyGrowth);
      setGraduationData(graduation);
      setCurrentUser(userData);
      setStudentsByYear(byYear);
      setDepartmentData(departments);
      setGpaByDepartment(gpaData);
      setTuitionStats(tuition);
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

  // Component cho Activity Icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return <BookIcon />;
      case 'grade':
        return <GradeIcon />;
      case 'announcement':
        return <AnnouncementIcon />;
      case 'document':
        return <DocumentIcon />;
      default:
        return <TrendingUpIcon />;
    }
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
      <Box sx={{ p: { xs: 2, sm: 2, md: 3 }, bgcolor: colors.background, minHeight: '100vh' }}>
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
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Xin chào, {currentUser?.fullName || 'Admin'}!
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.95 }}>
                        {currentUser?.email || 'Quản trị viên hệ thống'} • {currentUser?.roleName || 'Administrator'}
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
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
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
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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

        {/* Charts Row 3: Department Distribution & Tuition Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Department Distribution */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, height: '400px', bgcolor: colors.paper }}>
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
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.text, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="studentCount" name="Số sinh viên" radius={[0, 8, 8, 0]}>
                    {departmentData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Tuition Statistics */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, height: '400px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Thống kê học phí 6 tháng gần nhất
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(colors.success, 0.1),
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Đã đóng
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: colors.success }}
                      >
                        {tuitionStats?.paidPercentage}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(colors.warning, 0.1),
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Chưa đóng
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: colors.warning }}
                      >
                        {tuitionStats?.pendingPercentage}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <ResponsiveContainer width="100%" height="70%">
                <BarChart data={tuitionStats?.monthlyStats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(colors.text, 0.1)}
                  />
                  <XAxis dataKey="month" stroke={colors.textSecondary} />
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
                    dataKey="paid"
                    fill={colors.success}
                    name="Đã đóng"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="pending"
                    fill={colors.warning}
                    name="Chưa đóng"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="overdue"
                    fill={colors.error}
                    name="Quá hạn"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 4: Students by Year & GPA by Department */}
        <Grid container spacing={3}>
          {/* Students by Academic Year */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, height: '400px', bgcolor: colors.paper }}>
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
                    label={({ year, percentage }) =>
                      `${year}: ${percentage}%`
                    }
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="count"
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

          {/* GPA by Department */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, height: '400px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Điểm trung bình theo chuyên ngành
              </Typography>
              <Box sx={{ overflowY: 'auto', maxHeight: '340px' }}>
                {gpaByDepartment?.map((dept, index) => (
                  <Box
                    key={dept.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: alpha(colors.primary, 0.05),
                      borderRadius: 2,
                      borderLeft: `4px solid ${colors.primary}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {dept.departmentName}
                      </Typography>
                      <Chip
                        label={`GPA: ${dept.averageGPA.toFixed(2)}`}
                        color={
                          dept.averageGPA >= 3.2
                            ? 'success'
                            : dept.averageGPA >= 3.0
                            ? 'primary'
                            : 'warning'
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{ color: colors.success, fontWeight: 700 }}
                          >
                            {dept.excellentCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Xuất sắc
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{ color: colors.primary, fontWeight: 700 }}
                          >
                            {dept.goodCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Giỏi
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{ color: colors.warning, fontWeight: 700 }}
                          >
                            {dept.averageCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Khá
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{ color: colors.error, fontWeight: 700 }}
                          >
                            {dept.weakCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Yếu
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTransition>
  );
};

export default AdminDashboard;
