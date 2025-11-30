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
} from '@mui/material';
import PageTransition from '../../../component/PageTransition';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
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
import statisticsService from '../../../service/statisticsService';

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  // State cho các thống kê
  const [overviewData, setOverviewData] = useState(null);
  const [studentStatusData, setStudentStatusData] = useState(null);
  const [yearlyGrowthData, setYearlyGrowthData] = useState(null);
  const [graduationData, setGraduationData] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [systemActivity, setSystemActivity] = useState(null);
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

  // Fetch tất cả dữ liệu khi component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Fetching dashboard data...');

        const [
          overview,
          studentStatus,
          yearlyGrowth,
          graduation,
          enrollment,
          departments,
          activity,
          tuition,
        ] = await Promise.all([
          statisticsService.getOverview(),
          statisticsService.getStudentStatus(),
          statisticsService.getYearlyGrowth(7),
          statisticsService.getGraduationYearly(),
          statisticsService.getRecentEnrollments(),
          statisticsService.getDepartmentDistribution(),
          statisticsService.getSystemActivity(),
          statisticsService.getTuitionStatistics(),
        ]);

        console.log('📊 Overview data:', overview);
        console.log('👥 Student status data:', studentStatus);
        console.log('📈 Yearly growth data:', yearlyGrowth);
        console.log('🎓 Graduation data:', graduation);

        setOverviewData(overview);
        setStudentStatusData(studentStatus);
        setYearlyGrowthData(yearlyGrowth);
        setGraduationData(graduation);
        setEnrollmentStats(enrollment);
        setDepartmentData(departments);
        setSystemActivity(activity);
        setTuitionStats(tuition);
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
      },
      {
        label: 'Giảng viên',
        value: overviewData.totalLecturers || 0,
        icon: SchoolIcon,
        color: 'success',
        trend: '+5%',
      },
      {
        label: 'Môn học',
        value: overviewData.totalCourses || 0,
        icon: MenuBookIcon,
        color: 'info',
        trend: '+8%',
      },
      {
        label: 'Tỷ lệ đạt',
        value: `${overviewData.passingRate || 0}%`,
        icon: AssessmentIcon,
        color: 'warning',
        trend: '+3%',
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
          background: alpha(colors[stat.color], 0.08),
          border: `1px solid ${alpha(colors[stat.color], 0.2)}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${alpha(colors[stat.color], 0.25)}`,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {stat.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stat.value}
              </Typography>
              <Chip
                label={stat.trend}
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Box>
            <Avatar sx={{ bgcolor: colors[stat.color], width: 56, height: 56 }}>
              <IconComponent sx={{ fontSize: 32 }} />
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
      <Box sx={{ p: { xs: 2, sm: 2, md: 3 }, bgcolor: colors.background, minHeight: '100vh' }}>
        {/* Header */}
        <Fade in={true} timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: colors.text, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Chào mừng trở lại! Đây là tổng quan hệ thống quản lý sinh viên.
            </Typography>
          </Box>
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
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '450px', bgcolor: colors.paper }}>
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
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '450px', bgcolor: colors.paper }}>
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
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '400px', bgcolor: colors.paper }}>
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
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '400px', bgcolor: colors.paper }}>
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
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '400px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Thống kê học phí 6 tháng gần nhất
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(colors.success, 0.1), borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Đã đóng
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.success }}>
                        {tuitionStats?.paidPercentage}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(colors.warning, 0.1), borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa đóng
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.warning }}>
                        {tuitionStats?.pendingPercentage}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <ResponsiveContainer width="100%" height="70%">
                <BarChart data={tuitionStats?.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.text, 0.1)} />
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
                  <Bar dataKey="paid" fill={colors.success} name="Đã đóng" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill={colors.warning} name="Chưa đóng" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="overdue" fill={colors.error} name="Quá hạn" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 4: Recent Activities & Enrollment Stats */}
        <Grid container spacing={3}>
          {/* Recent Enrollment Activities */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '450px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Hoạt động đăng ký gần đây
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
                        {enrollmentStats?.thisWeek}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tuần này
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.warning }}>
                        {enrollmentStats?.pending}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Chờ xử lý
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.success }}>
                        {enrollmentStats?.completed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hoàn thành
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: '300px' }}>
                {enrollmentStats?.recentActivities?.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: alpha(colors.text, 0.03),
                      borderRadius: 2,
                      borderLeft: `4px solid ${
                        activity.status === 'completed'
                          ? colors.success
                          : activity.status === 'pending'
                          ? colors.warning
                          : colors.error
                      }`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activity.studentName}
                      </Typography>
                      <Chip
                        label={activity.status === 'completed' ? 'Hoàn thành' : activity.status === 'pending' ? 'Chờ' : 'Hủy'}
                        size="small"
                        color={
                          activity.status === 'completed'
                            ? 'success'
                            : activity.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {activity.action}: {activity.courseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* System Activities */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: { xs: 2, sm: 2, md: 3 }, height: '450px', bgcolor: colors.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Hoạt động hệ thống
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
                        {systemActivity?.todayLogins}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Đăng nhập hôm nay
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.success }}>
                        {systemActivity?.activeUsers}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Người dùng hoạt động
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: '300px' }}>
                {systemActivity?.recentActivities?.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: alpha(colors.text, 0.03),
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(colors.primary, 0.1),
                        color: colors.primary,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {activity.icon === 'login' && '🔐'}
                      {activity.icon === 'notification' && '📢'}
                      {activity.icon === 'school' && '📚'}
                      {activity.icon === 'assessment' && '📊'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.timestamp).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
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
