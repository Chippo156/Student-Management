import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  DatePicker,
  Divider,
  Typography,
  message,
} from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { Box } from '@mui/material';
import { userService } from '../../../service/userService';
import facultyService from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';
import { classService } from '../../../service/classService';

const { Option } = Select;
const { Title } = Typography;

const genderOptions = [
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Khác' },
];

const roleOptions = [
  { value: 1, label: 'Admin' },
  { value: 3, label: 'Giảng viên' },
  { value: 2, label: 'Sinh viên' },
];

const academicTitleOptions = [
  { value: 'Thạc sĩ', label: 'Thạc sĩ' },
  { value: 'Tiến sĩ', label: 'Tiến sĩ' },
  { value: 'Phó giáo sư', label: 'Phó giáo sư' },
  { value: 'Giáo sư', label: 'Giáo sư' },
];

const positionOptions = [
  { value: 'Giảng viên', label: 'Giảng viên' },
  { value: 'Trưởng khoa', label: 'Trưởng khoa' },
  { value: 'Phó khoa', label: 'Phó khoa' },
];

// Regex patterns
const usernameRegex = /^[a-zA-Z0-9_]{4,32}$/;
const phoneRegex = /^(0|\+84)(\d{9,10})$/;
const cccdRegex = /^\d{9,12}$/;

