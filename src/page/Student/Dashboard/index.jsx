import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col } from 'antd';
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
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import reportService from '../../../service/reportService';
import scheduleService from '../../../service/scheduleService';
import { semesterService } from '../../../service/semesterService';

// Component con
import StudentProfileCard from '../../../component/Student/Dashboard/StudentProfileCard';
import StudentQuickMenu from '../../../component/Student/Dashboard/StudentQuickMenu';
import StudentRemindCard from '../../../component/Student/Dashboard/StudentRemindCard';
import StudentScheduleSummary from '../../../component/Student/Dashboard/StudentScheduleSummary';
import StudentAcademicChart from '../../../component/Student/Dashboard/StudentAcademicChart';
import StudentProgressChart from '../../../component/Student/Dashboard/StudentProgressChart';
import StudentClassList from '../../../component/Student/Dashboard/StudentClassList';

const Dashboard = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();

  const account = useSelector((state) => state.user.account);
  const [semesterReport, setSemesterReport] = useState(null);
  const [creditsSummary, setCreditsSummary] = useState(null);
  const [scheduleCount, setScheduleCount] = useState({
    countScheduleOfWeek: 0,
    countTestOfWeek: 0,
  });
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

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
        name: 'Tín chỉ hoàn thành',
        value: completedCredits,
        color: colors.chart2,
      },
      {
        name: 'Còn lại',
        value:
          totalCredits > completedCredits ? totalCredits - completedCredits : 0,
        color: alpha(colors.sub, 0.2),
      },
    ],
    [completedCredits, colors, totalCredits]
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
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <div>
            <h1 style={{ ...sectionTitleStyle, fontSize: 28, fontWeight: 700 }}>
              Dashboard
            </h1>
            <div style={{ ...subTextStyle, marginTop: 4 }}>
              Chào mừng trở lại,{' '}
              {account?.fullName || account?.user?.fullName || 'Sinh viên'}
            </div>
          </div>
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
            semesterReport={semesterReport}
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
