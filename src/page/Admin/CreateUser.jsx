import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  FormHelperText,
  Chip,
  Avatar,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    studentId: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const roles = [
    { value: '1', label: 'Admin' },
    { value: '2', label: 'Giảng viên' },
    { value: '3', label: 'Sinh viên' },
    { value: '4', label: 'Super Admin' },
  ];

  const departments = [
    'Công nghệ thông tin',
    'Kinh tế',
    'Ngoại ngữ',
    'Khoa học tự nhiên',
    'Kỹ thuật',
    'Y khoa',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Họ tên là bắt buộc';
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    if (!formData.role) newErrors.role = 'Vai trò là bắt buộc';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      studentId: '',
      employeeId: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography variant="h4" component="h1">
          Tạo tài khoản mới
        </Typography>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Tạo tài khoản thành công!
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange('fullName', e.target.value)
                        }
                        error={!!errors.fullName}
                        helperText={errors.fullName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        error={!!errors.email}
                        helperText={errors.email}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.role} required>
                        <InputLabel>Vai trò</InputLabel>
                        <Select
                          value={formData.role}
                          onChange={(e) =>
                            handleInputChange('role', e.target.value)
                          }
                          label="Vai trò"
                        >
                          {roles.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={role.label}
                                  size="small"
                                  color={
                                    role.value === '1' || role.value === '4'
                                      ? 'primary'
                                      : 'default'
                                  }
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.role && (
                          <FormHelperText>{errors.role}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Thông tin học tập/công tác */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin học tập/công tác
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Khoa/Phòng ban</InputLabel>
                        <Select
                          value={formData.department}
                          onChange={(e) =>
                            handleInputChange('department', e.target.value)
                          }
                          label="Khoa/Phòng ban"
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {formData.role === '3' && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mã sinh viên"
                          value={formData.studentId}
                          onChange={(e) =>
                            handleInputChange('studentId', e.target.value)
                          }
                          placeholder="VD: SV2024001"
                        />
                      </Grid>
                    )}
                    {(formData.role === '1' ||
                      formData.role === '2' ||
                      formData.role === '4') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mã nhân viên"
                          value={formData.employeeId}
                          onChange={(e) =>
                            handleInputChange('employeeId', e.target.value)
                          }
                          placeholder="VD: NV2024001"
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Thông tin bảo mật */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin bảo mật
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        error={!!errors.password}
                        helperText={errors.password || 'Tối thiểu 6 ký tự'}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange('confirmPassword', e.target.value)
                        }
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleReset}
                >
                  Làm mới
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Tạo tài khoản
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser;
