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
    label: 'Quản lý môn học',
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
    label: 'Học sinh',
    icon: <PeopleIcon />,
    key: 'students',
    path: '/teacher/students',
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
  {
    label: 'Bài tập',
    icon: <AssignmentIcon />,
    key: 'assignments',
    path: '/teacher/assignments',
  },
  {
    label: 'Tài liệu',
    icon: <FolderIcon />,
    key: 'materials',
    path: '/teacher/materials',
  },
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
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  React.useEffect(() => {
    const currentPath = location.pathname;
    const found = menuData.find((item) => item.path === currentPath);
    if (found) setSelectedKey(found.key);
  }, [location.pathname]);

  const handleMenuClick = (item) => {
    setSelectedKey(item.key);
    navigate(item.path);
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
              {menuData.map((item) => (
                <ListItemButton
                  key={item.key}
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
                </ListItemButton>
              ))}
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

export default LayoutTeacher;
