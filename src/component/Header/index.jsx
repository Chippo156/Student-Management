import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Container,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode } from '../../redux/ThemeSlice';
import { useNavigate } from 'react-router-dom';
import { logoutUser, doLogoutAction } from '../../redux/UserSlice';

const HeaderPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifyEl, setNotifyEl] = React.useState(null);

  const handleUserMenu = (event) => setAnchorEl(event.currentTarget);
  const handleUserClose = () => setAnchorEl(null);

  const handleNotifyMenu = (event) => setNotifyEl(event.currentTarget);
  const handleNotifyClose = () => setNotifyEl(null);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      handleUserClose();
      navigate('/login');
    } catch (error) {
      dispatch(doLogoutAction());
      handleUserClose();
      navigate('/login');
    }
  };

  const getDashboardByRole = () => {
    const userRoleId = account?.role?.roleId;
    if (!userRoleId) {
      return '/login';
    }
    switch (!!userRoleId) {
      case 1:
        return '/admin';
      case 2:
        return '/student';
      case 3:
        return '/teacher';
      default:
        return '/login';
    }
  };

  const getRoleDisplayName = () => {
    if (!account || !account.role) return '';
    const userRoleId = account.role.roleId;
    switch (userRoleId) {
      case 1:
        return 'Quản trị viên';
      case 2:
        return 'Sinh viên';
      case 3:
        return 'Giảng viên';
      default:
        return account.role.roleName;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleUserMenu(event);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <AppBar
      position="static"
      color="default"
      sx={{
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Toolbar
          sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2, md: 3 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: theme.shadows[2],
              }}
              onClick={() => navigate('/')}
            >
              <Typography
                sx={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: theme.palette.primary.contrastText,
                  letterSpacing: '-0.5px',
                }}
              >
                UMS
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.2,
                }}
                onClick={() => navigate('/')}
              >
                Hệ thống Quản lý Đào tạo
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem',
                  display: 'block',
                  letterSpacing: '0.5px',
                }}
              >
                University Management System
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Tooltip title="Trang chủ">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="primary" onClick={() => navigate('/')}>
                  <HomeIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    mr: 1,
                    cursor: 'pointer',
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.primary,
                  }}
                  onClick={() => navigate('/')}
                >
                  Trang chủ
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Tin tức">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="primary" onClick={handleNotifyMenu}>
                  <NotificationsIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    mr: 1,
                    cursor: 'pointer',
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.primary,
                  }}
                  onClick={handleNotifyMenu}
                >
                  Tin tức
                </Typography>
              </Box>
            </Tooltip>
            <Menu
              anchorEl={notifyEl}
              open={Boolean(notifyEl)}
              onClose={handleNotifyClose}
            >
              <MenuItem
                onClick={handleNotifyClose}
                sx={{ color: theme.palette.text.primary }}
              >
                <NotificationsIcon sx={{ mr: 1 }} /> Thông báo học phí học kỳ 1
              </MenuItem>
              <MenuItem
                onClick={handleNotifyClose}
                sx={{ color: theme.palette.text.primary }}
              >
                <NotificationsIcon sx={{ mr: 1 }} /> Lịch thi cuối kỳ đã được
                cập nhật
              </MenuItem>
              <MenuItem
                onClick={handleNotifyClose}
                sx={{ color: theme.palette.text.primary }}
              >
                <NotificationsIcon sx={{ mr: 1 }} /> Đăng ký học phần học kỳ 2
              </MenuItem>
            </Menu>
            <Tooltip
              title={
                mode === 'light'
                  ? 'Chuyển sang dark mode'
                  : 'Chuyển sang light mode'
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="primary"
                  onClick={() => dispatch(toggleMode())}
                >
                  {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    mr: 1,
                    cursor: 'pointer',
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.primary,
                  }}
                  onClick={() => dispatch(toggleMode())}
                >
                  {mode === 'light' ? 'Dark mode' : 'Light mode'}
                </Typography>
              </Box>
            </Tooltip>
            {isAuthenticated && account ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={handleUserMenu}
                  tabIndex={0}
                  role="button"
                  onKeyDown={handleKeyDown}
                >
                  <Avatar
                    src={account.avatarUrl || ''}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      mr: 1,
                    }}
                  >
                    {!account.avatarUrl &&
                      (account.fullName ? (
                        account.fullName.charAt(0).toUpperCase()
                      ) : (
                        <AccountCircleIcon />
                      ))}
                  </Avatar>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                      }}
                    >
                      {account.fullName || account.username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        lineHeight: 1,
                      }}
                    >
                      {getRoleDisplayName()}
                    </Typography>
                  </Box>
                  <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      '& .MuiMenuItem-root': { px: 2, py: 1 },
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {account.fullName || account.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.email}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="primary">
                      {getRoleDisplayName()}
                    </Typography>
                  </Box>
                  <MenuItem
                    onClick={() => {
                      navigate(getDashboardByRole());
                      handleUserClose();
                    }}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      if (account.role.roleId === 3) {
                        navigate('/student/info');
                      } else {
                        navigate('/profile');
                      }
                      handleUserClose();
                    }}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <InfoIcon sx={{ mr: 1 }} /> Thông tin cá nhân
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate('/change-password');
                      handleUserClose();
                    }}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <LockIcon sx={{ mr: 1 }} /> Đổi mật khẩu
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.light + '20',
                      },
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Đăng nhập">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="primary" onClick={handleLogin}>
                      <LoginIcon />
                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{
                        ml: 0.5,
                        mr: 1,
                        cursor: 'pointer',
                        display: { xs: 'none', sm: 'block' },
                        color: theme.palette.text.primary,
                      }}
                      onClick={handleLogin}
                    >
                      Đăng nhập
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HeaderPage;
