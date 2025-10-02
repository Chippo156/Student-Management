import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  FolderShared as FolderSharedIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

const UserProfiles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample data
  const profiles: UserProfile[] = [
    {
      id: '1',
      fullName: 'Nguyễn Văn Admin',
      email: 'admin@university.edu.vn',
      role: 'Admin',
      department: 'Quản lý hệ thống',
      status: 'active',
      lastLogin: '2024-10-02 09:30:00',
      phone: '0901234567',
      address: 'Hà Nội',
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      fullName: 'Trần Thị Hương',
      email: 'huong.tran@university.edu.vn',
      role: 'Giảng viên',
      department: 'Công nghệ thông tin',
      status: 'active',
      lastLogin: '2024-10-01 14:22:00',
      phone: '0912345678',
      address: 'TP.HCM',
      joinDate: '2022-09-01'
    },
    {
      id: '3',
      fullName: 'Lê Văn Minh',
      email: 'minh.le@student.university.edu.vn',
      role: 'Sinh viên',
      department: 'Công nghệ thông tin',
      status: 'active',
      lastLogin: '2024-10-02 08:15:00',
      phone: '0923456789',
      address: 'Đà Nẵng',
      joinDate: '2023-09-15'
    },
    {
      id: '4',
      fullName: 'Phạm Thị Lan',
      email: 'lan.pham@university.edu.vn',
      role: 'Giảng viên',
      department: 'Kinh tế',
      status: 'inactive',
      lastLogin: '2024-09-28 16:45:00',
      phone: '0934567890',
      address: 'Cần Thơ',
      joinDate: '2021-03-10'
    }
  ];

  const roles = ['Admin', 'Giảng viên', 'Sinh viên'];
  const statuses = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' }
  ];

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || profile.role === roleFilter;
    const matchesStatus = !statusFilter || profile.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewProfile = (profile: UserProfile) => {
    setSelectedUser(profile);
    setViewDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Giảng viên': return 'primary';
      case 'Sinh viên': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <FolderSharedIcon />
        </Avatar>
        <Typography variant="h4" component="h1">
          Quản lý Profile người dùng
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Vai trò"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Profiles Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Khoa/Phòng ban</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đăng nhập cuối</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProfiles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((profile) => (
                <TableRow key={profile.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {profile.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {profile.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={profile.role}
                      color={getRoleColor(profile.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{profile.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(profile.status)}
                      color={getStatusColor(profile.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(profile.lastLogin).toLocaleDateString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(profile.lastLogin).toLocaleTimeString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewProfile(profile)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProfiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* View Profile Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết Profile: {selectedUser?.fullName}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin cơ bản
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Họ tên:</strong> {selectedUser.fullName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedUser.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Số điện thoại:</strong> {selectedUser.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Địa chỉ:</strong> {selectedUser.address}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin hệ thống
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Vai trò:</strong> {selectedUser.role}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Khoa/Phòng ban:</strong> {selectedUser.department}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ngày gia nhập:</strong> {new Date(selectedUser.joinDate).toLocaleDateString('vi-VN')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Đăng nhập cuối:</strong> {new Date(selectedUser.lastLogin).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Đóng
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfiles;