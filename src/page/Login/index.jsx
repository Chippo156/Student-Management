import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser, clearError } from '../../redux/UserSlice';
import { doLoginAction } from '../../redux/UserSlice';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

import { userService } from '../../service/userService';
import { authService } from '../../service/authService';
import PublicAnnouncementPanel from '../../component/PublicAnnouncementPanel';

const Login = () => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [usernameOrMssv, setUsernameOrMssv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [studentName, setStudentName] = useState('');
  const [otpError, setOtpError] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, account } = useAppSelector(
    (state) => state.user
  );

  // Helper function to get dashboard by role
  const getDashboardByRole = (roleId) => {
    switch (roleId) {
      case 1: // Admin
        return '/admin';
      case 2:
        return '/student';
      case 3:
        return '/teacher';
      default:
        return '/login';
    }
  };

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (isAuthenticated && account && account.role) {
      const dashboard = getDashboardByRole(account.role.roleId);
      navigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, account, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(clearError());

      try {
        const result = await dispatch(loginUser({ username, password }));
        if (result.meta.requestStatus === 'fulfilled') {
          const data = await userService.getUserInfo();
          if (data) {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            dispatch(
              doLoginAction({
                token: { accessToken: token, refreshToken },
                user: data,
              })
            );
          }
          const userData = result.payload;
          if (userData?.user?.role?.roleId) {
            const dashboard = getDashboardByRole(userData.user.role.roleId);
            navigate(dashboard, { replace: true });
          }
        } else if (result.meta.requestStatus === 'rejected') {
          console.error('Login rejected:', result.payload);
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async () => {
    if (!usernameOrMssv.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.forgotPasswordByMSSV(usernameOrMssv);
      if (result && result.success) {
        setOtpSent(true);
        setEmailMasked(result.data?.email || '');
        setUserName(result.data?.studentName || result.data?.userName || '');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      return;
    }

    setIsSubmitting(true);
    // Reset error state trước khi verify
    setOtpError(false);

    try {
      const result = await authService.verifyOtp(usernameOrMssv, otpCode);
      if (result && result.success) {
        setOpenForgotPassword(false);
        setUsernameOrMssv('');
        setOtpCode('');
        setOtpSent(false);
        setEmailMasked('');
        setStudentName('');
        setOtpError(false);
      } else {
        // Show error if OTP is incorrect
        setTimeout(() => setOtpError(true), 100);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setTimeout(() => setOtpError(true), 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setOpenForgotPassword(false);
    setUsernameOrMssv('');
    setOtpCode('');
    setOtpSent(false);
    setEmailMasked('');
    setUserName('');
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
        p: { xs: 2, sm: 2, md: 3 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: '100%',
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid container spacing={3} sx={{ height: 'auto', maxHeight: '100%' }}>
          {/* Login Form */}
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card
              sx={{
                width: '100%',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                    : '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  align="center"
                  gutterBottom
                  sx={{
                    mb: 4,
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                  }}
                >
                  Đăng nhập
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={handleClearError}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Nhập tên đăng nhập"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Nhập mật khẩu"
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      fontSize: '16px',
                      fontWeight: 600,
                      textTransform: 'none',
                      mb: 2,
                    }}
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setOpenForgotPassword(true)}
                      sx={{ textTransform: 'none' }}
                    >
                      Quên mật khẩu?
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Public Announcements Panel */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: 'flex',
              maxHeight: '600px',
            }}
          >
            <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <PublicAnnouncementPanel />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Forgot Password Modal */}
      <Dialog
        open={openForgotPassword}
        onClose={() => !isSubmitting && handleCloseForgotPassword()}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{otpSent ? 'Xác thực OTP' : 'Quên mật khẩu'}</DialogTitle>
        <DialogContent>
          {!otpSent ? (
            <>
              <Typography variant="body2" sx={{ mb: 3, mt: 1 }}>
                Nhập tên đăng nhập của bạn. Mã OTP sẽ được gửi đến email đã đăng
                ký.
              </Typography>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                value={usernameOrMssv}
                onChange={(e) => setUsernameOrMssv(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Nhập tên đăng nhập"
                autoFocus
              />
            </>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 2, mt: 1 }}>
                Mã OTP đã được gửi đến email của bạn
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Người dùng:</strong> {userName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Email:</strong> {emailMasked}
              </Typography>
              <TextField
                fullWidth
                label="Mã OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Nhập mã OTP từ email"
                autoFocus
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForgotPassword} disabled={isSubmitting}>
            Hủy
          </Button>
          {!otpSent ? (
            <Button
              onClick={handleForgotPassword}
              variant="contained"
              disabled={isSubmitting || !usernameOrMssv.trim()}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi OTP'}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyOtp}
              variant="contained"
              disabled={isSubmitting || !otpCode.trim()}
            >
              {isSubmitting ? 'Đang xác thực...' : 'Xác thực OTP'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* OTP Error Snackbar */}
      <Snackbar
        open={otpError}
        autoHideDuration={4000}
        onClose={() => setOtpError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOtpError(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          Mã OTP không chính xác. Vui lòng kiểm tra lại!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
