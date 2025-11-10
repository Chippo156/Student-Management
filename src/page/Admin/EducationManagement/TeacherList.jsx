import React, { useEffect, useState, useMemo } from 'react';
// Ant Design - Layout & Container
import {
  Input,
  Card,
  Avatar as AntAvatar,
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
  CheckCircleOutlined,
  FileExcelOutlined,
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
  Tooltip,
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
import { lecturerService } from '../../../service/lecturerService';
import { StatCardAntd } from '../../../component/Shared/StatCard';

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
  const theme = useTheme();
  const [lecturers, setLecturers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // MUI uses 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [form] = Form.useForm();

  const fetchLecturers = async (pageNum = 1, size = 10, searchText = '') => {
    setLoading(true);
    const res = await lecturerService.getAllLecturers(pageNum, size);
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
    fetchLecturers(page + 1, rowsPerPage, search); // +1 for API
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(0);
    fetchLecturers(1, rowsPerPage, value);
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
    return status === 0
      ? {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          label: 'Đang công tác',
        }
      : {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          label: 'Nghỉ việc',
        };
  };

  // Statistics
  const stats = useMemo(() => {
    const activeLecturers = lecturers.filter(
      (l) => l.user.accountStatus === 0
    ).length;
    const uniqueDepartments = new Set(
      lecturers.map((l) => l.department?.departmentName).filter(Boolean)
    );
    const withTitle = lecturers.filter((l) => l.academicTitle).length;
    return {
      total: totalCount,
      active: activeLecturers,
      departments: uniqueDepartments.size,
      withTitle: withTitle,
    };
  }, [lecturers, totalCount]);

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
      fetchLecturers(page + 1, rowsPerPage, search); // +1 for API
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
            <AntAvatar
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

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Quản lý giảng viên</h2>
        <div style={{ color: '#888' }}>
          Quản lý thông tin giảng viên, khoa và trạng thái công tác.
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng giảng viên"
            value={stats.total}
            icon={UserOutlined}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Đang công tác"
            value={stats.active}
            icon={CheckCircleOutlined}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Có học hàm"
            value={stats.withTitle}
            icon={IdcardOutlined}
            color="#13c2c2"
            bgColor="#e6fffb"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Khoa"
            value={stats.departments}
            icon={TeamOutlined}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

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
              onClick={() => fetchLecturers(page + 1, rowsPerPage, search)}
            >
              Làm mới
            </Button>
            <Button
              icon={<FileExcelOutlined />}
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
        styles={{ body: { padding: 0 } }}
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
                    <TableCell sx={{ fontWeight: 600 }}>Giảng viên</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã GV</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Chức vụ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Học hàm</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lecturers.map((lecturer) => {
                    const statusInfo = getStatusColor(
                      lecturer.user.accountStatus
                    );
                    return (
                      <TableRow
                        key={lecturer.id}
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
                              src={lecturer.user.avatarUrl}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#e6f4ff',
                                color: '#1677ff',
                              }}
                            >
                              {lecturer.user.fullName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {lecturer.user.fullName}
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
                            {lecturer.lecturerCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {lecturer.user.email || (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {lecturer.user.phone || (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {lecturer.department?.departmentName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {lecturer.position || (
                              <span style={{ color: '#aaa' }}>-</span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {lecturer.academicTitle || (
                              <span style={{ color: '#aaa' }}>-</span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
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
                                  setSelectedLecturer(lecturer);
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
                                  setSelectedLecturer(lecturer);
                                  setOpenEdit(true);
                                  form.setFieldsValue({
                                    ...lecturer.user,
                                    lecturerCode: lecturer.lecturerCode,
                                    departmentName:
                                      lecturer.department?.departmentName,
                                    position: lecturer.position,
                                    academicTitle: lecturer.academicTitle,
                                    accountStatus: lecturer.user.accountStatus,
                                    fullName: lecturer.user.fullName,
                                    email: lecturer.user.email,
                                    phone: lecturer.user.phone,
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

export default TeacherList;
