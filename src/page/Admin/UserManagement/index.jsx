import React, { useState, useEffect, useMemo } from 'react';
import { message, Popconfirm } from 'antd';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  Avatar,
  TablePagination,
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
import { userService } from '../../../service/userService';
import UserDetailModal from '../../../component/Admin/UserManagementPage/UserDetailModal';
import UserEditModal from '../../../component/Admin/UserManagementPage/UserEditModal';
import { exportUsersExcel } from '../../../until/exportUsersExcel';
import { useDebounce } from '../../../hooks/useDebounce';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = async () => {
    setLoading(true);
    const roleId = filterRole !== 'all' ? getRoleIdFromName(filterRole) : null;
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

  const getRoleIdFromName = (roleName) => {
    const roleMap = {
      admin: 1,
      'giảng viên': 2,
      'sinh viên': 3,
    };
    return roleMap[roleName.toLowerCase()] || null;
  };

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
    setRowsPerPage(parseInt(event.target.value, 10));
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
    setFilterRole('all');
  };

  const handleExportExcel = async () => {
    let filterInfo = '';
    if (searchTerm) filterInfo += `Tìm kiếm: "${searchTerm}"`;
    if (filterRole !== 'all')
      filterInfo += (filterInfo ? ', ' : '') + `Vai trò: ${filterRole}`;

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
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Quản lý người dùng
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={fetchUsers}
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: '#e3f2fd' },
                boxShadow: 1,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/admin/create-user')}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
            }}
          >
            Thêm người dùng
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={users.length === 0}
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' },
              textTransform: 'none',
              px: 3,
              boxShadow: 2,
            }}
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
              bgcolor: '#e3f2fd',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <People sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}
                >
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng người dùng
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: '#e8f5e9',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}
                >
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Đang hoạt động
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: '#ffebee',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <AdminPanelSettings
                sx={{ fontSize: 50, mr: 2, color: '#d32f2f' }}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: '#d32f2f' }}
                >
                  {stats.admins}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Quản trị viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: '#f3e5f5',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <SchoolIcon sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}
                >
                  {stats.teachers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
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
            <FilterList sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bộ lọc tìm kiếm
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={filterRole}
                  label="Vai trò"
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <MenuItem value="all">Tất cả vai trò</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="giảng viên">Giảng viên</MenuItem>
                  <MenuItem value="sinh viên">Sinh viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ height: '40px' }}
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
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  Người dùng
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  Vai trò
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  Số điện thoại
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.userId}
                  hover
                  sx={{
                    '&:hover': { bgcolor: '#f5f5f5' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={user.avatarUrl}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#e6f4ff',
                          color: '#1677ff',
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
                  </TableCell>
                  <TableCell>{getRoleChip(user.role?.roleName)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email || (
                        <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.phone || (
                        <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(user.accountStatus)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}
                    >
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
                            const res = await userService.deactivateUser(
                              user.userId
                            );
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
                            const res = await userService.reactivateUser(
                              user.userId
                            );
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {users.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <People sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy người dùng nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || filterRole !== 'all'
                ? 'Thử thay đổi bộ lọc để tìm kiếm'
                : 'Chưa có người dùng nào trong hệ thống'}
            </Typography>
          </Box>
        )}

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
      </Paper>

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
