import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Avatar,
  Tooltip,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Table,
  Divider,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  FlagOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { userService } from '../../../service/userService';
import { facultyService } from '../../../service/facultyService';
import { departmentService } from '../../../service/departmentService';
import { classService } from '../../../service/classService';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;

const genderLabel = (gender) => {
  if (gender === 0) return 'Nam';
  if (gender === 1) return 'Nữ';
  if (gender === 2) return 'Khác';
  return '';
};

const fieldList = [
  { label: 'Tên đăng nhập', key: 'username', icon: <UserOutlined /> },
  { label: 'Họ và tên', key: 'fullName', icon: <UserOutlined /> },
  { label: 'Email', key: 'email', icon: <MailOutlined /> },
  { label: 'Số điện thoại', key: 'phone', icon: <PhoneOutlined /> },
  { label: 'Địa chỉ', key: 'address', icon: <HomeOutlined /> },
  {
    label: 'Giới tính',
    key: 'gender',
    icon: <UserOutlined />,
    render: genderLabel,
  },
  { label: 'Nơi sinh', key: 'placeOfBirth', icon: <HomeOutlined /> },
  { label: 'Tôn giáo', key: 'religion', icon: <FlagOutlined /> },
  {
    label: 'Ngày sinh',
    key: 'dateOfBirth',
    icon: <HomeOutlined />,
    render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
  },
  { label: 'CCCD', key: 'citizenIdCard', icon: <UserOutlined /> },
  {
    label: 'Trạng thái tài khoản',
    key: 'accountStatus',
    icon: <UserOutlined />,
    render: (v) => (v === 0 ? 'Hoạt động' : 'Khóa'),
  },
];

// Trạng thái tài khoản mapping
const accountStatusMap = {
  1: { label: 'Hoạt động', color: 'green' },
  2: { label: 'Không hoạt động', color: 'orange' },
  3: { label: 'Bị tạm khóa', color: 'red' },
  4: { label: 'Đã xóa', color: 'default' },
};

