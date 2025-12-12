import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  People as PeopleIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { message as antMessage } from 'antd';
import announcementService from '../../service/announcementService';
import fileService from '../../service/fileService';
import {
  ANNOUNCEMENT_PRIORITY,
  ANNOUNCEMENT_TYPE,
  ANNOUNCEMENT_TARGET_TYPE,
  PRIORITY_OPTIONS,
  TYPE_OPTIONS,
  TARGET_TYPE_OPTIONS,
} from '../../constants/announcementConstants';

const SendNotifications = () => {
  const user = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [notificationData, setNotificationData] = useState({
    title: '',
    content: '',
    type: ANNOUNCEMENT_TYPE.GENERAL,
    targetType: ANNOUNCEMENT_TARGET_TYPE.ALL,
    targetYear: null,
    priority: ANNOUNCEMENT_PRIORITY.NORMAL,
    sourceUrl: '',
    expiryDate: null,
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setNotificationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event, type = 'file') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      antMessage.error('File không được vượt quá 10MB!');
      return;
    }

    setLoading(true);
    try {
      const result = await fileService.uploadFile(file, user?.userId || 2);

      if (result) {
        if (type === 'image') {
          setUploadedImages((prev) => [...prev, result]);
          antMessage.success('Upload ảnh thành công!');
        } else {
          setUploadedFiles((prev) => [...prev, result]);
          antMessage.success('Upload file thành công!');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      antMessage.error('Upload file thất bại!');
    } finally {
      setLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemoveFile = (index, type = 'file') => {
    if (type === 'image') {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handlePreview = () => {
    if (!notificationData.title || !notificationData.content) {
      antMessage.warning('Vui lòng nhập tiêu đề và nội dung thông báo!');
      return;
    }
    setPreviewOpen(true);
  };

  const handleSend = async () => {
    if (!notificationData.title || !notificationData.content) {
      antMessage.warning('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    try {
      // Build content with images
      let contentWithImages = notificationData.content;

      if (uploadedImages.length > 0) {
        const imageLinks = uploadedImages.map((img) => img.filePath).join('\n');
        contentWithImages += `\n\n[Ảnh đính kèm]:\n${imageLinks}`;
      }

      // Build sourceUrl with files
      let sourceUrl = notificationData.sourceUrl || '';
      if (uploadedFiles.length > 0) {
        const fileLinks = uploadedFiles.map((file) => file.filePath).join('|');
        sourceUrl = sourceUrl ? `${sourceUrl}|${fileLinks}` : fileLinks;
      }

      const payload = {
        title: notificationData.title,
        content: contentWithImages,
        sourceUrl: sourceUrl || null,
        priority: notificationData.priority,
        type: notificationData.type,
        targetType: notificationData.targetType,
        targetDepartmentId: null, // Backend không dùng
        targetYear: notificationData.targetYear
          ? parseInt(notificationData.targetYear)
          : null,
        expiryDate: notificationData.expiryDate || null,
        createdByUserId: user?.userId || 1,
      };

      const result = await announcementService.createAnnouncement(payload);

      if (result) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form
        setNotificationData({
          title: '',
          content: '',
          type: ANNOUNCEMENT_TYPE.GENERAL,
          targetType: ANNOUNCEMENT_TARGET_TYPE.ALL,
          targetYear: null,
          priority: ANNOUNCEMENT_PRIORITY.NORMAL,
          sourceUrl: '',
          expiryDate: null,
        });
        setUploadedFiles([]);
        setUploadedImages([]);
        setPreviewOpen(false);
      }
    } catch (error) {
      console.error('Send notification error:', error);
      antMessage.error('Gửi thông báo thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientCount = () => {
    switch (notificationData.targetType) {
      case ANNOUNCEMENT_TARGET_TYPE.ALL:
        return '~1500';
      case ANNOUNCEMENT_TARGET_TYPE.STUDENTS:
        return '~1200';
      case ANNOUNCEMENT_TARGET_TYPE.LECTURERS:
        return '~80';
      case ANNOUNCEMENT_TARGET_TYPE.ACADEMIC_YEAR:
        return '~250';
      default:
        return '0';
    }
  };

  const years = [1, 2, 3, 4, 5];

  return (
    <Box
      sx={{ p: { xs: 2, sm: 2, md: 3 }, maxWidth: '100%', overflow: 'hidden' }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AnnouncementIcon />
        </Avatar>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
        >
          Gửi thông báo
        </Typography>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Gửi thông báo thành công!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Nội dung thông báo
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề thông báo"
                  value={notificationData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại thông báo</InputLabel>
                  <Select
                    value={notificationData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    label="Loại thông báo"
                  >
                    {TYPE_OPTIONS.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Mức độ ưu tiên</InputLabel>
                  <Select
                    value={notificationData.priority}
                    onChange={(e) =>
                      handleInputChange('priority', e.target.value)
                    }
                    label="Mức độ ưu tiên"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Chip
                          label={priority.label}
                          size="small"
                          sx={{
                            bgcolor: priority.color + '30',
                            color: priority.color,
                          }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Nội dung thông báo"
                  value={notificationData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link tham khảo (tùy chọn)"
                  value={notificationData.sourceUrl}
                  onChange={(e) =>
                    handleInputChange('sourceUrl', e.target.value)
                  }
                  placeholder="https://example.com"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày hết hạn (tùy chọn)"
                  value={notificationData.expiryDate || ''}
                  onChange={(e) =>
                    handleInputChange('expiryDate', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* File attachments */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Đính kèm" />
                </Divider>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Đính kèm file
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(e) => handleFileUpload(e, 'file')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />

                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => imageInputRef.current?.click()}
                    disabled={loading}
                  >
                    Đính kèm ảnh
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    hidden
                    onChange={(e) => handleFileUpload(e, 'image')}
                    accept="image/*"
                  />
                </Box>

                {/* Display uploaded files */}
                {uploadedFiles.length > 0 && (
                  <List dense>
                    {uploadedFiles.map((file, index) => (
                      <ListItem key={index}>
                        <AttachFileIcon sx={{ mr: 1 }} />
                        <ListItemText
                          primary={file.fileName}
                          secondary={`Đã upload lúc ${new Date(file.uploadedAt).toLocaleString('vi-VN')}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFile(index, 'file')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Display uploaded images */}
                {uploadedImages.length > 0 && (
                  <Box
                    sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}
                  >
                    {uploadedImages.map((img, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={img.filePath}
                          alt={img.fileName}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
                          }}
                          onClick={() => handleRemoveFile(index, 'image')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recipients & Actions */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Recipients */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  Đối tượng nhận
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Chọn đối tượng</InputLabel>
                  <Select
                    value={notificationData.targetType}
                    onChange={(e) =>
                      handleInputChange('targetType', e.target.value)
                    }
                    label="Chọn đối tượng"
                  >
                    {TARGET_TYPE_OPTIONS.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {notificationData.targetType ===
                  ANNOUNCEMENT_TARGET_TYPE.ACADEMIC_YEAR && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Chọn năm học</InputLabel>
                    <Select
                      value={notificationData.targetYear || ''}
                      onChange={(e) =>
                        handleInputChange('targetYear', e.target.value)
                      }
                      label="Chọn năm học"
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          Năm {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  <PeopleIcon color="action" />
                  <Typography variant="body2">
                    Ước tính: <strong>{getRecipientCount()}</strong> người nhận
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  Thao tác
                </Typography>

                <Box
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'column' }}
                  gap={2}
                >
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreview}
                    disabled={
                      !notificationData.title ||
                      !notificationData.content ||
                      loading
                    }
                  >
                    Xem trước
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={
                      !notificationData.title ||
                      !notificationData.content ||
                      loading
                    }
                  >
                    {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Xem trước thông báo</DialogTitle>
        <DialogContent>
          <Card sx={{ mt: 1 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                mb={2}
              >
                <Typography variant="h6">{notificationData.title}</Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={
                      TYPE_OPTIONS.find(
                        (t) => t.value === notificationData.type
                      )?.label
                    }
                    size="small"
                  />
                  <Chip
                    label={
                      PRIORITY_OPTIONS.find(
                        (p) => p.value === notificationData.priority
                      )?.label
                    }
                    size="small"
                    sx={{
                      bgcolor:
                        PRIORITY_OPTIONS.find(
                          (p) => p.value === notificationData.priority
                        )?.color + '30',
                      color: PRIORITY_OPTIONS.find(
                        (p) => p.value === notificationData.priority
                      )?.color,
                    }}
                  />
                </Box>
              </Box>

              <Typography
                variant="body1"
                paragraph
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {notificationData.content}
              </Typography>

              {uploadedImages.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {uploadedImages.map((img, index) => (
                    <img
                      key={index}
                      src={img.filePath}
                      alt={img.fileName}
                      style={{
                        width: 150,
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </Box>
              )}

              {uploadedFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    File đính kèm:
                  </Typography>
                  {uploadedFiles.map((file, index) => (
                    <Typography key={index} variant="body2" color="primary">
                      • {file.fileName}
                    </Typography>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Gửi đến:{' '}
                {
                  TARGET_TYPE_OPTIONS.find(
                    (r) => r.value === notificationData.targetType
                  )?.label
                }{' '}
                ({getRecipientCount()} người)
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Chỉnh sửa</Button>
          <Button variant="contained" onClick={handleSend} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi ngay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendNotifications;
