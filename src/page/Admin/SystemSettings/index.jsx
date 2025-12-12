import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Sample system configurations
const systemConfigs = [
  {
    id: 'site_name',
    category: 'general',
    name: 'Tên hệ thống',
    description: 'Tên hiển thị của hệ thống quản lý sinh viên',
    value: 'T1 Student Management System',
    type: 'text',
  },
  {
    id: 'max_students_per_class',
    category: 'academic',
    name: 'Số sinh viên tối đa/lớp',
    description: 'Giới hạn số lượng sinh viên trong một lớp học',
    value: 50,
    type: 'number',
  },
  {
    id: 'enable_notifications',
    category: 'notifications',
    name: 'Bật thông báo',
    description: 'Cho phép gửi thông báo qua email và SMS',
    value: true,
    type: 'boolean',
  },
  {
    id: 'default_semester',
    category: 'academic',
    name: 'Học kỳ mặc định',
    description: 'Học kỳ mặc định khi tạo môn học mới',
    value: 'HK1 2023-2024',
    type: 'select',
    options: ['HK1 2023-2024', 'HK2 2023-2024', 'HK1 2024-2025'],
  },
  {
    id: 'auto_backup',
    category: 'system',
    name: 'Tự động sao lưu',
    description: 'Tự động sao lưu dữ liệu hàng ngày',
    value: true,
    type: 'boolean',
  },
  {
    id: 'session_timeout',
    category: 'security',
    name: 'Thời gian hết phiên (phút)',
    description: 'Thời gian tự động đăng xuất khi không hoạt động',
    value: 30,
    type: 'number',
  },
  {
    id: 'email_smtp_server',
    category: 'email',
    name: 'SMTP Server',
    description: 'Máy chủ SMTP để gửi email',
    value: 'smtp.gmail.com',
    type: 'text',
  },
  {
    id: 'maintenance_mode',
    category: 'system',
    name: 'Chế độ bảo trì',
    description: 'Bật chế độ bảo trì hệ thống',
    value: false,
    type: 'boolean',
  },
];

const SystemSettings = () => {
  const theme = useTheme();
  const [configs, setConfigs] = useState(systemConfigs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingConfig, setEditingConfig] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      background: theme.palette.background.default,
      paper: theme.palette.background.paper,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
    }),
    [theme]
  );

  const categories = [
    {
      key: 'general',
      label: 'Tổng quát',
      icon: <SecurityIcon />,
      color: colors.primary,
    },
    {
      key: 'academic',
      label: 'Học tập',
      icon: <StorageIcon />,
      color: colors.info,
    },
    {
      key: 'notifications',
      label: 'Thông báo',
      icon: <NotificationsIcon />,
      color: colors.warning,
    },
    {
      key: 'email',
      label: 'Email',
      icon: <EmailIcon />,
      color: colors.secondary,
    },
    {
      key: 'security',
      label: 'Bảo mật',
      icon: <SecurityIcon />,
      color: colors.error,
    },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: <StorageIcon />,
      color: colors.success,
    },
  ];

  const filteredConfigs = useMemo(() => {
    return configs.filter((config) => {
      const matchesSearch =
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || config.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [configs, searchTerm, filterCategory]);

  const handleEdit = (config) => {
    setEditingConfig(config);
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (editingConfig) {
      setConfigs(
        configs.map((config) =>
          config.id === editingConfig.id ? editingConfig : config
        )
      );
    }
    setOpenDialog(false);
    setEditingConfig(null);
  };

  const handleValueChange = (newValue) => {
    if (editingConfig) {
      setEditingConfig({ ...editingConfig, value: newValue });
    }
  };

  const renderConfigValue = (config) => {
    switch (config.type) {
      case 'boolean':
        return (
          <Chip
            label={config.value ? 'Bật' : 'Tắt'}
            size="small"
            sx={{
              backgroundColor: alpha(
                config.value ? colors.success : colors.error,
                0.1
              ),
              color: config.value ? colors.success : colors.error,
              fontWeight: 600,
            }}
          />
        );
      case 'number':
        return (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {config.value}
          </Typography>
        );
      default:
        return (
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {String(config.value)}
          </Typography>
        );
    }
  };

  const renderEditField = () => {
    if (!editingConfig) return null;

    switch (editingConfig.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(editingConfig.value)}
                onChange={(e) => handleValueChange(e.target.checked)}
              />
            }
            label={editingConfig.name}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            label={editingConfig.name}
            type="number"
            value={editingConfig.value}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            helperText={editingConfig.description}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{editingConfig.name}</InputLabel>
            <Select
              value={editingConfig.value}
              label={editingConfig.name}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              {editingConfig.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return (
          <TextField
            fullWidth
            label={editingConfig.name}
            value={editingConfig.value}
            onChange={(e) => handleValueChange(e.target.value)}
            helperText={editingConfig.description}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        backgroundColor: colors.background,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: colors.text, mb: 1 }}
        >
          Cài đặt hệ thống
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý các cấu hình và thiết lập hệ thống quản lý sinh viên.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <BackupIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Sao lưu dữ liệu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <UpdateIcon sx={{ fontSize: 40, color: colors.info, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Cập nhật hệ thống
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <SecurityIcon
                sx={{ fontSize: 40, color: colors.warning, mb: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Kiểm tra bảo mật
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <StorageIcon
                sx={{ fontSize: 40, color: colors.success, mb: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Quản lý dung lượng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm cài đặt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filterCategory}
                  label="Danh mục"
                  onChange={(e) => setFilterCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.key} value={category.key}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: 2,
                  height: 56,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Lưu tất cả
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Settings by Category */}
      {categories.map((category) => {
        const categoryConfigs = filteredConfigs.filter(
          (config) => config.category === category.key
        );
        if (categoryConfigs.length === 0) return null;

        return (
          <Card key={category.key} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  p: { xs: 2, sm: 2, md: 3 },
                  backgroundColor: alpha(category.color, 0.05),
                  borderBottom: `1px solid ${alpha(category.color, 0.1)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(category.color, 0.1),
                      color: category.color,
                      mr: 2,
                    }}
                  >
                    {category.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.text }}
                  >
                    {category.label}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 0 }}>
                {categoryConfigs.map((config, index) => (
                  <Box key={config.id}>
                    <Box
                      sx={{
                        p: { xs: 2, sm: 2, md: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {config.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {config.description}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        {renderConfigValue(config)}
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(config)}
                          sx={{ color: colors.primary }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {index < categoryConfigs.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa cài đặt</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>{renderEditField()}</Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;
