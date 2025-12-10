import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  Pagination,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import announcementService from '../service/announcementService';
import {
  getTypeIcon,
  getPriorityColor,
} from '../constants/announcementConstants';
import NotificationDetailDialog from '../component/Header/NotificationDetailDialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // States
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Check if user is admin
  const isAdmin = localStorage.getItem('role') === '1';

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, typeFilter, priorityFilter, searchTerm]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // Admin uses getAllAnnouncements, other roles use getMyAnnouncements
      const result = isAdmin
        ? await announcementService.getAllAnnouncements({
            pageNumber: currentPage,
            pageSize: pageSize,
            search: searchTerm,
            type: typeFilter || null,
            priority: priorityFilter || null,
            isActive: true,
          })
        : await announcementService.getMyAnnouncements({
            pageNumber: currentPage,
            pageSize: pageSize,
            search: searchTerm,
            type: typeFilter || null,
            priority: priorityFilter || null,
            isActive: true,
          });

      if (result) {
        setAnnouncements(result.items || []);
        setTotalPages(result.totalPages || 1);
        setTotalItems(result.totalItems || 0);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (announcementId) => {
    try {
      const detail =
        await announcementService.getAnnouncementById(announcementId);
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
    // Refresh list to update view count
    fetchAnnouncements();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setTypeFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
    fetchAnnouncements();
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        width: '100%',
        p: {
          xs: 2,
          sm: 2,
          md: 3,
        },
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 2, md: 3 },
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}
          >
            <NotificationsIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Lịch sử thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số {totalItems} thông báo
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
        <Grid
          container
          className="equal-height-cards"
          spacing={2}
          alignItems="center"
        >
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại thông báo</InputLabel>
              <Select
                value={typeFilter}
                label="Loại thông báo"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={1}>Thông báo chung</MenuItem>
                <MenuItem value={2}>Học tập</MenuItem>
                <MenuItem value={3}>Sự kiện</MenuItem>
                <MenuItem value={4}>Học phí</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Mức độ ưu tiên</InputLabel>
              <Select
                value={priorityFilter}
                label="Mức độ ưu tiên"
                onChange={handlePriorityFilterChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={1}>Thấp</MenuItem>
                <MenuItem value={2}>Bình thường</MenuItem>
                <MenuItem value={3}>Cao</MenuItem>
                <MenuItem value={4}>Khẩn cấp</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Paper elevation={1} sx={{ p: 8, textAlign: 'center' }}>
          <NotificationsIcon
            sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có thông báo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || typeFilter || priorityFilter
              ? 'Không tìm thấy thông báo phù hợp với bộ lọc'
              : 'Chưa có thông báo nào'}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Announcement Cards */}
          <Grid
            container
            className="equal-height-cards"
            spacing={2}
            sx={{ mb: 3 }}
          >
            {announcements.map((announcement) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={announcement.announcementId}
              >
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    border:
                      announcement.viewCount === 0
                        ? `2px solid ${theme.palette.primary.main}`
                        : '2px solid transparent',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      handleNotificationClick(announcement.announcementId)
                    }
                    sx={{ height: '100%' }}
                  >
                    <CardContent
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              getPriorityColor(announcement.priority) + '20',
                            color: getPriorityColor(announcement.priority),
                            mr: 1.5,
                            width: 48,
                            height: 48,
                          }}
                        >
                          {getTypeIcon(announcement.type)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={
                                announcement.viewCount === 0 ? 700 : 600
                              }
                              sx={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {announcement.title}
                            </Typography>
                            {announcement.viewCount === 0 && (
                              <CircleIcon
                                sx={{
                                  fontSize: 12,
                                  color: theme.palette.primary.main,
                                  mt: 0.5,
                                }}
                              />
                            )}
                          </Box>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            <Chip
                              label={announcement.typeText}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                bgcolor:
                                  getPriorityColor(announcement.priority) +
                                  '20',
                                color: getPriorityColor(announcement.priority),
                              }}
                            />
                            <Chip
                              label={announcement.priorityText}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                              }}
                            />
                          </Stack>
                        </Box>
                      </Box>

                      {/* Content */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 2,
                          flex: 1,
                        }}
                      >
                        {announcement.content}
                      </Typography>

                      {/* Footer */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          pt: 1,
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">
                          {dayjs(announcement.createdAt).fromNow()}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          Xem chi tiết →
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <NotificationDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        announcement={selectedAnnouncement}
      />
    </Box>
  );
};

export default NotificationHistory;
