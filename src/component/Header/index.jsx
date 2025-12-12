import React, { useState, useEffect } from 'react';
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
  Badge,
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
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode } from '../../redux/ThemeSlice';
import { useNavigate } from 'react-router-dom';
import { logoutUser, doLogoutAction } from '../../redux/UserSlice';
import NotificationDropdown from './NotificationDropdown';
import ResetPasswordModal from '../Common/ResetPasswordModal';
import announcementService from '../../service/announcementService';
import { message } from 'antd';

const HeaderPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSelector((state) => state.user);
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifyEl, setNotifyEl] = React.useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mobileMenuEl, setMobileMenuEl] = React.useState(null);
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (account) {
      fetchUnreadCount();
    }
  }, [account]);

  const fetchUnreadCount = async () => {
    try {
      const result = await announcementService.getMyAnnouncements({
        pageNumber: 1,
        pageSize: 100,
        isActive: true,
      });

      if (result && result.items) {
        const unread = result.items.filter(
          (item) => item.viewCount === 0
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleUserMenu = (event) => setAnchorEl(event.currentTarget);
  const handleUserClose = () => setAnchorEl(null);

  const handleNotifyOpen = (event) => setNotifyEl(event.currentTarget);
  const handleNotifyClose = () => {
    setNotifyEl(null);
    fetchUnreadCount();
  };

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
    switch (userRoleId) {
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

  const handleChangePasswordSuccess = () => {
    message.success('Đổi mật khẩu thành công!');
    setShowPasswordModal(false);
  };

  const handleMobileMenuOpen = (event) => setMobileMenuEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuEl(null);

  console.log(account);
  const isAdmin = localStorage.getItem('role') == 1;
  return (
    <>
      <AppBar
        position="static"
        color="default"
        sx={{
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2, md: 3 },
            // maxWidth: isAdmin ? 'none' : '1600px',
            margin: '0 auto',
            width: '100%',
          }}
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
                Cổng thông tin đào tạo CNTT
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
                IT Academic Portal
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
            {/* Mobile/Tablet: Single Menu Button */}
            {isMobileOrTablet ? (
              <>
                <IconButton
                  color="primary"
                  onClick={handleMobileMenuOpen}
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {isAuthenticated && account ? (
                    <Avatar
                      src={account?.user?.avatarUrl || account?.avatarUrl || ''}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {!account?.user?.avatarUrl &&
                        !account?.avatarUrl &&
                        (account?.user?.fullName || account?.fullName ? (
                          (account?.user?.fullName || account?.fullName)
                            .charAt(0)
                            .toUpperCase()
                        ) : (
                          <AccountCircleIcon />
                        ))}
                    </Avatar>
                  ) : (
                    <MenuIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={mobileMenuEl}
                  open={Boolean(mobileMenuEl)}
                  onClose={handleMobileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 250,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate('/');
                      handleMobileMenuClose();
                    }}
                  >
                    <HomeIcon sx={{ mr: 1 }} /> Trang chủ
                  </MenuItem>
                  <MenuItem onClick={handleNotifyOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon sx={{ mr: 1 }} />
                    </Badge>
                    <Typography sx={{ ml: 1 }}>Tin tức</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      dispatch(toggleMode());
                      handleMobileMenuClose();
                    }}
                  >
                    {mode === 'light' ? (
                      <Brightness4Icon sx={{ mr: 1 }} />
                    ) : (
                      <Brightness7Icon sx={{ mr: 1 }} />
                    )}
                    {mode === 'light' ? 'Dark mode' : 'Light mode'}
                  </MenuItem>
                  {isAuthenticated && account ? (
                    <>
                      <Divider />
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {account?.user?.fullName || account?.user?.username || account?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                      {account?.user?.email || account?.email}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="primary">
                          {getRoleDisplayName()}
                        </Typography>
                      </Box>
                      <MenuItem
                        onClick={() => {
                          navigate(getDashboardByRole());
                          handleMobileMenuClose();
                        }}
                      >
                        <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                      </MenuItem>
                      {account?.role?.roleId === 2 && (
                        <MenuItem
                          onClick={() => {
                            navigate('/student/info');
                            handleMobileMenuClose();
                          }}
                        >
                          <InfoIcon sx={{ mr: 1 }} /> Thông tin cá nhân
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={() => {
                          setShowPasswordModal(true);
                          handleMobileMenuClose();
                        }}
                      >
                        <LockIcon sx={{ mr: 1 }} /> Đổi mật khẩu
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={() => {
                          handleLogout();
                          handleMobileMenuClose();
                        }}
                        sx={{
                          color: theme.palette.error.main,
                        }}
                      >
                        <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <Divider />
                      <MenuItem
                        onClick={() => {
                          handleLogin();
                          handleMobileMenuClose();
                        }}
                      >
                        <LoginIcon sx={{ mr: 1 }} /> Đăng nhập
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <>
                {/* Desktop: Original Menu Items */}
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
                        color: theme.palette.text.primary,
                      }}
                      onClick={() => navigate('/')}
                    >
                      Trang chủ
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Tin tức">
                  <Box
                    sx={{ display: 'flex', alignItems: 'center' }}
                    onMouseEnter={handleNotifyOpen}
                  >
                    <IconButton color="primary" onClick={handleNotifyOpen}>
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{
                        ml: 0.5,
                        mr: 1,
                        cursor: 'pointer',
                        color: theme.palette.text.primary,
                      }}
                      onClick={handleNotifyOpen}
                    >
                      Tin tức
                    </Typography>
                  </Box>
                </Tooltip>
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
                        color: theme.palette.text.primary,
                      }}
                      onClick={() => dispatch(toggleMode())}
                    >
                      {mode === 'light' ? 'Dark mode' : 'Light mode'}
                    </Typography>
                  </Box>
                </Tooltip>
              </>
            )}
            {!isMobileOrTablet && isAuthenticated && account ? (
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
                    src={account?.user?.avatarUrl || account?.avatarUrl || ''}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      mr: 1,
                    }}
                  >
                    {!account?.user?.avatarUrl &&
                      !account?.avatarUrl &&
                      (account?.user?.fullName || account?.fullName ? (
                        (account?.user?.fullName || account?.fullName)
                          .charAt(0)
                          .toUpperCase()
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
                      {account?.user?.fullName || account?.user?.username|| account?.username}
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
                      {account?.user?.fullName || account?.user?.username || account?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account?.user?.email || account?.email}
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
                  {account?.role?.roleId === 2 && (
                    <MenuItem
                      onClick={() => {
                        navigate('/student/info');
                        handleUserClose();
                      }}
                      sx={{ color: theme.palette.text.primary }}
                    >
                      <InfoIcon sx={{ mr: 1 }} /> Thông tin cá nhân
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      setShowPasswordModal(true);
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
            ) : !isMobileOrTablet ? (
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
                        color: theme.palette.text.primary,
                      }}
                      onClick={handleLogin}
                    >
                      Đăng nhập
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>
      <NotificationDropdown
        anchorEl={notifyEl}
        open={Boolean(notifyEl)}
        onClose={handleNotifyClose}
      />
      <ResetPasswordModal
        visible={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onSuccess={handleChangePasswordSuccess}
      />
    </>
  );
};

export default HeaderPage;
