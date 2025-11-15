import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import sectionService from '../../../service/sectionService';
import scheduleService from '../../../service/scheduleService';

// Import components
import TeacherCoursesList from './components/TeacherCoursesList';
import TeacherScheduleToday from './components/TeacherScheduleToday';
import TeacherQuickActions from './components/TeacherQuickActions';
import TeacherProfileCard from './components/TeacherProfileCard';
import TeacherRecentActivity from './components/TeacherRecentActivity';
const getCurrentSemesterName = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  const year = now.getFullYear();

  if (month >= 1 && month <= 5) {
    // January - May: HK2 of previous academic year
    return `HK2 ${year - 1}-${year}`;
  } else if (month >= 6 && month <= 8) {
    // June - August: HK3 of previous academic year
    return `HK3 ${year - 1}-${year}`;
  } else {
    // September - December: HK1 of current academic year
    return `HK1 ${year}-${year + 1}`;
  }
};

const TeacherDashboard = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalStudents: 0,
    upcomingClasses: 0,
    pendingGrades: 0,
  });
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user.account);

  const lecturerId = user?.lecturerId;
  const fullName = user?.user?.fullName || user?.fullName || user?.username;
  const position = user?.position;
  const academicTitle = user?.academicTitle;
  const departmentName = user?.departmentName;
  const facultyName = user?.facultyName;

  const colors = useMemo(() => {
    const p = muiTheme.palette;
    return {
      bgPage: p.background.default,
      bgCard: p.background.paper,
      bgSoftSuccess: alpha(p.success.main, 0.12),
      bgSoftWarning: alpha(p.warning.main, 0.12),
      bgSoftInfo: alpha(p.primary.main, 0.12),
      bgSoftError: alpha(p.error.main, 0.12),
      fg: p.text.primary,
      sub: p.text.secondary,
      border: p.divider,
      primary: p.primary.main,
      primaryContrast: p.primary.contrastText,
      secondary: p.secondary.main,
      success: p.success.main,
      warning: p.warning.main,
      error: p.error.main,
      info: p.primary.main,
    };
  }, [muiTheme]);

  const cardStyle = {
    background: colors.bgCard,
    color: colors.fg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
  };

  // Menu quick actions
  const menuItems = [
    {
      icon: <BarChartOutlined />,
      text: 'Chấm điểm',
      path: '/teacher/grades',
      color: colors.primary,
    },
    {
      icon: <CheckCircleOutlined />,
      text: 'Điểm danh',
      path: '/teacher/attendance',
      color: colors.success,
    },
    {
      icon: <FileTextOutlined />,
      text: 'Bài tập',
      path: '/teacher/assignments',
      color: colors.warning,
    },
    {
      icon: <FolderOutlined />,
      text: 'Tài liệu',
      path: '/teacher/materials',
      color: colors.info,
    },
    {
      icon: <UserOutlined />,
      text: 'Sinh viên',
      path: '/teacher/students',
      color: colors.error,
    },
    {
      icon: <CalendarOutlined />,
      text: 'Lịch dạy',
      path: '/teacher/schedule',
      color: colors.secondary,
    },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch sections (courses) for lecturer
        const sectionsResponse = await sectionService.getSectionsByLecturer({
          pageNumber: 1,
          pageSize: 100, // Get all sections
        });

        const sections = sectionsResponse?.items || [];

        // Calculate total students from all sections
        let totalStudents = 0;
        sections.forEach((section) => {
          totalStudents += section.enrolledCount || 0;
        });

        // Fetch schedule count for the week
        let upcomingClasses = 0;
        try {
          const scheduleCount =
            await scheduleService.countSchedulesOfLecturer();
          upcomingClasses = scheduleCount?.countScheduleOfWeek || 0;
        } catch (error) {
          console.log('Error fetching schedule count:', error);
        }

        setDashboardData({
          totalCourses: sections.length,
          totalStudents,
          upcomingClasses,
          pendingGrades: 0, // TODO: Implement when grades API is available
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [lecturerId]);

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 24px 40px',
        background: colors.bgPage,
      }}
    >
      {/* Welcome Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          borderRadius: 16,
          padding: '24px 32px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
          }}
        />
        <Row
          justify="space-between"
          align="middle"
          style={{ position: 'relative' }}
        >
          <Col xs={24} md={16}>
            <div style={{ marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                }}
              >
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#fff',
                margin: '4px 0 8px',
                lineHeight: 1.3,
              }}
            >
              Chào mừng, {academicTitle} {fullName}!
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
              }}
            >
              {position} • {departmentName} • {facultyName}
            </p>
          </Col>
          <Col
            xs={24}
            md={8}
            style={{ textAlign: 'right', marginTop: { xs: 16, md: 0 } }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: 10,
                padding: '12px 20px',
                display: 'inline-block',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.75)',
                  marginBottom: 2,
                  fontWeight: 500,
                }}
              >
                Học kỳ hiện tại
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {getCurrentSemesterName()}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderLeft: `3px solid ${colors.primary}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Tổng số môn học
                </span>
              }
              value={dashboardData.totalCourses}
              prefix={
                <BookOutlined style={{ color: colors.primary, fontSize: 20 }} />
              }
              valueStyle={{ color: colors.fg, fontWeight: 600, fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderLeft: `3px solid ${colors.success}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Tổng số sinh viên
                </span>
              }
              value={dashboardData.totalStudents}
              prefix={
                <UserOutlined style={{ color: colors.success, fontSize: 20 }} />
              }
              valueStyle={{ color: colors.fg, fontWeight: 600, fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderLeft: `3px solid ${colors.warning}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Lớp sắp tới
                </span>
              }
              value={dashboardData.upcomingClasses}
              prefix={
                <ClockCircleOutlined
                  style={{ color: colors.warning, fontSize: 20 }}
                />
              }
              valueStyle={{ color: colors.fg, fontWeight: 600, fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderLeft: `3px solid ${colors.error}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Điểm chưa chấm
                </span>
              }
              value={dashboardData.pendingGrades}
              prefix={
                <FileTextOutlined
                  style={{ color: colors.error, fontSize: 20 }}
                />
              }
              valueStyle={{ color: colors.fg, fontWeight: 600, fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Menu */}
      <Card
        style={{
          ...cardStyle,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        title={
          <span style={{ color: colors.fg, fontSize: 17, fontWeight: 600 }}>
            Thao tác nhanh
          </span>
        }
      >
        <Row gutter={[12, 12]}>
          {menuItems.map((item, idx) => (
            <Col xs={12} sm={8} md={4} key={idx}>
              <div
                onClick={() => navigate(item.path)}
                style={{
                  textAlign: 'center',
                  padding: '16px 10px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: alpha(item.color, 0.08),
                  border: `1px solid ${alpha(item.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${alpha(item.color, 0.25)}`;
                  e.currentTarget.style.background = alpha(item.color, 0.15);
                  e.currentTarget.style.borderColor = item.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = alpha(item.color, 0.08);
                  e.currentTarget.style.borderColor = alpha(item.color, 0.2);
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    color: item.color,
                    marginBottom: 6,
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{ fontSize: 13, color: colors.fg, fontWeight: 600 }}
                >
                  {item.text}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            {/* Courses List */}
            <Col xs={24} md={12}>
              <TeacherCoursesList lecturerId={lecturerId} />
            </Col>

            {/* Schedule Today */}
            <Col xs={24} md={12}>
              <TeacherScheduleToday lecturerId={lecturerId} />
            </Col>

            {/* Recent Activity */}
            <Col xs={24}>
              <TeacherRecentActivity />
            </Col>
          </Row>
        </Col>

        {/* Right Column - Profile Card */}
        <Col xs={24} lg={8}>
          <TeacherProfileCard user={user} />
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard;
