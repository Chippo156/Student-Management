import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Table,
  Tag,
  Progress,
  Timeline,
  Avatar,
  Tabs,
  List,
  Space,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BellOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useTheme } from '@mui/material';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import StudentInfo from './StudentInfo';
import StudentGrades from './StudentGrades';
import StudentSchedule from './StudentSchedule';

const { Option } = Select;

interface SubjectData {
  subject: string;
  myScore: number;
  avgScore: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
}

// Dữ liệu điểm học tập
const data: SubjectData[] = [
  { subject: "Cấu trúc dữ liệu & giải thuật", myScore: 8.9, avgScore: 6.9 },
  { subject: "Cơ sở dữ liệu", myScore: 9.5, avgScore: 8.2 },
  { subject: "Mạng máy tính", myScore: 8.2, avgScore: 8.1 },
  { subject: "Hệ điều hành", myScore: 9.0, avgScore: 8.3 },
  { subject: "Lập trình Web", myScore: 10, avgScore: 9.0 },
];

// Tooltip custom
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          padding: 10,
          fontSize: 13,
          color: theme.palette.text.primary,
        }}
      >
        <b>{label}</b>
        <br />
        <span style={{ color: "#ff4d4f" }}>
          ● Điểm của bạn: {payload[0].value}
        </span>
        <br />
        <span style={{ color: "#faad14" }}>
          ● Điểm TB lớp học phần: {payload[1].value}
        </span>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock student data
  const studentData = {
    name: 'Nguyễn Văn An',
    studentCode: 'SV21112551',
    avatar: 'https://i.pravatar.cc/150?img=1',
    gpa: 3.45,
    totalCredits: 85,
    completedCredits: 65,
    semester: 'HK1/2025',
  };

  // Mock recent activities
  const recentActivities = [
    {
      id: '1',
      title: 'Điểm môn Lập trình cơ bản đã được cập nhật',
      description: 'Điểm giữa kỳ: 8.5/10',
      time: '2 giờ trước',
      type: 'grade',
    },
    {
      id: '2',
      title: 'Lịch học tuần tới đã có thay đổi',
      description: 'Môn Cấu trúc dữ liệu chuyển từ A101 sang B203',
      time: '5 giờ trước',
      type: 'schedule',
    },
    {
      id: '3',
      title: 'Thông báo nộp bài tập lớn',
      description: 'Hạn nộp: 30/09/2025',
      time: '1 ngày trước',
      type: 'assignment',
    },
  ];

  // Mock upcoming schedule
  const upcomingSchedule = [
    {
      id: '1',
      course: 'Lập trình cơ bản',
      time: '07:30 - 09:30',
      room: 'A101',
      date: 'Thứ 2, 30/09',
      type: 'theory',
    },
    {
      id: '2',
      course: 'Cấu trúc dữ liệu',
      time: '13:30 - 15:30',
      room: 'B203',
      date: 'Thứ 3, 01/10',
      type: 'lab',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grade': return <TrophyOutlined style={{ color: '#52c41a' }} />;
      case 'schedule': return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'assignment': return <FileTextOutlined style={{ color: '#faad14' }} />;
      default: return <BellOutlined />;
    }
  };

  const tabItems = [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      children: (
        <div style={{ padding: '24px 0' }}>
          <Row gutter={[24, 24]}>
            {/* Student Overview Cards */}
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center' }}>
                <Statistic
                  title="GPA"
                  value={studentData.gpa}
                  precision={2}
                  valueStyle={{ color: '#3f8600', fontSize: '32px' }}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center' }}>
                <Statistic
                  title="Tín chỉ hoàn thành"
                  value={studentData.completedCredits}
                  suffix={`/${studentData.totalCredits}`}
                  valueStyle={{ color: '#1890ff', fontSize: '32px' }}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '4px' }}>
                    Tiến độ học tập
                  </div>
                  <Progress
                    type="circle"
                    percent={Math.round((studentData.completedCredits / studentData.totalCredits) * 100)}
                    size={80}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center' }}>
                <Statistic
                  title="Học kỳ hiện tại"
                  value={studentData.semester}
                  valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>

            {/* Recent Activities */}
            <Col xs={24} lg={14}>
              <Card title="Hoạt động gần đây" extra={<Button type="link">Xem tất cả</Button>}>
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getActivityIcon(item.type)}
                        title={item.title}
                        description={
                          <Space direction="vertical" size={0}>
                            <span>{item.description}</span>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {item.time}
                            </span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Upcoming Schedule */}
            <Col xs={24} lg={10}>
              <Card title="Lịch học sắp tới" extra={<Button type="link">Xem chi tiết</Button>}>
                <Timeline
                  items={upcomingSchedule.map(item => ({
                    dot: item.type === 'lab' ? 
                      <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} /> :
                      <ClockCircleOutlined style={{ fontSize: '16px', color: '#1890ff' }} />,
                    children: (
                      <div key={item.id}>
                        <div style={{ fontWeight: 'bold' }}>{item.course}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {item.date} • {item.time}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          {item.room}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      children: <StudentInfo />,
    },
    {
      key: 'grades',
      label: 'Bảng điểm',
      children: <StudentGrades />,
    },
    {
      key: 'schedule',
      label: 'Lịch học',
      children: <StudentSchedule />,
    },
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={64} src={studentData.avatar} icon={<UserOutlined />} />
          </Col>
          <Col flex="auto">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Chào mừng, {studentData.name}!
            </Typography.Title>
            <Typography.Text type="secondary">
              Mã sinh viên: {studentData.studentCode} • {studentData.semester}
            </Typography.Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<BellOutlined />} />
              <Button type="primary" icon={<FileTextOutlined />}>
                Báo cáo học tập
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default Dashboard;