import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  message,
  DatePicker,
} from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const { Option } = Select;

const genderOptions = [
  { value: '0', label: 'Nam' },
  { value: '1', label: 'Nữ' },
  { value: '2', label: 'Khác' },
];

const roles = [
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Giảng viên' },
  { value: '3', label: 'Sinh viên' },
  { value: '4', label: 'Super Admin' },
];

const departments = [
  'Công nghệ thông tin',
  'Kinh tế',
  'Ngoại ngữ',
  'Khoa học tự nhiên',
  'Kỹ thuật',
  'Y khoa',
];

const statusOptions = [
  { value: '0', label: 'Hoạt động' },
  { value: '1', label: 'Khóa' },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0[2-9]|84[2-9])[0-9]{8,9}$/;
const idCardRegex = /^[0-9]{9,12}$/;

const CreateUser = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    message.success('Tạo tài khoản thành công!');
    form.resetFields();
  };

  return (
    <Card
      title={
        <span style={{ fontSize: 25 }}>
          <UserAddOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Tạo tài khoản mới
        </span>
      }
      style={{ maxWidth: 1100, margin: '32px auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          {/* 3 columns on PC, 2 on tablet, 1 on mobile */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Bắt buộc nhập tên đăng nhập' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Trạng thái tài khoản"
              name="accountStatus"
              initialValue="0"
            >
              <Select>
                {statusOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Bắt buộc nhập họ tên' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Bắt buộc nhập email' },
                { pattern: emailRegex, message: 'Email không hợp lệ' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: 'Bắt buộc nhập số điện thoại' },
                { pattern: phoneRegex, message: 'Số điện thoại không hợp lệ' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Địa chỉ" name="address">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Địa chỉ tạm trú" name="temporaryAddress">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: 'Bắt buộc chọn giới tính' }]}
            >
              <Select>
                {genderOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Nơi sinh" name="placeOfBirth">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Tôn giáo" name="religion">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: 'Bắt buộc nhập ngày sinh' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="CCCD"
              name="citizenIdCard"
              rules={[
                { required: true, message: 'Bắt buộc nhập CCCD' },
                { pattern: idCardRegex, message: 'CCCD không hợp lệ' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Ngày cấp" name="issuedDate">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Nơi cấp" name="issuedPlace">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Đối tượng" name="object">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Khu vực chính sách" name="policyArea">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Ngày vào Đoàn" name="dateOfJoinUnion">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Ngày vào Đảng" name="dateOfJoinParty">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Số tài khoản" name="bankAccountNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Ngân hàng" name="bankName">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Chủ tài khoản" name="bankAccountHolder">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Dân tộc" name="ethnicity">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Quốc tịch" name="nationality">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Tỉnh quê quán" name="hometownProvince">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Huyện quê quán" name="hometownDistrict">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Xã quê quán" name="hometownWard">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Tỉnh nơi sinh" name="birthProvince">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Huyện nơi sinh" name="birthDistrict">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Xã nơi sinh" name="birthWard">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Tỉnh giấy khai sinh" name="birthCertProvince">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Huyện giấy khai sinh" name="birthCertDistrict">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Xã giấy khai sinh" name="birthCertWard">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Tỉnh thường trú" name="permanentProvince">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Huyện thường trú" name="permanentDistrict">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Xã thường trú" name="permanentWard">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Số BHYT" name="healthInsuranceNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Nơi đăng ký BHYT"
              name="healthInsuranceRegistrationPlace"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: 'Bắt buộc chọn vai trò' }]}
            >
              <Select>
                {roles.map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Khoa/Phòng ban" name="department">
              <Select allowClear>
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              shouldUpdate={(prev, curr) => prev.role !== curr.role}
              noStyle
            >
              {({ getFieldValue }) =>
                getFieldValue('role') === '3' ? (
                  <Form.Item label="Mã sinh viên" name="studentId">
                    <Input placeholder="VD: SV2024001" />
                  </Form.Item>
                ) : (
                  <Form.Item label="Mã nhân viên" name="employeeId">
                    <Input placeholder="VD: NV2024001" />
                  </Form.Item>
                )
              }
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Bắt buộc nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Bắt buộc xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Mật khẩu xác nhận không khớp');
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ textAlign: 'right' }}>
          <Button
            htmlType="reset"
            style={{ marginRight: 8 }}
            onClick={() => form.resetFields()}
          >
            Làm mới
          </Button>
          <Button type="primary" htmlType="submit">
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateUser;
