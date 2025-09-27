import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import { 
  School, 
  Person, 
  Assignment, 
  Schedule,
  TrendingUp 
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { teacherService, courseService } from '../../../service';

const TeacherDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalStudents: 0,
    upcomingClasses: 0,
    pendingGrades: 0
  });
  const [loading, setLoading] = useState(true);
  
  const user = useSelector((state: any) => state.user.account);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Lấy thông tin courses của giảng viên
        const coursesResponse = await teacherService.getTeacherCourses(user.userId);
        const courses = coursesResponse.data || [];
        
        // Tính toán số liệu dashboard
        let totalStudents = 0;
        for (const course of courses) {
          const studentsResponse = await courseService.getCourseStudents(course.id);
          totalStudents += studentsResponse.data?.length || 0;
        }

        setDashboardData({
          totalCourses: courses.length,
          totalStudents,
          upcomingClasses: courses.filter((course: any) => 
            new Date(course.nextClass) > new Date()
          ).length,
          pendingGrades: 0 // Có thể tính sau
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.userId) {
      fetchDashboardData();
    }
  }, [user.userId]);

  const statCards = [
    {
      title: 'Tổng số môn học',
      value: dashboardData.totalCourses,
      icon: <School sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#e3f2fd'
    },
    {
      title: 'Tổng số sinh viên',
      value: dashboardData.totalStudents,
      icon: <Person sx={{ fontSize: 40, color: '#388e3c' }} />,
      color: '#e8f5e8'
    },
    {
      title: 'Lớp sắp tới',
      value: dashboardData.upcomingClasses,
      icon: <Schedule sx={{ fontSize: 40, color: '#f57c00' }} />,
      color: '#fff3e0'
    },
    {
      title: 'Điểm chưa chấm',
      value: dashboardData.pendingGrades,
      icon: <Assignment sx={{ fontSize: 40, color: '#d32f2f' }} />,
      color: '#ffebee'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Giảng viên
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Chào mừng, {user.username}!
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: 140,
                background: `linear-gradient(135deg, ${card.color} 0%, white 100%)`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                height: '100%',
                p: 2
              }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
                {card.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1 }} />
              Hoạt động gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chức năng này sẽ hiển thị các hoạt động gần đây của bạn
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1 }} />
              Lịch dạy hôm nay
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chức năng này sẽ hiển thị lịch dạy của bạn hôm nay
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;