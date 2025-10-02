import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  useTheme,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  
  // Sample data - in real app, this would come from API
  const statsData = [
    {
      title: 'Tổng số sinh viên',
      value: '1,234',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      change: '+12%'
    },
    {
      title: 'Tổng số giảng viên',
      value: '89',
      icon: <SchoolIcon />,
      color: theme.palette.secondary.main,
      change: '+5%'
    },
    {
      title: 'Số khóa học',
      value: '156',
      icon: <AssignmentIcon />,
      color: theme.palette.success.main,
      change: '+8%'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: '94.5%',
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main,
      change: '+2.1%'
    }
  ];

  const enrollmentData = [
    { month: 'T1', students: 65, teachers: 8 },
    { month: 'T2', students: 59, teachers: 7 },
    { month: 'T3', students: 80, teachers: 9 },
    { month: 'T4', students: 81, teachers: 10 },
    { month: 'T5', students: 56, teachers: 8 },
    { month: 'T6', students: 95, teachers: 12 },
    { month: 'T7', students: 120, teachers: 15 },
    { month: 'T8', students: 140, teachers: 18 },
    { month: 'T9', students: 160, teachers: 20 },
    { month: 'T10', students: 145, teachers: 19 },
    { month: 'T11', students: 130, teachers: 17 },
    { month: 'T12', students: 150, teachers: 21 }
  ];

  const departmentData = [
    { name: 'Công nghệ thông tin', value: 450, color: '#8884d8' },
    { name: 'Kinh tế', value: 320, color: '#82ca9d' },
    { name: 'Ngoại ngữ', value: 280, color: '#ffc658' },
    { name: 'Khoa học tự nhiên', value: 184, color: '#ff7300' }
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      action: 'đã đăng ký khóa học',
      course: 'Lập trình Java',
      time: '2 giờ trước',
      type: 'success'
    },
    {
      id: 2,
      user: 'Trần Thị B',
      action: 'đã hoàn thành bài kiểm tra',
      course: 'Cơ sở dữ liệu',
      time: '3 giờ trước',
      type: 'info'
    },
    {
      id: 3,
      user: 'Lê Văn C',
      action: 'cần hỗ trợ',
      course: 'Toán cao cấp',
      time: '5 giờ trước',
      type: 'warning'
    },
    {
      id: 4,
      user: 'Phạm Thị D',
      action: 'đã nộp bài tập',
      course: 'Tiếng Anh B1',
      time: '1 ngày trước',
      type: 'success'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PersonIcon color="primary" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Tổng quan hệ thống
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Chip 
                      label={stat.change} 
                      size="small" 
                      color="success" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Enrollment Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đăng ký theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill={theme.palette.primary.main} name="Sinh viên" />
                <Bar dataKey="teachers" fill={theme.palette.secondary.main} name="Giảng viên" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Phân bố theo khoa
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <List sx={{ height: '300px', overflow: 'auto' }}>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography component="span" variant="body2" fontWeight="bold">
                          {activity.user}
                        </Typography>
                        <Typography component="span" variant="body2">
                          {' ' + activity.action + ' '}
                        </Typography>
                        <Chip 
                          label={activity.course} 
                          size="small" 
                          color={getActivityColor(activity.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={activity.time}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Performance Trend */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Xu hướng hiệu suất
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  name="Sinh viên"
                />
                <Line 
                  type="monotone" 
                  dataKey="teachers" 
                  stroke={theme.palette.secondary.main} 
                  strokeWidth={3}
                  name="Giảng viên"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;