import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  Button,
  message,
  Card,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { Box } from '@mui/material';
import { lecturerService } from '../../../service/lecturerService';
import facultyService from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';
const { Option } = Select;
const { Title } = Typography;

const genderOptions = [
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Khác' },
];

const academicTitleOptions = [
  { value: 'Thạc sĩ', label: 'Thạc sĩ' },
  { value: 'Tiến sĩ', label: 'Tiến sĩ' },
  { value: 'Phó giáo sư', label: 'Phó giáo sư' },
  { value: 'Giáo sư', label: 'Giáo sư' },
];

const positionOptions = [
  { value: 'Giảng viên', label: 'Giảng viên' },
  { value: 'Giáo sư', label: 'Giáo sư' },
  { value: 'Trợ giảng', label: 'Trợ giảng' },
];

// Regex patterns
const phoneRegex = /^(0|\+84)(\d{9,10})$/;
const cccdRegex = /^\d{9,12}$/;

/**
 * TeacherCreateModal - Modal tạo giảng viên mới
 */
const TeacherCreateModal = ({ open, onCancel, onSave, loading }) => {
  const theme = useTheme();
  const [form] = Form.useForm();
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(undefined);

  const colors = {
    primary: theme.palette.primary.main,
    primaryLight: alpha(theme.palette.primary.main, 0.1),
  };

  // Load faculties
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await facultyService.getFacultiesDropdown();
        if (res && Array.isArray(res)) {
          setFaculties(res);
        }
      } catch (error) {
        console.error('Failed to fetch faculties:', error);
      }
    };
    fetchFaculties();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (selectedFaculty) {
      const fetchDepartments = async () => {
        const res =
          await departmentService.getDepartmentsDropdownByFaculty(
            selectedFaculty
          );
        if (res && Array.isArray(res)) {
          setDepartments(res);
        } else {
          setDepartments([]);
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]);
    }
    form.setFieldsValue({ departmentId: undefined });
  }, [selectedFaculty, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        departmentId: values.departmentId,
        academicTitle: values.academicTitle || null,
        position: values.position || null,
        joiningDate: values.joiningDate
          ? values.joiningDate.format('YYYY-MM-DD')
          : null,
        userCreateRequest: {
          fullName: values.fullName,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
          email: values.email || null,
          phone: values.phone || null,
          address: values.address || null,
          temporaryAddress: values.temporaryAddress || null,
          ethnicity: values.ethnicity || null,
          religion: values.religion || null,
          nationality: values.nationality || null,
          citizenIdCard: values.citizenIdCard || null,
          issuedDate: values.issuedDate
            ? values.issuedDate.format('YYYY-MM-DD')
            : null,
          issuedPlace: values.issuedPlace || null,
          placeOfBirth: values.placeOfBirth || null,
        },
      };

      const result = await lecturerService.createLecturer(payload);
      if (result) {
        message.success('Tạo giảng viên mới thành công!');
        form.resetFields();
        setSelectedFaculty(undefined);
        setDepartments([]);
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to create lecturer:', error);
      message.error('Tạo giảng viên mới thất bại!');
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedFaculty(undefined);
    setDepartments([]);
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty(facultyId);
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      title={
        <div style={{ fontWeight: 700, fontSize: 22, color: colors.primary }}>
          <PlusOutlined /> Tạo giảng viên mới
        </div>
      }
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      destroyOnClose
    >
      <div style={{ borderRadius: 16, padding: 32 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ gender: 1 }}
        >
          {/* Thông tin cơ bản */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            👨‍🏫 Thông tin cơ bản
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập họ tên' },
                    { min: 2, max: 100, message: 'Họ tên từ 2-100 ký tự' },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên đầy đủ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                    { required: true, message: 'Bắt buộc chọn giới tính' },
                  ]}
                >
                  <Select placeholder="Chọn giới tính">
                    {genderOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập ngày sinh' },
                  ]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                >
                  <Input placeholder="Nhập địa chỉ email" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    {
                      pattern: phoneRegex,
                      message: 'Số điện thoại không hợp lệ',
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ngày bắt đầu công tác" name="joiningDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Thông tin địa chỉ */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            🏠 Thông tin địa chỉ
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Địa chỉ thường trú" name="address">
                  <Input placeholder="Nhập địa chỉ thường trú" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Địa chỉ tạm trú" name="temporaryAddress">
                  <Input placeholder="Nhập địa chỉ tạm trú" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Nơi sinh" name="placeOfBirth">
                  <Input placeholder="Nhập nơi sinh" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Dân tộc" name="ethnicity">
                  <Input placeholder="Nhập dân tộc" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tôn giáo" name="religion">
                  <Input placeholder="Nhập tôn giáo" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quốc tịch" name="nationality">
                  <Input placeholder="Nhập quốc tịch" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Giấy tờ cá nhân */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            🪪 Giấy tờ cá nhân
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số CCCD"
                  name="citizenIdCard"
                  rules={[
                    { pattern: cccdRegex, message: 'CCCD phải là 9-12 số' },
                  ]}
                >
                  <Input placeholder="Nhập số căn cước công dân" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ngày cấp" name="issuedDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Nơi cấp" name="issuedPlace">
                  <Input placeholder="Nhập nơi cấp CCCD" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Thông tin công tác */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            💼 Thông tin công tác
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Khoa"
                  name="facultyId"
                  rules={[{ required: true, message: 'Bắt buộc chọn khoa' }]}
                >
                  <Select
                    placeholder="Chọn khoa"
                    onChange={handleFacultyChange}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {faculties.map((f) => (
                      <Option key={f.facultyId} value={f.facultyId}>
                        {f.facultyName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Bộ môn/Phòng ban"
                  name="departmentId"
                  rules={[
                    {
                      required: true,
                      message: 'Bắt buộc chọn bộ môn/phòng ban',
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn bộ môn/phòng ban"
                    disabled={!selectedFaculty}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {departments.map((d) => (
                      <Option key={d.departmentId} value={d.departmentId}>
                        {d.departmentName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Học hàm" name="academicTitle">
                  <Select placeholder="Chọn học hàm" allowClear>
                    {academicTitleOptions.map((title) => (
                      <Option key={title.value} value={title.value}>
                        {title.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Chức vụ" name="position">
                  <Select placeholder="Chọn chức vụ" allowClear>
                    {positionOptions.map((pos) => (
                      <Option key={pos.value} value={pos.value}>
                        {pos.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Buttons */}
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={handleReset} style={{ marginRight: 8 }}>
              Làm mới
            </Button>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo giảng viên
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default TeacherCreateModal;
