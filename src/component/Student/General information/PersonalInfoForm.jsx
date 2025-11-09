import React from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Button, Card } from 'antd';
import { useTheme } from '@mui/material/styles';
import AddressSelector from './AddressSelector';

const { Option } = Select;

/**
 * PersonalInfoForm - Form chỉnh sửa thông tin cá nhân
 */
const PersonalInfoForm = ({ form, onSave, onCancel, provinces, studentInfo }) => {
  const theme = useTheme();

  return (
    <Card
      title="Cập nhật thông tin cá nhân"
      style={{
        background: theme.palette.background.paper,
        marginBottom: 20,
        borderColor: theme.palette.divider,
      }}
      bordered={false}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        {/* Thông tin cơ bản */}
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Nhập họ tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: 'Chọn ngày sinh' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Dân tộc" name="ethnicity">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: 'Chọn giới tính' }]}
            >
              <Select>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Thông tin căn cước và liên hệ */}
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="Quốc tịch" name="nationality">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Số CCCD/CMND" name="citizenIdCard">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ngày cấp" name="issuedDate">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Nơi cấp" name="issuedPlace">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Mã số BHYT" name="healthInsuranceNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Nơi đăng ký BHYT" name="healthInsuranceRegistrationPlace">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Quê quán */}
        <Row gutter={24}>
          <AddressSelector
            label="Quê quán"
            provinceField="hometownProvince"
            districtField="hometownDistrict"
            wardField="hometownWard"
            provinces={provinces}
            form={form}
            initialValues={{
              province: studentInfo?.hometownProvince,
              district: studentInfo?.hometownDistrict,
              ward: studentInfo?.hometownWard,
            }}
          />
        </Row>

        {/* Nơi sinh */}
        <Row gutter={24}>
          <AddressSelector
            label="Nơi sinh"
            provinceField="birthProvince"
            districtField="birthDistrict"
            wardField="birthWard"
            provinces={provinces}
            form={form}
            initialValues={{
              province: studentInfo?.birthProvince,
              district: studentInfo?.birthDistrict,
              ward: studentInfo?.birthWard,
            }}
          />
        </Row>

        {/* Nơi cấp giấy khai sinh */}
        <Row gutter={24}>
          <AddressSelector
            label="Nơi cấp giấy khai sinh"
            provinceField="birthCertProvince"
            districtField="birthCertDistrict"
            wardField="birthCertWard"
            provinces={provinces}
            form={form}
            initialValues={{
              province: studentInfo?.birthCertProvince,
              district: studentInfo?.birthCertDistrict,
              ward: studentInfo?.birthCertWard,
            }}
          />
        </Row>

        {/* Nơi đăng ký hộ khẩu thường trú */}
        <Row gutter={24}>
          <AddressSelector
            label="Nơi đăng ký hộ khẩu thường trú"
            provinceField="permanentProvince"
            districtField="permanentDistrict"
            wardField="permanentWard"
            provinces={provinces}
            form={form}
            initialValues={{
              province: studentInfo?.permanentProvince,
              district: studentInfo?.permanentDistrict,
              ward: studentInfo?.permanentWard,
            }}
          />
        </Row>

        {/* Địa chỉ */}
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="Địa chỉ tạm trú (nếu có)" name="temporaryAddress">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="Địa chỉ liên hệ" name="address">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" htmlType="submit" style={{ minWidth: 120, marginRight: 8 }}>
            Lưu
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </div>
      </Form>
    </Card>
  );
};

export default PersonalInfoForm;
