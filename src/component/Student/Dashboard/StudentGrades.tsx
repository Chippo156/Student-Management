import React, { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Modal,
  Descriptions,
  Row,
  Col,
  Statistic,
  Progress,
  Select,
} from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

interface Grade {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  midtermScore: number;
  finalScore: number;
  assignmentScore: number;
  totalScore: number;
  letterGrade: string;
  gpa: number;
  semester: string;
  year: number;
  status: 'passed' | 'failed' | 'in-progress';
}

const StudentGrades: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('all');

  // Mock data
  const gradesData: Grade[] = [
    {
      id: '1',
      courseCode: 'IT101',
      courseName: 'Lập trình cơ bản',
      credits: 3,
      midtermScore: 8.5,
      finalScore: 7.8,
      assignmentScore: 9.0,
      totalScore: 8.2,
      letterGrade: 'B+',
      gpa: 3.3,
      semester: 'HK1',
      year: 2023,
      status: 'passed',
    },
    {
      id: '2',
      courseCode: 'MA101',
      courseName: 'Toán cao cấp 1',
      credits: 4,
      midtermScore: 7.5,
      finalScore: 8.2,
      assignmentScore: 8.8,
      totalScore: 8.1,
      letterGrade: 'B+',
      gpa: 3.3,
      semester: 'HK1',
      year: 2023,
      status: 'passed',
    },
    {
      id: '3',
      courseCode: 'IT201',
      courseName: 'Cấu trúc dữ liệu',
      credits: 3,
      midtermScore: 9.0,
      finalScore: 8.5,
      assignmentScore: 9.2,
      totalScore: 8.8,
      letterGrade: 'A',
      gpa: 4.0,
      semester: 'HK2',
      year: 2023,
      status: 'passed',
    },
    {
      id: '4',
      courseCode: 'EN101',
      courseName: 'Tiếng Anh cơ bản',
      credits: 2,
      midtermScore: 6.5,
      finalScore: 7.0,
      assignmentScore: 7.5,
      totalScore: 6.9,
      letterGrade: 'C+',
      gpa: 2.3,
      semester: 'HK2',
      year: 2023,
      status: 'passed',
    },
    {
      id: '5',
      courseCode: 'IT301',
      courseName: 'Cơ sở dữ liệu',
      credits: 3,
      midtermScore: 0,
      finalScore: 0,
      assignmentScore: 8.5,
      totalScore: 0,
      letterGrade: 'F',
      gpa: 0,
      semester: 'HK1',
      year: 2024,
      status: 'in-progress',
    },
  ];

  const handleViewDetail = (record: Grade) => {
    setSelectedGrade(record);
    setIsModalVisible(true);
  };

  const getGradeColor = (letterGrade: string) => {
    const colors: { [key: string]: string } = {
      'A+': '#52c41a', 'A': '#52c41a',
      'B+': '#1890ff', 'B': '#1890ff',
      'C+': '#faad14', 'C': '#faad14',
      'D+': '#fa8c16', 'D': '#fa8c16',
      'F': '#ff4d4f'
    };
    return colors[letterGrade] || '#d9d9d9';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'in-progress': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return 'Đã qua';
      case 'failed': return 'Không qua';
      case 'in-progress': return 'Đang học';
      default: return status;
    }
  };

  const filteredGrades = selectedSemester === 'all' 
    ? gradesData 
    : gradesData.filter(grade => `${grade.semester}-${grade.year}` === selectedSemester);

  // Statistics
  const totalCredits = filteredGrades.reduce((sum, grade) => sum + grade.credits, 0);
  const passedCredits = filteredGrades
    .filter(grade => grade.status === 'passed')
    .reduce((sum, grade) => sum + grade.credits, 0);
  const averageGPA = filteredGrades.length > 0 
    ? (filteredGrades.reduce((sum, grade) => sum + grade.gpa, 0) / filteredGrades.length).toFixed(2)
    : 0;
  const passRate = totalCredits > 0 ? Math.round((passedCredits / totalCredits) * 100) : 0;

  const columns: ColumnsType<Grade> = [
    {
      title: 'Mã MH',
      dataIndex: 'courseCode',
      key: 'courseCode',
      width: 100,
    },
    {
      title: 'Tên môn học',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 200,
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
      width: 90,
      align: 'center',
      render: (score: number) => score > 0 ? score.toFixed(1) : '-',
    },
    {
      title: 'Điểm CK',
      dataIndex: 'finalScore',
      key: 'finalScore',
      width: 90,
      align: 'center',
      render: (score: number) => score > 0 ? score.toFixed(1) : '-',
    },
    {
      title: 'Điểm BT',
      dataIndex: 'assignmentScore',
      key: 'assignmentScore',
      width: 90,
      align: 'center',
      render: (score: number) => score > 0 ? score.toFixed(1) : '-',
    },
    {
      title: 'Điểm TB',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 90,
      align: 'center',
      render: (score: number) => (
        <Text strong style={{ color: score >= 5.0 ? '#52c41a' : '#ff4d4f' }}>
          {score > 0 ? score.toFixed(1) : '-'}
        </Text>
      ),
    },
    {
      title: 'Điểm chữ',
      dataIndex: 'letterGrade',
      key: 'letterGrade',
      width: 90,
      align: 'center',
      render: (grade: string) => (
        <Tag color={getGradeColor(grade)} style={{ fontWeight: 'bold' }}>
          {grade}
        </Tag>
      ),
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      width: 80,
      align: 'center',
      render: (gpa: number) => gpa.toFixed(1),
    },
    {
      title: 'Học kỳ',
      key: 'semester',
      width: 100,
      align: 'center',
      render: (_, record) => `${record.semester}/${record.year}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Bảng điểm</Title>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn học kỳ"
          value={selectedSemester}
          onChange={setSelectedSemester}
        >
          <Option value="all">Tất cả học kỳ</Option>
          <Option value="HK1-2023">HK1/2023</Option>
          <Option value="HK2-2023">HK2/2023</Option>
          <Option value="HK1-2024">HK1/2024</Option>
          <Option value="HK2-2024">HK2/2024</Option>
        </Select>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng tín chỉ"
              value={totalCredits}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tín chỉ đạt"
              value={passedCredits}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="GPA trung bình"
              value={averageGPA}
              precision={2}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: Number(averageGPA) >= 3.0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Tỷ lệ đậu</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: passRate >= 80 ? '#3f8600' : '#cf1322' }}>
                  {passRate}%
                </div>
              </div>
              <Progress
                type="circle"
                percent={passRate}
                width={60}
                strokeColor={passRate >= 80 ? '#52c41a' : '#ff4d4f'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Grades Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredGrades}
          rowKey="id"
          pagination={{
            total: filteredGrades.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} môn học`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết điểm số"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedGrade && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>{selectedGrade.courseName}</Title>
              <Text type="secondary">{selectedGrade.courseCode}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={getGradeColor(selectedGrade.letterGrade)} style={{ fontSize: '16px', padding: '4px 12px' }}>
                  {selectedGrade.letterGrade}
                </Tag>
              </div>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Số tín chỉ" span={1}>
                {selectedGrade.credits}
              </Descriptions.Item>
              <Descriptions.Item label="Học kỳ" span={1}>
                {selectedGrade.semester}/{selectedGrade.year}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm giữa kỳ" span={1}>
                <Text strong>{selectedGrade.midtermScore > 0 ? selectedGrade.midtermScore.toFixed(1) : 'Chưa có'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm cuối kỳ" span={1}>
                <Text strong>{selectedGrade.finalScore > 0 ? selectedGrade.finalScore.toFixed(1) : 'Chưa có'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm bài tập" span={1}>
                <Text strong>{selectedGrade.assignmentScore > 0 ? selectedGrade.assignmentScore.toFixed(1) : 'Chưa có'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm tổng kết" span={1}>
                <Text strong style={{ color: selectedGrade.totalScore >= 5.0 ? '#52c41a' : '#ff4d4f' }}>
                  {selectedGrade.totalScore > 0 ? selectedGrade.totalScore.toFixed(1) : 'Chưa có'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm chữ" span={1}>
                <Tag color={getGradeColor(selectedGrade.letterGrade)} style={{ fontWeight: 'bold' }}>
                  {selectedGrade.letterGrade}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm GPA" span={1}>
                <Text strong>{selectedGrade.gpa.toFixed(1)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag color={getStatusColor(selectedGrade.status)}>
                  {getStatusText(selectedGrade.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedGrade.status === 'in-progress' && (
              <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Môn học đang trong quá trình học tập. Điểm số sẽ được cập nhật sau khi hoàn thành các bài kiểm tra.
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentGrades;