import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  Fade,
  Grow,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Person,
  Lock,
  Notifications,
  Settings as SettingsIcon,
  Save,
  Edit,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { teacherService } from '../../../service';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    officeLocation: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    gradeNotifications: true,
    courseUpdates: true,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const user = useSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const lecturerId = user?.lecturerId;

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      bgPrimary: alpha(theme.palette.primary.main, 0.1),
    }),
    [theme]
  );

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const response = await teacherService.getTeacherInfo(lecturerId);
        const data = response.data || {};

        // Sử dụng dữ liệu từ user account nếu API không có
        setProfileData({
          fullName:
            data.fullName ||
            user?.user?.fullName ||
            user?.fullName ||
            user?.username ||
            '',
          email: data.email || user?.user?.email || user?.email || '',
          phone: data.phone || user?.user?.phone || user?.phone || '',
          department: data.department || user?.departmentName || '',
          officeLocation: data.officeLocation || '',
          bio: data.bio || '',
        });
      } catch (error) {
        console.error('Error fetching teacher info:', error);
        // Fallback to user data if API call fails
        setProfileData({
          fullName:
            user?.user?.fullName || user?.fullName || user?.username || '',
          email: user?.user?.email || user?.email || '',
          phone: user?.user?.phone || user?.phone || '',
          department: user?.departmentName || '',
          officeLocation: '',
          bio: '',
        });
      }
    };

    if (lecturerId) {
      fetchTeacherInfo();
    } else if (user) {
      // Nếu chưa có lecturerId, sử dụng dữ liệu từ user luôn
      setProfileData({
        fullName:
          user?.user?.fullName || user?.fullName || user?.username || '',
        email: user?.user?.email || user?.email || '',
        phone: user?.user?.phone || user?.phone || '',
        department: user?.departmentName || '',
        officeLocation: '',
        bio: '',
      });
    }
  }, [lecturerId, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await teacherService.updateTeacherInfo({
        lecturerId: lecturerId,
        ...profileData,
      });

      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin thành công!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi cập nhật thông tin',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Mật khẩu xác nhận không khớp',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      // Call API to change password
      // await authService.changePassword(passwordData);

      setSnackbar({
        open: true,
        message: 'Đổi mật khẩu thành công!',
        severity: 'success',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi đổi mật khẩu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    setSnackbar({
      open: true,
      message: 'Lưu cài đặt thông báo thành công!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Fade in={true} timeout={600}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 4, fontWeight: 'bold' }}
        >
          Cài đặt
        </Typography>
      </Fade>

      <Grid container className="equal-height-cards" spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: colors.primary,
                  fontSize: 48,
                }}
              >
                {profileData.fullName?.charAt(0).toUpperCase() || 'T'}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {user?.academicTitle} {profileData.fullName || 'Giảng viên'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.position}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.department}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.facultyName}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                sx={{ mt: 2 }}
                onClick={() => setTabValue(0)}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </Card>
          </Grow>
        </Grid>

        {/* Settings Tabs */}
        <Grid item xs={12} md={8}>
          <Fade in={true} timeout={1000}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="settings tabs"
                >
                  <Tab icon={<Person />} label="Thông tin cá nhân" />
                  <Tab icon={<Lock />} label="Đổi mật khẩu" />
                  <Tab icon={<Notifications />} label="Thông báo" />
                </Tabs>
              </Box>

              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container className="equal-height-cards" spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin cá nhân
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={profileData.fullName}
                      onChange={(e) =>
                        handleProfileChange('fullName', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileChange('email', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileChange('phone', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Khoa/Bộ môn"
                      value={profileData.department}
                      onChange={(e) =>
                        handleProfileChange('department', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phòng làm việc"
                      value={profileData.officeLocation}
                      onChange={(e) =>
                        handleProfileChange('officeLocation', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Giới thiệu"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) =>
                        handleProfileChange('bio', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      Lưu thay đổi
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Password Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container className="equal-height-cards" spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Đổi mật khẩu
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu hiện tại"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange('currentPassword', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu mới"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange('newPassword', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange('confirmPassword', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Lock />}
                      onClick={handleChangePassword}
                      disabled={
                        loading ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                    >
                      Đổi mật khẩu
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container className="equal-height-cards" spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Cài đặt thông báo
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={() =>
                            handleNotificationChange('emailNotifications')
                          }
                        />
                      }
                      label="Nhận thông báo qua email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.assignmentReminders}
                          onChange={() =>
                            handleNotificationChange('assignmentReminders')
                          }
                        />
                      }
                      label="Nhắc nhở về hạn nộp bài tập"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.gradeNotifications}
                          onChange={() =>
                            handleNotificationChange('gradeNotifications')
                          }
                        />
                      }
                      label="Thông báo về điểm số"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.courseUpdates}
                          onChange={() =>
                            handleNotificationChange('courseUpdates')
                          }
                        />
                      }
                      label="Cập nhật về khóa học"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveNotifications}
                    >
                      Lưu cài đặt
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
