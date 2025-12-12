import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Box, Typography, Grow } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { School, Person, Assignment, Schedule } from '@mui/icons-material';

const TeacherStatisticsCards = ({ dashboardData, loading }) => {
  const theme = useTheme();

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      primaryLight: alpha(theme.palette.primary.main, 0.08),
      successLight: alpha(theme.palette.success.main, 0.08),
      warningLight: alpha(theme.palette.warning.main, 0.08),
      errorLight: alpha(theme.palette.error.main, 0.08),
      shadow:
        theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
      shadowHover:
        theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)',
    }),
    [theme]
  );

  const statCards = [
    {
      title: 'Tổng số môn học',
      value: dashboardData.totalCourses,
      icon: <School sx={{ fontSize: 40, color: colors.primary }} />,
      color: colors.primaryLight,
      gradient: `linear-gradient(135deg, ${colors.primaryLight} 0%, transparent 100%)`,
    },
    {
      title: 'Tổng số sinh viên',
      value: dashboardData.totalStudents,
      icon: <Person sx={{ fontSize: 40, color: colors.success }} />,
      color: colors.successLight,
      gradient: `linear-gradient(135deg, ${colors.successLight} 0%, transparent 100%)`,
    },
    {
      title: 'Lớp sắp tới',
      value: dashboardData.upcomingClasses,
      icon: <Schedule sx={{ fontSize: 40, color: colors.warning }} />,
      color: colors.warningLight,
      gradient: `linear-gradient(135deg, ${colors.warningLight} 0%, transparent 100%)`,
    },
    {
      title: 'Điểm chưa chấm',
      value: dashboardData.pendingGrades,
      icon: <Assignment sx={{ fontSize: 40, color: colors.error }} />,
      color: colors.errorLight,
      gradient: `linear-gradient(135deg, ${colors.errorLight} 0%, transparent 100%)`,
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
                bgcolor: theme.palette.background.paper,
                boxShadow: `0 4px 20px ${colors.shadow}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 30px ${colors.shadowHover}`,
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
