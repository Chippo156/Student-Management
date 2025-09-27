import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  useTheme,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

interface StudentStats {
  totalCredits: number;
  completedCredits: number;
  gpa: number;
  semester: string;
  year: string;
}

interface RecentActivity {
  id: string;
  title: string;
  date: string;
  type: "grade" | "assignment" | "registration";
}

const Dashboard: React.FC = () => {
  const theme = useTheme();

  // Mock data - sẽ được thay thế bằng API calls
  const studentInfo = {
    name: "Nguyễn Văn A",
    studentId: "SV001",
    major: "Công nghệ thông tin",
    faculty: "Khoa CNTT",
    year: 3,
    avatar: "/api/placeholder/100/100",
  };

  const stats: StudentStats = {
    totalCredits: 120,
    completedCredits: 85,
    gpa: 3.45,
    semester: "1",
    year: "2024-2025",
  };

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      title: "Điểm môn Cấu trúc dữ liệu đã được cập nhật",
      date: "2024-01-15",
      type: "grade",
    },
    {
      id: "2", 
      title: "Đăng ký học phần kỳ 2 năm học 2024-2025",
      date: "2024-01-14",
      type: "registration",
    },
    {
      id: "3",
      title: "Nộp bài tập lớn môn Lập trình Web",
      date: "2024-01-13", 
      type: "assignment",
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color="primary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Student Info Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={studentInfo.avatar}
            sx={{ width: 80, height: 80, mr: 3 }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              {studentInfo.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              MSSV: {studentInfo.studentId}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip label={studentInfo.major} sx={{ mr: 1 }} />
              <Chip label={`Năm ${studentInfo.year}`} variant="outlined" />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số tín chỉ"
            value={stats.totalCredits}
            icon={<SchoolIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tín chỉ đã hoàn thành"
            value={stats.completedCredits}
            icon={<AssignmentIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GPA"
            value={stats.gpa.toFixed(2)}
            icon={<GradeIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tiến độ học tập"
            value={`${Math.round((stats.completedCredits / stats.totalCredits) * 100)}%`}
            icon={<TrendingUpIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemText
                      primary={activity.title}
                      secondary={new Date(activity.date).toLocaleDateString("vi-VN")}
                    />
                    <Chip
                      label={
                        activity.type === "grade"
                          ? "Điểm số"
                          : activity.type === "assignment"
                          ? "Bài tập"
                          : "Đăng ký"
                      }
                      size="small"
                      color={
                        activity.type === "grade"
                          ? "success"
                          : activity.type === "assignment"
                          ? "warning"
                          : "primary"
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Thông tin học kỳ
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Học kỳ hiện tại
              </Typography>
              <Typography variant="h6">
                Học kỳ {stats.semester} - {stats.year}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Khoa
              </Typography>
              <Typography variant="h6">{studentInfo.faculty}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;