const CreateUser = () => {
  const [form] = Form.useForm();
  const [roleId, setRoleId] = useState(1);

  // Dropdown state
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  // Selected for dropdown
  const [selectedFaculty, setSelectedFaculty] = useState(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState(undefined);

  // Load faculties on mount
  useEffect(() => {
    const fetchFaculties = async () => {
      const res = await facultyService.getFacultiesDropdown();
      if (res && Array.isArray(res)) {
        setFaculties(res);
      }
    };
    fetchFaculties();
  }, []);

  // Load departments when faculty changes (for lecturer)
  useEffect(() => {
    if (selectedFaculty) {
      const fetchDepartments = async () => {
        const res =
          await departmentService.getDepartmentsDropdownByFaculty(
            selectedFaculty
          );
        console.log(res);

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
    setSelectedDepartment(undefined);
    setClasses([]);
    form.setFieldsValue({ departmentId: undefined, classId: undefined });
  }, [selectedFaculty, form]);

  // Load classes when department changes (for student)
  useEffect(() => {
    if (selectedDepartment) {
      const fetchClasses = async () => {
        const res =
          await classService.getClassesDropdownByDepartment(selectedDepartment);

        if (res && Array.isArray(res)) {
          setClasses(res);
        } else {
          setClasses([]);
        }
      };
      fetchClasses();
    } else {
      setClasses([]);
    }
    form.setFieldsValue({ classId: undefined });
  }, [selectedDepartment, form]);

  // Reset dropdowns when role changes
  useEffect(() => {
    setSelectedFaculty(undefined);
    setDepartments([]);
    setSelectedDepartment(undefined);
    setClasses([]);
    form.setFieldsValue({
      facultyId: undefined,
      departmentId: undefined,
      classId: undefined,
    });
  }, [roleId, form]);

  const onFinish = async (values) => {
    // Build payload
    const payload = {
      username: values.username,
      password: values.password,
      fullName: values.fullName,
      roleId: values.roleId,
      gender: values.gender,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      temporaryAddress: values.temporaryAddress || null,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format('YYYY-MM-DD')
        : null,
      ethnicity: values.ethnicity || null,
      nationality: values.nationality || null,
      citizenIdCard: values.citizenIdCard || null,
      issuedDate: values.issuedDate
        ? values.issuedDate.format('YYYY-MM-DD')
        : null,
      issuedPlace: values.issuedPlace || null,
      healthInsuranceNumber: values.healthInsuranceNumber || null,
      healthInsuranceRegistrationPlace:
        values.healthInsuranceRegistrationPlace || null,
      placeOfBirth: values.placeOfBirth || null,
      religion: values.religion || null,
      object: values.object || null,
      policyArea: values.policyArea || null,
      dateOfJoinUnion: values.dateOfJoinUnion
        ? values.dateOfJoinUnion.format('YYYY-MM-DD')
        : null,
      dateOfJoinParty: values.dateOfJoinParty
        ? values.dateOfJoinParty.format('YYYY-MM-DD')
        : null,
      studentSpecificData:
        values.roleId === 2
          ? {
              classId: values.classId,
              studentStatus: values.studentStatus || null,
              admissionDate: values.admissionDate
                ? values.admissionDate.format('YYYY-MM-DD')
                : null,
              year: values.year || null,
            }
          : undefined,
      lecturerSpecificData:
        values.roleId === 3
          ? {
              departmentId: values.departmentId,
              position: values.position || null,
              academicTitle: values.academicTitle || null,
            }
          : undefined,
    };

    const res = await userService.createUserWithRole(payload);
    if (res) {
      message.success('Tạo tài khoản thành công!');
      form.resetFields();
      setRoleId(1);
      setSelectedFaculty(undefined);
      setDepartments([]);
      setSelectedDepartment(undefined);
      setClasses([]);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      <Card
        title={
          <span style={{ fontSize: 25 }}>
            <UserAddOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Tạo tài khoản mới
          </span>
        }
        style={{
          boxShadow: '0 4px 24px #1677ff22',
          borderRadius: 16,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ roleId: 1, gender: 1 }}
        >
          <Title level={4} style={{ marginBottom: 16, color: '#1677ff' }}>
            🧍 Thông tin cá nhân
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập tên đăng nhập' },
                    {
                      pattern: usernameRegex,
                      message: 'Tên đăng nhập 4-32 ký tự, chỉ chữ, số, _',
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên đăng nhập" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập mật khẩu' },
                    { min: 6, message: 'Tối thiểu 6 ký tự' },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập họ tên' },
                    { min: 2, message: 'Tối thiểu 2 ký tự' },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                    { required: true, message: 'Bắt buộc chọn giới tính' },
                  ]}
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
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập ngày sinh' },
                  ]}
                >
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
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
            </Row>
          </Card>

          <Title level={4} style={{ marginBottom: 16, color: '#1677ff' }}>
            🏠 Thông tin thêm
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Địa chỉ" name="address">
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Địa chỉ tạm trú" name="temporaryAddress">
                  <Input placeholder="Nhập địa chỉ tạm trú" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Nơi sinh" name="placeOfBirth">
                  <Input placeholder="Nhập nơi sinh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Dân tộc" name="ethnicity">
                  <Input placeholder="Nhập dân tộc" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Tôn giáo" name="religion">
                  <Input placeholder="Nhập tôn giáo" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Quốc tịch" name="nationality">
                  <Input placeholder="Nhập quốc tịch" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Title level={4} style={{ marginBottom: 16, color: '#1677ff' }}>
            🪪 Giấy tờ cá nhân
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="CCCD"
                  name="citizenIdCard"
                  rules={[
                    { pattern: cccdRegex, message: 'CCCD phải là 9-12 số' },
                  ]}
                >
                  <Input placeholder="Nhập số CCCD" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Ngày cấp" name="issuedDate">
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Nơi cấp" name="issuedPlace">
                  <Input placeholder="Nhập nơi cấp" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Title level={4} style={{ marginBottom: 16, color: '#1677ff' }}>
            ⚙️ Vai trò người dùng
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Vai trò"
                  name="roleId"
                  rules={[{ required: true, message: 'Bắt buộc chọn vai trò' }]}
                >
                  <Select onChange={(val) => setRoleId(val)}>
                    {roleOptions.map((role) => (
                      <Option key={role.value} value={role.value}>
                        {role.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* --- THÔNG TIN SINH VIÊN --- */}
            {roleId === 2 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 16 }}>
                  🎓 Thông tin sinh viên
                </Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label="Khoa"
                      name="facultyId"
                      rules={[
                        { required: true, message: 'Bắt buộc chọn khoa' },
                      ]}
                    >
                      <Select
                        placeholder="Chọn khoa"
                        onChange={(val) => setSelectedFaculty(val)}
                        value={selectedFaculty}
                        allowClear
                      >
                        {faculties.map((f) => (
                          <Option key={f.facultyId} value={f.facultyId}>
                            {f.facultyName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label="Chuyên ngành"
                      name="departmentId"
                      rules={[
                        {
                          required: true,
                          message: 'Bắt buộc chọn chuyên ngành',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn chuyên ngành"
                        onChange={(val) => setSelectedDepartment(val)}
                        value={selectedDepartment}
                        allowClear
                        disabled={!selectedFaculty}
                      >
                        {departments.map((d) => (
                          <Option key={d.departmentId} value={d.departmentId}>
                            {d.departmentName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label="Lớp"
                      name="classId"
                      rules={[{ required: true, message: 'Bắt buộc chọn lớp' }]}
                    >
                      <Select
                        placeholder="Chọn lớp"
                        allowClear
                        disabled={!selectedDepartment}
                      >
                        {classes.map((cls) => (
                          <Option key={cls.classId} value={cls.classId}>
                            {cls.className}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {/* <Col xs={24} md={8}>
                    <Form.Item
                      label="Trạng thái sinh viên"
                      name="studentStatus"
                    >
                      <Input placeholder="Nhập trạng thái" />
                    </Form.Item>
                  </Col> */}
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Ngày nhập học" name="admissionDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Năm học" name="year">
                      <Input placeholder="Nhập năm học" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* --- THÔNG TIN GIẢNG VIÊN --- */}
            {roleId === 3 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 16 }}>
                  👨‍🏫 Thông tin giảng viên
                </Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label="Khoa"
                      name="facultyId"
                      rules={[
                        {
                          required: true,
                          message: 'Bắt buộc chọn khoa',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn khoa"
                        onChange={(val) => setSelectedFaculty(val)}
                        value={selectedFaculty}
                        allowClear
                      >
                        {faculties.map((f) => (
                          <Option key={f.facultyId} value={f.facultyId}>
                            {f.facultyName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label="Chuyên ngành"
                      name="departmentId"
                      rules={[
                        {
                          required: true,
                          message: 'Bắt buộc chọn chuyên ngành',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn chuyên ngành"
                        onChange={(val) => setSelectedDepartment(val)}
                        value={selectedDepartment}
                        allowClear
                        disabled={!selectedFaculty}
                      >
                        {departments.map((d) => (
                          <Option key={d.departmentId} value={d.departmentId}>
                            {d.departmentName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
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
                  <Col xs={24} sm={12} md={8}>
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
                </Row>
              </>
            )}
          </Card>

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button
              htmlType="reset"
              style={{ marginRight: 8 }}
              onClick={() => {
                form.resetFields();
                setRoleId(1);
                setSelectedFaculty(undefined);
                setDepartments([]);
                setSelectedDepartment(undefined);
                setClasses([]);
              }}
            >
              Làm mới
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo tài khoản
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Box>
  );
};

export default CreateUser;
