import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  useTheme,
  Drawer,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  EventAvailable as AttendanceIcon,
  Folder as FolderIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import HeaderPage from '../Header';
import ChatWidget from '../Chat/ChatWidget';

const menuData = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    key: 'dashboard',
    path: '/teacher',
  },
  {
    label: 'Quản lý lớp học phần',
    icon: <SchoolIcon />,
    key: 'courses',
    path: '/teacher/courses',
  },
  {
    label: 'Lịch giảng dạy',
    icon: <ScheduleIcon />,
    key: 'schedule',
    path: '/teacher/schedule',
  },
  {
    label: 'Sinh viên - Lớp học phần',
    icon: <PeopleIcon />,
    key: 'students',
    path: '/teacher/students',
  },
  {
    label: 'Sinh viên - Lớp chủ nhiệm',
    icon: <SchoolIcon />,
    key: 'students-by-class',
    path: '/teacher/students-by-class',
  },
  {
    label: 'Điểm số',
    icon: <GradeIcon />,
    key: 'grades',
    path: '/teacher/grades',
  },
  {
    label: 'Điểm danh',
    icon: <AttendanceIcon />,
    key: 'attendance',
    path: '/teacher/attendance',
  },
  // {
  //   label: 'Bài tập',
  //   icon: <AssignmentIcon />,
  //   key: 'assignments',
  //   path: '/teacher/assignments',
  // },
  // {
  //   label: 'Tài liệu',
  //   icon: <FolderIcon />,
  //   key: 'materials',
  //   path: '/teacher/materials',
  // },
  {
    label: 'Cài đặt',
    icon: <SettingsIcon />,
    key: 'settings',
    path: '/teacher/settings',
  },
];

const LayoutTeacher = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-960px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 960px

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  React.useEffect(() => {
    const currentPath = location.pathname;
    const found = menuData.find((item) => item.path === currentPath);
    if (found) setSelectedKey(found.key);
  }, [location.pathname]);

  const handleMenuClick = (item) => {
    setSelectedKey(item.key);
    navigate(item.path);
    // Close mobile drawer after navigation
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const renderMenuItem = (item, isChild = false) => {
    const isSelected = selectedKey === item.key;

    return (
      <ListItemButton
        key={item.key}
        selected={isSelected}
        onClick={() => handleMenuClick(item)}
        sx={{
          justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
          px: collapsed && isDesktop ? 1 : isChild ? 3 : 2,
          pl: collapsed && isDesktop ? 1 : isChild ? 4 : 2,
          minHeight: 48,
          flexDirection: 'row', // Ensure horizontal layout
          alignItems: 'center',
        }}
      >
        <ListItemIcon
          sx={{
            color: theme.palette.text.primary,
            minWidth: 0,
            mr: collapsed && isDesktop ? 0 : 2,
            justifyContent: 'center',
            fontSize: isChild ? '1.2rem' : '1.5rem',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!(collapsed && isDesktop) && (
          <ListItemText
            primary={item.label}
            sx={{
              fontSize: isChild ? '0.875rem' : '1rem',
              '& .MuiListItemText-primary': {
                fontSize: isChild ? '0.875rem' : '1rem',
                whiteSpace: 'nowrap', // Prevent text wrapping
              },
            }}
          />
        )}
      </ListItemButton>
    );
  };

  // Drawer content component
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with close button for mobile/tablet */}
      {!isDesktop && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div">
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {/* Menu List */}
      <List component="nav" sx={{ flex: 1, overflow: 'auto', pt: isDesktop ? 0 : 1 }}>
        {menuData.map((item) => renderMenuItem(item))}
      </List>

      {/* Collapse toggle for desktop */}
      {isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, borderTop: 1, borderColor: 'divider' }}>
          <Tooltip
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            placement="right"
          >
            <IconButton
              onClick={() => setCollapsed((v) => !v)}
              size="small"
            >
              {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderPage />

      {/* Mobile/Tablet: Menu button in header position */}
      {!isDesktop && (
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 48 }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Teacher Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            minHeight: 'calc(100vh - 64px)',
            bgcolor: 'background.default',
          }}
        >
          {/* Desktop: Permanent Sidebar */}
          {isDesktop && (
            <Paper
              elevation={2}
              sx={{
                width: collapsed ? 72 : 240,
                minWidth: collapsed ? 72 : 240,
                minHeight: '100%',
                bgcolor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s cubic-bezier(.4,2,.6,1)',
              }}
            >
              {drawerContent}
            </Paper>
          )}

          {/* Mobile/Tablet: Drawer */}
          {!isDesktop && (
            <Drawer
              variant="temporary"
              anchor="left"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better performance on mobile
              }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: isMobile ? '100%' : '300px',
                  minWidth: isMobile ? '100%' : '280px',
                  maxWidth: isMobile ? '100%' : '360px',
                  bgcolor: 'background.paper',
                  borderRight: 1,
                  borderColor: 'divider',
                },
              }}
            >
              {drawerContent}
            </Drawer>
          )}

          {/* Main Content - Full width on mobile/tablet */}
          <Box
            component="main"
            sx={{
              flex: 1,
              width: isDesktop ? 'auto' : '100%',
              overflow: 'hidden', // Prevent horizontal scroll
              p: 3,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
      <ChatWidget />
    </Box>
  );
};

export default LayoutTeacher;
