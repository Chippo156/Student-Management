import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Skeleton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import announcementService from '../service/announcementService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PublicAnnouncementPanel = () => {
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(1); // 1: Chung, 2: Học tập, 3: Sự kiện, 4: Học phí
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedType]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await announcementService.getPublicAnnouncementsByType(
        selectedType,
        1,
        5 // Lấy 5 thông báo mới nhất
      );

      if (result && result.items) {
        setAnnouncements(result.items);
      }
    } catch (error) {
      console.error('Failed to fetch public announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 1:
        return <CampaignIcon />;
      case 2:
        return <SchoolIcon />;
      case 3:
        return <EventIcon />;
      case 4:
        return <PaymentIcon />;
      default:
        return <CampaignIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 1:
        return theme.palette.primary.main;
      case 2:
        return theme.palette.success.main;
      case 3:
        return theme.palette.warning.main;
      case 4:
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return theme.palette.text.secondary;
      case 2:
        return theme.palette.info.main;
      case 3:
        return theme.palette.warning.main;
      case 4:
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        maxHeight: '100%',
        background: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 10px 30px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CardContent
        sx={{
          p: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 2.5,
            flexShrink: 0,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              <CampaignIcon fontSize="medium" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.25 }}>
                Thông báo mới
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.813rem' }}
              >
                Cập nhật liên tục từ nhà trường
              </Typography>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={selectedType}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 42,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              borderRadius: 1.5,
              p: 0.5,
              '& .MuiTabs-indicator': {
                display: 'none',
              },
              '& .MuiTab-root': {
                minHeight: 38,
                py: 1,
                px: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
                minWidth: 'auto',
                textTransform: 'none',
                color: theme.palette.text.secondary,
                borderRadius: 1,
                transition: 'all 0.3s',
                '&.Mui-selected': {
                  color: theme.palette.primary.contrastText,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              },
            }}
          >
            <Tab label="Chung" value={1} />
            <Tab label="Học tập" value={2} />
            <Tab label="Sự kiện" value={3} />
            <Tab label="Học phí" value={4} />
          </Tabs>
        </Box>

        {/* List */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2.5,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.5),
              },
            },
          }}
        >
          {loading ? (
            <List sx={{ p: 0 }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <React.Fragment key={item}>
                  <ListItem alignItems="flex-start" sx={{ px: 1.5, py: 2 }}>
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={48} height={48} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Skeleton variant="text" width="85%" height={24} />
                      }
                      secondary={
                        <>
                          <Skeleton variant="text" width="100%" />
                          <Skeleton variant="text" width="100%" />
                          <Skeleton variant="text" width="65%" />
                        </>
                      }
                    />
                  </ListItem>
                  {item < 5 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : announcements.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
              }}
            >
              <CampaignIcon
                sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Chưa có thông báo
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement.announcementId}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleAnnouncementClick(announcement)}
                    sx={{
                      px: 2,
                      py: 2.5,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.4),
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(getTypeColor(announcement.type), 0.15),
                          color: getTypeColor(announcement.type),
                          width: 48,
                          height: 48,
                          boxShadow: `0 2px 8px ${alpha(getTypeColor(announcement.type), 0.2)}`,
                        }}
                      >
                        {getTypeIcon(announcement.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.5,
                              mb: 0.75,
                              fontSize: '0.938rem',
                            }}
                          >
                            {announcement.title}
                          </Typography>
                          <Chip
                            label={announcement.priorityText}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              bgcolor: alpha(
                                getPriorityColor(announcement.priority),
                                0.15
                              ),
                              color: getPriorityColor(announcement.priority),
                              border: `1px solid ${alpha(getPriorityColor(announcement.priority), 0.3)}`,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontSize: '0.875rem',
                              lineHeight: 1.6,
                              mb: 0.75,
                            }}
                          >
                            {announcement.content}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 14, color: 'text.disabled' }}
                            />
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontSize: '0.813rem', fontWeight: 500 }}
                            >
                              {dayjs(announcement.createdAt).fromNow()}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            flexShrink: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Đăng nhập để xem tất cả thông báo
          </Typography>
        </Box>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                pb: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  flex: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(
                      getTypeColor(selectedAnnouncement.type),
                      0.15
                    ),
                    color: getTypeColor(selectedAnnouncement.type),
                    width: 48,
                    height: 48,
                  }}
                >
                  {getTypeIcon(selectedAnnouncement.type)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {selectedAnnouncement.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={selectedAnnouncement.typeText}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        bgcolor: alpha(
                          getTypeColor(selectedAnnouncement.type),
                          0.15
                        ),
                        color: getTypeColor(selectedAnnouncement.type),
                      }}
                    />
                    <Chip
                      label={selectedAnnouncement.priorityText}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        bgcolor: alpha(
                          getPriorityColor(selectedAnnouncement.priority),
                          0.15
                        ),
                        color: getPriorityColor(selectedAnnouncement.priority),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={handleCloseDetail}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 3, pb: 2 }}>
              {/* Thông tin thời gian */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <CalendarIcon
                    sx={{ fontSize: 18, color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Thời gian:{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {dayjs(selectedAnnouncement.createdAt).format(
                        'DD/MM/YYYY HH:mm'
                      )}
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Người gửi:{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      Nhà trường
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Nội dung */}
              <Box>
                {(() => {
                  // Tách content và ảnh đính kèm
                  const contentParts = selectedAnnouncement.content.split(
                    '\n\n[Ảnh đính kèm]:\n'
                  );
                  const mainContent = contentParts[0];
                  const imageLinks = contentParts[1]
                    ? contentParts[1].split('\n').filter((link) => link.trim())
                    : [];

                  return (
                    <>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.8,
                          color: 'text.primary',
                        }}
                      >
                        {mainContent}
                      </Typography>

                      {/* Hiển thị ảnh đính kèm từ content */}
                      {imageLinks.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            textTransform="uppercase"
                            sx={{ mb: 1.5, display: 'block' }}
                          >
                            Hình ảnh đính kèm
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            {imageLinks.map((imageUrl, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: '100%',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  border: `1px solid ${theme.palette.divider}`,
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: theme.shadows[4],
                                  },
                                }}
                                onClick={() =>
                                  window.open(imageUrl.trim(), '_blank')
                                }
                              >
                                <img
                                  src={imageUrl.trim()}
                                  alt={`Ảnh đính kèm ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  );
                })()}
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={handleCloseDetail}
                variant="contained"
                color="primary"
              >
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default PublicAnnouncementPanel;
