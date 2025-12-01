import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import { Table, Popconfirm, message } from 'antd';
import {
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Flag as FlagIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const UserTable = ({
  data,
  loading,
  totalCount,
  pageNumber,
  pageSize,
  onChange,
  onView,
  onEdit,
}) => {
  const theme = useTheme();

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={record.avatarUrl} sx={{ width: 40, height: 40, mr: 2 }}>
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
            ) : (
              <PersonIcon />
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
      render: (email) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon fontSize="small" />
          {email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </Box>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      render: (phone) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon fontSize="small" />
          {phone || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </Box>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      render: (address) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon fontSize="small" />
          {address || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </Box>
      ),
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      render: (v) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon fontSize="small" />
          {v || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </Box>
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
              onClick={() => onView(record)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="info"
              onClick={() => onEdit(record)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => message.info('Tính năng xóa chưa hỗ trợ')}
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

  return (
    <Table
      columns={columns}
      dataSource={data}
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
      onChange={onChange}
      scroll={{ x: 'max-content' }}
      size="middle"
    />
  );
};

export default UserTable;
