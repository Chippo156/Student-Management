import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Tag,
  Divider,
  Progress,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentInfo {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  avatar: string;
  faculty: string;
  major: string;
  className: string;
  academicYear: string;
  enrollmentDate: string;
  status: string;
  gpa: number;
  totalCredits: number;
  completedCredits: number;
}

const StudentInfoPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    id: '1',
    studentCode: 'SV21112551',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@student.edu.vn',
    phone: '0123456789',
    dateOfBirth: '2003-10-08',
    gender: 'Nam',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=1',
    faculty: 'Công nghệ thông tin',
    major: 'Kỹ thuật phần mềm',
    className: 'KTPM17C',
    academicYear: '2021-2025',
    enrollmentDate: '2021-09-01',
    status: 'Đang học',
    gpa: 3.45,
    totalCredits: 140,
    completedCredits: 95,
  });

  const handleEdit = () => {
    form.setFieldsValue({
      ...studentInfo,
      dateOfBirth: dayjs(studentInfo.dateOfBirth),
      enrollmentDate: dayjs(studentInfo.enrollmentDate),
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setStudentInfo({
        ...studentInfo,
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        enrollmentDate: values.enrollmentDate.format('YYYY-MM-DD'),
      });
      setIsModalVisible(false);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success('Tải ảnh thành công!');
      } else if (info.file.status === 'error') {
        message.error('Tải ảnh thất bại!');
      }
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Thông tin sinh viên</Title>
      
      <Row gutter={24}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar
              size={120}
              src={studentInfo.avatar}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {studentInfo.fullName}
            </Title>
            <Text type="secondary">{studentInfo.studentCode}</Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {studentInfo.status}
              </Tag>
            </div>
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Email:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{studentInfo.email}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Số điện thoại:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{studentInfo.phone}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Địa chỉ:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{studentInfo.address}</Text>
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              style={{ width: '100%', marginTop: 16 }}
            >
              Chỉnh sửa thông tin
            </Button>
          </Card>
        </Col>

        {/* Details Cards */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Mã sinh viên" span={1}>
                <Text strong>{studentInfo.studentCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên" span={1}>
                <Text strong>{studentInfo.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh" span={1}>
                {dayjs(studentInfo.dateOfBirth).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính" span={1}>
                {studentInfo.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                <Text copyable>{studentInfo.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                <Text copyable>{studentInfo.phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {studentInfo.address}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin học tập">
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Khoa" span={1}>
                <Tag color="green">{studentInfo.faculty}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành" span={1}>
                <Tag color="blue">{studentInfo.major}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Lớp" span={1}>
                <Tag color="purple">{studentInfo.className}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khóa học" span={1}>
                {studentInfo.academicYear}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhập học" span={1}>
                {dayjs(studentInfo.enrollmentDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={studentInfo.status === 'Đang học' ? 'green' : 'orange'}>
                  {studentInfo.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="GPA" span={1}>
                <Text strong style={{ color: studentInfo.gpa >= 3.5 ? '#52c41a' : '#faad14' }}>
                  {studentInfo.gpa}/4.0
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tín chỉ" span={1}>
                <Text strong>{studentInfo.completedCredits}/{studentInfo.totalCredits}</Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Progress Section */}
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Tiến độ học tập</Title>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                      {Math.round((studentInfo.completedCredits / studentInfo.totalCredits) * 100)}%
                    </div>
                    <div style={{ color: '#666' }}>Hoàn thành chương trình</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                      {studentInfo.gpa}
                    </div>
                    <div style={{ color: '#666' }}>GPA tích lũy</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                      {Math.ceil((studentInfo.totalCredits - studentInfo.completedCredits) / 15)}
                    </div>
                    <div style={{ color: '#666' }}>Học kỳ còn lại</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin sinh viên"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avatar" label="Ảnh đại diện">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentInfoPage;