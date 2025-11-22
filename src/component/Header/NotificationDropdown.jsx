import React, { useState, useEffect } from 'react';
import {
  Box,
  Menu,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import announcementService from '../../service/announcementService';
import {
  getTypeIcon,
  getPriorityColor,
} from '../../constants/announcementConstants';
import NotificationDetailDialog from './NotificationDetailDialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationDropdown = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAnnouncements();
    }
  }, [open, tabValue]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const type = tabValue === 0 ? null : tabValue;
      const result = await announcementService.getMyAnnouncements({
        pageNumber: 1,
        pageSize: 20,
        type,
        isActive: true,
      });

      if (result && result.items) {
        setAnnouncements(result.items);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNotificationClick = async (announcementId) => {
    try {
      const detail = await announcementService.getAnnouncementById(announcementId);
      if (detail) {
        setSelectedAnnouncement(detail);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch announcement detail:', error);
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleViewAll = () => {
    onClose();
    const role = localStorage.getItem('role');
    if (role === '1') {
      navigate('/admin/notification-history');
    } else if (role === '2') {
      navigate('/student/notifications');
    } else if (role === '3') {
      navigate('/teacher/notifications');
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 360, sm: 420 },
          maxHeight: 600,
          mt: 1.5,
          overflow: 'hidden',
          boxShadow: theme.shadows[8],
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Thông báo
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {announcements.length} thông báo
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 42,
          '& .MuiTab-root': {
            minHeight: 42,
            py: 1,
            fontSize: '0.875rem',
          },
        }}
      >
        <Tab label="Tất cả" />
        <Tab label="Chung" />
        <Tab label="Học tập" />
        <Tab label="Sự kiện" />
        <Tab label="Học phí" />
      </Tabs>

      {/* List */}
      <Box
        sx={{
          maxHeight: 450,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '3px',
          },
        }}
      >
        {loading ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 4 }}
          >
            Đang tải...
          </Typography>
        ) : announcements.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsIcon
              sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Không có thông báo mới
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {announcements.map((announcement, index) => (
              <React.Fragment key={announcement.announcementId}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 2,
                    py: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => handleNotificationClick(announcement.announcementId)}
                >
                  <Avatar
                    sx={{
                      bgcolor: getPriorityColor(announcement.priority) + '20',
                      color: getPriorityColor(announcement.priority),
                      mr: 1.5,
                      width: 36,
                      height: 36,
                    }}
                  >
                    {getTypeIcon(announcement.type)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={announcement.viewCount === 0 ? 600 : 500}
                          sx={{ flex: 1, mr: 1, fontSize: '0.875rem' }}
                        >
                          {announcement.title}
                        </Typography>
                        {announcement.viewCount === 0 && (
                          <CircleIcon
                            sx={{
                              fontSize: 8,
                              color: theme.palette.primary.main,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5,
                            fontSize: '0.8rem',
                          }}
                        >
                          {announcement.content}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            label={announcement.typeText}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 10,
                              bgcolor:
                                getPriorityColor(announcement.priority) + '15',
                              color: getPriorityColor(announcement.priority),
                            }}
                          />
                          <Typography variant="caption" color="text.disabled">
                            {dayjs(announcement.createdAt).fromNow()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < announcements.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer - View All Button */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Button
          fullWidth
          variant="text"
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAll}
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Xem tất cả thông báo
        </Button>
      </Box>

      {/* Detail Dialog */}
      <NotificationDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        announcement={selectedAnnouncement}
      />
    </Menu>
  );
};

export default NotificationDropdown;
