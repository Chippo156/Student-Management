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
import { userService } from '../../../service/userService';
import facultyService from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';
import { classService } from '../../../service/classService';
import AddressSelector from '../../Student/General information/AddressSelector';
import { externalBankService } from '../../../service/helperService';
import { normalizeList } from '../../Student/General information/constants';

const { Option } = Select;

const genderOptions = [
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Khác' },
];

const studentStatusOptions = [
  { value: 1, label: 'Đang học' },
  { value: 2, label: 'Không hoạt động' },
  { value: 3, label: 'Đã tốt nghiệp' },
  { value: 4, label: 'Đình chỉ' },
  { value: 5, label: 'Bảo lưu' },
];

/**
 * StudentEditModal - Modal chỉnh sửa thông tin sinh viên
 */
const StudentEditModal = ({ open, onCancel, onSave, student, loading }) => {
  const theme = useTheme();
  const [form] = Form.useForm();
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState(undefined);
  const [provinces, setProvinces] = useState([]);

  const colors = {
    primary: theme.palette.primary.main,
    primaryLight: alpha(theme.palette.primary.main, 0.1),
  };

  // Load faculties and provinces
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
    const fetchProvinces = async () => {
      try {
        const data = await externalBankService.getProvinces();
        setProvinces(normalizeList(data));
      } catch (error) {
        console.error('Failed to fetch provinces:', error);
      }
    };
    fetchFaculties();
    fetchProvinces();
  }, []);

  // Load departments when faculty changes - ✅ KHÔNG reset department khi init
  useEffect(() => {
    if (selectedFaculty) {
      // ✅ Chỉ reset khi user thay đổi, không phải khi init
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
      setSelectedDepartment(undefined);
      setClasses([]);
      form.setFieldsValue({ departmentId: undefined, classId: undefined });
    }
  }, [selectedFaculty, form]);

  // Load classes when department changes - ✅ KHÔNG reset class khi init
  useEffect(() => {
    if (selectedDepartment) {
      // ✅ Chỉ reset khi user thay đổi
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
      form.setFieldsValue({ classId: undefined });
    }
  }, [selectedDepartment, form]);

  // Set initial values
  useEffect(() => {
    if (student && open) {
      // ✅ Lấy faculty và department từ nested structure
      const facultyId = student.class?.program?.department?.faculty?.facultyId;
      const departmentId = student.class?.program?.department?.departmentId;

      setSelectedFaculty(facultyId);
      setSelectedDepartment(departmentId);

      form.setFieldsValue({
        mssv: student.mssv,
        fullName: student.user?.fullName,
        gender: student.user?.gender,
        dateOfBirth: student.user?.dateOfBirth
          ? dayjs(student.user.dateOfBirth)
          : undefined,
        email: student.user?.email,
        phone: student.user?.phone,
        address: student.user?.address,
        temporaryAddress: student.user?.temporaryAddress,
        ethnicity: student.user?.ethnicity,
        religion: student.user?.religion,
        nationality: student.user?.nationality,
        citizenIdCard: student.user?.citizenIdCard,
        issuedDate: student.user?.issuedDate
          ? dayjs(student.user.issuedDate)
          : undefined,
        issuedPlace: student.user?.issuedPlace,
        placeOfBirth: student.user?.placeOfBirth,
        healthInsuranceNumber: student.user?.healthInsuranceNumber,
        healthInsuranceRegistrationPlace:
          student.user?.healthInsuranceRegistrationPlace,
        object: student.user?.object,
        policyArea: student.user?.policyArea,
        // ✅ Address fields
        hometownProvince: student.user?.hometownProvince,
        hometownDistrict: student.user?.hometownDistrict,
        hometownWard: student.user?.hometownWard,
        birthProvince: student.user?.birthProvince,
        birthDistrict: student.user?.birthDistrict,
        birthWard: student.user?.birthWard,
        permanentProvince: student.user?.permanentProvince,
        permanentDistrict: student.user?.permanentDistrict,
        permanentWard: student.user?.permanentWard,
        // ✅ Academic fields - Fix nested path
        facultyId: facultyId,
        departmentId: departmentId,
        classId: student.class?.classId,
        yearOfAdmission: student.yearOfAdmission,
        studentStatus: student.studentStatus,
      });

      // ✅ Debug log để kiểm tra
      console.log('🔍 Student data:', student);
      console.log('🔍 Faculty ID:', facultyId);
      console.log('🔍 Department ID:', departmentId);
      console.log('🔍 Class ID:', student.class?.classId);
    }
  }, [student, open, form]);

  const handleFinish = async (values) => {
    try {
      // ✅ Build payload theo đúng format API update-with-role
      const payload = {
        fullName: values.fullName,
        gender: values.gender,
        roleId: 2, // ✅ roleId = 2 cho sinh viên
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
        dateOfJoinUnion: null,
        dateOfJoinParty: null,
        // ✅ Address fields từ AddressSelector
        hometownProvince: values.hometownProvince || null,
        hometownDistrict: values.hometownDistrict || null,
        hometownWard: values.hometownWard || null,
        birthProvince: values.birthProvince || null,
        birthDistrict: values.birthDistrict || null,
        birthWard: values.birthWard || null,
        permanentProvince: values.permanentProvince || null,
        permanentDistrict: values.permanentDistrict || null,
        permanentWard: values.permanentWard || null,
        // ✅ Student-specific data
        studentSpecificData: {
          classId: values.classId,
          studentStatus: values.studentStatus,
          admissionDate: null,
          year: values.yearOfAdmission ? String(values.yearOfAdmission) : null,
        },
        // ✅ Lecturer-specific data (null cho sinh viên)
        lecturerSpecificData: null,
      };

      console.log('📤 Updating student with payload:', payload);

      const result = await userService.updateUserWithRole(
        student.user?.userId,
        payload
      );

      if (result) {
        message.success('Cập nhật thông tin sinh viên thành công!');
        onSave(result);
      }
    } catch (error) {
      console.error('❌ Failed to update student:', error);
      message.error('Cập nhật thông tin sinh viên thất bại!');
    }
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty(facultyId);
  };

  const handleDepartmentChange = (departmentId) => {
    setSelectedDepartment(departmentId);
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
          <EditOutlined /> Chỉnh sửa sinh viên
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
            🧍 Thông tin cơ bản
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="MSSV"
                name="mssv"
                rules={[
                  { required: true, message: 'Bắt buộc nhập MSSV' },
                  { min: 6, max: 20, message: 'MSSV từ 6-20 ký tự' },
                ]}
              >
                <Input placeholder="Nhập mã số sinh viên" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[{ required: true, message: 'Bắt buộc nhập ngày sinh' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input placeholder="Nhập địa chỉ email" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin địa chỉ */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🏠 Thông tin địa chỉ
          </Divider>
          <Row gutter={[24, 16]}>
            <AddressSelector
              label="Quê quán"
              provinceField="hometownProvince"
              districtField="hometownDistrict"
              wardField="hometownWard"
              provinces={provinces}
              form={form}
              initialValues={{
                province: student?.user?.hometownProvince,
                district: student?.user?.hometownDistrict,
                ward: student?.user?.hometownWard,
              }}
            />
            <AddressSelector
              label="Nơi sinh"
              provinceField="birthProvince"
              districtField="birthDistrict"
              wardField="birthWard"
              provinces={provinces}
              form={form}
              initialValues={{
                province: student?.user?.birthProvince,
                district: student?.user?.birthDistrict,
                ward: student?.user?.birthWard,
              }}
            />
            <AddressSelector
              label="Địa chỉ thường trú"
              provinceField="permanentProvince"
              districtField="permanentDistrict"
              wardField="permanentWard"
              provinces={provinces}
              form={form}
              initialValues={{
                province: student?.user?.permanentProvince,
                district: student?.user?.permanentDistrict,
                ward: student?.user?.permanentWard,
              }}
            />
            <Col xs={24} md={12}>
              <Form.Item label="Địa chỉ tạm trú" name="temporaryAddress">
                <Input placeholder="Nhập địa chỉ tạm trú" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Địa chỉ liên hệ" name="address">
                <Input placeholder="Nhập địa chỉ liên hệ" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Dân tộc" name="ethnicity">
                <Input placeholder="Nhập dân tộc" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Tôn giáo" name="religion">
                <Input placeholder="Nhập tôn giáo" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Form.Item label="Số CCCD" name="citizenIdCard">
                <Input placeholder="Nhập số căn cước công dân" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ngày cấp" name="issuedDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Nơi cấp" name="issuedPlace">
                <Input placeholder="Nhập nơi cấp CCCD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số BHYT" name="healthInsuranceNumber">
                <Input placeholder="Nhập số bảo hiểm y tế" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nơi đăng ký KCB"
                name="healthInsuranceRegistrationPlace"
              >
                <Input placeholder="Nhập nơi đăng ký khám chữa bệnh" />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin học tập */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🎓 Thông tin học tập
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={6}>
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
            <Col xs={24} md={6}>
              <Form.Item
                label="Chuyên ngành"
                name="departmentId"
                rules={[
                  { required: true, message: 'Bắt buộc chọn chuyên ngành' },
                ]}
              >
                <Select
                  placeholder="Chọn chuyên ngành"
                  onChange={handleDepartmentChange}
                  value={selectedDepartment}
                  disabled={!selectedFaculty}
                  defaultValue={3}
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
            <Col xs={24} md={6}>
              <Form.Item
                label="Lớp"
                name="classId"
                rules={[{ required: true, message: 'Bắt buộc chọn lớp' }]}
              >
                <Select
                  placeholder="Chọn lớp"
                  disabled={!selectedDepartment}
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {classes.map((cls) => (
                    <Option key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Năm nhập học"
                name="yearOfAdmission"
                rules={[
                  { required: true, message: 'Bắt buộc nhập năm nhập học' },
                ]}
              >
                <Input placeholder="VD: 2023" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Trạng thái sinh viên"
                name="studentStatus"
                rules={[
                  { required: true, message: 'Bắt buộc chọn trạng thái' },
                ]}
              >
                <Select placeholder="Chọn trạng thái sinh viên">
                  {studentStatusOptions.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
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

export default StudentEditModal;
