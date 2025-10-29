import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Tag,
  Card,
  Avatar,
  Button,
  Space,
  message,
  Modal,
  Form,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { lecturerService } from '../../../service/lecturerService';

const statusMap = {
  0: { color: 'green', text: 'Đang công tác' },
  1: { color: 'red', text: 'Nghỉ việc' },
};

const fieldList = [
  { label: 'Mã GV', key: 'lecturerCode', icon: <IdcardOutlined /> },
  { label: 'Họ và tên', key: 'fullName', icon: <UserOutlined /> },
  { label: 'Email', key: 'email', icon: <MailOutlined /> },
  { label: 'Số điện thoại', key: 'phone', icon: <PhoneOutlined /> },
  { label: 'Khoa', key: 'departmentName', icon: <TeamOutlined /> },
  { label: 'Chức vụ', key: 'position', icon: <UserOutlined /> },
  { label: 'Học hàm', key: 'academicTitle', icon: <UserOutlined /> },
  {
    label: 'Trạng thái',
    key: 'accountStatus',
    icon: <UserOutlined />,
    render: (v) => statusMap[v]?.text || 'Không xác định',
  },
];

const TeacherList = () => {
  const [lecturers, setLecturers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [form] = Form.useForm();

  const fetchLecturers = async (page = 1, size = 10, searchText = '') => {
    setLoading(true);
    const res = await lecturerService.getAllLecturers(page, size);
    if (res && res.items) {
      let items = res.items;
      if (searchText) {
        items = items.filter(
          (l) =>
            l.user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            l.lecturerCode?.toLowerCase().includes(searchText.toLowerCase()) ||
            l.user.email?.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      setLecturers(items);
      setTotalCount(res.totalCount || items.length);
    } else {
      setLecturers([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLecturers(pageNumber, pageSize, search);
    // eslint-disable-next-line
  }, [pageNumber, pageSize]);

  const handleSearch = (value) => {
    setSearch(value);
    setPageNumber(1);
    fetchLecturers(1, pageSize, value);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Tùy backend, bạn cần build payload phù hợp
      const payload = {
        ...selectedLecturer,
        user: {
          ...selectedLecturer.user,
          ...values,
        },
        lecturerCode: values.lecturerCode,
        position: values.position,
        academicTitle: values.academicTitle,
        department: {
          ...selectedLecturer.department,
          departmentName: values.departmentName,
        },
      };
      // Gọi API update ở đây nếu có
      // await lecturerService.updateLecturer(payload);
      message.success('Cập nhật thông tin thành công');
      setOpenEdit(false);
      fetchLecturers(pageNumber, pageSize, search);
    } catch (err) {
      // Validation error hoặc API error
    }
  };

  const DetailModal = (
    <Modal
      open={openDetail}
      onCancel={() => setOpenDetail(false)}
      footer={null}
      width={800}
      centered
      title={
        <Space>
          <EyeOutlined />
          Thông tin chi tiết giảng viên
        </Space>
      }
      styles={{
        body: {
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          maxHeight: '80vh',
          overflowY: 'auto',
        },
      }}
    >
      {selectedLecturer && (
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
              flexWrap: 'wrap',
            }}
          >
            <Avatar
              src={selectedLecturer.user.avatarUrl}
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
                {selectedLecturer.user.fullName}
              </div>
              <Tag
                color={statusMap[selectedLecturer.user.accountStatus]?.color}
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: 8,
                  marginTop: 8,
                  padding: '2px 16px',
                }}
              >
                {statusMap[selectedLecturer.user.accountStatus]?.text}
              </Tag>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <Row gutter={[16, 16]}>
              {fieldList.map((field) => (
                <Col xs={24} sm={24} md={12} key={field.key}>
                  <div
                    style={{
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ marginRight: 10, color: '#1677ff' }}>
                      {field.icon}
                    </span>
                    <span style={{ fontWeight: 600, minWidth: 120 }}>
                      {field.label}:
                    </span>
                    <span style={{ marginLeft: 8, whiteSpace: 'pre-line' }}>
                      {field.render
                        ? field.render(
                            field.key === 'departmentName'
                              ? selectedLecturer.department?.departmentName
                              : (selectedLecturer.user[field.key] ??
                                  selectedLecturer[field.key])
                          )
                        : field.key === 'departmentName'
                          ? selectedLecturer.department?.departmentName
                          : (selectedLecturer.user[field.key] ??
                            selectedLecturer[field.key] ?? (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
                            ))}
                    </span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}
    </Modal>
  );

  const EditModal = (
    <Modal
      open={openEdit}
      onCancel={() => setOpenEdit(false)}
      onOk={handleEditSubmit}
      okText="Lưu"
      cancelText="Hủy"
      width={800}
      centered
      title={
        <Space>
          <EditOutlined />
          Chỉnh sửa thông tin giảng viên
        </Space>
      }
      styles={{
        body: {
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          maxHeight: '80vh',
          overflowY: 'auto',
        },
      }}
    >
      {selectedLecturer && (
        <div style={{ background: '#f4f8ff', borderRadius: 16, padding: 16 }}>
          <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
              {fieldList.map((field) => (
                <Col xs={24} sm={24} md={12} key={field.key}>
                  <Form.Item
                    label={field.label}
                    name={field.key}
                    key={field.key}
                    initialValue={
                      field.key === 'departmentName'
                        ? selectedLecturer.department?.departmentName
                        : (selectedLecturer.user[field.key] ??
                          selectedLecturer[field.key])
                    }
                    rules={
                      field.key === 'lecturerCode' || field.key === 'fullName'
                        ? [
                            {
                              required: true,
                              message: `Vui lòng nhập ${field.label}`,
                            },
                          ]
                        : []
                    }
                  >
                    <Input />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </div>
      )}
    </Modal>
  );

  const columns = [
    {
      title: 'Avatar',
      key: 'avatar',
      width: 60,
      render: (_, record) => (
        <Avatar
          src={record.user.avatarUrl}
          icon={<UserOutlined />}
          style={{ background: '#e6f4ff', color: '#1677ff' }}
        >
          {record.user.fullName?.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Mã GV',
      dataIndex: 'lecturerCode',
      key: 'lecturerCode',
      width: 110,
    },
    {
      title: 'Họ và tên',
      dataIndex: ['user', 'fullName'],
      key: 'fullName',
      width: 180,
      render: (_, record) => record.user.fullName,
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
      width: 200,
      render: (_, record) =>
        record.user.email || (
          <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
        ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['user', 'phone'],
      key: 'phone',
      width: 130,
      render: (_, record) =>
        record.user.phone || (
          <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
        ),
    },
    {
      title: 'Khoa',
      key: 'department',
      width: 180,
      render: (_, record) => record.department?.departmentName,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      width: 120,
    },
    {
      title: 'Học hàm',
      dataIndex: 'academicTitle',
      key: 'academicTitle',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: ['user', 'accountStatus'],
      key: 'accountStatus',
      width: 120,
      render: (status) => {
        const s = statusMap[status] || {
          color: 'default',
          text: 'Không xác định',
        };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLecturer(record);
              setOpenDetail(true);
            }}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedLecturer(record);
              setOpenEdit(true);
              form.setFieldsValue({
                ...record.user,
                lecturerCode: record.lecturerCode,
                departmentName: record.department?.departmentName,
                position: record.position,
                academicTitle: record.academicTitle,
                accountStatus: record.user.accountStatus,
                fullName: record.user.fullName,
                email: record.user.email,
                phone: record.user.phone,
              });
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách giảng viên"
      extra={
        <Space>
          <Input.Search
            allowClear
            placeholder="Tìm kiếm tên, mã GV, email..."
            onSearch={handleSearch}
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLecturers(pageNumber, pageSize, search)}
          >
            Làm mới
          </Button>
        </Space>
      }
      style={{ margin: 24 }}
      styles={{ body: { padding: 0 } }}
    >
      <Table
        columns={columns}
        dataSource={lecturers}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{
          current: pageNumber,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total) => `Tổng ${total} giảng viên`,
          onChange: (page, size) => {
            setPageNumber(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1000 }}
      />
      {DetailModal}
      {EditModal}
    </Card>
  );
};

export default TeacherList;
