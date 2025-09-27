import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Tag,
  Statistic,
  Card,
  Row,
  Col,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Grade {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
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
  status: 'passed' | 'failed' | 'pending';
}

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([
    {
      id: '1',
      studentId: '1',
      studentCode: 'SV001',
      studentName: 'Nguyễn Văn An',
      courseId: '1',
      courseCode: 'IT101',
      courseName: 'Lập trình cơ bản',
      credits: 3,
      midtermScore: 8.5,
      finalScore: 7.8,
      assignmentScore: 9.0,
      totalScore: 8.3,
      letterGrade: 'B+',
      gpa: 3.3,
      semester: 'HK1',
      year: 2025,
      status: 'passed',
    },
    {
      id: '2',
      studentId: '2',
      studentCode: 'SV002',
      studentName: 'Trần Thị Bình',
      courseId: '1',
      courseCode: 'IT101',
      courseName: 'Lập trình cơ bản',
      credits: 3,
      midtermScore: 9.2,
      finalScore: 8.8,
      assignmentScore: 9.5,
      totalScore: 9.1,
      letterGrade: 'A',
      gpa: 4.0,
      semester: 'HK1',
      year: 2025,
      status: 'passed',
    },
    {
      id: '3',
      studentId: '1',
      studentCode: 'SV001',
      studentName: 'Nguyễn Văn An',
      courseId: '2',
      courseCode: 'IT201',
      courseName: 'Cấu trúc dữ liệu và giải thuật',
      credits: 4,
      midtermScore: 7.0,
      finalScore: 6.5,
      assignmentScore: 7.5,
      totalScore: 6.9,
      letterGrade: 'C+',
      gpa: 2.3,
      semester: 'HK1',
      year: 2025,
      status: 'passed',
    },
    {
      id: '4',
      studentId: '3',
      studentCode: 'SV003',
      studentName: 'Lê Minh Cường',
      courseId: '3',
      courseCode: 'EC101',
      courseName: 'Kinh tế vi mô',
      credits: 3,
      midtermScore: 5.5,
      finalScore: 4.8,
      assignmentScore: 6.0,
      totalScore: 5.3,
      letterGrade: 'D',
      gpa: 1.0,
      semester: 'HK2',
      year: 2024,
      status: 'failed',
    },
    {
      id: '5',
      studentId: '4',
      studentCode: 'SV004',
      studentName: 'Phạm Thu Dung',
      courseId: '4',
      courseCode: 'EN101',
      courseName: 'Tiếng Anh giao tiếp',
      credits: 2,
      midtermScore: 9.5,
      finalScore: 9.2,
      assignmentScore: 9.8,
      totalScore: 9.4,
      letterGrade: 'A+',
      gpa: 4.0,
      semester: 'HK1',
      year: 2025,
      status: 'passed',
    },
    {
      id: '6',
      studentId: '5',
      studentCode: 'SV005',
      studentName: 'Hoàng Văn Em',
      courseId: '5',
      courseCode: 'MA201',
      courseName: 'Giải tích 2',
      credits: 4,
      midtermScore: 0,
      finalScore: 0,
      assignmentScore: 0,
      totalScore: 0,
      letterGrade: 'F',
      gpa: 0,
      semester: 'HK2',
      year: 2025,
      status: 'pending',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const calculateTotalScore = (midterm: number, final: number, assignment: number): number => {
    return Math.round((midterm * 0.3 + final * 0.5 + assignment * 0.2) * 10) / 10;
  };

  const getLetterGrade = (score: number): string => {
    if (score >= 9.0) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'B+';
    if (score >= 7.0) return 'B';
    if (score >= 6.5) return 'C+';
    if (score >= 5.5) return 'C';
    if (score >= 5.0) return 'D+';
    if (score >= 4.0) return 'D';
    return 'F';
  };

  const getGPA = (letterGrade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
    };
    return gradePoints[letterGrade] || 0.0;
  };

  const handleAdd = () => {
    setEditingGrade(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    form.setFieldsValue(grade);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setGrades(grades.filter(grade => grade.id !== id));
    message.success('Xóa điểm số thành công!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const totalScore = calculateTotalScore(
        values.midtermScore || 0,
        values.finalScore || 0,
        values.assignmentScore || 0
      );
      const letterGrade = getLetterGrade(totalScore);
      const gpa = getGPA(letterGrade);
      
      const newGrade: Grade = {
        id: editingGrade ? editingGrade.id : Date.now().toString(),
        ...values,
        totalScore,
        letterGrade,
        gpa,
        status: totalScore >= 5.0 ? 'passed' : (totalScore > 0 ? 'failed' : 'pending'),
      };

      if (editingGrade) {
        setGrades(grades.map(grade => 
          grade.id === editingGrade.id ? newGrade : grade
        ));
        message.success('Cập nhật điểm số thành công!');
      } else {
        setGrades([...grades, newGrade]);
        message.success('Thêm điểm số thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingGrade(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingGrade(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'green';
      case 'failed':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Đậu';
      case 'failed':
        return 'Rớt';
      case 'pending':
        return 'Chưa có điểm';
      default:
        return status;
    }
  };

  const getGradeColor = (letterGrade: string) => {
    if (letterGrade === 'A+' || letterGrade === 'A') return '#52c41a';
    if (letterGrade === 'B+' || letterGrade === 'B') return '#1890ff';
    if (letterGrade === 'C+' || letterGrade === 'C') return '#faad14';
    if (letterGrade === 'D+' || letterGrade === 'D') return '#fa8c16';
    return '#ff4d4f';
  };

  const filteredGrades = grades.filter(grade =>
    grade.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
    grade.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
    grade.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
    grade.courseCode.toLowerCase().includes(searchText.toLowerCase())
  );

  // Statistics
  const totalGrades = grades.length;
  const passedGrades = grades.filter(g => g.status === 'passed').length;
  const failedGrades = grades.filter(g => g.status === 'failed').length;
  const averageGPA = grades.length > 0 ? 
    Math.round((grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length) * 100) / 100 : 0;

  const columns: ColumnsType<Grade> = [
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 100,
    },
    {
      title: 'Tên sinh viên',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 150,
    },
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
      width: 180,
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
        <span style={{ 
          fontWeight: 'bold',
          color: score >= 5.0 ? '#52c41a' : '#ff4d4f'
        }}>
          {score > 0 ? score.toFixed(1) : '-'}
        </span>
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
      key: 'semester_year',
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa điểm số này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số điểm"
              value={totalGrades}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số điểm đậu"
              value={passedGrades}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số điểm rớt"
              value={failedGrades}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="GPA trung bình"
              value={averageGPA}
              precision={2}
              valueStyle={{ color: averageGPA >= 3.0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="Tìm kiếm điểm số..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm điểm số
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredGrades}
        rowKey="id"
        pagination={{
          total: filteredGrades.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} điểm số`,
        }}
        scroll={{ x: 1800 }}
      />

      <Modal
        title={editingGrade ? 'Chỉnh sửa điểm số' : 'Thêm điểm số mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        okText={editingGrade ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            midtermScore: 0,
            finalScore: 0,
            assignmentScore: 0,
            year: new Date().getFullYear(),
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="studentCode"
              label="Mã sinh viên"
              rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập mã sinh viên" />
            </Form.Item>

            <Form.Item
              name="studentName"
              label="Tên sinh viên"
              rules={[{ required: true, message: 'Vui lòng nhập tên sinh viên!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập tên sinh viên" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="courseCode"
              label="Mã môn học"
              rules={[{ required: true, message: 'Vui lòng nhập mã môn học!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập mã môn học" />
            </Form.Item>

            <Form.Item
              name="courseName"
              label="Tên môn học"
              rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập tên môn học" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="credits"
              label="Số tín chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                max={6}
                placeholder="Số tín chỉ"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="semester"
              label="Học kỳ"
              rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn học kỳ">
                <Option value="HK1">Học kỳ 1</Option>
                <Option value="HK2">Học kỳ 2</Option>
                <Option value="HK3">Học kỳ hè</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="year"
              label="Năm học"
              rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn năm học">
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="midtermScore"
              label="Điểm giữa kỳ (30%)"
              rules={[
                { required: true, message: 'Vui lòng nhập điểm giữa kỳ!' },
                { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0 đến 10!' }
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={10}
                step={0.1}
                placeholder="Điểm giữa kỳ"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="finalScore"
              label="Điểm cuối kỳ (50%)"
              rules={[
                { required: true, message: 'Vui lòng nhập điểm cuối kỳ!' },
                { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0 đến 10!' }
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={10}
                step={0.1}
                placeholder="Điểm cuối kỳ"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="assignmentScore"
              label="Điểm bài tập (20%)"
              rules={[
                { required: true, message: 'Vui lòng nhập điểm bài tập!' },
                { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0 đến 10!' }
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={10}
                step={0.1}
                placeholder="Điểm bài tập"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeManagement;