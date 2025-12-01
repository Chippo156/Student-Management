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
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  Drawer,
  useMediaQuery,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Tune as TuneIcon,
  AccountBox as AccountBoxIcon,
  PersonAdd as PersonAddIcon,
  FolderShared as FolderSharedIcon,
  MenuBook as MenuBookIcon,
  Class as ClassIcon,
  Grade as GradeIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Announcement as AnnouncementIcon,
  Email as EmailIcon,
  EventAvailable as EventAvailableIcon, // Thêm icon mới
} from '@mui/icons-material';
import HeaderPage from '../Header';
import ChatWidget from '../Chat/ChatWidget';

const menuData = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    key: 'dashboard',
    path: '/admin',
  },
  {
    label: 'Quản lý Tài khoản',
    icon: <AccountBoxIcon />,
    key: 'account-management',
    path: '/admin/account-management',
    children: [
      {
        label: 'Danh sách tài khoản',
        icon: <GroupIcon />,
        key: 'users',
        path: '/admin/users',
      },
      {
        label: 'Tạo tài khoản mới',
        icon: <PersonAddIcon />,
        key: 'create-user',
        path: '/admin/create-user',
      },
    ],
  },
  {
    label: 'Quản lý Hồ sơ Sinh viên',
    icon: <PeopleIcon />,
    key: 'student-management',
    path: '/admin/student-management',
    children: [
      {
        label: 'Danh sách sinh viên',
        icon: <PeopleIcon />,
        key: 'students',
        path: '/admin/students',
      },
    ],
  },
  {
    label: 'Quản lý Đào tạo',
    icon: <SchoolIcon />,
    key: 'education-management',
    path: '/admin/education-management',
    children: [
      {
        label: 'Quản lý môn học',
        icon: <MenuBookIcon />,
        key: 'courses',
        path: '/admin/courses',
      },
      {
        label: 'Quản lý lớp học',
        icon: <ClassIcon />,
        key: 'classes',
        path: '/admin/classes',
      },
      {
        label: 'Quản lý lớp học phần',
        icon: <EventAvailableIcon />,
        key: 'sections',
        path: '/admin/sections',
      },
      {
        label: 'Khung thời gian đăng ký',
        icon: <EventAvailableIcon />,
        key: 'registration-period',
        path: '/admin/registration-period',
      },
      {
        label: 'Chương trình đào tạo',
        icon: <SchoolIcon />,
        key: 'curriculum',
        path: '/admin/curriculum',
      },
      {
        label: 'Quản lý giảng viên',
        icon: <GroupIcon />,
        key: 'teacher-management',
        path: '/admin/teacher',
      },
    ],
  },
  // {
  //   label: 'Phân quyền',
  //   icon: <SecurityIcon />,
  //   key: 'permission-management',
  //   path: '/admin/permission-management',
  //   children: [
  //     {
  //       label: 'Quản lý vai trò',
  //       icon: <AdminPanelSettingsIcon />,
  //       key: 'roles',
  //       path: '/admin/roles',
  //     },
  //     {
  //       label: 'Phân quyền người dùng',
  //       icon: <SecurityIcon />,
  //       key: 'user-permissions',
  //       path: '/admin/user-permissions',
  //     },
  //     {
  //       label: 'Cài đặt bảo mật',
  //       icon: <TuneIcon />,
  //       key: 'security-settings',
  //       path: '/admin/security-settings',
  //     },
  //   ],
  // },
  {
    label: 'Quản lý Học phí',
    icon: <PaymentIcon />,
    key: 'tuition-management',
    path: '/admin/tuition-management',
    children: [
      {
        label: 'Danh sách học phí',
        icon: <PaymentIcon />,
        key: 'tuition-list',
        path: '/admin/tuition-list',
      },
      // {
      //   label: 'Thanh toán',
      //   icon: <ReceiptIcon />,
      //   key: 'payments',
      //   path: '/admin/payments',
      // },
      // {
      //   label: 'Báo cáo tài chính',
      //   icon: <AssessmentIcon />,
      //   key: 'financial-reports',
      //   path: '/admin/financial-reports',
      // },
    ],
  },
  {
    label: 'Quản lý Điểm số',
    icon: <GradeIcon />,
    key: 'grade-management',
    path: '/admin/grade-management',
    children: [
      {
        label: 'Nhập điểm',
        icon: <GradeIcon />,
        key: 'grades',
        path: '/admin/grades',
      },
      {
        label: 'Bảng điểm',
        icon: <AssessmentIcon />,
        key: 'grade-sheets',
        path: '/admin/grade-sheets',
      },
      {
        label: 'Thống kê điểm',
        icon: <BarChartIcon />,
        key: 'grade-statistics',
        path: '/admin/grade-statistics',
      },
    ],
  },
  {
    label: 'Quản lý Thông báo',
    icon: <NotificationsIcon />,
    key: 'notification-management',
    path: '/admin/notification-management',
    children: [
      {
        label: 'Gửi thông báo',
        icon: <AnnouncementIcon />,
        key: 'send-notifications',
        path: '/admin/send-notifications',
      },
      {
        label: 'Lịch sử thông báo',
        icon: <NotificationsIcon />,
        key: 'notification-history',
        path: '/admin/notification-history',
      },
      // {
      //   label: 'Cài đặt email',
      //   icon: <EmailIcon />,
      //   key: 'email-settings',
      //   path: '/admin/email-settings',
      // },
    ],
  },
  // {
  //   label: 'Cài đặt hệ thống',
  //   icon: <SettingsIcon />,
  //   key: 'settings',
  //   path: '/admin/settings',
  // },
];

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openMenus, setOpenMenus] = useState({});
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
    // Tìm menu item phù hợp với đường dẫn hiện tại
    let foundKey = 'dashboard';

    for (const item of menuData) {
      if (item.path === currentPath) {
        foundKey = item.key;
        break;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === currentPath) {
            foundKey = child.key;
            // Mở menu cha
            setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
            break;
          }
        }
      }
    }

    setSelectedKey(foundKey);
  }, [location.pathname]);

  const handleMenuClick = (item) => {
    if (item.children && item.children.length > 0) {
      // Toggle submenu
      setOpenMenus((prev) => ({
        ...prev,
        [item.key]: !prev[item.key],
      }));
    } else {
      // Navigate to page
      setSelectedKey(item.key);
      navigate(item.path);
      // Close mobile drawer after navigation
      if (!isDesktop) {
        setMobileOpen(false);
      }
    }
  };

  const renderMenuItem = (item, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.key];
    const isSelected = selectedKey === item.key;

    return (
      <React.Fragment key={item.key}>
        <ListItemButton
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
            <>
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
              {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </>
          )}
        </ListItemButton>

        {hasChildren && !(collapsed && isDesktop) && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // Sidebar content component
  const drawerContent = (
    <Box
      sx={{
        minWidth: 150,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
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
      <List
        component="nav"
        sx={{ flex: 1, overflow: 'auto', pt: isDesktop ? 0 : 1 }}
      >
        {menuData.map((item) => renderMenuItem(item))}
      </List>

      {/* Collapse toggle for desktop */}
      {isDesktop && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Tooltip
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            placement="right"
          >
            <IconButton onClick={() => setCollapsed((v) => !v)} size="small">
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
            borderColor: 'divider',
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
              Admin Dashboard
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

export default LayoutAdmin;
