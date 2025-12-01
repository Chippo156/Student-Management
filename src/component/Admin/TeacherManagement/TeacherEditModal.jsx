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
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { lecturerService } from '../../../service/lecturerService';
import facultyService from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';

const { Option } = Select;

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

/**
 * TeacherEditModal - Modal chỉnh sửa thông tin giảng viên
 */
const TeacherEditModal = ({ open, onCancel, onSave, lecturer, loading }) => {
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

  // Set initial values
  useEffect(() => {
    if (lecturer && open) {
      setSelectedFaculty(lecturer.department?.facultyId);

      form.setFieldsValue({
        fullName: lecturer.user?.fullName,
        gender: lecturer.user?.gender,
        dateOfBirth: lecturer.user?.dateOfBirth
          ? dayjs(lecturer.user.dateOfBirth)
          : undefined,
        email: lecturer.user?.email,
        phone: lecturer.user?.phone,
        address: lecturer.user?.address,
        temporaryAddress: lecturer.user?.temporaryAddress,
        ethnicity: lecturer.user?.ethnicity,
        religion: lecturer.user?.religion,
        nationality: lecturer.user?.nationality,
        citizenIdCard: lecturer.user?.citizenIdCard,
        issuedDate: lecturer.user?.issuedDate
          ? dayjs(lecturer.user.issuedDate)
          : undefined,
        issuedPlace: lecturer.user?.issuedPlace,
        placeOfBirth: lecturer.user?.placeOfBirth,
        facultyId: lecturer.department?.facultyId,
        departmentId: lecturer.departmentId,
        academicTitle: lecturer.academicTitle,
        position: lecturer.position,
        joiningDate: lecturer.joiningDate
          ? dayjs(lecturer.joiningDate)
          : undefined,
      });
    }
  }, [lecturer, open, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        lecturerId: lecturer.lecturerId,
        departmentId: values.departmentId,
        academicTitle: values.academicTitle,
        position: values.position,
        joiningDate: values.joiningDate
          ? values.joiningDate.format('YYYY-MM-DD')
          : null,
        userUpdateRequest: {
          fullName: values.fullName,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format('YYYY-MM-DD')
            : null,
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

      const result = await lecturerService.updateLecturer(payload);
      if (result) {
        message.success('Cập nhật thông tin giảng viên thành công!');
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to update lecturer:', error);
      message.error('Cập nhật thông tin giảng viên thất bại!');
    }
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty(facultyId);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      title={
        <div style={{ fontWeight: 700, fontSize: 22, color: colors.primary }}>
          <EditOutlined /> Chỉnh sửa giảng viên
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
          <Divider orientation="left" style={{ color: colors.primary }}>
            👨‍🏫 Thông tin cơ bản
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  { required: true, message: 'Bắt buộc nhập họ tên' },
                  { min: 2, message: 'Tối thiểu 2 ký tự' },
                ]}
              >
                <Input placeholder="Nhập họ và tên đầy đủ" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: 'Bắt buộc chọn giới tính' }]}
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
                rules={[{ required: true, message: 'Bắt buộc nhập ngày sinh' }]}
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
              <Form.Item label="Số điện thoại" name="phone">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày bắt đầu công tác" name="joiningDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin địa chỉ */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🏠 Thông tin địa chỉ
          </Divider>
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

          {/* Giấy tờ cá nhân */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🪪 Giấy tờ cá nhân
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Số CCCD" name="citizenIdCard">
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

          {/* Thông tin công tác */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            💼 Thông tin công tác
          </Divider>
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
                  { required: true, message: 'Bắt buộc chọn bộ môn/phòng ban' },
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

          {/* Buttons */}
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default TeacherEditModal;
