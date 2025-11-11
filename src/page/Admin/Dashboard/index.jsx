import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Chip,
  LinearProgress,
  Fade,
  Grow,
} from '@mui/material';
import PageTransition from '../../../component/PageTransition';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
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
} from 'recharts';

// Sample data
const statsData = [
  { label: 'Tổng sinh viên', value: 1205, icon: PeopleIcon, color: 'primary', trend: '+12%' },
  { label: 'Giảng viên', value: 87, icon: GroupsIcon, color: 'success', trend: '+5%' },
  { label: 'Môn học', value: 145, icon: MenuBookIcon, color: 'info', trend: '+8%' },
  { label: 'Lớp học', value: 89, icon: AssessmentIcon, color: 'warning', trend: '+3%' },
];

const revenueData = [
  { month: 'T1', value: 2400 },
  { month: 'T2', value: 1398 },
  { month: 'T3', value: 9800 },
  { month: 'T4', value: 3908 },
  { month: 'T5', value: 4800 },
  { month: 'T6', value: 3800 },
];

const departmentData = [
  { name: 'CNTT', value: 400, color: '#0088FE' },
  { name: 'Kinh tế', value: 300, color: '#00C49F' },
  { name: 'Ngoại ngữ', value: 200, color: '#FFBB28' },
  { name: 'Khác', value: 100, color: '#FF8042' },
];

const AdminDashboard = () => {
  const theme = useTheme();

  const colors = useMemo(() => ({
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
  }), [theme]);

  const StatCard = ({ stat }: { stat: any }) => {
    const IconComponent = stat.icon;
    const colorKey = stat.color as keyof typeof colors;
    
    return (
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors[colorKey], 0.05)} 100%)`,
          border: `1px solid ${alpha(colors[colorKey], 0.1)}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            borderColor: alpha(colors[colorKey], 0.3),
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {stat.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
                {stat.value.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={stat.trend}
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                backgroundColor: alpha(colors[colorKey], 0.1),
                color: colors[colorKey],
              }}
            >
              <IconComponent fontSize="large" />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageTransition>
      <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
        {/* Header */}
        <Fade in={true} timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
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

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Doanh thu theo tháng
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.text, 0.1)} />
                  <XAxis dataKey="month" stroke={colors.textSecondary} />
                  <YAxis stroke={colors.textSecondary} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.paper,
                      border: `1px solid ${alpha(colors.primary, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={colors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Phân bố theo khoa
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities & Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Hoạt động gần đây
              </Typography>
              <Box sx={{ space: 2 }}>
                {[
                  { action: 'Đăng ký mới', user: 'Nguyễn Văn A', time: '2 phút trước', type: 'student' },
                  { action: 'Cập nhật điểm', user: 'GV. Trần Thị B', time: '15 phút trước', type: 'grade' },
                  { action: 'Thêm môn học', user: 'Admin', time: '1 giờ trước', type: 'course' },
                  { action: 'Thanh toán học phí', user: 'Lê Văn C', time: '2 giờ trước', type: 'payment' },
                ].map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      px: 2,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor: alpha(colors.primary, 0.05),
                      border: `1px solid ${alpha(colors.primary, 0.1)}`,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: colors.primary,
                        mr: 2,
                      }}
                    >
                      {activity.user.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.user} • {activity.time}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Trạng thái hệ thống
              </Typography>
              <Box sx={{ space: 3 }}>
                {[
                  { label: 'CPU Usage', value: 65, color: colors.info },
                  { label: 'Memory Usage', value: 78, color: colors.warning },
                  { label: 'Storage', value: 45, color: colors.success },
                  { label: 'Network', value: 92, color: colors.error },
                ].map((metric, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(metric.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: metric.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </PageTransition>
  );
};

export default AdminDashboard;