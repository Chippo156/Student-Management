import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Paper,
  Container,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import NoteIcon from '@mui/icons-material/Note';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import SearchIcon from '@mui/icons-material/Search';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Dashboard from '~/component/Student/Dashboard';
import StudentInfoPage from '~/component/Student/Pages/StudentInfoPage';
import StudentNotes from '~/component/Student/Components/StudentNotes';
import StudentSchedule from '~/component/Student/Components/StudentSchedule';
import StudentGrades from '~/component/Student/Components/StudentGrades';
import BankInfo from '~/component/Student/Components/BankInfo';
import BHYTPage from '~/component/Student/Pages/BHYTPage';
import GraduatePage from '~/component/Student/Pages/GraduatePage';
// Thêm import cho trang chỉnh sửa thông tin sinh viên
import StudentEditInfoPage from '~/component/Student/Pages/StudentEditInfoPage';
import { Routes, Route } from 'react-router-dom';

const menuData = [
  {
    label: 'Trang chủ',
    icon: <HomeIcon />,
    key: 'home',
  },
  {
    label: 'Thông tin chung',
    icon: <InfoIcon />,
    key: 'info',
    children: [
      { label: 'Thông tin sinh viên', icon: <InfoIcon />, key: 'student-info' },
      { label: 'Ghi chú nhắc nhở', icon: <NoteIcon />, key: 'note' },
      {
        label: 'Cập nhật thông tin cá nhân',
        icon: <InfoIcon />,
        key: 'edit-info',
      },
      {
        label: 'Cập nhật thông tin ngân hàng',
        icon: <AccountBalanceIcon />,
        key: 'bank',
      },
      {
        label: 'Cập nhật thông tin BHYT',
        icon: <LocalHospitalIcon />,
        key: 'bhyt',
      },
      { label: 'Đề xuất xét TN', icon: <CheckCircleIcon />, key: 'graduate' },
    ],
  },
  {
    label: 'Học tập',
    icon: <SchoolIcon />,
    key: 'study',
    children: [
      { label: 'Kết quả học tập', icon: <AssignmentIcon />, key: 'result' },
      {
        label: 'Lịch theo tuần',
        icon: <CalendarMonthIcon />,
        key: 'week-calendar',
      },
      {
        label: 'Lịch theo tiến độ',
        icon: <TimelineIcon />,
        key: 'timeline-calendar',
      },
    ],
  },
  {
    label: 'Đăng ký học phần',
    icon: <AssignmentIcon />,
    key: 'register',
    children: [
      { label: 'Chương trình khung', icon: <SchoolIcon />, key: 'curriculum' },
      {
        label: 'Đăng ký học phần',
        icon: <AssignmentIcon />,
        key: 'register-course',
      },
    ],
  },
  {
    label: 'Học phí',
    icon: <PaymentIcon />,
    key: 'fee',
    children: [
      { label: 'Tra cứu công nợ', icon: <SearchIcon />, key: 'debt' },
      { label: 'Thanh toán trực tuyến', icon: <CreditCardIcon />, key: 'pay' },
    ],
  },
];

function StudentManagementLayout() {
  const [openMenus, setOpenMenus] = useState({});
  const [selectedKey, setSelectedKey] = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = (key, hasChildren) => {
    if (hasChildren) {
      setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
    } else {
      setSelectedKey(key);
    }
  };

  const theme = useTheme();

  const renderMenu = (items) =>
    items.map((item) => (
      <React.Fragment key={item.key}>
        <ListItemButton
          selected={selectedKey === item.key}
          onClick={() => handleMenuClick(item.key, !!item.children)}
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
                  onClick={() => setSelectedKey(child.key)}
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

  const contentMap = {
    home: <Dashboard />,
    'student-info': <StudentInfoPage />,
    note: <StudentNotes />,
    bank: <BankInfo />,
    bhyt: <BHYTPage />,
    graduate: <GraduatePage />,
    result: <StudentGrades />,
    'week-calendar': <StudentSchedule />,
    'timeline-calendar': <StudentSchedule />,
    curriculum: (
      <div style={{ padding: '24px' }}>
        <Typography variant="h4" gutterBottom>
          Chương trình khung
        </Typography>
        <Typography>
          Component chương trình khung đang được phát triển...
        </Typography>
      </div>
    ),
    'register-course': (
      <div style={{ padding: '24px' }}>
        <Typography variant="h4" gutterBottom>
          Đăng ký học phần
        </Typography>
        <Typography>
          Component đăng ký học phần đang được phát triển...
        </Typography>
      </div>
    ),
    debt: (
      <div style={{ padding: '24px' }}>
        <Typography variant="h4" gutterBottom>
          Tra cứu công nợ
        </Typography>
        <Typography>
          Component tra cứu công nợ đang được phát triển...
        </Typography>
      </div>
    ),
    pay: (
      <div style={{ padding: '24px' }}>
        <Typography variant="h4" gutterBottom>
          Thanh toán trực tuyến
        </Typography>
        <Typography>Component thanh toán đang được phát triển...</Typography>
      </div>
    ),
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: collapsed ? 72 : 270,
            minWidth: collapsed ? 72 : 270,
            minHeight: '100vh',
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
              <IconButton onClick={() => setCollapsed((v) => !v)} size="small">
                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
        <Box sx={{ flex: 1, p: 3 }}>
          <Routes>
            <Route
              path="/"
              element={
                contentMap[selectedKey] || (
                  <Typography>Chọn menu để xem nội dung</Typography>
                )
              }
            />
            <Route
              path="/student/edit-info"
              element={<StudentEditInfoPage />}
            />
          </Routes>
        </Box>
      </Box>
    </Container>
  );
}

export default StudentManagementLayout;
