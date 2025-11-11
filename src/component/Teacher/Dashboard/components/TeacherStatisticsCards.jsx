import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Grow } from '@mui/material';
import {
  School,
  Person,
  Assignment,
  Schedule,
} from '@mui/icons-material';

const TeacherStatisticsCards = ({ dashboardData, loading }) => {
  const statCards = [
    {
      title: 'Tổng số môn học',
      value: dashboardData.totalCourses,
      icon: <School sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#e3f2fd',
      gradient: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
    },
    {
      title: 'Tổng số sinh viên',
      value: dashboardData.totalStudents,
      icon: <Person sx={{ fontSize: 40, color: '#388e3c' }} />,
      color: '#e8f5e8',
      gradient: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
    },
    {
      title: 'Lớp sắp tới',
      value: dashboardData.upcomingClasses,
      icon: <Schedule sx={{ fontSize: 40, color: '#f57c00' }} />,
      color: '#fff3e0',
      gradient: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
    },
    {
      title: 'Điểm chưa chấm',
      value: dashboardData.pendingGrades,
      icon: <Assignment sx={{ fontSize: 40, color: '#d32f2f' }} />,
      color: '#ffebee',
      gradient: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Grow in={!loading} timeout={800 + index * 200}>
            <Card
              sx={{
                height: 140,
                background: card.gradient,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%',
                  p: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
                {card.icon}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      ))}
    </Grid>
  );
};

export default TeacherStatisticsCards;
