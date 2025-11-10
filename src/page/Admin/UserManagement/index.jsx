import React, { useState, useMemo, useEffect } from 'react';
// Ant Design - Layout & Container
import { Card, Row, Col, message, Popconfirm } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
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
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import { accountStatusMap } from '../../../component/Admin/UserManagementPage/constants';
import UserFilterBar from '../../../component/Admin/UserManagementPage/UserFilterBar';
import UserDetailModal from '../../../component/Admin/UserManagementPage/UserDetailModal';
import UserEditModal from '../../../component/Admin/UserManagementPage/UserEditModal';
import { StatCardAntd } from '../../../component/Shared/StatCard';

const UserManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // MUI uses 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getAllUsers(page + 1, rowsPerPage); // +1 for API
    if (res) {
      setUsers(res.items || []);
      setTotalCount(res.totalCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

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

  // Statistics
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

  // Handle edit save
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

  // Role color helper
  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
        };
      case 'Giảng viên':
        return {
          bg: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        };
      default:
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
        };
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    return status === 1
      ? {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          label: 'Hoạt động',
        }
      : {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          label: 'Bị khóa',
        };
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Quản lý người dùng</h2>
        <div style={{ color: '#888' }}>
          Quản lý thông tin người dùng, phân quyền và trạng thái hoạt động.
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Tổng người dùng"
            value={stats.total}
            icon={UserOutlined}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Đang hoạt động"
            value={stats.active}
            icon={CheckCircleOutlined}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Quản trị viên"
            value={stats.admins}
            icon={SafetyCertificateOutlined}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCardAntd
            label="Giảng viên"
            value={stats.teachers}
            icon={TeamOutlined}
            color="#13c2c2"
            bgColor="#e6fffb"
          />
        </Col>
      </Row>

      <UserFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        onAddUser={() => navigate('/admin/create-user')}
      />

      <Card
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
                    <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleColors = getRoleColor(user.role?.roleName);
                    const statusInfo = getStatusColor(user.accountStatus);
                    return (
                      <TableRow
                        key={user.userId}
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
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {user.fullName || user.username}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role?.roleName}
                            size="small"
                            sx={{
                              backgroundColor: roleColors.bg,
                              color: roleColors.color,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.email || (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.phone || (
                              <span style={{ color: '#aaa' }}>
                                Chưa cập nhật
                              </span>
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
                                sx={{ color: '#fa8c16' }}
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
                                    message.success(
                                      'Đã vô hiệu hóa tài khoản!'
                                    );
                                    await fetchUsers();
                                  } else {
                                    message.error('Vô hiệu hóa thất bại!');
                                  }
                                }}
                              >
                                <Tooltip title="Khóa tài khoản">
                                  <IconButton
                                    size="small"
                                    sx={{ color: theme.palette.error.main }}
                                  >
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
                                  } else {
                                    message.error('Mở lại tài khoản thất bại!');
                                  }
                                }}
                              >
                                <Tooltip title="Mở khóa tài khoản">
                                  <IconButton
                                    size="small"
                                    sx={{ color: theme.palette.success.main }}
                                  >
                                    <LockOpenIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Popconfirm>
                            )}
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
      </Card>

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
    </div>
  );
};

export default UserManagement;
