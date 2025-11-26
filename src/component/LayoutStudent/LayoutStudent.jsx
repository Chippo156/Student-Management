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
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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
    }
  };

  const handleChildMenuClick = (child) => {
    setSelectedKey(child.key);
    navigate(child.path);
  };

  const renderMenu = (items) =>
    items.map((item) => (
      <React.Fragment key={item.key}>
        <ListItemButton
          selected={selectedKey === item.key}
          onClick={() => handleMenuClick(item)}
          sx={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 1 : 2,
          }}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.text.primary,
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!collapsed && <ListItemText primary={item.label} />}
          {item.children && !collapsed ? (
            openMenus[item.key] ? (
              <ExpandLess sx={{ color: theme.palette.text.primary }} />
            ) : (
              <ExpandMore sx={{ color: theme.palette.text.primary }} />
            )
          ) : null}
        </ListItemButton>
        {item.children && !collapsed && (
          <Collapse in={openMenus[item.key]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <ListItemButton
                  key={child.key}
                  sx={{ pl: 4 }}
                  selected={selectedKey === child.key}
                  onClick={() => handleChildMenuClick(child)}
                >
                  <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                    {child.icon}
                  </ListItemIcon>
                  <ListItemText primary={child.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    ));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderPage />
      <Container maxWidth="xl" disableGutters sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            minHeight: 'calc(100vh - 64px)',
            bgcolor: 'background.default',
          }}
        >
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
            <List component="nav" sx={{ flex: 1 }}>
              {renderMenu(menuData)}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
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
          </Paper>
          <Box sx={{ flex: 1, p: 3 }}>
            <Outlet />
          </Box>
        </Box>
      </Container>
      <ChatWidget />
    </Box>
  );
};

export default LayoutStudent;