function renderField(user, field) {
  let value = user[field.key];
  if (field.render) value = field.render(value);
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'object' && !React.isValidElement(value))
  ) {
    value = <span style={{ color: '#aaa' }}>Chưa cập nhật</span>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ marginRight: 10, color: '#1677ff' }}>{field.icon}</span>
      <span style={{ fontWeight: 600, minWidth: 120 }}>{field.label}:</span>
      <span style={{ marginLeft: 8 }}>{value}</span>
    </div>
  );
}

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Hàm fetch lại user
  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getAllUsers(pageNumber, pageSize);
    if (res) {
      setUsers(res.items || []);
      setTotalCount(res.totalCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [pageNumber, pageSize]);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.fullName || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole !== 'all') {
      filtered = filtered.filter(
        (user) => user.role?.roleName?.toLowerCase() === filterRole
      );
    }
    return filtered;
  }, [users, searchTerm, filterRole]);

  const handleTableChange = (pagination) => {
    setPageNumber(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={record.avatarUrl}
            icon={<UserOutlined />}
            style={{ marginRight: 8, background: '#e6f4ff', color: '#1677ff' }}
            size={44}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {record.fullName || record.username}
            </div>
            <div style={{ color: '#888', fontSize: 12 }}>{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'roleName'],
      key: 'role',
      render: (roleName) => (
        <Tag
          color={
            roleName === 'Admin'
              ? 'volcano'
              : roleName === 'Giảng viên'
                ? 'geekblue'
                : 'green'
          }
          style={{
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 8,
            padding: '2px 12px',
          }}
        >
          {roleName}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <span>
          <MailOutlined style={{ color: '#1677ff' }} />{' '}
          {email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <span>
          <PhoneOutlined style={{ color: '#1677ff' }} />{' '}
          {phone || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <span>
          <HomeOutlined style={{ color: '#1677ff' }} />{' '}
          {address || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
      render: (nationality) => (
        <span>
          <FlagOutlined style={{ color: '#1677ff' }} />{' '}
          {nationality || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      align: 'center',
      render: (status) => {
        const info = accountStatusMap[status] || {
          label: 'Không xác định',
          color: 'default',
        };
        return (
          <Tag
            color={info.color}
            style={{
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 8,
              padding: '2px 12px',
            }}
          >
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="link"
              style={{ color: '#1677ff' }}
              onClick={() => {
                setSelectedUser(record);
                setOpenDetail(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="link"
              style={{ color: '#faad14' }}
              onClick={() => {
                setSelectedUser(record);
                setOpenEdit(true);
              }}
            />
          </Tooltip>
          {/* Vô hiệu hóa / Mở khóa tài khoản */}
          {record.accountStatus === 1 ? (
            <Popconfirm
              title="Vô hiệu hóa tài khoản này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={async () => {
                const res = await userService.deactivateUser(record.userId);
                if (res) {
                  message.success('Đã vô hiệu hóa tài khoản!');
                  await fetchUsers();
                } else {
                  message.error('Vô hiệu hóa thất bại!');
                }
              }}
            >
              <Button
                icon={<LockOutlined />}
                size="small"
                type="link"
                style={{ color: '#ff4d4f' }}
              />
            </Popconfirm>
          ) : record.accountStatus === 2 || record.accountStatus === 3 ? (
            <Popconfirm
              title="Mở lại tài khoản này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={async () => {
                const res = await userService.reactivateUser(record.userId);
                if (res) {
                  message.success('Đã mở lại tài khoản!');
                  await fetchUsers();
                } else {
                  message.error('Mở lại tài khoản thất bại!');
                }
              }}
            >
              <Button
                icon={<UnlockOutlined />}
                size="small"
                type="link"
                style={{ color: '#52c41a' }}
              />
            </Popconfirm>
          ) : null}
        </>
      ),
    },
  ];
  // Detail Modal - đẹp hơn
  const DetailModal = (
    <Modal
      open={openDetail}
      onCancel={() => setOpenDetail(false)}
      footer={null}
      width={720}
      centered
      title={null}
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        // Cho phép scroll nếu content dài
        overflowY: 'auto',
      }}
    >
      {selectedUser && (
        <div style={{ background: '#f4f8ff', borderRadius: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 32,
              background: '#1677ff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              color: '#fff',
              gap: 24,
            }}
          >
            <Avatar
              src={selectedUser.avatarUrl}
              size={80}
              icon={<UserOutlined />}
              style={{
                background: '#fff',
                color: '#1677ff',
                fontWeight: 700,
                fontSize: 36,
                border: '3px solid #fff',
                boxShadow: '0 2px 8px #1677ff33',
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 26,
                  wordBreak: 'break-word',
                }}
              >
                {selectedUser.fullName || selectedUser.username}
              </div>
              <Tag
                color={
                  selectedUser.role?.roleName === 'Admin'
                    ? 'volcano'
                    : selectedUser.role?.roleName === 'Giảng viên'
                      ? 'geekblue'
                      : 'green'
                }
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: 8,
                  marginTop: 8,
                  padding: '2px 16px',
                }}
              >
                {selectedUser.role?.roleName}
              </Tag>
            </div>
          </div>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: 32, maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Thông tin cá nhân */}
            <Divider orientation="left" style={{ color: '#1677ff' }}>
              🧍 Thông tin cá nhân
            </Divider>
            <Row gutter={32}>
              <Col span={12}>
                <div style={{ marginBottom: 10 }}>
                  <b>Tên đăng nhập:</b>{' '}
                  {selectedUser.username || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Họ và tên:</b>{' '}
                  {selectedUser.fullName || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Giới tính:</b>{' '}
                  {genderOptions.find((g) => g.value === selectedUser.gender)
                    ?.label || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Ngày sinh:</b>{' '}
                  {selectedUser.dateOfBirth ? (
                    dayjs(selectedUser.dateOfBirth).format('DD/MM/YYYY')
                  ) : (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Email:</b>{' '}
                  {selectedUser.email || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Số điện thoại:</b>{' '}
                  {selectedUser.phone || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 10 }}>
                  <b>Địa chỉ:</b>{' '}
                  {selectedUser.address || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Địa chỉ tạm trú:</b>{' '}
                  {selectedUser.temporaryAddress || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Nơi sinh:</b>{' '}
                  {selectedUser.placeOfBirth || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Dân tộc:</b>{' '}
                  {selectedUser.ethnicity || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Tôn giáo:</b>{' '}
                  {selectedUser.religion || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Quốc tịch:</b>{' '}
                  {selectedUser.nationality || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
              </Col>
            </Row>

            {/* Giấy tờ cá nhân */}
            <Divider orientation="left" style={{ color: '#1677ff' }}>
              🪪 Giấy tờ cá nhân
            </Divider>
            <Row gutter={32}>
              <Col span={12}>
                <div style={{ marginBottom: 10 }}>
                  <b>CCCD:</b>{' '}
                  {selectedUser.citizenIdCard || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Ngày cấp:</b>{' '}
                  {selectedUser.issuedDate ? (
                    dayjs(selectedUser.issuedDate).format('DD/MM/YYYY')
                  ) : (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Nơi cấp:</b>{' '}
                  {selectedUser.issuedPlace || (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 10 }}>
                  <b>Trạng thái tài khoản:</b>{' '}
                  {(() => {
                    const info = accountStatusMap[selectedUser.accountStatus];
                    return info ? (
                      <Tag color={info.color}>{info.label}</Tag>
                    ) : (
                      <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                    );
                  })()}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}
    </Modal>
  );

  // Edit Modal - đẹp hơn
  const [form] = Form.useForm();
  const [editRoleId, setEditRoleId] = useState(null);
  const [editFaculties, setEditFaculties] = useState([]);
  const [editDepartments, setEditDepartments] = useState([]);
  const [editClasses, setEditClasses] = useState([]);
  const [editSelectedFaculty, setEditSelectedFaculty] = useState(undefined);
  const [editSelectedDepartment, setEditSelectedDepartment] =
    useState(undefined);

  // Load faculties for edit modal
  useEffect(() => {
    if (openEdit) {
      const fetchFaculties = async () => {
        const res = await facultyService.getFacultiesDropdown();
        if (res && Array.isArray(res)) setEditFaculties(res);
      };
      fetchFaculties();
    }
  }, [openEdit]);

  // Set initial values when open edit
  useEffect(() => {
    if (selectedUser && openEdit) {
      // Detect roleId
      const roleId = selectedUser.role?.roleId || selectedUser.roleId;
      setEditRoleId(roleId);

      // Set faculty/department/class for dropdowns
      setEditSelectedFaculty(selectedUser.facultyId);
      setEditSelectedDepartment(selectedUser.departmentId);

      // Set form values, đảm bảo có roleId
      form.setFieldsValue({
        ...selectedUser,
        roleId: roleId, // <-- thêm dòng này
        dateOfBirth: selectedUser.dateOfBirth
          ? dayjs(selectedUser.dateOfBirth)
          : undefined,
        issuedDate: selectedUser.issuedDate
          ? dayjs(selectedUser.issuedDate)
          : undefined,
        admissionDate: selectedUser.studentSpecificData?.admissionDate
          ? dayjs(selectedUser.studentSpecificData.admissionDate)
          : undefined,
        // ...add more if needed
      });
    }
  }, [selectedUser, openEdit, form]);

  // Load departments for edit modal
  useEffect(() => {
    if (editSelectedFaculty) {
      const fetchDepartments = async () => {
        const res =
          await departmentService.getDepartmentsDropdownByFaculty(
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
  }, [editSelectedFaculty, form, openEdit]);

  // Load classes for edit modal
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
  }, [editSelectedDepartment, form, openEdit]);

  // Reset edit modal dropdowns when role changes
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
  }, [editRoleId, form, openEdit]);

  // Handle update
  const handleEditFinish = async (values) => {
    setEditLoading(true);
    const payload = {
      ...values,
      roleId: editRoleId,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format('YYYY-MM-DD')
        : null,
      issuedDate: values.issuedDate
        ? values.issuedDate.format('YYYY-MM-DD')
        : null,
      // KHÔNG gửi studentSpecificData/lecturerSpecificData ở đây
    };
    const res = await userService.updateUserWithRole(
      selectedUser.userId,
      payload
    );
    setEditLoading(false);
    if (res) {
      message.success('Cập nhật người dùng thành công!');
      setOpenEdit(false);
      fetchUsers();
    }
  };

  // Edit Modal UI
  const EditModal = (
    <Modal
      open={openEdit}
      onCancel={() => setOpenEdit(false)}
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditFinish}
          initialValues={{ gender: 1 }}
        >
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            🧍 Thông tin cá nhân
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[
                  { required: true, message: 'Bắt buộc nhập tên đăng nhập' },
                ]}
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

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button
              onClick={() => setOpenEdit(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={editLoading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f5f7fa' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Quản lý người dùng</h2>
        <div style={{ color: '#888' }}>
          Quản lý thông tin người dùng, phân quyền và trạng thái hoạt động.
        </div>
      </div>
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Input.Search
            allowClear
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
          />
          <Select
            value={filterRole}
            onChange={(value) => setFilterRole(value)}
            style={{ width: 180 }}
            placeholder="Vai trò"
          >
            <Option value="all">Tất cả vai trò</Option>
            <Option value="admin">Quản trị viên</Option>
            <Option value="giảng viên">Giảng viên</Option>
            <Option value="sinh viên">Sinh viên</Option>
          </Select>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/create-user')}
            >
              Thêm mới
            </Button>
          </div>
        </div>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
      {DetailModal}
      {EditModal}
    </div>
  );
};

export default UserManagement;

// Đặt các options ở đầu file (trước UserManagement)
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
