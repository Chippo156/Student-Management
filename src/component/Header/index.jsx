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
import { useDispatch, useSelector } from "react-redux";
import { toggleMode } from "../../redux/ThemeSlice";
import { useNavigate } from "react-router-dom";

const HeaderPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const mode = useSelector((state) => state.theme.mode);

  // Dropdown state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifyEl, setNotifyEl] = React.useState(null);

  const handleUserMenu = (event) => setAnchorEl(event.currentTarget);
  const handleUserClose = () => setAnchorEl(null);

  const handleNotifyMenu = (event) => setNotifyEl(event.currentTarget);
  const handleNotifyClose = () => setNotifyEl(null);

  const handleLogout = () => {
    // Xử lý logout ở đây
    handleUserClose();
    // ...dispatch logout, navigate, v.v.
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
                <NotificationsIcon sx={{ mr: 1 }} />Tin mới 1
              </MenuItem>
              <MenuItem onClick={handleNotifyClose} sx={{ color: theme.palette.text.primary }}>
                <NotificationsIcon sx={{ mr: 1 }} />Tin mới 2
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

            {/* User info */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={handleUserMenu}
                tabIndex={0}
                role="button"
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUserMenu(e)}
              >
                <Avatar src={user?.avatar || ""} sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, mr: 1 }}>
                  {!user?.avatar && <AccountCircleIcon />}
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    mr: 0.5,
                    color: theme.palette.text.primary
                  }}
                >
                  {user?.username || "User"}
                </Typography>
                <ArrowDropDownIcon />
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserClose}>
                <MenuItem onClick={() => { navigate("/profile"); handleUserClose(); }} sx={{ color: theme.palette.text.primary }}>
                  <InfoIcon sx={{ mr: 1 }} /> Thông tin cá nhân
                </MenuItem>
                <MenuItem onClick={() => { navigate("/change-password"); handleUserClose(); }} sx={{ color: theme.palette.text.primary }}>
                  <LockIcon sx={{ mr: 1 }} /> Đổi mật khẩu
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: theme.palette.text.primary }}>
                  <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HeaderPage;