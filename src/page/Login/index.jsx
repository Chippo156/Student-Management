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
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

import { userService } from '../../service/userService';
import { authService } from '../../service/authService';

const Login = () => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [mssv, setMssv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleForgotPassword = async () => {
    if (!mssv.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.forgotPasswordByMSSV(mssv);
      if (result) {
        setOpenForgotPassword(false);
        setMssv('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
        padding: 3,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
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
                type="password"
                label="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Nhập mật khẩu"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Ghi nhớ đăng nhập"
                sx={{ mb: 3 }}
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
      </Container>

      {/* Forgot Password Modal */}
      <Dialog
        open={openForgotPassword}
        onClose={() => !isSubmitting && setOpenForgotPassword(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Quên mật khẩu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, mt: 1 }}>
            Nhập mã số sinh viên của bạn. Mật khẩu mới sẽ được gửi đến email đã
            đăng ký.
          </Typography>
          <TextField
            fullWidth
            label="Mã số sinh viên (MSSV)"
            value={mssv}
            onChange={(e) => setMssv(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Nhập MSSV"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenForgotPassword(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={isSubmitting || !mssv.trim()}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
