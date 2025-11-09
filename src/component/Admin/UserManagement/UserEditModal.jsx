import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, Divider, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { genderOptions, roleOptions } from './constants';
import { facultyService } from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';
import { classService } from '../../../service/classService';

const { Option } = Select;

/**
 * UserEditModal - Modal chỉnh sửa thông tin user
 */
const UserEditModal = ({ open, onCancel, onSave, user, loading }) => {
  const [form] = Form.useForm();
  const [editRoleId, setEditRoleId] = useState(null);
  const [editFaculties, setEditFaculties] = useState([]);
  const [editDepartments, setEditDepartments] = useState([]);
  const [editClasses, setEditClasses] = useState([]);
  const [editSelectedFaculty, setEditSelectedFaculty] = useState(undefined);
  const [editSelectedDepartment, setEditSelectedDepartment] = useState(undefined);

  // Load faculties khi mở modal
  useEffect(() => {
    if (open) {
      const fetchFaculties = async () => {
        const res = await facultyService.getFacultiesDropdown();
        if (res && Array.isArray(res)) setEditFaculties(res);
      };
      fetchFaculties();
    }
  }, [open]);

  // Set initial values khi mở modal
  useEffect(() => {
    if (user && open) {
      const roleId = user.role?.roleId || user.roleId;
      setEditRoleId(roleId);
      setEditSelectedFaculty(user.facultyId);
      setEditSelectedDepartment(user.departmentId);

      form.setFieldsValue({
        ...user,
        roleId: roleId,
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
        issuedDate: user.issuedDate ? dayjs(user.issuedDate) : undefined,
        admissionDate: user.studentSpecificData?.admissionDate
          ? dayjs(user.studentSpecificData.admissionDate)
          : undefined,
      });
    }
  }, [user, open, form]);

  // Load departments khi chọn faculty
  useEffect(() => {
    if (editSelectedFaculty) {
      const fetchDepartments = async () => {
        const res = await departmentService.getDepartmentsDropdownByFaculty(
          editSelectedFaculty
        );
        if (res && Array.isArray(res)) setEditDepartments(res);
        else setEditDepartments([]);
      };
      fetchDepartments();
    } else {
      setEditDepartments([]);
    }
    setEditSelectedDepartment(undefined);
    setEditClasses([]);
    form.setFieldsValue({ departmentId: undefined, classId: undefined });
  }, [editSelectedFaculty, form, open]);

  // Load classes khi chọn department
  useEffect(() => {
    if (editSelectedDepartment) {
      const fetchClasses = async () => {
        const res = await classService.getClassesDropdownByDepartment(
          editSelectedDepartment
        );
        if (res && Array.isArray(res)) setEditClasses(res);
        else setEditClasses([]);
      };
      fetchClasses();
    } else {
      setEditClasses([]);
    }
    form.setFieldsValue({ classId: undefined });
  }, [editSelectedDepartment, form, open]);

  // Reset khi thay đổi role
  useEffect(() => {
    setEditSelectedFaculty(undefined);
    setEditDepartments([]);
    setEditSelectedDepartment(undefined);
    setEditClasses([]);
    form.setFieldsValue({
      facultyId: undefined,
      departmentId: undefined,
      classId: undefined,
    });
  }, [editRoleId, form, open]);

  const handleFinish = (values) => {
    const payload = {
      ...values,
      roleId: editRoleId,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null,
    };
    onSave(payload);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      centered
      title={
        <div style={{ fontWeight: 700, fontSize: 22, color: '#1677ff' }}>
          <EditOutlined /> Chỉnh sửa người dùng
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
      <div style={{ background: '#f4f8ff', borderRadius: 16, padding: 32 }}>
        <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ gender: 1 }}>
          {/* Thông tin cá nhân */}
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            🧍 Thông tin cá nhân
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[{ required: true, message: 'Bắt buộc nhập tên đăng nhập' }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Bắt buộc nhập họ tên' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[{ required: true, message: 'Bắt buộc nhập ngày sinh' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin thêm */}
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            🏠 Thông tin thêm
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item label="Địa chỉ" name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Địa chỉ tạm trú" name="temporaryAddress">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Nơi sinh" name="placeOfBirth">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Dân tộc" name="ethnicity">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Tôn giáo" name="religion">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Quốc tịch" name="nationality">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Giấy tờ cá nhân */}
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            🪪 Giấy tờ cá nhân
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item label="CCCD" name="citizenIdCard">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ngày cấp" name="issuedDate">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Nơi cấp" name="issuedPlace">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Vai trò */}
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            ⚙️ Vai trò người dùng
          </Divider>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item label="Vai trò" name="roleId">
                <Select disabled>
                  {roleOptions.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
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

export default UserEditModal;
