import React, { useState, useEffect } from 'react';
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
  Spin,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { userService } from '../../../service/userService';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentInfoPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ API khi mount
  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserInfo();
        setStudentInfo({
          id: data.studentId,
          studentCode: data.mssv,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          dateOfBirth: data.user.dateOfBirth,
          gender: data.user.gender === 0 ? "Nam" : data.user.gender === 1 ? "Nữ" : "Khác",
          address: data.user.address,
          avatar: data.user.avatarUrl,
          faculty: data.departmentName,
          major: data.programName,
          className: data.className,
          academicYear: data.yearOfAddmision
            ? `${data.yearOfAddmision}-${data.yearOfAddmision + 4}`
            : "",
          enrollmentDate: data.enrollmentDate || "",
          status: data.status || "Đang học",
          gpa: data.gpa ?? 0,
          totalCredits: data.totalCredits ?? 0,
          completedCredits: data.completedCredits ?? 0,
          placeOfBirth: data.user.placeOfBirth,
          religion: data.user.religion,
          citizenIdCard: data.user.citizenIdCard,
          issuedDate: data.user.issuedDate,
          object: data.user.object,
          policyArea: data.user.policyArea,
          dateOfJoinUnion: data.user.dateOfJoinUnion,
          dateOfJoinParty: data.user.dateOfJoinParty,
          accountNumber: data.user.accountNumber,
          bankName: data.user.bankName,
          branch: data.user.branch,
          accountHolderName: data.user.accountHolderName,
          accountStatus: data.user.accountStatus,
        });
      } catch (err) {
        message.error("Không thể lấy thông tin sinh viên!");
        setStudentInfo(null);
      }
      setLoading(false);
    };
    fetchInfo();
  }, []);

  // Xử lý mở modal chỉnh sửa
  const handleEdit = () => {
    if (!studentInfo) return;
    form.setFieldsValue({
      ...studentInfo,
      dateOfBirth: studentInfo.dateOfBirth ? dayjs(studentInfo.dateOfBirth) : null,
      enrollmentDate: studentInfo.enrollmentDate ? dayjs(studentInfo.enrollmentDate) : null,
    });
    setIsModalVisible(true);
  };

  // Xử lý lưu thông tin chỉnh sửa
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Gọi API cập nhật nếu có
      setStudentInfo({
        ...studentInfo,
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : "",
        enrollmentDate: values.enrollmentDate ? values.enrollmentDate.format('YYYY-MM-DD') : "",
      });
      setIsModalVisible(false);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      // Validation failed
    }
  };

  // Xử lý upload avatar
  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    showUploadList: false,
    onChange(info: any) {
      if (info.file.status === 'done') {
        setStudentInfo((prev: any) => ({
          ...prev,
          avatar: info.file.response.url,
        }));
        message.success('Tải ảnh thành công!');
      } else if (info.file.status === 'error') {
        message.error('Tải ảnh thất bại!');
      }
    },
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#faad14' }}>
        Không có dữ liệu sinh viên!
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Thông tin sinh viên</Title>
      <Row gutter={24} wrap>
        {/* Profile Card */}
        <Col xs={24} md={8} style={{ minWidth: 0 }}>
          <Card style={{ textAlign: 'center', marginBottom: 24, height: '100%' }}>
            <Avatar
              size={120}
              src={studentInfo.avatar}
              icon={<UserOutlined />}
              style={{ marginBottom: 16, background: '#e6f7ff' }}
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
        <Col xs={24} md={16} style={{ minWidth: 0 }}>
          <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Mã sinh viên">{studentInfo.studentCode}</Descriptions.Item>
              <Descriptions.Item label="Họ và tên">{studentInfo.fullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">{studentInfo.dateOfBirth ? dayjs(studentInfo.dateOfBirth).format('DD/MM/YYYY') : ""}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{studentInfo.gender}</Descriptions.Item>
              <Descriptions.Item label="Nơi sinh">{studentInfo.placeOfBirth}</Descriptions.Item>
              <Descriptions.Item label="Tôn giáo">{studentInfo.religion}</Descriptions.Item>
              <Descriptions.Item label="Số CCCD">{studentInfo.citizenIdCard}</Descriptions.Item>
              <Descriptions.Item label="Ngày cấp CCCD">{studentInfo.issuedDate ? dayjs(studentInfo.issuedDate).format('DD/MM/YYYY') : ""}</Descriptions.Item>
              <Descriptions.Item label="Đối tượng">{studentInfo.object}</Descriptions.Item>
              <Descriptions.Item label="Khu vực chính sách">{studentInfo.policyArea}</Descriptions.Item>
              <Descriptions.Item label="Ngày vào Đoàn">{studentInfo.dateOfJoinUnion ? dayjs(studentInfo.dateOfJoinUnion).format('DD/MM/YYYY') : ""}</Descriptions.Item>
              <Descriptions.Item label="Ngày vào Đảng">{studentInfo.dateOfJoinParty ? dayjs(studentInfo.dateOfJoinParty).format('DD/MM/YYYY') : ""}</Descriptions.Item>
              <Descriptions.Item label="Email"><Text copyable>{studentInfo.email}</Text></Descriptions.Item>
              <Descriptions.Item label="Số điện thoại"><Text copyable>{studentInfo.phone}</Text></Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{studentInfo.address}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin học tập" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Khoa">
                <Tag color="green" style={{ maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
                  {studentInfo.faculty}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành">
                <Tag color="blue" style={{ maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
                  {studentInfo.major}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                <Tag color="purple">{studentInfo.className}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khóa học">{studentInfo.academicYear}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhập học">{studentInfo.enrollmentDate ? dayjs(studentInfo.enrollmentDate).format('DD/MM/YYYY') : ""}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={studentInfo.status === 'Đang học' ? 'green' : 'orange'}>{studentInfo.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="GPA">
                <Text strong style={{ color: studentInfo.gpa >= 3.5 ? '#52c41a' : '#faad14' }}>{studentInfo.gpa}/4.0</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tín chỉ">
                <Text strong>{studentInfo.completedCredits}/{studentInfo.totalCredits}</Text>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Tiến độ học tập</Title>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                      {studentInfo.totalCredits > 0
                        ? Math.round((studentInfo.completedCredits / studentInfo.totalCredits) * 100)
                        : 0}
                      %
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
                      {studentInfo.totalCredits > 0
                        ? Math.ceil((studentInfo.totalCredits - studentInfo.completedCredits) / 15)
                        : 0}
                    </div>
                    <div style={{ color: '#666' }}>Học kỳ còn lại</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          <Card title="Thông tin tài khoản ngân hàng">
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Số tài khoản">{studentInfo.accountNumber}</Descriptions.Item>
              <Descriptions.Item label="Ngân hàng">{studentInfo.bankName}</Descriptions.Item>
              <Descriptions.Item label="Chi nhánh">{studentInfo.branch}</Descriptions.Item>
              <Descriptions.Item label="Chủ tài khoản">{studentInfo.accountHolderName}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái tài khoản">
                <Tag color={studentInfo.accountStatus === 1 ? 'green' : 'red'}>
                  {studentInfo.accountStatus === 1 ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
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