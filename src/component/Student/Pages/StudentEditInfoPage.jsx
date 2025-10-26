import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Tabs,
  Card,
  Row,
  Col,
  message,
  Spin,
  Divider,
  Checkbox,
} from 'antd';
import { Box, Paper } from '@mui/material';
import { userService } from '../../../service/userService';
import { familyRelationshipService } from '../../../service/familyRelationshipService';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TabPane } = Tabs;

const StudentEditInfoPage = () => {
  const [formPersonal] = Form.useForm();
  const [formFamily] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({});
  const [familyData, setFamilyData] = useState({
    father: {},
    mother: {},
    guardian: {},
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userRes = await userService.getUserInfo();
        setStudentInfo(userRes?.user || {});

        const familyRes =
          await familyRelationshipService.getFamilyRelationshipsByStudent();
        const familyList = Array.isArray(familyRes)
          ? familyRes
          : familyRes?.data || [];

        const father =
          familyList.find((i) => i.relationshipTypeName === 'Cha') || {};
        const mother =
          familyList.find((i) => i.relationshipTypeName === 'Mẹ') || {};
        const guardian =
          familyList.find((i) => i.relationshipTypeName === 'Người giám hộ') ||
          {};

        setFamilyData({ father, mother, guardian });

        formPersonal.setFieldsValue({
          fullName: userRes?.user?.fullName,
          email: userRes?.user?.email,
          phone: userRes?.user?.phone,
          dateOfBirth: userRes?.user?.dateOfBirth
            ? dayjs(userRes?.user?.dateOfBirth)
            : null,
          gender:
            userRes?.user?.gender === 0
              ? 'Nam'
              : userRes?.user?.gender === 1
                ? 'Nữ'
                : 'Khác',
          address: userRes?.user?.address,
          religion: userRes?.user?.religion,
          placeOfBirth: userRes?.user?.placeOfBirth,
        });

        formFamily.setFieldsValue({
          fatherName: father?.fullName,
          fatherPhone: father?.phone,
          fatherDOB: father?.dateOfBirth
            ? dayjs(father?.dateOfBirth)
            : undefined,
          motherName: mother?.fullName,
          motherPhone: mother?.phone,
          motherDOB: mother?.dateOfBirth
            ? dayjs(mother?.dateOfBirth)
            : undefined,
          guardianName: guardian?.fullName,
          guardianPhone: guardian?.phone,
        });
      } catch (error) {
        message.error('Không thể tải dữ liệu sinh viên!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formPersonal, formFamily]);

  const handleSavePersonal = async () => {
    try {
      const values = await formPersonal.validateFields();
      await userService.updateProfile({
        ...values,
        gender: values.gender === 'Nam' ? 0 : values.gender === 'Nữ' ? 1 : 2,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : null,
      });
      message.success('Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      message.error('Cập nhật thông tin thất bại!');
    }
  };

  const handleSaveFamily = async () => {
    try {
      const values = await formFamily.validateFields();
      // Giả lập lưu API (bạn có thể map sang familyRelationshipService)
      console.log('Gia đình:', values);
      message.success('Cập nhật thông tin gia đình thành công!');
    } catch {
      message.error('Cập nhật thất bại!');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 20 }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  return (
    <Box sx={{ mx: 'auto', mt: 4, maxWidth: 1100 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Tabs defaultActiveKey="1">
          {/* TAB 1 - THÔNG TIN CÁ NHÂN */}
          <TabPane tab="Thông tin cá nhân" key="1">
            <Card
              title="Cập nhật thông tin cá nhân"
              style={{ background: '#fafcff', marginBottom: 20 }}
              bordered={false}
            >
              <Form
                form={formPersonal}
                layout="vertical"
                onFinish={handleSavePersonal}
              >
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
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
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

                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Quốc tịch" name="nationality">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số CCCD/CMND" name="idNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Ngày cấp" name="idDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nơi cấp" name="idPlace">
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
                    <Form.Item label="Mã số BHYT" name="healthInsurance">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Nơi đăng ký KCB (mới) - Bệnh viện"
                      name="hospital"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Quê quán - Tỉnh/Thành phố"
                      name="hometownProvince"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Quê quán - Huyện/Quận"
                      name="hometownDistrict"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Quê quán - Xã/Phường" name="hometownWard">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi sinh - Tỉnh/Thành phố"
                      name="birthProvince"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi sinh - Huyện/Quận"
                      name="birthDistrict"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Nơi sinh - Xã/Phường" name="birthWard">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi cấp giấy khai sinh - Tỉnh/Thành phố"
                      name="birthCertProvince"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi cấp giấy khai sinh - Huyện/Quận"
                      name="birthCertDistrict"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi cấp giấy khai sinh - Xã/Phường"
                      name="birthCertWard"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi đăng ký hộ khẩu thường trú - Tỉnh/Thành phố"
                      name="permanentProvince"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi đăng ký hộ khẩu thường trú - Huyện/Quận"
                      name="permanentDistrict"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi đăng ký hộ khẩu thường trú - Xã/Phường"
                      name="permanentWard"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ tạm trú (nếu có)"
                      name="temporaryAddress"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item label="Địa chỉ liên hệ" name="contactAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ minWidth: 120, marginRight: 8 }}
                  >
                    Lưu
                  </Button>
                  <Button onClick={() => navigate('/student/info')}>Hủy</Button>
                </div>
              </Form>
            </Card>
          </TabPane>

          {/* TAB 2 - QUAN HỆ GIA ĐÌNH */}
          <TabPane tab="Quan hệ gia đình" key="2">
            <Form
              form={formFamily}
              layout="vertical"
              onFinish={handleSaveFamily}
            >
              {/* CHA */}
              <Card
                title="Thông tin Cha"
                style={{ background: '#f7fbff', marginBottom: 16 }}
                bordered={false}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Họ và tên" name="fatherName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Ngày sinh" name="fatherDOB">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số CMND" name="fatherIdNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nơi cấp CMND" name="fatherIdPlace">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Ngày cấp CMND" name="fatherIdDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số điện thoại" name="fatherPhone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nghề nghiệp" name="fatherJob">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Hộ khẩu thường trú" name="fatherAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Tỉnh/Thành phố" name="fatherProvince">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Huyện/Quận" name="fatherDistrict">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Xã/Phường" name="fatherWard">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Địa chỉ" name="fatherDetailAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item name="fatherIsDead" valuePropName="checked">
                      <Checkbox>Đã mất</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="fatherIsHouseholdHead"
                      valuePropName="checked"
                    >
                      <Checkbox>Là chủ hộ</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              {/* MẸ */}
              <Card
                title="Thông tin Mẹ"
                style={{ background: '#f7fbff', marginBottom: 16 }}
                bordered={false}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Họ và tên" name="motherName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Ngày sinh" name="motherDOB">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số CMND" name="motherIdNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nơi cấp CMND" name="motherIdPlace">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Ngày cấp CMND" name="motherIdDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số điện thoại" name="motherPhone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nghề nghiệp" name="motherJob">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Hộ khẩu thường trú" name="motherAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Tỉnh/Thành phố" name="motherProvince">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Huyện/Quận" name="motherDistrict">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Xã/Phường" name="motherWard">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Địa chỉ" name="motherDetailAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item name="motherIsDead" valuePropName="checked">
                      <Checkbox>Đã mất</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="motherIsHouseholdHead"
                      valuePropName="checked"
                    >
                      <Checkbox>Là chủ hộ</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              {/* NGƯỜI GIÁM HỘ */}
              <Divider />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ minWidth: 120, marginRight: 8 }}
                >
                  Lưu
                </Button>
                <Button onClick={() => navigate('/student/info')}>Hủy</Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Paper>
    </Box>
  );
};

export default StudentEditInfoPage;
