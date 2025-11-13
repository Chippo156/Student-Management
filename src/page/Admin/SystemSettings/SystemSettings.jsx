import React, { useState } from 'react';
import { message } from 'antd';
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../../component/Common';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const SystemSettings = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [config, setConfig] = useState({
    systemName: 'Hệ thống quản lý sinh viên',
    systemLogo: '',
    mainColor: '#1976d2',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    academicYear: '2024-2025',
    semesterSystem: '2-semester',
    gradeScale: '10-point',
    minPassingGrade: 5.0,
    maxCreditsPerSemester: 24,
    emailNotifications: true,
    smsNotifications: false,
    systemAnnouncements: true,
    gradeNotifications: true,
    passwordPolicy: 'medium',
    sessionTimeout: 30,
    twoFactorAuth: false,
    maintenanceMode: false,
    backupFrequency: 'daily',
    logRetention: 30,
  });

  const [formData, setFormData] = useState(config);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setConfig(formData);
      message.success('Cài đặt hệ thống đã được lưu thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(config);
    message.info('Đã khôi phục về cài đặt gốc');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Cài đặt hệ thống"
        actions={
          <>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Khôi phục mặc định
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ textTransform: 'none', px: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Lưu cài đặt'}
            </Button>
          </>
        }
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Quản lý các cài đặt chung của hệ thống quản lý sinh viên
      </Typography>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="system settings tabs">
          <Tab label="Cài đặt chung" icon={<SettingsIcon />} {...a11yProps(0)} />
          <Tab label="Học vụ" icon={<SchoolIcon />} {...a11yProps(1)} />
          <Tab label="Thông báo" icon={<NotificationsIcon />} {...a11yProps(2)} />
          <Tab label="Bảo mật" icon={<SecurityIcon />} {...a11yProps(3)} />
          <Tab label="Thông tin" icon={<InfoIcon />} {...a11yProps(4)} />
        </Tabs>

        {/* Tab 1 - Cài đặt chung */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên hệ thống"
                name="systemName"
                value={formData.systemName}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Ngôn ngữ</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  label="Ngôn ngữ"
                >
                  <MenuItem value="vi">Tiếng Việt</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Múi giờ</InputLabel>
                <Select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  label="Múi giờ"
                >
                  <MenuItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</MenuItem>
                  <MenuItem value="Asia/Bangkok">Bangkok (UTC+7)</MenuItem>
                  <MenuItem value="Asia/Shanghai">Shanghai (UTC+8)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Màu chủ đạo"
                name="mainColor"
                value={formData.mainColor}
                onChange={handleInputChange}
                type="color"
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2 - Học vụ */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm học"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                placeholder="Ví dụ: 2024-2025"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hệ thống học kỳ</InputLabel>
                <Select
                  name="semesterSystem"
                  value={formData.semesterSystem}
                  onChange={handleInputChange}
                  label="Hệ thống học kỳ"
                >
                  <MenuItem value="2-semester">2 học kỳ chính + hè</MenuItem>
                  <MenuItem value="3-semester">3 học kỳ</MenuItem>
                  <MenuItem value="4-quarter">4 quý</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Thang điểm</InputLabel>
                <Select
                  name="gradeScale"
                  value={formData.gradeScale}
                  onChange={handleInputChange}
                  label="Thang điểm"
                >
                  <MenuItem value="10-point">Thang điểm 10</MenuItem>
                  <MenuItem value="4-point">Thang điểm 4</MenuItem>
                  <MenuItem value="100-point">Thang điểm 100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Điểm đậu tối thiểu"
                name="minPassingGrade"
                type="number"
                value={formData.minPassingGrade}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tín chỉ tối đa mỗi học kỳ"
                name="maxCreditsPerSemester"
                type="number"
                value={formData.maxCreditsPerSemester}
                onChange={handleInputChange}
                inputProps={{ min: 10, max: 50 }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3 - Thông báo */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cài đặt thông báo
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleInputChange}
                        />
                      }
                      label="Thông báo qua Email"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="smsNotifications"
                          checked={formData.smsNotifications}
                          onChange={handleInputChange}
                        />
                      }
                      label="Thông báo qua SMS"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="systemAnnouncements"
                          checked={formData.systemAnnouncements}
                          onChange={handleInputChange}
                        />
                      }
                      label="Thông báo hệ thống"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="gradeNotifications"
                          checked={formData.gradeNotifications}
                          onChange={handleInputChange}
                        />
                      }
                      label="Thông báo điểm số"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cấu hình email
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="SMTP Server"
                      placeholder="smtp.gmail.com"
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      type="number"
                      placeholder="587"
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Email Username"
                      placeholder="admin@school.edu.vn"
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Email Password"
                      type="password"
                      placeholder="Mật khẩu email"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4 - Bảo mật */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chính sách mật khẩu
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Độ mạnh mật khẩu</InputLabel>
                      <Select
                        name="passwordPolicy"
                        value={formData.passwordPolicy}
                        onChange={handleInputChange}
                        label="Độ mạnh mật khẩu"
                      >
                        <MenuItem value="weak">Yếu (6+ ký tự)</MenuItem>
                        <MenuItem value="medium">Trung bình (8+ ký tự, chữ và số)</MenuItem>
                        <MenuItem value="strong">Mạnh (12+ ký tự, chữ, số, ký tự đặc biệt)</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Thời gian hết phiên (phút)"
                      name="sessionTimeout"
                      type="number"
                      value={formData.sessionTimeout}
                      onChange={handleInputChange}
                      inputProps={{ min: 5, max: 1440 }}
                      variant="outlined"
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="twoFactorAuth"
                          checked={formData.twoFactorAuth}
                          onChange={handleInputChange}
                        />
                      }
                      label="Xác thực 2 bước"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cài đặt bảo trì
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="maintenanceMode"
                          checked={formData.maintenanceMode}
                          onChange={handleInputChange}
                        />
                      }
                      label="Chế độ bảo trì"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Tần suất sao lưu</InputLabel>
                      <Select
                        name="backupFrequency"
                        value={formData.backupFrequency}
                        onChange={handleInputChange}
                        label="Tần suất sao lưu"
                      >
                        <MenuItem value="hourly">Mỗi giờ</MenuItem>
                        <MenuItem value="daily">Hàng ngày</MenuItem>
                        <MenuItem value="weekly">Hàng tuần</MenuItem>
                        <MenuItem value="monthly">Hàng tháng</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Thời gian lưu log (ngày)"
                      name="logRetention"
                      type="number"
                      value={formData.logRetention}
                      onChange={handleInputChange}
                      inputProps={{ min: 1, max: 365 }}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5 - Thông tin hệ thống */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tên hệ thống
                  </Typography>
                  <Typography variant="body2">{config.systemName}</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    Phiên bản
                  </Typography>
                  <Typography variant="body2">v1.0.0</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    Ngày phát hành
                  </Typography>
                  <Typography variant="body2">27/09/2025</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    Nhà phát triển
                  </Typography>
                  <Typography variant="body2">Đại học XYZ</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Số lượng sinh viên
                  </Typography>
                  <Typography variant="body2">1,250 sinh viên</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    Số lượng môn học
                  </Typography>
                  <Typography variant="body2">325 môn học</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    Dung lượng database
                  </Typography>
                  <Typography variant="body2">2.5 GB</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    Lần sao lưu cuối
                  </Typography>
                  <Typography variant="body2">27/09/2025 02:00 AM</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                © 2025 Hệ thống quản lý sinh viên. Tất cả quyền được bảo lưu.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SystemSettings;
