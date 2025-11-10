import React, { useEffect, useState, useMemo } from 'react';
// Ant Design - Layout & Container
import {
  Input,
  Card,
  Avatar as AntAvatar,
  Button,
  Space,
  Tooltip,
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
// Material-UI - Table & Animations
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  TablePagination,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Box,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { studentServices } from '../../../service/studentServices';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { StatCardAntd } from '../../../component/Shared/StatCard';

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
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // MUI uses 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();

  const fetchStudents = async (pageNum = 1, size = 10, searchText = '') => {
    setLoading(true);
    const res = await studentServices.getAllStudents(pageNum, size);
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
    fetchStudents(page + 1, rowsPerPage, search); // +1 for API
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(0);
    fetchStudents(1, rowsPerPage, value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
        };
      case 1:
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
        };
      case 2:
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
        };
      default:
        return {
          bg: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[500],
        };
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.studentStatus === 0).length;
    const graduatedStudents = students.filter(
      (s) => s.studentStatus === 2
    ).length;
    const uniqueDepartments = new Set(
      students
        .map((s) => s.class?.program?.department?.departmentName)
        .filter(Boolean)
    );
    return {
      total: totalCount,
      active: activeStudents,
      graduated: graduatedStudents,
      departments: uniqueDepartments.size,
    };
  }, [students, totalCount]);

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
            <AntAvatar
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
      fetchStudents(page + 1, rowsPerPage, search); // +1 for API
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
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Quản lý sinh viên</h2>
        <div style={{ color: '#888' }}>
          Quản lý thông tin sinh viên, lớp học và trạng thái học tập.
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng sinh viên"
            value={stats.total}
            icon={TeamOutlined}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Đang học"
            value={stats.active}
            icon={CheckCircleOutlined}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Đã tốt nghiệp"
            value={stats.graduated}
            icon={IdcardOutlined}
            color="#1890ff"
            bgColor="#e6f7ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Khoa"
            value={stats.departments}
            icon={ApartmentOutlined}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

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
              onClick={() => fetchStudents(page + 1, rowsPerPage, search)}
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
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        styles={{
          body: { padding: 0 },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>MSSV</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Lớp</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Năm nhập học</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const statusInfo = getStatusColor(student.studentStatus);
                    return (
                      <TableRow
                        key={student.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.05
                            ),
                            transition: 'all 0.3s ease',
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={student.user.avatarUrl}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#e6f4ff',
                                color: '#1677ff',
                              }}
                            >
                              {student.user.fullName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {student.user.fullName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {student.mssv}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.user.email ? (
                              <a
                                href={`mailto:${student.user.email}`}
                                style={{
                                  color: theme.palette.primary.main,
                                  textDecoration: 'none',
                                }}
                              >
                                {student.user.email}
                              </a>
                            ) : (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.class?.className}
                            size="small"
                            sx={{
                              backgroundColor: alpha(
                                theme.palette.info.main,
                                0.1
                              ),
                              color: theme.palette.info.main,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.class?.program?.department
                              ?.departmentName || (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.yearOfAdmission || (
                              <span style={{ color: '#aaa' }}>-</span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              statusMap[student.studentStatus]?.text ||
                              'Không xác định'
                            }
                            size="small"
                            sx={{
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.color,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.5,
                              justifyContent: 'center',
                            }}
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                sx={{ color: '#13c2c2' }}
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setOpenDetail(true);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                sx={{ color: '#fa8c16' }}
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setOpenEdit(true);
                                  form.setFieldsValue({
                                    ...student.user,
                                    mssv: student.mssv,
                                    className: student.class?.className,
                                    departmentName:
                                      student.class?.program?.department
                                        ?.departmentName,
                                    yearOfAdmission: student.yearOfAdmission,
                                    studentStatus: student.studentStatus,
                                    gender: student.user.gender,
                                    dateOfBirth: student.user.dateOfBirth
                                      ? dayjs(student.user.dateOfBirth)
                                      : null,
                                  });
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </>
        )}
        {DetailModal}
        {EditModal}
      </Card>
    </div>
  );
};

export default StudentList;
