import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Select,
  DatePicker,
  Button,
} from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StudentGrades = () => {
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  const [grades] = useState([
    {
      id: '1',
      semester: '2023-2024-1',
      courseCode: 'IT2040',
      courseName: 'Cấu trúc dữ liệu và giải thuật',
      credits: 3,
      midtermScore: 7.5,
      finalScore: 8.2,
      totalScore: 7.9,
      letterGrade: 'B+',
      gpa: 3.5,
      status: 'passed',
    },
    {
      id: '2',
      semester: '2023-2024-1',
      courseCode: 'IT3090',
      courseName: 'Cơ sở dữ liệu',
      credits: 3,
      midtermScore: 8.5,
      finalScore: 9.0,
      totalScore: 8.8,
      letterGrade: 'A',
      gpa: 4.0,
      status: 'passed',
    },
    {
      id: '3',
      semester: '2023-2024-1',
      courseCode: 'IT2030',
      courseName: 'Lập trình hướng đối tượng',
      credits: 3,
      midtermScore: 6.0,
      finalScore: 7.5,
      totalScore: 6.9,
      letterGrade: 'C+',
      gpa: 2.5,
      status: 'passed',
    },
    {
      id: '4',
      semester: '2023-2024-2',
      courseCode: 'IT4995',
      courseName: 'Đồ án tốt nghiệp',
      credits: 4,
      midtermScore: 8.0,
      finalScore: 8.5,
      totalScore: 8.3,
      letterGrade: 'A-',
      gpa: 3.7,
      status: 'passed',
    },
    {
      id: '5',
      semester: '2023-2024-2',
      courseCode: 'IT3080',
      courseName: 'Mạng máy tính',
      credits: 3,
      midtermScore: 5.5,
      finalScore: 4.0,
      totalScore: 4.6,
      letterGrade: 'F',
      gpa: 0,
      status: 'failed',
    },
  ]);

  const [semesterSummaries] = useState([
    {
      semester: '2023-2024-1',
      totalCredits: 9,
      gpa: 3.33,
      totalCourses: 3,
      passedCourses: 3,
    },
    {
      semester: '2023-2024-2',
      totalCredits: 7,
      gpa: 1.85,
      totalCourses: 2,
      passedCourses: 1,
    },
  ]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A+': return 'green';
      case 'A-':
      case 'B+': return 'blue';
      case 'B':
      case 'B-': return 'cyan';
      case 'C+':
      case 'C': return 'orange';
      case 'C-':
      case 'D+':
      case 'D': return 'gold';
      case 'F': return 'red';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'green';
      case 'failed': return 'red';
      case 'retake': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'passed': return 'Đậu';
      case 'failed': return 'Rớt';
      case 'retake': return 'Học lại';
      default: return status;
    }
  };

  const filteredGrades = selectedSemester === 'all' 
    ? grades 
    : grades.filter(grade => grade.semester === selectedSemester);

  const overallGPA = grades.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0) / 
                    grades.reduce((sum, grade) => sum + grade.credits, 0);
  
  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
  const passedCredits = grades.filter(grade => grade.status === 'passed')
                             .reduce((sum, grade) => sum + grade.credits, 0);
  const failedCourses = grades.filter(grade => grade.status === 'failed').length;

  const columns = [
    {
      title: 'Mã môn',
      dataIndex: 'courseCode',
      key: 'courseCode',
      width: 100,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: 'Tên môn học',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 300,
    },
    {
      title: 'Tín chỉ',
      dataIndex: 'credits',
      key: 'credits',
      width: 80,
      align: 'center',
    },
    {
      title: 'Điểm GK',
      dataIndex: 'midtermScore',
      key: 'midtermScore',
      width: 80,
      align: 'center',
      render: (score) => score.toFixed(1),
    },
    {
      title: 'Điểm CK',
      dataIndex: 'finalScore',
      key: 'finalScore',
      width: 80,
      align: 'center',
      render: (score) => score.toFixed(1),
    },
    {
      title: 'Điểm TK',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80,
      align: 'center',
      render: (score) => (
        <Text strong style={{ color: score >= 5.0 ? '#52c41a' : '#ff4d4f' }}>
          {score.toFixed(1)}
        </Text>
      ),
    },
    {
      title: 'Điểm chữ',
      dataIndex: 'letterGrade',
      key: 'letterGrade',
      width: 80,
      align: 'center',
      render: (grade) => (
        <Tag color={getGradeColor(grade)}>{grade}</Tag>
      ),
    },
    {
      title: 'Điểm 4',
      dataIndex: 'gpa',
      key: 'gpa',
      width: 80,
      align: 'center',
      render: (gpa) => gpa.toFixed(1),
    },
    {
      title: 'Kết quả',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <BookOutlined style={{ marginRight: 8 }} />
          Kết quả học tập
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="GPA tích lũy"
              value={overallGPA}
              precision={2}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: overallGPA >= 3.0 ? '#52c41a' : overallGPA >= 2.0 ? '#faad14' : '#ff4d4f' }}
            />
            <Progress 
              percent={Math.min((overallGPA / 4) * 100, 100)} 
              strokeColor={overallGPA >= 3.0 ? '#52c41a' : overallGPA >= 2.0 ? '#faad14' : '#ff4d4f'}
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tín chỉ tích lũy"
              value={passedCredits}
              suffix={`/ ${totalCredits}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Môn học rớt"
              value={failedCourses}
              prefix={<WarningOutlined />}
              valueStyle={{ color: failedCourses > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={Math.round((passedCredits / totalCredits) * 100)}
              suffix="%"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Semester Summary */}
      <Card title="Tổng kết theo học kỳ" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {semesterSummaries.map(summary => (
            <Col span={12} key={summary.semester}>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Học kỳ {summary.semester}</Text>
                    <Tag color={summary.gpa >= 3.0 ? 'green' : summary.gpa >= 2.0 ? 'orange' : 'red'}>
                      GPA: {summary.gpa.toFixed(2)}
                    </Tag>
                  </div>
                  <Space>
                    <Text>Tín chỉ: <Text strong>{summary.totalCredits}</Text></Text>
                    <Text>Môn học: <Text strong>{summary.passedCourses}/{summary.totalCourses}</Text></Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Text>Học kỳ:</Text>
          <Select 
            value={selectedSemester} 
            onChange={setSelectedSemester}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả học kỳ</Option>
            <Option value="2023-2024-1">HK1 2023-2024</Option>
            <Option value="2023-2024-2">HK2 2023-2024</Option>
          </Select>
          <Text>Thời gian:</Text>
          <RangePicker 
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Button type="primary">Lọc kết quả</Button>
        </Space>
      </Card>

      {/* Alert for failed courses */}
      {failedCourses > 0 && (
        <Alert
          message="Cảnh báo"
          description={`Bạn có ${failedCourses} môn học chưa đạt. Vui lòng liên hệ phòng đào tạo để đăng ký học lại.`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Grades Table */}
      <Card title={`Bảng điểm chi tiết (${filteredGrades.length} môn)`}>
        <Table
          columns={columns}
          dataSource={filteredGrades}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} môn học`,
          }}
          summary={(data) => {
            const totalCreditsInView = data.reduce((sum, grade) => sum + grade.credits, 0);
            const avgGPA = data.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0) / totalCreditsInView;
            
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <Text strong>Tổng kết</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>{data.length} môn</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text strong>{totalCreditsInView} TC</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={5}></Table.Summary.Cell>
                <Table.Summary.Cell index={6}></Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <Text strong>{isNaN(avgGPA) ? '0.00' : avgGPA.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default StudentGrades;
