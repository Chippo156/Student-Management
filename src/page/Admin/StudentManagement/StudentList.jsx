import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Tag,
  Card,
  Avatar,
  Button,
  Space,
  Tooltip,
  Typography,
  Divider,
  Modal,
  Form,
  Row,
  Col,
  message,
  Select,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  MailOutlined,
  TeamOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  HomeOutlined,
  FlagOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { studentServices } from '../../../service/studentServices';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const statusMap = {
  0: { color: 'green', text: 'Đang học', icon: <CheckCircleOutlined /> },
  1: { color: 'red', text: 'Tạm nghỉ', icon: <IdcardOutlined /> },
  2: { color: 'blue', text: 'Đã tốt nghiệp', icon: <TeamOutlined /> },
};

const genderOptions = [
  { label: 'Nam', value: 0 },
  { label: 'Nữ', value: 1 },
  { label: 'Khác', value: 2 },
];

const statusOptions = [
  { label: 'Đang học', value: 0 },
  { label: 'Tạm nghỉ', value: 1 },
  { label: 'Đã tốt nghiệp', value: 2 },
];

const fieldList = [
  { label: 'MSSV', key: 'mssv', icon: <IdcardOutlined /> },
  { label: 'Họ và tên', key: 'fullName', icon: <UserOutlined /> },
  { label: 'Email', key: 'email', icon: <MailOutlined /> },
  { label: 'Số điện thoại', key: 'phone', icon: <PhoneOutlined /> },
  { label: 'Địa chỉ', key: 'address', icon: <HomeOutlined /> },
  {
    label: 'Giới tính',
    key: 'gender',
    icon: <UserOutlined />,
    render: (v) => (v === 0 ? 'Nam' : v === 1 ? 'Nữ' : 'Khác'),
  },
  {
    label: 'Ngày sinh',
    key: 'dateOfBirth',
    icon: <CalendarOutlined />,
    render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
  },
  { label: 'Nơi sinh', key: 'placeOfBirth', icon: <HomeOutlined /> },
  { label: 'Tôn giáo', key: 'religion', icon: <FlagOutlined /> },
  { label: 'CCCD', key: 'citizenIdCard', icon: <IdcardOutlined /> },
  { label: 'Lớp', key: 'className', icon: <ApartmentOutlined /> },
  { label: 'Khoa', key: 'departmentName', icon: <TeamOutlined /> },
  { label: 'Năm nhập học', key: 'yearOfAdmission', icon: <CalendarOutlined /> },
  {
    label: 'Trạng thái',
    key: 'studentStatus',
    icon: <CheckCircleOutlined />,
    render: (v) => statusMap[v]?.text || 'Không xác định',
  },
];

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();

  const fetchStudents = async (page = 1, size = 10, searchText = '') => {
    setLoading(true);
    const res = await studentServices.getAllStudents(page, size);
    if (res && res.items) {
      let items = res.items;
      if (searchText) {
        items = items.filter(
          (s) =>
            s.user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            s.mssv.toLowerCase().includes(searchText.toLowerCase()) ||
            (s.user.email &&
              s.user.email.toLowerCase().includes(searchText.toLowerCase()))
        );
      }
      setStudents(items);
      setTotalCount(res.totalCount || items.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents(pageNumber, pageSize, search);
    // eslint-disable-next-line
  }, [pageNumber, pageSize]);

  const handleSearch = (value) => {
    setSearch(value);
    setPageNumber(1);
    fetchStudents(1, pageSize, value);
  };

  const handleExportExcel = () => {
    if (!students || students.length === 0) {
      message.warning('Không có dữ liệu để xuất Excel!');
      return;
    }
    try {
      const handleExportExcel = () => {
        const data = students.map((s) => ({
          MSSV: s.mssv,
          'Họ và tên': s.user?.fullName || '',
          Email: s.user?.email || '',
          'Số điện thoại': s.user?.phone || '',
          'Địa chỉ': s.user?.address || '',
          'Giới tính':
            s.user?.gender === 0 ? 'Nam' : s.user?.gender === 1 ? 'Nữ' : 'Khác',
          'Ngày sinh': s.user?.dateOfBirth
            ? new Date(s.user.dateOfBirth).toLocaleDateString('vi-VN')
            : '',
          'Nơi sinh': s.user?.placeOfBirth || '',
          'Tôn giáo': s.user?.religion || '',
          CCCD: s.user?.citizenIdCard || '',
          Lớp: s.class?.className || '',
          Khoa: s.class?.program?.department?.departmentName || '',
          'Năm nhập học': s.yearOfAdmission || '',
          'Trạng thái': statusMap[s.studentStatus]?.text || 'Không xác định',
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          'Danh sách sinh viên'
        );
        XLSX.writeFile(workbook, 'DanhSachSinhVien.xlsx');
        message.success('Xuất file Excel thành công!');
      };
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      message.error('Xuất file Excel thất bại!');
    }
  };

  const columns = [
    {
      title: (
        <span>
          <UserOutlined /> Avatar
        </span>
      ),
      key: 'avatar',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Avatar
          src={record.user.avatarUrl}
          icon={<UserOutlined />}
          style={{ background: '#e6f4ff', color: '#1677ff' }}
          size={44}
        >
          {record.user.fullName?.charAt(0)}
        </Avatar>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: (
        <span>
          <IdcardOutlined /> MSSV
        </span>
      ),
      dataIndex: 'mssv',
      key: 'mssv',
      width: 110,
      render: (mssv) => <Typography.Text strong>{mssv}</Typography.Text>,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: (
        <span>
          <UserOutlined /> Họ và tên
        </span>
      ),
      dataIndex: ['user', 'fullName'],
      key: 'fullName',
      width: 180,
      render: (_, record) => (
        <Typography.Text>{record.user.fullName}</Typography.Text>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: (
        <span>
          <MailOutlined /> Email
        </span>
      ),
      dataIndex: ['user', 'email'],
      key: 'email',
      width: 200,
      render: (_, record) =>
        record.user.email ? (
          <a href={`mailto:${record.user.email}`}>{record.user.email}</a>
        ) : (
          <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
        ),
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: (
        <span>
          <ApartmentOutlined /> Lớp
        </span>
      ),
      dataIndex: ['class', 'className'],
      key: 'className',
      width: 120,
      render: (_, record) => (
        <Tag color="geekblue" icon={<ApartmentOutlined />}>
          {record.class?.className}
        </Tag>
      ),
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: (
        <span>
          <TeamOutlined /> Khoa
        </span>
      ),
      key: 'department',
      width: 180,
      render: (_, record) => (
        <span>
          {record.class?.program?.department?.departmentName || (
            <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
          )}
        </span>
      ),
      responsive: ['lg', 'xl'],
    },
    {
      title: (
        <span>
          <CalendarOutlined /> Năm nhập học
        </span>
      ),
      dataIndex: 'yearOfAdmission',
      key: 'yearOfAdmission',
      width: 110,
      render: (year) => year || <span style={{ color: '#aaa' }}>-</span>,
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: (
        <span>
          <CheckCircleOutlined /> Trạng thái
        </span>
      ),
      dataIndex: 'studentStatus',
      key: 'studentStatus',
      width: 140,
      render: (status) => {
        const s = statusMap[status] || {
          color: 'default',
          text: 'Không xác định',
          icon: <IdcardOutlined />,
        };
        return (
          <Tag color={s.color} icon={s.icon} style={{ fontWeight: 600 }}>
            {s.text}
          </Tag>
        );
      },
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedStudent(record);
                setOpenDetail(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedStudent(record);
                setOpenEdit(true);
                form.setFieldsValue({
                  ...record.user,
                  mssv: record.mssv,
                  className: record.class?.className,
                  departmentName:
                    record.class?.program?.department?.departmentName,
                  yearOfAdmission: record.yearOfAdmission,
                  studentStatus: record.studentStatus,
                  gender: record.user.gender,
                  dateOfBirth: record.user.dateOfBirth
                    ? dayjs(record.user.dateOfBirth)
                    : null,
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  // Detail Modal
  const DetailModal = (
    <Modal
      open={openDetail}
      onCancel={() => setOpenDetail(false)}
      footer={null}
      width={700}
      centered
      title={
        <Space>
          <UserOutlined />
          Thông tin chi tiết sinh viên
        </Space>
      }
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      responsive
    >
      {selectedStudent && (
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
              src={selectedStudent.user.avatarUrl}
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
                {selectedStudent.user.fullName}
              </div>
              <Tag
                color={statusMap[selectedStudent.studentStatus]?.color}
                icon={statusMap[selectedStudent.studentStatus]?.icon}
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: 8,
                  marginTop: 8,
                  padding: '2px 16px',
                }}
              >
                {statusMap[selectedStudent.studentStatus]?.text}
              </Tag>
            </div>
          </div>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: 16, maxHeight: '60vh', overflowY: 'auto' }}>
            <Row gutter={[16, 16]}>
              {fieldList.map((field) => (
                <Col xs={24} sm={24} md={12} key={field.key}>
                  <div
                    style={{
                      wordBreak: 'break-word',
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
                    <span style={{ marginLeft: 8 }}>
                      {field.render
                        ? field.render(
                            selectedStudent.user[field.key] ??
                              selectedStudent[field.key] ??
                              selectedStudent.class?.[field.key] ??
                              selectedStudent.class?.program?.department?.[
                                field.key
                              ]
                          )
                        : (selectedStudent.user[field.key] ??
                          selectedStudent[field.key] ??
                          selectedStudent.class?.[field.key] ??
                          selectedStudent.class?.program?.department?.[
                            field.key
                          ] ?? (
                            <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
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

  // Edit Modal
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...selectedStudent,
        user: {
          ...selectedStudent.user,
          ...values,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format('YYYY-MM-DD')
            : null,
        },
        mssv: values.mssv,
        yearOfAdmission: values.yearOfAdmission,
        studentStatus: values.studentStatus,
        gender: values.gender,
      };
      await studentServices.updateStudentInformation(payload);
      message.success('Cập nhật thông tin thành công');
      setOpenEdit(false);
      fetchStudents(pageNumber, pageSize, search);
    } catch (err) {
      // Validation error or API error
    }
  };

  const EditModal = (
    <Modal
      open={openEdit}
      onCancel={() => setOpenEdit(false)}
      onOk={handleEditSubmit}
      okText="Lưu"
      cancelText="Hủy"
      width={700}
      centered
      title={
        <Space>
          <EditOutlined />
          Chỉnh sửa thông tin sinh viên
        </Space>
      }
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      responsive
    >
      {selectedStudent && (
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
                      field.key === 'dateOfBirth'
                        ? selectedStudent.user.dateOfBirth
                          ? dayjs(selectedStudent.user.dateOfBirth)
                          : null
                        : (selectedStudent.user[field.key] ??
                          selectedStudent[field.key] ??
                          selectedStudent.class?.[field.key] ??
                          selectedStudent.class?.program?.department?.[
                            field.key
                          ])
                    }
                    rules={
                      field.key === 'mssv' || field.key === 'fullName'
                        ? [
                            {
                              required: true,
                              message: `Vui lòng nhập ${field.label}`,
                            },
                          ]
                        : []
                    }
                  >
                    {field.key === 'gender' ? (
                      <Select options={genderOptions} />
                    ) : field.key === 'studentStatus' ? (
                      <Select options={statusOptions} />
                    ) : field.key === 'dateOfBirth' ? (
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày sinh"
                        allowClear
                      />
                    ) : (
                      <Input />
                    )}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </div>
      )}
    </Modal>
  );

  return (
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: '#1677ff', fontSize: 22 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Danh sách sinh viên
          </span>
        </Space>
      }
      extra={
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Tìm kiếm tên, MSSV, email..."
            onSearch={handleSearch}
            style={{ width: 220, maxWidth: '100%' }}
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchStudents(pageNumber, pageSize, search)}
          >
            Làm mới
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            type="primary"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Xuất Excel
          </Button>
        </Space>
      }
      style={{
        margin: 24,
        borderRadius: 12,
        boxShadow: '0 2px 8px #1677ff22',
        background: '#f8fbff',
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Divider style={{ margin: 0 }} />
      <Table
        columns={columns}
        dataSource={students}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{
          current: pageNumber,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total) => `Tổng ${total} sinh viên`,
          onChange: (page, size) => {
            setPageNumber(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1100 }}
        bordered
        size="middle"
        responsive
      />
      {DetailModal}
      {EditModal}
    </Card>
  );
};

export default StudentList;
