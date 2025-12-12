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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Person,
  Lock,
  Notifications,
  Settings as SettingsIcon,
  Save,
  Edit,
  Badge,
  Home,
  HealthAndSafety,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { teacherService } from '../../../service';
import { externalBankService } from '../../../service/helperService';
import dayjs from 'dayjs';

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
    // Thông tin cơ bản
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: null,
    placeOfBirth: '',
    ethnicity: '',
    nationality: '',
    religion: '',

    // CMND/CCCD
    citizenIdCard: '',
    issuedDate: null,
    issuedPlace: '',

    // Bảo hiểm y tế
    healthInsuranceNumber: '',
    healthInsuranceRegistrationPlace: '',
    registeredHospital: '',

    // Quê quán
    hometownProvince: '',
    hometownDistrict: '',
    hometownWard: '',

    // Nơi sinh
    birthProvince: '',
    birthDistrict: '',
    birthWard: '',

    // Khai sinh
    birthCertProvince: '',
    birthCertDistrict: '',
    birthCertWard: '',

    // Hộ khẩu thường trú
    permanentProvince: '',
    permanentDistrict: '',
    permanentWard: '',

    // Địa chỉ
    temporaryAddress: '',
    contactAddress: '',
    address: '',

    // Thông tin khác
    object: '',
    policyArea: '',
    dateOfJoinUnion: null,
    dateOfJoinParty: null,
  });

  const [errors, setErrors] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Address data
  const [provinces, setProvinces] = useState([]);
  const [hometownDistricts, setHometownDistricts] = useState([]);
  const [hometownWards, setHometownWards] = useState([]);
  const [birthDistricts, setBirthDistricts] = useState([]);
  const [birthWards, setBirthWards] = useState([]);
  const [birthCertDistricts, setBirthCertDistricts] = useState([]);
  const [birthCertWards, setBirthCertWards] = useState([]);
  const [permanentDistricts, setPermanentDistricts] = useState([]);
  const [permanentWards, setPermanentWards] = useState([]);

  // Selected IDs for dropdowns (UI state)
  const [selectedIds, setSelectedIds] = useState({
    hometownProvinceId: '',
    hometownDistrictId: '',
    hometownWardId: '',
    permanentProvinceId: '',
    permanentDistrictId: '',
    permanentWardId: '',
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

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await externalBankService.getProvinces();
        setProvinces(data?.data || data || []);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const initData = () => {
      // Lấy dữ liệu từ user object trong Redux store
      const userData = user?.user || {};

      setProfileData({
        fullName: userData.fullName || user?.fullName || '',
        email: userData.email || user?.email || '',
        phone: userData.phone || user?.phone || '',
        gender: userData.gender ?? '',
        dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
        placeOfBirth: userData.placeOfBirth || '',
        ethnicity: userData.ethnicity || '',
        nationality: userData.nationality || '',
        religion: userData.religion || '',
        citizenIdCard: userData.citizenIdCard || '',
        issuedDate: userData.issuedDate ? dayjs(userData.issuedDate) : null,
        issuedPlace: userData.issuedPlace || '',
        healthInsuranceNumber: userData.healthInsuranceNumber || '',
        healthInsuranceRegistrationPlace:
          userData.healthInsuranceRegistrationPlace || '',
        registeredHospital: userData.registeredHospital || '',
        hometownProvince: userData.hometownProvince || '',
        hometownDistrict: userData.hometownDistrict || '',
        hometownWard: userData.hometownWard || '',
        birthProvince: userData.birthProvince || '',
        birthDistrict: userData.birthDistrict || '',
        birthWard: userData.birthWard || '',
        birthCertProvince: userData.birthCertProvince || '',
        birthCertDistrict: userData.birthCertDistrict || '',
        birthCertWard: userData.birthCertWard || '',
        permanentProvince: userData.permanentProvince || '',
        permanentDistrict: userData.permanentDistrict || '',
        permanentWard: userData.permanentWard || '',
        temporaryAddress: userData.temporaryAddress || '',
        contactAddress: userData.contactAddress || '',
        address: userData.address || '',
        object: userData.object || '',
        policyArea: userData.policyArea || '',
        dateOfJoinUnion: userData.dateOfJoinUnion
          ? dayjs(userData.dateOfJoinUnion)
          : null,
        dateOfJoinParty: userData.dateOfJoinParty
          ? dayjs(userData.dateOfJoinParty)
          : null,
      });

      // Load districts and wards for initial values & find IDs from names
      // Note: Backend stores names (string) but we need IDs for dropdowns
      const loadAddressData = async () => {
        // Hometown
        if (userData.hometownProvince && provinces.length > 0) {
          const provinceObj = provinces.find(
            (p) => p.name === userData.hometownProvince
          );
          if (provinceObj) {
            setSelectedIds((prev) => ({
              ...prev,
              hometownProvinceId: provinceObj.id,
            }));
            const data = await externalBankService.getDistrictsByProvince(
              provinceObj.id
            );
            const districts = data?.data || data || [];
            setHometownDistricts(districts);

            if (userData.hometownDistrict) {
              const districtObj = districts.find(
                (d) => d.name === userData.hometownDistrict
              );
              if (districtObj) {
                setSelectedIds((prev) => ({
                  ...prev,
                  hometownDistrictId: districtObj.id,
                }));
                const wardData = await externalBankService.getWardsByDistrict(
                  districtObj.id
                );
                const wards = wardData?.data || wardData || [];
                setHometownWards(wards);

                if (userData.hometownWard) {
                  const wardObj = wards.find(
                    (w) => w.name === userData.hometownWard
                  );
                  if (wardObj) {
                    setSelectedIds((prev) => ({
                      ...prev,
                      hometownWardId: wardObj.id,
                    }));
                  }
                }
              }
            }
          }
        }

        // Permanent address
        if (userData.permanentProvince && provinces.length > 0) {
          const provinceObj = provinces.find(
            (p) => p.name === userData.permanentProvince
          );
          if (provinceObj) {
            setSelectedIds((prev) => ({
              ...prev,
              permanentProvinceId: provinceObj.id,
            }));
            const data = await externalBankService.getDistrictsByProvince(
              provinceObj.id
            );
            const districts = data?.data || data || [];
            setPermanentDistricts(districts);

            if (userData.permanentDistrict) {
              const districtObj = districts.find(
                (d) => d.name === userData.permanentDistrict
              );
              if (districtObj) {
                setSelectedIds((prev) => ({
                  ...prev,
                  permanentDistrictId: districtObj.id,
                }));
                const wardData = await externalBankService.getWardsByDistrict(
                  districtObj.id
                );
                const wards = wardData?.data || wardData || [];
                setPermanentWards(wards);

                if (userData.permanentWard) {
                  const wardObj = wards.find(
                    (w) => w.name === userData.permanentWard
                  );
                  if (wardObj) {
                    setSelectedIds((prev) => ({
                      ...prev,
                      permanentWardId: wardObj.id,
                    }));
                  }
                }
              }
            }
          }
        }
      };

      loadAddressData();
    };

    if (user) {
      initData();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Address handlers
  const handleHometownProvinceChange = async (e) => {
    const selectedId = e.target.value;
    const selectedProvince = provinces.find((p) => p.id === selectedId);
    const provinceName = selectedProvince?.name || '';

    setSelectedIds((prev) => ({
      ...prev,
      hometownProvinceId: selectedId,
      hometownDistrictId: '',
      hometownWardId: '',
    }));
    handleProfileChange('hometownProvince', provinceName);
    handleProfileChange('hometownDistrict', '');
    handleProfileChange('hometownWard', '');
    setHometownWards([]);
    if (selectedId) {
      const data = await externalBankService.getDistrictsByProvince(selectedId);
      setHometownDistricts(data?.data || data || []);
    } else {
      setHometownDistricts([]);
    }
  };

  const handleHometownDistrictChange = async (e) => {
    const selectedId = e.target.value;
    const selectedDistrict = hometownDistricts.find((d) => d.id === selectedId);
    const districtName = selectedDistrict?.name || '';

    setSelectedIds((prev) => ({
      ...prev,
      hometownDistrictId: selectedId,
      hometownWardId: '',
    }));
    handleProfileChange('hometownDistrict', districtName);
    handleProfileChange('hometownWard', '');
    if (selectedId) {
      const data = await externalBankService.getWardsByDistrict(selectedId);
      setHometownWards(data?.data || data || []);
    } else {
      setHometownWards([]);
    }
  };

  const handlePermanentProvinceChange = async (e) => {
    const selectedId = e.target.value;
    const selectedProvince = provinces.find((p) => p.id === selectedId);
    const provinceName = selectedProvince?.name || '';

    setSelectedIds((prev) => ({
      ...prev,
      permanentProvinceId: selectedId,
      permanentDistrictId: '',
      permanentWardId: '',
    }));
    handleProfileChange('permanentProvince', provinceName);
    handleProfileChange('permanentDistrict', '');
    handleProfileChange('permanentWard', '');
    setPermanentWards([]);
    if (selectedId) {
      const data = await externalBankService.getDistrictsByProvince(selectedId);
      setPermanentDistricts(data?.data || data || []);
    } else {
      setPermanentDistricts([]);
    }
  };

  const handlePermanentDistrictChange = async (e) => {
    const selectedId = e.target.value;
    const selectedDistrict = permanentDistricts.find(
      (d) => d.id === selectedId
    );
    const districtName = selectedDistrict?.name || '';

    setSelectedIds((prev) => ({
      ...prev,
      permanentDistrictId: selectedId,
      permanentWardId: '',
    }));
    handleProfileChange('permanentDistrict', districtName);
    handleProfileChange('permanentWard', '');
    if (selectedId) {
      const data = await externalBankService.getWardsByDistrict(selectedId);
      setPermanentWards(data?.data || data || []);
    } else {
      setPermanentWards([]);
    }
  };

  const handleHometownWardChange = (e) => {
    const selectedId = e.target.value;
    const selectedWard = hometownWards.find((w) => w.id === selectedId);
    const wardName = selectedWard?.name || '';
    setSelectedIds((prev) => ({ ...prev, hometownWardId: selectedId }));
    handleProfileChange('hometownWard', wardName);
  };

  const handlePermanentWardChange = (e) => {
    const selectedId = e.target.value;
    const selectedWard = permanentWards.find((w) => w.id === selectedId);
    const wardName = selectedWard?.name || '';
    setSelectedIds((prev) => ({ ...prev, permanentWardId: selectedId }));
    handleProfileChange('permanentWard', wardName);
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

  const validateProfile = () => {
    const newErrors = {};

    // Validate họ tên
    if (!profileData.fullName || profileData.fullName.trim() === '') {
      newErrors.fullName = 'Họ và tên không được để trống';
    }

    // Validate email
    if (!profileData.email || profileData.email.trim() === '') {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone
    if (profileData.phone && !/^[0-9]{10,11}$/.test(profileData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate CMND/CCCD
    if (
      profileData.citizenIdCard &&
      !/^[0-9]{9,12}$/.test(profileData.citizenIdCard)
    ) {
      newErrors.citizenIdCard = 'CMND/CCCD phải có 9-12 chữ số';
    }

    // Validate health insurance
    if (
      profileData.healthInsuranceNumber &&
      !/^[A-Z0-9]{10,15}$/.test(profileData.healthInsuranceNumber)
    ) {
      newErrors.healthInsuranceNumber =
        'Số BHYT phải có 10-15 ký tự (chữ hoa và số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin nhập vào',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare payload with proper handling for enum fields
      const payload = {
        fullName: profileData.fullName || null,
        email: profileData.email || null,
        phone: profileData.phone || null,
        gender:
          profileData.gender !== '' &&
          profileData.gender !== null &&
          profileData.gender !== undefined
            ? profileData.gender
            : null,
        dateOfBirth: profileData.dateOfBirth
          ? profileData.dateOfBirth.format('YYYY-MM-DD')
          : null,
        placeOfBirth: profileData.placeOfBirth || null,
        ethnicity: profileData.ethnicity || null,
        nationality: profileData.nationality || null,
        religion: profileData.religion || null,
        avatarUrl: null,
        citizenIdCard: profileData.citizenIdCard || null,
        issuedDate: profileData.issuedDate
          ? profileData.issuedDate.format('YYYY-MM-DD')
          : null,
        issuedPlace: profileData.issuedPlace || null,
        healthInsuranceNumber: profileData.healthInsuranceNumber || null,
        healthInsuranceRegistrationPlace:
          profileData.healthInsuranceRegistrationPlace || null,
        registeredHospital: profileData.registeredHospital || null,
        hometownProvince: profileData.hometownProvince || null,
        hometownDistrict: profileData.hometownDistrict || null,
        hometownWard: profileData.hometownWard || null,
        birthProvince: profileData.birthProvince || null,
        birthDistrict: profileData.birthDistrict || null,
        birthWard: profileData.birthWard || null,
        birthCertProvince: profileData.birthCertProvince || null,
        birthCertDistrict: profileData.birthCertDistrict || null,
        birthCertWard: profileData.birthCertWard || null,
        permanentProvince: profileData.permanentProvince || null,
        permanentDistrict: profileData.permanentDistrict || null,
        permanentWard: profileData.permanentWard || null,
        temporaryAddress: profileData.temporaryAddress || null,
        contactAddress: profileData.contactAddress || null,
        address: profileData.address || null,
        object: profileData.object || null,
        policyArea: profileData.policyArea || null,
        dateOfJoinUnion: profileData.dateOfJoinUnion
          ? profileData.dateOfJoinUnion.format('YYYY-MM-DD')
          : null,
        dateOfJoinParty: profileData.dateOfJoinParty
          ? profileData.dateOfJoinParty.format('YYYY-MM-DD')
          : null,
      };

      // Remove gender field if it's null/empty to avoid validation error
      if (payload.gender === null) {
        delete payload.gender;
      }

      await teacherService.updateLecturerInfo(payload);

      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin thành công!',
        severity: 'success',
      });
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Lỗi khi cập nhật thông tin',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Mật khẩu hiện tại không được để trống';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin mật khẩu',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      await teacherService.resetPassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

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
      setErrors({});
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Lỗi khi đổi mật khẩu',
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

      <Grid container spacing={3}>
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
                  {/* <Tab icon={<Notifications />} label="Thông báo" /> */}
                </Tabs>
              </Box>

              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
                  <Grid container spacing={3}>
                    {/* Thông tin cơ bản */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Person color="primary" />
                        <Typography variant="h6">Thông tin cơ bản</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Họ và tên"
                        value={profileData.fullName}
                        onChange={(e) =>
                          handleProfileChange('fullName', e.target.value)
                        }
                        error={!!errors.fullName}
                        helperText={errors.fullName}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                          value={profileData.gender}
                          label="Giới tính"
                          onChange={(e) =>
                            handleProfileChange('gender', e.target.value)
                          }
                        >
                          <MenuItem value={1}>Nam</MenuItem>
                          <MenuItem value={0}>Nữ</MenuItem>
                          <MenuItem value={2}>Khác</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileChange('email', e.target.value)
                        }
                        error={!!errors.email}
                        helperText={errors.email}
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
                        error={!!errors.phone}
                        helperText={errors.phone}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ngày sinh"
                        type="date"
                        value={
                          profileData.dateOfBirth
                            ? profileData.dateOfBirth.format('YYYY-MM-DD')
                            : ''
                        }
                        onChange={(e) =>
                          handleProfileChange(
                            'dateOfBirth',
                            e.target.value ? dayjs(e.target.value) : null
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nơi sinh"
                        value={profileData.placeOfBirth}
                        onChange={(e) =>
                          handleProfileChange('placeOfBirth', e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Dân tộc"
                        value={profileData.ethnicity}
                        onChange={(e) =>
                          handleProfileChange('ethnicity', e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Quốc tịch"
                        value={profileData.nationality}
                        onChange={(e) =>
                          handleProfileChange('nationality', e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Tôn giáo"
                        value={profileData.religion}
                        onChange={(e) =>
                          handleProfileChange('religion', e.target.value)
                        }
                      />
                    </Grid>

                    {/* CMND/CCCD */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Badge color="primary" />
                        <Typography variant="h6">CMND/CCCD</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Số CMND/CCCD"
                        value={profileData.citizenIdCard}
                        onChange={(e) =>
                          handleProfileChange('citizenIdCard', e.target.value)
                        }
                        error={!!errors.citizenIdCard}
                        helperText={errors.citizenIdCard}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Ngày cấp"
                        type="date"
                        value={
                          profileData.issuedDate
                            ? profileData.issuedDate.format('YYYY-MM-DD')
                            : ''
                        }
                        onChange={(e) =>
                          handleProfileChange(
                            'issuedDate',
                            e.target.value ? dayjs(e.target.value) : null
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Nơi cấp"
                        value={profileData.issuedPlace}
                        onChange={(e) =>
                          handleProfileChange('issuedPlace', e.target.value)
                        }
                      />
                    </Grid>

                    {/* Bảo hiểm y tế */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <HealthAndSafety color="primary" />
                        <Typography variant="h6">Bảo hiểm y tế</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Số BHYT"
                        value={profileData.healthInsuranceNumber}
                        onChange={(e) =>
                          handleProfileChange(
                            'healthInsuranceNumber',
                            e.target.value.toUpperCase()
                          )
                        }
                        error={!!errors.healthInsuranceNumber}
                        helperText={errors.healthInsuranceNumber}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Nơi đăng ký KCB"
                        value={profileData.healthInsuranceRegistrationPlace}
                        onChange={(e) =>
                          handleProfileChange(
                            'healthInsuranceRegistrationPlace',
                            e.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Bệnh viện đăng ký"
                        value={profileData.registeredHospital}
                        onChange={(e) =>
                          handleProfileChange(
                            'registeredHospital',
                            e.target.value
                          )
                        }
                      />
                    </Grid>

                    {/* Địa chỉ */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Home color="primary" />
                        <Typography variant="h6">Địa chỉ</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    {/* Quê quán */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Quê quán
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Tỉnh/Thành phố</InputLabel>
                        <Select
                          value={selectedIds.hometownProvinceId}
                          label="Tỉnh/Thành phố"
                          onChange={handleHometownProvinceChange}
                        >
                          <MenuItem value="">
                            <em>Chọn tỉnh/thành phố</em>
                          </MenuItem>
                          {provinces.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        disabled={!selectedIds.hometownProvinceId}
                      >
                        <InputLabel>Quận/Huyện</InputLabel>
                        <Select
                          value={selectedIds.hometownDistrictId}
                          label="Quận/Huyện"
                          onChange={handleHometownDistrictChange}
                        >
                          <MenuItem value="">
                            <em>Chọn quận/huyện</em>
                          </MenuItem>
                          {hometownDistricts.map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                              {d.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        disabled={!selectedIds.hometownDistrictId}
                      >
                        <InputLabel>Phường/Xã</InputLabel>
                        <Select
                          value={selectedIds.hometownWardId}
                          label="Phường/Xã"
                          onChange={handleHometownWardChange}
                        >
                          <MenuItem value="">
                            <em>Chọn phường/xã</em>
                          </MenuItem>
                          {hometownWards.map((w) => (
                            <MenuItem key={w.id} value={w.id}>
                              {w.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Hộ khẩu thường trú */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1, mt: 1 }}
                      >
                        Hộ khẩu thường trú
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Tỉnh/Thành phố</InputLabel>
                        <Select
                          value={selectedIds.permanentProvinceId}
                          label="Tỉnh/Thành phố"
                          onChange={handlePermanentProvinceChange}
                        >
                          <MenuItem value="">
                            <em>Chọn tỉnh/thành phố</em>
                          </MenuItem>
                          {provinces.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        disabled={!selectedIds.permanentProvinceId}
                      >
                        <InputLabel>Quận/Huyện</InputLabel>
                        <Select
                          value={selectedIds.permanentDistrictId}
                          label="Quận/Huyện"
                          onChange={handlePermanentDistrictChange}
                        >
                          <MenuItem value="">
                            <em>Chọn quận/huyện</em>
                          </MenuItem>
                          {permanentDistricts.map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                              {d.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        disabled={!selectedIds.permanentDistrictId}
                      >
                        <InputLabel>Phường/Xã</InputLabel>
                        <Select
                          value={selectedIds.permanentWardId}
                          label="Phường/Xã"
                          onChange={handlePermanentWardChange}
                        >
                          <MenuItem value="">
                            <em>Chọn phường/xã</em>
                          </MenuItem>
                          {permanentWards.map((w) => (
                            <MenuItem key={w.id} value={w.id}>
                              {w.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Địa chỉ khác */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Địa chỉ tạm trú"
                        value={profileData.temporaryAddress}
                        onChange={(e) =>
                          handleProfileChange(
                            'temporaryAddress',
                            e.target.value
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Địa chỉ liên hệ"
                        value={profileData.contactAddress}
                        onChange={(e) =>
                          handleProfileChange('contactAddress', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Địa chỉ"
                        value={profileData.address}
                        onChange={(e) =>
                          handleProfileChange('address', e.target.value)
                        }
                      />
                    </Grid>

                    {/* Thông tin khác */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Thông tin khác
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Đối tượng"
                        value={profileData.object}
                        onChange={(e) =>
                          handleProfileChange('object', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Khu vực chính sách"
                        value={profileData.policyArea}
                        onChange={(e) =>
                          handleProfileChange('policyArea', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Ngày vào Đoàn"
                        type="date"
                        value={
                          profileData.dateOfJoinUnion
                            ? profileData.dateOfJoinUnion.format('YYYY-MM-DD')
                            : ''
                        }
                        onChange={(e) =>
                          handleProfileChange(
                            'dateOfJoinUnion',
                            e.target.value ? dayjs(e.target.value) : null
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Ngày vào Đảng"
                        type="date"
                        value={
                          profileData.dateOfJoinParty
                            ? profileData.dateOfJoinParty.format('YYYY-MM-DD')
                            : ''
                        }
                        onChange={(e) =>
                          handleProfileChange(
                            'dateOfJoinParty',
                            e.target.value ? dayjs(e.target.value) : null
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        size="large"
                      >
                        Lưu thay đổi
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Password Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Đổi mật khẩu
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Mật khẩu hiện tại"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange('currentPassword', e.target.value)
                      }
                      error={!!errors.currentPassword}
                      helperText={errors.currentPassword}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Mật khẩu mới"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange('newPassword', e.target.value)
                      }
                      error={!!errors.newPassword}
                      helperText={
                        errors.newPassword || 'Mật khẩu phải có ít nhất 6 ký tự'
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange('confirmPassword', e.target.value)
                      }
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Lock />}
                      onClick={handleChangePassword}
                      disabled={loading}
                      size="large"
                    >
                      Đổi mật khẩu
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
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
