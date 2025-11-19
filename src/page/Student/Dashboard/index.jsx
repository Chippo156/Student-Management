import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  BellOutlined,
  MessageOutlined,
  ReadOutlined,
  TrophyOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import reportService from '../../../service/reportService';
import scheduleService from '../../../service/scheduleService';
import { semesterService } from '../../../service/semesterService';
import enrollmentService from '../../../service/enrollmentService';

// Component con
import StudentProfileCard from '../../../component/Student/Dashboard/StudentProfileCard';
import StudentQuickMenu from '../../../component/Student/Dashboard/StudentQuickMenu';
import StudentRemindCard from '../../../component/Student/Dashboard/StudentRemindCard';
import StudentScheduleSummary from '../../../component/Student/Dashboard/StudentScheduleSummary';
import StudentAcademicChart from '../../../component/Student/Dashboard/StudentAcademicChart';
import StudentProgressChart from '../../../component/Student/Dashboard/StudentProgressChart';
import StudentClassList from '../../../component/Student/Dashboard/StudentClassList';
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

const Dashboard = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();

  const account = useSelector((state) => state.user.account);
  const [semesterReport, setSemesterReport] = useState(null);
  const [creditsSummary, setCreditsSummary] = useState(null);
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [scheduleCount, setScheduleCount] = useState({
    countScheduleOfWeek: 0,
    countTestOfWeek: 0,
  });
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  // Helper function to calculate current semester based on month

  const colors = useMemo(() => {
    const p = muiTheme.palette;
    return {
      bgPage: p.background.default,
      bgCard: p.background.paper,
      bgSoftSuccess: alpha(p.success.main, 0.12),
      bgSoftWarning: alpha(p.warning.main, 0.12),
      bgSoftInfo: alpha(p.primary.main, 0.12),
      fg: p.text.primary,
      sub: p.text.secondary,
      border: p.divider,
      primary: p.primary.main,
      primaryContrast: p.primary.contrastText,
      secondary: p.secondary.main,
      success: p.success.main,
      warning: p.warning.main,
      info: p.primary.main,
      chart1: p.primary.main,
      chart2: p.secondary.main,
    };
  }, [muiTheme]);
  const sectionTitleStyle = {
    color: colors.fg,
    margin: 0,
  };
  const subTextStyle = { color: colors.sub };
  const cardStyle = {
    background: colors.bgCard,
    color: colors.fg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
  };

  // Menu quick actions
  const menuItems = [
    {
      icon: <CalendarOutlined />,
      text: 'Lịch theo tuần',
      path: '/student/schedule',
    },
    {
      icon: <BarChartOutlined />,
      text: 'Kết quả học tập',
      path: '/student/grades',
    },
    {
      icon: <FileTextOutlined />,
      text: 'Đăng ký học phần',
      path: '/student/register-courses',
    },
    { icon: <ReadOutlined />, text: 'Hồ sơ điện tử', path: '/student/info' },
    {
      icon: <DollarOutlined />,
      text: 'Tra cứu công nợ',
      path: '/student/debt',
    },
    {
      icon: <CreditCardOutlined />,
      text: 'Thanh toán trực tuyến',
      path: '/student/payment',
    },
    {
      icon: <FileTextOutlined />,
      text: 'Phiếu thu tổng hợp',
      path: '/student/receipt',
    },
    {
      icon: <ClockCircleOutlined />,
      text: 'Lịch theo tiến độ',
      path: '/student/progress-schedule',
    },
    {
      icon: <BellOutlined />,
      text: 'Nhắc nhở',
      path: '/student/notifications',
    },
    { icon: <MessageOutlined />, text: 'Khảo sát', path: '/student/survey' },
  ];

  const [hoveredRing, setHoveredRing] = useState(null);
  const completedCredits = creditsSummary?.totalCreditCompleted ?? 0;
  const totalCredits =
    creditsSummary?.totalCreditRequired ?? account?.totalCreditsRequired ?? 0;
  const percentCompleted =
    totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  const innerProgress = useMemo(
    () => [
      { name: 'Hoàn thành', value: percentCompleted, color: colors.chart1 },
      {
        name: 'Còn lại',
        value: 100 - percentCompleted,
        color: alpha(colors.sub, 0.2),
      },
    ],
    [percentCompleted, colors]
  );

  const outerCredits = useMemo(
    () => [
      {
        name: 'Tổng tiến độ',
        value: 100,
        color: colors.chart2,
        label: 'Tổng tiến độ',
      },
    ],
    [colors]
  );

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [reportRes, scheduleRes, creditsSummaryRes] = await Promise.all([
          reportService.getSemesterCredits('1'),
          scheduleService.countScheduleOfWeek(),
          reportService.getAllCreditsByStudent(),
        ]);
        setSemesterReport(reportRes.data);
        setScheduleCount(scheduleRes.data);
        setCreditsSummary(creditsSummaryRes.data);
      } catch {
        setSemesterReport(null);
        setScheduleCount({ countScheduleOfWeek: 0, countTestOfWeek: 0 });
      }
      setLoading(false);
    };
    fetchAll();
  }, []);
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await semesterService.getStudentSemesters();
        setSemesters(data);

        if (data.length > 0)
          setSelectedSemesterId(data[data.length - 1].semesterId);
      } catch {
        setSemesters([]);
      }
    };
    fetchSemesters();
  }, []);
  useEffect(() => {
    const fetchEnrollment = async () => {
      if (selectedSemesterId) {
        try {
          const res =
            await enrollmentService.getEnrollmentBySemester(selectedSemesterId);
          setEnrollmentList(res || []);
        } catch (error) {
          setEnrollmentList([]);
          console.error('Enrollment API error:', error);
        }
      }
    };
    fetchEnrollment();
  }, [selectedSemesterId]);
  const handleSemesterChange = (value) => {
    setSelectedSemesterId(value);
  };

  const academicData = semesterReport?.courses
    ? semesterReport.courses.map((course) => ({
        subject: course.courseName,
        myScore: course.gradePoint,
        avgScore: course.classAverageScore,
      }))
    : [];

  useEffect(() => {
    if (selectedSemesterId) {
      setLoading(true);
      reportService
        .getSemesterCredits(selectedSemesterId.toString())
        .then((reportRes) => {
          setSemesterReport(reportRes.data);
        })
        .catch(() => {
          setSemesterReport(null);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedSemesterId]);

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: colors.bgPage }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          borderRadius: 16,
          padding: '32px 40px',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <Row
          justify="space-between"
          align="middle"
          style={{ position: 'relative' }}
        >
          <Col xs={24} md={16}>
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
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
                fontSize: 32,
                fontWeight: 700,
                color: '#fff',
                margin: '8px 0',
                lineHeight: 1.2,
              }}
            >
              Chào mừng trở lại,{' '}
              {account?.fullName || account?.user?.fullName || 'Sinh viên'}!
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.85)',
                margin: 0,
              }}
            >
              Hôm nay là một ngày tuyệt vời để học tập và phát triển. Hãy cùng
              bắt đầu nhé!
            </p>
          </Col>
          <Col
            xs={24}
            md={8}
            style={{ textAlign: 'right', marginTop: { xs: 16, md: 0 } }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                padding: '16px 24px',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: 4,
                }}
              >
                Học kỳ hiện tại
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {getCurrentSemesterName()}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              ...cardStyle,
              textAlign: 'center',
              background: alpha(colors.primary, 0.08),
              borderColor: alpha(colors.primary, 0.2),
            }}
            bodyStyle={{ padding: '20px 16px' }}
          >
            <BookOutlined
              style={{
                fontSize: 32,
                color: colors.primary,
                marginBottom: 8,
              }}
            />
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Môn học đăng ký
                </span>
              }
              value={enrollmentList.length || 0}
              valueStyle={{
                color: colors.primary,
                fontSize: 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              ...cardStyle,
              textAlign: 'center',
              background: alpha(colors.success, 0.08),
              borderColor: alpha(colors.success, 0.2),
            }}
            bodyStyle={{ padding: '20px 16px' }}
          >
            <CheckCircleOutlined
              style={{
                fontSize: 32,
                color: colors.success,
                marginBottom: 8,
              }}
            />
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Tín chỉ hoàn thành
                </span>
              }
              value={completedCredits}
              suffix={`/${totalCredits}`}
              valueStyle={{
                color: colors.success,
                fontSize: 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              ...cardStyle,
              textAlign: 'center',
              background: alpha(colors.secondary, 0.08),
              borderColor: alpha(colors.secondary, 0.2),
            }}
            bodyStyle={{ padding: '20px 16px' }}
          >
            <CalendarOutlined
              style={{
                fontSize: 32,
                color: colors.secondary,
                marginBottom: 8,
              }}
            />
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Lịch học tuần này
                </span>
              }
              value={scheduleCount.countScheduleOfWeek || 0}
              valueStyle={{
                color: colors.secondary,
                fontSize: 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              ...cardStyle,
              textAlign: 'center',
              background: alpha(colors.warning, 0.08),
              borderColor: alpha(colors.warning, 0.2),
            }}
            bodyStyle={{ padding: '20px 16px' }}
          >
            <TrophyOutlined
              style={{
                fontSize: 32,
                color: colors.warning,
                marginBottom: 8,
              }}
            />
            <Statistic
              title={
                <span style={{ color: colors.sub, fontSize: 13 }}>
                  Tiến độ hoàn thành
                </span>
              }
              value={percentCompleted}
              suffix="%"
              valueStyle={{
                color: colors.warning,
                fontSize: 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 1: Profile + Right column */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={16}>
          <StudentProfileCard account={account} colors={colors} />
        </Col>
        <Col xs={24} lg={8}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            <StudentRemindCard colors={colors} />
            <StudentScheduleSummary
              scheduleCount={scheduleCount}
              colors={colors}
              loading={loading}
              subTextStyle={subTextStyle}
              cardStyle={cardStyle}
            />
          </div>
        </Col>
      </Row>

      {/* Row 2: Menu quick actions */}
      <StudentQuickMenu
        menuItems={menuItems}
        colors={colors}
        navigate={navigate}
      />

      {/* Row 3: Kết quả học tập + Tiến độ + Lớp học phần (3 cột) */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }} align="stretch">
        <Col xs={24} lg={12}>
          <StudentAcademicChart
            academicData={academicData}
            semesters={semesters}
            selectedSemesterId={selectedSemesterId}
            handleSemesterChange={handleSemesterChange}
            colors={colors}
            sectionTitleStyle={sectionTitleStyle}
          />
        </Col>
        <Col xs={24} lg={6}>
          <StudentProgressChart
            outerCredits={outerCredits}
            innerProgress={innerProgress}
            hoveredRing={hoveredRing}
            setHoveredRing={setHoveredRing}
            completedCredits={completedCredits}
            totalCredits={totalCredits}
            percentCompleted={percentCompleted}
            colors={colors}
            creditsSummary={creditsSummary}
            account={account}
          />
        </Col>
        <Col xs={24} lg={6}>
          <StudentClassList
            enrollmentList={enrollmentList}
            semesters={semesters}
            selectedSemesterId={selectedSemesterId}
            handleSemesterChange={handleSemesterChange}
            colors={colors}
            sectionTitleStyle={sectionTitleStyle}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
