import React, { useState, useEffect, useMemo } from 'react';
import { message, Popconfirm } from 'antd';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  People,
  CheckCircle,
  AdminPanelSettings,
  School as SchoolIcon,
  Search as SearchIcon,
  FilterList,
  Refresh,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import { userService } from '../../../service/userService';
import UserDetailModal from '../../../component/Admin/UserManagementPage/UserDetailModal';
import UserEditModal from '../../../component/Admin/UserManagementPage/UserEditModal';
import SearchableAutocomplete from '../../../component/Common/SearchableAutocomplete';
import { exportUsersExcel } from '../../../until/exportUsersExcel';
import { useDebounce } from '../../../hooks/useDebounce';
import DataTable from '../../../component/Common/DataTable';

const UserManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = async () => {
    setLoading(true);
    // Only pass roleId if it's not null and not undefined
    const roleId =
      filterRole?.id !== null && filterRole?.id !== undefined
        ? filterRole.id
        : null;
    const res = await userService.getAllUsers(
      page + 1,
      rowsPerPage,
      roleId,
      debouncedSearchTerm // ✅ Dùng debounced value
    );
    if (res) {
      setUsers(res.items || []);
      setTotalCount(res.totalCount || 0);
    }
    setLoading(false);
  };

  // Role options for SearchableAutocomplete - ensure plain objects
  const roleOptions = React.useMemo(
    () => [
      { id: null, name: 'Tất cả vai trò' },
      { id: 1, name: 'Admin' },
      { id: 3, name: 'Giảng viên' },
      { id: 2, name: 'Sinh viên' },
    ],
    []
  );

  // ✅ Fetch users khi debounced search term thay đổi
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, rowsPerPage, debouncedSearchTerm, filterRole]);

  const stats = useMemo(() => {
    const activeUsers = users.filter((u) => u.accountStatus === 1).length;
    const adminUsers = users.filter((u) => u.role?.roleName === 'Admin').length;
    const teacherUsers = users.filter(
      (u) => u.role?.roleName === 'Giảng viên'
    ).length;
    return {
      total: totalCount,
      active: activeUsers,
      admins: adminUsers,
      teachers: teacherUsers,
    };
  }, [users, totalCount]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(
      parseInt(event.target.value.target?.value || event.target.value, 10)
    );
    setPage(0);
  };

  const handleEditSave = async (payload) => {
    setEditLoading(true);
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterRole(null);
  };

  const handleExportExcel = async () => {
    let filterInfo = '';
    if (searchTerm) filterInfo += `Tìm kiếm: "${searchTerm}"`;
    if (filterRole && filterRole.id !== null)
      filterInfo += (filterInfo ? ', ' : '') + `Vai trò: ${filterRole.name}`;

    const result = await exportUsersExcel(users, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  const getRoleChip = (roleName) => {
    const roleConfig = {
      Admin: { color: 'error', label: 'Admin' },
      'Giảng viên': { color: 'primary', label: 'Giảng viên' },
      'Sinh viên': { color: 'success', label: 'Sinh viên' },
    };
    const config = roleConfig[roleName] || {
      color: 'default',
      label: roleName,
    };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getStatusChip = (status) => {
    return status === 1 ? (
      <Chip label="Hoạt động" color="success" size="small" />
    ) : (
      <Chip label="Bị khóa" color="error" size="small" />
    );
  };

  // Define columns for DataTable
  const columns = [
    {
      field: 'user',
      headerName: 'Người dùng',
      width: '25%',
      renderCell: (user) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={user.avatarUrl}
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            {user.fullName?.[0] || user.username?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user.fullName || user.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.username}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Vai trò',
      width: '15%',
      renderCell: (user) => getRoleChip(user.role?.roleName),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: '20%',
      renderCell: (user) => (
        <Typography variant="body2">
          {user.email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'Số điện thoại',
      width: '15%',
      renderCell: (user) => (
        <Typography variant="body2">
          {user.phone || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: '12%',
      renderCell: (user) => getStatusChip(user.accountStatus),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: '13%',
      align: 'center',
      renderCell: (user) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedUser(user);
                setOpenDetail(true);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedUser(user);
                setOpenEdit(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {user.accountStatus === 1 ? (
            <Popconfirm
              title="Vô hiệu hóa tài khoản này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={async () => {
                const res = await userService.deactivateUser(user.userId);
                if (res) {
                  message.success('Đã vô hiệu hóa tài khoản!');
                  await fetchUsers();
                }
              }}
            >
              <Tooltip title="Khóa tài khoản">
                <IconButton size="small" color="error">
                  <LockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Mở lại tài khoản này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={async () => {
                const res = await userService.reactivateUser(user.userId);
                if (res) {
                  message.success('Đã mở lại tài khoản!');
                  await fetchUsers();
                }
              }}
            >
              <Tooltip title="Mở khóa tài khoản">
                <IconButton size="small" color="success">
                  <LockOpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Popconfirm>
          )}
        </Box>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Quản lý người dùng
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchUsers}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
                boxShadow: 1,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/admin/create-user')}
            color="primary"
            sx={{
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
              width: { xs: '100%', sm: 'auto' },
            }}
            size="small"
          >
            Thêm người dùng
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={users.length === 0}
            color="success"
            sx={{
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
              width: { xs: '100%', sm: 'auto' },
            }}
            size="small"
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <People sx={{ fontSize: 50, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: 'primary.main' }}
                >
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng người dùng
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <CheckCircle
                sx={{ fontSize: 50, mr: 2, color: 'success.main' }}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: 'success.main' }}
                >
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang hoạt động
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <AdminPanelSettings
                sx={{ fontSize: 50, mr: 2, color: 'error.main' }}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: 'error.main' }}
                >
                  {stats.admins}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quản trị viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <SchoolIcon
                sx={{ fontSize: 50, mr: 2, color: 'secondary.main' }}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: 'secondary.main' }}
                >
                  {stats.teachers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Giảng viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Bộ lọc tìm kiếm
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
                helperText={
                  searchTerm !== debouncedSearchTerm && searchTerm
                    ? 'Đang tìm kiếm...'
                    : null
                }
              />
            </Grid>
            <Grid item xs={12} sm={8} md={4} lg={4}>
              <SearchableAutocomplete
                options={roleOptions}
                placeholder="Tìm vai trò..."
                value={filterRole}
                onChange={(value) => {
                  setFilterRole(value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2} lg={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ height: '40px' }}
                size="small"
              >
                Đặt lại
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy: <strong>{users.length}</strong> người dùng
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <DataTable
        columns={columns}
        rows={users}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <Box>
            <People sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy người dùng nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || filterRole !== 'all'
                ? 'Thử thay đổi bộ lọc để tìm kiếm'
                : 'Chưa có người dùng nào trong hệ thống'}
            </Typography>
          </Box>
        }
      />

      <UserDetailModal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        user={selectedUser}
      />
      <UserEditModal
        open={openEdit}
        onCancel={() => setOpenEdit(false)}
        user={selectedUser}
        onSave={handleEditSave}
        loading={editLoading}
      />
    </Box>
  );
};

export default UserManagement;
