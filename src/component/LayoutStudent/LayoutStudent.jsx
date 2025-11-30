import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Menu,
  useTheme,
  Drawer,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  Info as InfoIcon,
  Note as NoteIcon,
  AccountBalance as AccountBalanceIcon,
  LocalHospital as LocalHospitalIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  Timeline as TimelineIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
  CreditCard as CreditCardIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import HeaderPage from '../Header';
import ChatWidget from '../Chat/ChatWidget';
const menuData = [
  {
    label: 'Trang chủ',
    icon: <HomeIcon />,
    key: 'home',
    path: '/student',
  },
  {
    label: 'Thông tin chung',
    icon: <InfoIcon />,
    key: 'info',
    path: '',
    children: [
      {
        label: 'Thông tin sinh viên',
        icon: <InfoIcon />,
        key: 'student-info',
        path: '/student/info',
      },
      {
        label: 'Cập nhật thông tin cá nhân',
        icon: <InfoIcon />,
        key: 'edit-info',
        path: '/student/edit-info',
      },
      {
        label: 'Cập nhật thông tin ngân hàng',
        icon: <AccountBalanceIcon />,
        key: 'bank',
        path: '/student/bank',
      },
      {
        label: 'Cập nhật thông tin BHYT',
        icon: <LocalHospitalIcon />,
        key: 'bhyt',
        path: '/student/bhyt',
      },
      // {
      //   label: 'Đề xuất xét TN',
      //   icon: <CheckCircleIcon />,
      //   key: 'graduate',
      //   path: '/student/graduate',
      // },
    ],
  },
  {
    label: 'Học tập',
    icon: <SchoolIcon />,
    key: 'study',
    path: '',
    children: [
      {
        label: 'Kết quả học tập',
        icon: <AssignmentIcon />,
        key: 'result',
        path: '/student/grades',
      },
      {
        label: 'Lịch theo tuần',
        icon: <CalendarMonthIcon />,
        key: 'week-calendar',
        path: '/student/schedule',
      },
      {
        label: 'Lịch theo tiến độ',
        icon: <TimelineIcon />,
        key: 'timeline-calendar',
        path: '/student/timeline',
      },
    ],
  },
  {
    label: 'Đăng ký học phần',
    icon: <AssignmentIcon />,
    key: 'register',
    path: '',
    children: [
      {
        label: 'Chương trình khung',
        icon: <SchoolIcon />,
        key: 'curriculum',
        path: '/student/curriculum',
      },
      {
        label: 'Đăng ký học phần',
        icon: <AssignmentIcon />,
        key: 'register-course',
        path: '/student/register-courses',
      },
    ],
  },
  {
    label: 'Học phí',
    icon: <PaymentIcon />,
    key: 'fee',
    path: '',
    children: [
      {
        label: 'Tra cứu công nợ',
        icon: <SearchIcon />,
        key: 'debt',
        path: '/student/debt',
      },
      {
        label: 'Thanh toán trực tuyến',
        icon: <CreditCardIcon />,
        key: 'pay',
        path: '/student/payment',
      },
    ],
  },
];

const LayoutStudent = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [selectedKey, setSelectedKey] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    const currentPath = location.pathname;
    const findMenuItemByPath = (items) => {
      for (const item of items) {
        if (item.path === currentPath) {
          return item.key;
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.path === currentPath) {
              setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
              return child.key;
            }
          }
        }
      }
      return null;
    };
    const foundKey = findMenuItemByPath(menuData);
    if (foundKey) {
      setSelectedKey(foundKey);
    }
  }, [location.pathname]);

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenus((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
    } else {
      setSelectedKey(item.key);
      navigate(item.path);
      // Close mobile drawer after navigation
      if (!isDesktop) {
        setMobileOpen(false);
      }
    }
  };

  const handleChildMenuClick = (child) => {
    setSelectedKey(child.key);
    navigate(child.path);
    // Close mobile drawer after navigation
    if (!isDesktop) {
      setMobileOpen(false);
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
              Student Dashboard
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
                width: collapsed ? 72 : 270,
                minWidth: collapsed ? 72 : 270,
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
                  width: isMobile ? '100%' : '40%',
                  maxWidth: isMobile ? '100%' : 360,
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

export default LayoutStudent;
