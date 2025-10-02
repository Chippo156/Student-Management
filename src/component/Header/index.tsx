import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme, Avatar, Menu, MenuItem, Tooltip, Divider, Container } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InfoIcon from "@mui/icons-material/Info";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useDispatch, useSelector } from "react-redux";
import { toggleMode } from "../../redux/ThemeSlice";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../redux/store";
import { logoutUser, doLogoutAction } from "../../redux/UserSlice";

const HeaderPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSelector((state: RootState) => state.user);
  const mode = useSelector((state: RootState) => state.theme.mode);

  // Dropdown state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifyEl, setNotifyEl] = React.useState<null | HTMLElement>(null);

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>): void => setAnchorEl(event.currentTarget);
  const handleUserClose = (): void => setAnchorEl(null);

  const handleNotifyMenu = (event: React.MouseEvent<HTMLElement>): void => setNotifyEl(event.currentTarget);
  const handleNotifyClose = (): void => setNotifyEl(null);

  const handleLogout = async (): Promise<void> => {
    try {
      // Call logout API
      await dispatch(logoutUser());
      
      // Close dropdown
      handleUserClose();
      
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if API fails
      dispatch(doLogoutAction());
      handleUserClose();
      navigate("/login");
    }
  };

  const getDashboardByRole = () => {
    if (!account || !account.role) {
      return '/login';
    }
    const userRoleId = account.role.roleId;
    switch (userRoleId) {
      case 1: // Admin
        return '/admin';
      case 2: // Teacher
        return '/teacher';
      case 3: // Student
        return '/student';
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
        return 'Giảng viên';
      case 3:
        return 'Sinh viên';
      default:
        return account.role.roleName;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleUserMenu(event as any);
    }
  };

  const handleLogin = (): void => {
    navigate("/login");
  };

  const handleRegister = (): void => {
    navigate("/register");
  };

  return (
    <AppBar position="static" color="default" sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Container maxWidth="xl" disableGutters>
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/vite.svg"
              alt="Logo"
              style={{ height: 40, marginRight: 12, cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/")}>
              T1 STUDENT
            </Typography>
          </Box>

          {/* List item */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* Trang chủ */}
            <Tooltip title="Trang chủ">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="primary" onClick={() => navigate("/")}>
                  <HomeIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    mr: 1,
                    cursor: 'pointer',
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.primary
                  }}
                  onClick={() => navigate("/")}
                >
                  Trang chủ
                </Typography>
              </Box>
            </Tooltip>

            {/* Tin tức */}
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
                    color: theme.palette.text.primary
                  }}
                  onClick={handleNotifyMenu}
                >
                  Tin tức
                </Typography>
              </Box>
            </Tooltip>
            <Menu anchorEl={notifyEl} open={Boolean(notifyEl)} onClose={handleNotifyClose}>
              <MenuItem onClick={handleNotifyClose} sx={{ color: theme.palette.text.primary }}>
                <NotificationsIcon sx={{ mr: 1 }} />Thông báo học phí học kỳ 1
              </MenuItem>
              <MenuItem onClick={handleNotifyClose} sx={{ color: theme.palette.text.primary }}>
                <NotificationsIcon sx={{ mr: 1 }} />Lịch thi cuối kỳ đã được cập nhật
              </MenuItem>
              <MenuItem onClick={handleNotifyClose} sx={{ color: theme.palette.text.primary }}>
                <NotificationsIcon sx={{ mr: 1 }} />Đăng ký học phần học kỳ 2
              </MenuItem>
            </Menu>

            {/* Toggle dark/light */}
            <Tooltip title={mode === "light" ? "Chuyển sang dark mode" : "Chuyển sang light mode"}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="primary" onClick={() => dispatch(toggleMode())}>
                  {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    mr: 1,
                    cursor: 'pointer',
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.primary
                  }}
                  onClick={() => dispatch(toggleMode())}
                >
                  {mode === "light" ? 'Dark mode' : 'Light mode'}
                </Typography>
              </Box>
            </Tooltip>

            {/* User info hoặc Login/Register */}
            {isAuthenticated && account ? (
              /* User dropdown khi đã đăng nhập */
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box 
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={handleUserMenu}
                  tabIndex={0}
                  role="button"
                  onKeyDown={handleKeyDown}
                >
                  <Avatar 
                    src={account.avatarUrl || ""} 
                    sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, mr: 1 }}
                  >
                    {!account.avatarUrl && (account.fullName ? account.fullName.charAt(0).toUpperCase() : <AccountCircleIcon />)}
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        lineHeight: 1.2
                      }}
                    >
                      {account.fullName || account.username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        lineHeight: 1
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
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1
                      }
                    }
                  }}
                >
                  {/* User info header */}
                  <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
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

                  {/* Dashboard */}
                  <MenuItem 
                    onClick={() => { 
                      navigate(getDashboardByRole()); 
                      handleUserClose(); 
                    }} 
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>

                  {/* Thông tin cá nhân */}
                  <MenuItem 
                    onClick={() => { 
                      if (account.role.roleId === 3) {
                        navigate("/student/info"); 
                      } else {
                        navigate("/profile"); 
                      }
                      handleUserClose(); 
                    }} 
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <InfoIcon sx={{ mr: 1 }} /> Thông tin cá nhân
                  </MenuItem>

                  {/* Đổi mật khẩu */}
                  <MenuItem 
                    onClick={() => { 
                      navigate("/change-password"); 
                      handleUserClose(); 
                    }} 
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <LockIcon sx={{ mr: 1 }} /> Đổi mật khẩu
                  </MenuItem>

                  <Divider />

                  {/* Đăng xuất */}
                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ 
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.light + '20'
                      }
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              /* Login/Register buttons khi chưa đăng nhập */
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        color: theme.palette.text.primary
                      }}
                      onClick={handleLogin}
                    >
                      Đăng nhập
                    </Typography>
                  </Box>
                </Tooltip>

                <Tooltip title="Đăng ký">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="secondary" onClick={handleRegister}>
                      <PersonAddIcon />
                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{
                        ml: 0.5,
                        cursor: 'pointer',
                        display: { xs: 'none', sm: 'block' },
                        color: theme.palette.text.primary
                      }}
                      onClick={handleRegister}
                    >
                      Đăng ký
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