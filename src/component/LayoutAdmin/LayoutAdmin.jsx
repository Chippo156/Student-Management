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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
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
} from '@mui/icons-material';
import HeaderPage from '../Header';

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
      {
        label: 'Quản lý profile',
        icon: <FolderSharedIcon />,
        key: 'user-profiles',
        path: '/admin/user-profiles',
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
      {
        label: 'Hồ sơ sinh viên',
        icon: <FolderSharedIcon />,
        key: 'student-profiles',
        path: '/admin/student-profiles',
      },
      {
        label: 'Thông tin cá nhân',
        icon: <AccountBoxIcon />,
        key: 'student-info',
        path: '/admin/student-info',
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
        label: 'Chương trình đào tạo',
        icon: <SchoolIcon />,
        key: 'curriculum',
        path: '/admin/curriculum',
      },
      {
        label: 'Lịch học',
        icon: <AssignmentIcon />,
        key: 'schedule',
        path: '/admin/schedule',
      },
    ],
  },
  {
    label: 'Phân quyền',
    icon: <SecurityIcon />,
    key: 'permission-management',
    path: '/admin/permission-management',
    children: [
      {
        label: 'Quản lý vai trò',
        icon: <AdminPanelSettingsIcon />,
        key: 'roles',
        path: '/admin/roles',
      },
      {
        label: 'Phân quyền người dùng',
        icon: <SecurityIcon />,
        key: 'user-permissions',
        path: '/admin/user-permissions',
      },
      {
        label: 'Cài đặt bảo mật',
        icon: <TuneIcon />,
        key: 'security-settings',
        path: '/admin/security-settings',
      },
    ],
  },
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
      {
        label: 'Thanh toán',
        icon: <ReceiptIcon />,
        key: 'payments',
        path: '/admin/payments',
      },
      {
        label: 'Báo cáo tài chính',
        icon: <AssessmentIcon />,
        key: 'financial-reports',
        path: '/admin/financial-reports',
      },
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
    label: 'Báo cáo Thống kê',
    icon: <TrendingUpIcon />,
    key: 'reports-statistics',
    path: '/admin/reports-statistics',
    children: [
      {
        label: 'Báo cáo sinh viên',
        icon: <AssessmentIcon />,
        key: 'student-reports',
        path: '/admin/student-reports',
      },
      {
        label: 'Báo cáo học tập',
        icon: <BarChartIcon />,
        key: 'academic-reports',
        path: '/admin/academic-reports',
      },
      {
        label: 'Thống kê hệ thống',
        icon: <TrendingUpIcon />,
        key: 'system-statistics',
        path: '/admin/system-statistics',
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
      {
        label: 'Cài đặt email',
        icon: <EmailIcon />,
        key: 'email-settings',
        path: '/admin/email-settings',
      },
    ],
  },
  {
    label: 'Cài đặt hệ thống',
    icon: <SettingsIcon />,
    key: 'settings',
    path: '/admin/settings',
  },
];

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 1 : isChild ? 3 : 2,
            pl: collapsed ? 1 : isChild ? 4 : 2,
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.text.primary,
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: 'center',
              fontSize: isChild ? '1.2rem' : '1.5rem',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={item.label}
                sx={{
                  fontSize: isChild ? '0.875rem' : '1rem',
                  '& .MuiListItemText-primary': {
                    fontSize: isChild ? '0.875rem' : '1rem',
                  },
                }}
              />
              {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </>
          )}
        </ListItemButton>

        {hasChildren && !collapsed && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

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
          {/* Sidebar */}
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
            <List component="nav" sx={{ flex: 1 }}>
              {menuData.map((item) => renderMenuItem(item))}
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
          {/* Main Content */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Outlet />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LayoutAdmin;
