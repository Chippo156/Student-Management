import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Avatar,
  Tooltip,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  AccountBox as AccountBoxIcon,
  LocationOn as LocationOnIcon,
  CreditCard as CreditCardIcon,
  Flag as FlagIcon,
  AssignmentInd as AssignmentIndIcon,
  CalendarToday as CalendarTodayIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import { Table, Input, Select, message, Popconfirm } from 'antd';
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const genderLabel = (gender) => {
  if (gender === 0) return 'Nam';
  if (gender === 1) return 'Nữ';
  if (gender === 2) return 'Khác';
  return '';
};

const UserManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate(); // Thêm dòng này
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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await userService.getAllUsers(pageNumber, pageSize);
      if (res) {
        setUsers(res.items || []);
        setTotalCount(res.totalCount || 0);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [pageNumber, pageSize]);

  // Filtered users
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

  // Table columns
  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={record.avatarUrl}
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              backgroundColor: theme.palette.primary.main,
            }}
          >
            {(record.fullName || record.username || '').charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {record.fullName || record.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {record.username}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'roleName'],
      key: 'role',
      render: (roleName) => (
        <Chip
          icon={
            roleName === 'Admin' ? (
              <AdminIcon />
            ) : roleName === 'Giảng viên' ? (
              <SchoolIcon />
            ) : roleName === 'Sinh viên' ? (
              <PersonIcon />
            ) : (
              <GroupIcon />
            )
          }
          label={roleName}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {phone || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {address || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
      render: (nationality) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {nationality || (
              <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
            )}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      align: 'center',
      render: (status) => (
        <Chip
          label={status === 0 ? 'Hoạt động' : 'Khóa'}
          color={status === 0 ? 'success' : 'default'}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor:
              status === 0
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.grey[500], 0.12),
            color:
              status === 0
                ? theme.palette.success.main
                : theme.palette.text.secondary,
          }}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedUser(record);
                setOpenDetail(true);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="info"
              onClick={() => {
                setSelectedUser(record);
                setOpenEdit(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => message.info('Chức năng xóa chưa được hỗ trợ')}
          >
            <Tooltip title="Xóa">
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Popconfirm>
        </Stack>
      ),
    },
  ];

  // Pagination handler
  const handleTableChange = (pagination) => {
    setPageNumber(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const fieldList = [
    {
      label: 'Tên đăng nhập',
      key: 'username',
      icon: <BadgeIcon fontSize="small" />,
    },
    {
      label: 'Họ và tên',
      key: 'fullName',
      icon: <PersonIcon fontSize="small" />,
    },
    { label: 'Email', key: 'email', icon: <EmailIcon fontSize="small" /> },
    {
      label: 'Số điện thoại',
      key: 'phone',
      icon: <PhoneIcon fontSize="small" />,
    },
    { label: 'Địa chỉ', key: 'address', icon: <HomeIcon fontSize="small" /> },
    {
      label: 'Địa chỉ tạm trú',
      key: 'temporaryAddress',
      icon: <HomeIcon fontSize="small" />,
    },
    {
      label: 'Giới tính',
      key: 'gender',
      icon: <WcIcon fontSize="small" />,
      render: (v) => genderLabel(v),
    },
    {
      label: 'Nơi sinh',
      key: 'placeOfBirth',
      icon: <LocationOnIcon fontSize="small" />,
    },
    { label: 'Tôn giáo', key: 'religion', icon: <FlagIcon fontSize="small" /> },
    {
      label: 'Ngày sinh',
      key: 'dateOfBirth',
      icon: <CakeIcon fontSize="small" />,
      render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
    },
    {
      label: 'CCCD',
      key: 'citizenIdCard',
      icon: <CreditCardIcon fontSize="small" />,
    },
    {
      label: 'Ngày cấp',
      key: 'issuedDate',
      icon: <CalendarTodayIcon fontSize="small" />,
      render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
    },
    {
      label: 'Nơi cấp',
      key: 'issuedPlace',
      icon: <AssignmentIndIcon fontSize="small" />,
    },
    { label: 'Đối tượng', key: 'object', icon: <GroupIcon fontSize="small" /> },
    {
      label: 'Khu vực chính sách',
      key: 'policyArea',
      icon: <GroupIcon fontSize="small" />,
    },
    {
      label: 'Ngày vào Đoàn',
      key: 'dateOfJoinUnion',
      icon: <CalendarTodayIcon fontSize="small" />,
      render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
    },
    {
      label: 'Ngày vào Đảng',
      key: 'dateOfJoinParty',
      icon: <CalendarTodayIcon fontSize="small" />,
      render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
    },
    {
      label: 'Tài khoản ngân hàng',
      key: 'bankAccount',
      icon: <CreditCardIcon fontSize="small" />,
    },
    { label: 'Dân tộc', key: 'ethnicity', icon: <FlagIcon fontSize="small" /> },
    {
      label: 'Quốc tịch',
      key: 'nationality',
      icon: <FlagIcon fontSize="small" />,
    },
    {
      label: 'Tỉnh quê quán',
      key: 'hometownProvince',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Huyện quê quán',
      key: 'hometownDistrict',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Xã quê quán',
      key: 'hometownWard',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Tỉnh nơi sinh',
      key: 'birthProvince',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Huyện nơi sinh',
      key: 'birthDistrict',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Xã nơi sinh',
      key: 'birthWard',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Tỉnh giấy khai sinh',
      key: 'birthCertProvince',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Huyện giấy khai sinh',
      key: 'birthCertDistrict',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Xã giấy khai sinh',
      key: 'birthCertWard',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Tỉnh thường trú',
      key: 'permanentProvince',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Huyện thường trú',
      key: 'permanentDistrict',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Xã thường trú',
      key: 'permanentWard',
      icon: <LocationOnIcon fontSize="small" />,
    },
    {
      label: 'Số BHYT',
      key: 'healthInsuranceNumber',
      icon: <LocalHospitalIcon fontSize="small" />,
    },
    {
      label: 'Nơi đăng ký BHYT',
      key: 'healthInsuranceRegistrationPlace',
      icon: <LocalHospitalIcon fontSize="small" />,
    },
    {
      label: 'Trạng thái tài khoản',
      key: 'accountStatus',
      icon: <BadgeIcon fontSize="small" />,
      render: (v) => (v === 0 ? 'Hoạt động' : 'Khóa'),
    },
  ];

  const renderField = (user, field) => {
    let value = user[field.key];
    if (field.render) value = field.render(value);

    // Custom render for bankAccount (object)
    if (field.key === 'bankAccount') {
      if (value && typeof value === 'object' && value.accountNumber) {
        value = (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Số TK: {value.accountNumber}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Ngân hàng: {value.bankName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Chủ TK: {value.accountHolderName}
            </Typography>
          </Box>
        );
      } else {
        value = <span style={{ color: '#aaa' }}>Chưa cập nhật</span>;
      }
    }

    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (typeof value === 'object' && !React.isValidElement(value))
    ) {
      value = <span style={{ color: '#aaa' }}>Chưa cập nhật</span>;
    }

    return (
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Grid item>{field.icon}</Grid>
        <Grid item xs>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 700, display: 'inline' }}
          >
            {field.label}:
          </Typography>
          <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
            {value}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Quản lý người dùng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin người dùng, phân quyền và trạng thái hoạt động.
        </Typography>
      </Box>

      {/* Filter and Search */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Input.Search
                allowClear
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select
                value={filterRole}
                onChange={(value) => setFilterRole(value)}
                style={{ width: '100%', borderRadius: 8 }}
                placeholder="Vai trò"
              >
                <Option value="all">Tất cả vai trò</Option>
                <Option value="admin">Quản trị viên</Option>
                <Option value="giảng viên">Giảng viên</Option>
                <Option value="sinh viên">Sinh viên</Option>
              </Select>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  height: 40,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 140,
                }}
                onClick={() => navigate('/admin/create-user')}
              >
                Thêm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 2 }}>
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
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: theme.palette.background.paper,
            boxShadow: 8,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBoxIcon color="inherit" />
            <span style={{ fontWeight: 700, fontSize: 20 }}>
              Chi tiết người dùng
            </span>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ background: theme.palette.background.default }}
        >
          {selectedUser && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: theme.palette.background.paper,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={selectedUser.avatarUrl}
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    bgcolor: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: 36,
                    border: '3px solid #fff',
                    boxShadow: 2,
                  }}
                >
                  {(
                    selectedUser.fullName ||
                    selectedUser.username ||
                    ''
                  ).charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 900, color: theme.palette.primary.main }}
                  >
                    {selectedUser.fullName || selectedUser.username}
                  </Typography>
                  <Chip
                    icon={
                      selectedUser.role?.roleName === 'Admin' ? (
                        <AdminIcon />
                      ) : selectedUser.role?.roleName === 'Giảng viên' ? (
                        <SchoolIcon />
                      ) : selectedUser.role?.roleName === 'Sinh viên' ? (
                        <PersonIcon />
                      ) : (
                        <GroupIcon />
                      )
                    }
                    label={selectedUser.role?.roleName}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: 14,
                      mt: 1,
                    }}
                  />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {fieldList
                    .slice(0, Math.ceil(fieldList.length / 2))
                    .map((field) => renderField(selectedUser, field))}
                </Grid>
                <Grid item xs={12} md={6}>
                  {fieldList
                    .slice(Math.ceil(fieldList.length / 2))
                    .map((field) => renderField(selectedUser, field))}
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            background: theme.palette.background.paper,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Button
            onClick={() => setOpenDetail(false)}
            variant="contained"
            sx={{
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              '&:hover': { background: theme.palette.primary.dark },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: theme.palette.background.paper,
            boxShadow: 8,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="inherit" />
            <span style={{ fontWeight: 700, fontSize: 20 }}>
              Chỉnh sửa người dùng
            </span>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ background: theme.palette.background.default }}
        >
          {selectedUser && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: theme.palette.background.paper,
              }}
            >
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {fieldList.map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 700 }}
                    >
                      {field.icon} {field.label}
                    </Typography>
                    <Input
                      defaultValue={
                        field.key === 'bankAccount'
                          ? selectedUser[field.key] &&
                            typeof selectedUser[field.key] === 'object'
                            ? JSON.stringify(selectedUser[field.key])
                            : ''
                          : field.render
                            ? field.render(selectedUser[field.key])
                            : selectedUser[field.key]
                      }
                      style={{
                        width: '100%',
                        marginBottom: 16,
                        fontSize: 16,
                        borderRadius: 8,
                        padding: 8,
                      }}
                      placeholder={field.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            background: theme.palette.background.paper,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Button
            onClick={() => setOpenEdit(false)}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              color: theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}`,
              background: theme.palette.background.paper,
              mr: 2,
              '&:hover': { background: theme.palette.action.hover },
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              color: theme.palette.primary.contrastText,
              boxShadow: 2,
            }}
            onClick={() => setOpenEdit(false)}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
