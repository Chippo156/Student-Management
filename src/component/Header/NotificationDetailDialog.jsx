import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  getTypeIcon,
  getPriorityColor,
} from '../../constants/announcementConstants';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const NotificationDetailDialog = ({ open, onClose, announcement }) => {
  const theme = useTheme();

  if (!announcement) return null;

  // Kiểm tra xem sourceUrl có phải là ảnh không
  const isImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );
  };

  // Lấy tên file từ URL
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return decodeURIComponent(fileName);
  };

  const handleSourceClick = () => {
    if (announcement.sourceUrl) {
      window.open(announcement.sourceUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (announcement.sourceUrl) {
      const link = document.createElement('a');
      link.href = announcement.sourceUrl;
      link.download = getFileNameFromUrl(announcement.sourceUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
          <Avatar
            sx={{
              bgcolor: getPriorityColor(announcement.priority) + '20',
              color: getPriorityColor(announcement.priority),
              width: 48,
              height: 48,
            }}
          >
            {getTypeIcon(announcement.type)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {announcement.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={announcement.typeText}
                size="small"
                sx={{
                  bgcolor: getPriorityColor(announcement.priority) + '20',
                  color: getPriorityColor(announcement.priority),
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
              <Chip
                label={announcement.priorityText}
                size="small"
                sx={{
                  height: 20,
                  bgcolor: getPriorityColor(announcement.priority) + '20',
                  color: getPriorityColor(announcement.priority),
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
              <Chip
                label={announcement.targetTypeText}
                size="small"
                sx={{ height: 20, fontSize: 11 }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Thông tin người tạo và thời gian */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Người gửi:{' '}
              <Typography
                component="span"
                variant="body2"
                fontWeight={600}
                color="text.primary"
              >
                {announcement.createdByFullName || announcement.createdByUserName}
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Thời gian:{' '}
              <Typography
                component="span"
                variant="body2"
                fontWeight={600}
                color="text.primary"
              >
                {dayjs(announcement.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Typography>
          </Box>
          {announcement.expiryDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Hết hạn:{' '}
                <Typography
                  component="span"
                  variant="body2"
                  fontWeight={600}
                  color={announcement.isExpired ? 'error.main' : 'text.primary'}
                >
                  {dayjs(announcement.expiryDate).format('DD/MM/YYYY HH:mm')}
                  {announcement.isExpired && ' (Đã hết hạn)'}
                  {!announcement.isExpired &&
                    announcement.daysUntilExpiry >= 0 &&
                    ` (Còn ${announcement.daysUntilExpiry} ngày)`}
                </Typography>
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Nội dung */}
        <Box>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              color: 'text.primary',
            }}
          >
            {announcement.content}
          </Typography>
        </Box>

        {/* Đối tượng nhận */}
        {announcement.targetDescription && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                textTransform="uppercase"
              >
                Đối tượng nhận
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                {announcement.targetDescription}
              </Typography>
            </Box>
          </>
        )}

        {/* Source URL - Hiển thị ảnh hoặc file */}
        {announcement.sourceUrl && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                textTransform="uppercase"
                sx={{ mb: 1, display: 'block' }}
              >
                {isImageUrl(announcement.sourceUrl) ? 'Hình ảnh đính kèm' : 'File đính kèm'}
              </Typography>

              {/* Hiển thị ảnh nếu là image */}
              {isImageUrl(announcement.sourceUrl) && (
                <Box
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 1,
                  }}
                >
                  <img
                    src={announcement.sourceUrl}
                    alt={announcement.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </Box>
              )}

              {/* Hiển thị thông tin file */}
              {!isImageUrl(announcement.sourceUrl) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 1,
                  }}
                >
                  <FileIcon sx={{ color: 'primary.main' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getFileNameFromUrl(announcement.sourceUrl)}
                  </Typography>
                </Box>
              )}

              {/* Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LinkIcon />}
                  onClick={handleSourceClick}
                  fullWidth
                >
                  Xem chi tiết
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  fullWidth
                >
                  Tải xuống
                </Button>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailDialog;
