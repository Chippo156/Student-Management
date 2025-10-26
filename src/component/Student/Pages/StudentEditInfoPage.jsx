import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Spin,
  Row,
  Col,
  Avatar,
  Typography,
  Divider,
  Card,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ContactsOutlined,
} from '@ant-design/icons';
import { Paper, Box } from '@mui/material';
import dayjs from 'dayjs';
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import { familyRelationshipService } from '../../../service/familyRelationshipService';

const { Option } = Select;
const { Title, Text } = Typography;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const StudentEditInfoPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [father, setFather] = useState({});
  const [mother, setMother] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserInfo();
        setStudentInfo(data);

        // Lấy thông tin người thân (cha, mẹ)
        let fatherData = {};
        let motherData = {};
        try {
          const familyRes =
            await familyRelationshipService.getFamilyRelationshipsByStudent();
          const familyList = Array.isArray(familyRes)
            ? familyRes
            : familyRes?.data || [];
          fatherData =
            familyList.find((item) => item.relationshipTypeName === 'Cha') ||
            {};
          motherData =
            familyList.find((item) => item.relationshipTypeName === 'Mẹ') || {};
        } catch {
          // Nếu lỗi thì để rỗng
        }
        setFather(fatherData);
        setMother(motherData);

        form.setFieldsValue({
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          dateOfBirth: data.user.dateOfBirth
            ? dayjs(data.user.dateOfBirth)
            : null,
          gender:
            data.user.gender === 0
              ? 'Nam'
              : data.user.gender === 1
                ? 'Nữ'
                : 'Khác',
          address: data.user.address,
          placeOfBirth: data.user.placeOfBirth,
          religion: data.user.religion,
          fatherName: fatherData.fullName || '',
          fatherPhone: fatherData.phone || '',
          motherName: motherData.fullName || '',
          motherPhone: motherData.phone || '',
        });
      } catch (err) {
        message.error('Không thể lấy thông tin sinh viên!');
      }
      setLoading(false);
    };
    fetchInfo();
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await userService.updateProfile({
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : '',
        gender: values.gender === 'Nam' ? 0 : values.gender === 'Nữ' ? 1 : 2,
      });
      message.success('Cập nhật thông tin thành công!');
      navigate('/student/info');
    } catch (err) {
      message.error('Cập nhật thất bại!');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  return (
    <Box sx={{ mx: 'auto', mt: 4, maxWidth: 950 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Row gutter={24} align="middle" style={{ marginBottom: 32 }}>
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={100}
              src={studentInfo?.user?.avatarUrl}
              icon={<UserOutlined />}
              style={{ background: '#e6f7ff', marginBottom: 12 }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {studentInfo?.user?.fullName}
            </Title>
            <Text type="secondary">{studentInfo?.mssv}</Text>
          </Col>
          <Col xs={24} md={18}>
            <Title level={3} style={{ marginBottom: 0 }}>
              Chỉnh sửa thông tin sinh viên
            </Title>
            <Text type="secondary">
              Vui lòng cập nhật đầy đủ và chính xác thông tin cá nhân của bạn.
            </Text>
          </Col>
        </Row>
        <Divider />
        <Card
          title="Thông tin cá nhân"
          bordered={false}
          style={{ marginBottom: 24, background: '#fafcff' }}
        >
          <Form
            {...formItemLayout}
            form={form}
            layout="horizontal"
            onFinish={handleSave}
            style={{ marginTop: 16 }}
            labelAlign="left"
          >
            <Form.Item
              name="fullName"
              label={
                <span>
                  <UserOutlined /> Họ và tên
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item
              name="email"
              label={
                <span>
                  <MailOutlined /> Email
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Form.Item
              name="phone"
              label={
                <span>
                  <PhoneOutlined /> Số điện thoại
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <Select>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="address"
              label={
                <span>
                  <HomeOutlined /> Địa chỉ
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
            </Form.Item>
            <Form.Item name="placeOfBirth" label="Nơi sinh">
              <Input placeholder="Nhập nơi sinh" />
            </Form.Item>
            <Form.Item name="religion" label="Tôn giáo">
              <Input placeholder="Nhập tôn giáo" />
            </Form.Item>
            <Divider />
            <Card
              type="inner"
              title={
                <span>
                  <ContactsOutlined /> Thông tin người thân
                </span>
              }
              style={{ background: '#f6faff' }}
              bordered={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="fatherName" label="Họ tên cha">
                    <Input
                      placeholder="Nhập họ tên cha"
                      value={father?.fullName || ''}
                    />
                  </Form.Item>
                  <Form.Item name="fatherPhone" label="SĐT cha">
                    <Input
                      placeholder="Nhập số điện thoại cha"
                      value={father?.phone || ''}
                    />
                  </Form.Item>
                  <Form.Item label="Năm sinh cha">
                    <Input
                      value={
                        father?.dateOfBirth
                          ? dayjs(father.dateOfBirth).format('DD/MM/YYYY')
                          : ''
                      }
                      placeholder="Năm sinh cha"
                    />
                  </Form.Item>
                  <Form.Item label="Nghề nghiệp cha">
                    <Input
                      value={father?.occupation || ''}
                      placeholder="Nghề nghiệp cha"
                    />
                  </Form.Item>
                  <Form.Item label="Địa chỉ cha">
                    <Input
                      value={father?.address || ''}
                      placeholder="Địa chỉ cha"
                    />
                  </Form.Item>
                  <Form.Item label="Nơi làm việc cha">
                    <Input
                      value={father?.workplace || ''}
                      placeholder="Nơi làm việc cha"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="motherName" label="Họ tên mẹ">
                    <Input
                      placeholder="Nhập họ tên mẹ"
                      value={mother?.fullName || ''}
                    />
                  </Form.Item>
                  <Form.Item name="motherPhone" label="SĐT mẹ">
                    <Input
                      placeholder="Nhập số điện thoại mẹ"
                      value={mother?.phone || ''}
                    />
                  </Form.Item>
                  <Form.Item label="Năm sinh mẹ">
                    <Input
                      value={
                        mother?.dateOfBirth
                          ? dayjs(mother.dateOfBirth).format('DD/MM/YYYY')
                          : ''
                      }
                      placeholder="Năm sinh mẹ"
                    />
                  </Form.Item>
                  <Form.Item label="Nghề nghiệp mẹ">
                    <Input
                      value={mother?.occupation || ''}
                      placeholder="Nghề nghiệp mẹ"
                    />
                  </Form.Item>
                  <Form.Item label="Địa chỉ mẹ">
                    <Input
                      value={mother?.address || ''}
                      placeholder="Địa chỉ mẹ"
                    />
                  </Form.Item>
                  <Form.Item label="Nơi làm việc mẹ">
                    <Input
                      value={mother?.workplace || ''}
                      placeholder="Nơi làm việc mẹ"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <Form.Item
              wrapperCol={{ span: 24 }}
              style={{ textAlign: 'center', marginTop: 32 }}
            >
              <Button
                type="primary"
                htmlType="submit"
                style={{ minWidth: 120, marginRight: 12 }}
              >
                Lưu thay đổi
              </Button>
              <Button
                onClick={() => navigate('/student/info')}
                style={{ minWidth: 120 }}
              >
                Hủy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Paper>
    </Box>
  );
};

export default StudentEditInfoPage;
