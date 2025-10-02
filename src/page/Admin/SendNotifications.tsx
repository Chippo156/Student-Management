import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const SendNotifications: React.FC = () => {
  const [notificationData, setNotificationData] = useState({
    title: '',
    content: '',
    type: 'general',
    recipients: 'all',
    department: '',
    year: '',
    priority: 'normal',
    sendMethod: 'system'
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const notificationTypes = [
    { value: 'general', label: 'Thông báo chung' },
    { value: 'academic', label: 'Học tập' },
    { value: 'payment', label: 'Học phí' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'urgent', label: 'Khẩn cấp' }
  ];

  const recipientTypes = [
    { value: 'all', label: 'Tất cả người dùng' },
    { value: 'students', label: 'Tất cả sinh viên' },
    { value: 'teachers', label: 'Tất cả giảng viên' },
    { value: 'department', label: 'Theo khoa' },
    { value: 'year', label: 'Theo năm học' },
    { value: 'custom', label: 'Tùy chọn' }
  ];

  const departments = ['Công nghệ thông tin', 'Kinh tế', 'Ngoại ngữ', 'Khoa học tự nhiên', 'Kỹ thuật', 'Y khoa'];
  const years = [1, 2, 3, 4, 5];
  const priorities = [
    { value: 'low', label: 'Thấp', color: 'default' },
    { value: 'normal', label: 'Bình thường', color: 'primary' },
    { value: 'high', label: 'Cao', color: 'warning' },
    { value: 'urgent', label: 'Khẩn cấp', color: 'error' }
  ];

  const sendMethods = [
    { value: 'system', label: 'Thông báo hệ thống', icon: <NotificationsIcon /> },
    { value: 'email', label: 'Email', icon: <EmailIcon /> },
    { value: 'sms', label: 'SMS', icon: <SmsIcon /> },
    { value: 'all', label: 'Tất cả phương thức', icon: <SendIcon /> }
  ];

  const handleInputChange = (field: string, value: string) => {
    setNotificationData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSend = () => {
    // Simulate sending notification
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Reset form
    setNotificationData({
      title: '',
      content: '',
      type: 'general',
      recipients: 'all',
      department: '',
      year: '',
      priority: 'normal',
      sendMethod: 'system'
    });
    
    setPreviewOpen(false);
  };

  const getRecipientCount = () => {
    switch (notificationData.recipients) {
      case 'all': return 1500;
      case 'students': return 1200;
      case 'teachers': return 80;
      case 'department': return 300;
      case 'year': return 250;
      default: return 0;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'error';
      case 'academic': return 'primary';
      case 'payment': return 'warning';
      case 'event': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'default';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AnnouncementIcon />
        </Avatar>
        <Typography variant="h4" component="h1">
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
          <Paper sx={{ p: 3 }}>
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
                    {notificationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
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
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    label="Mức độ ưu tiên"
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Chip
                          label={priority.label}
                          color={priority.color as any}
                          size="small"
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
            </Grid>
          </Paper>
        </Grid>

        {/* Recipients & Settings */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Recipients */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Đối tượng nhận
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Chọn đối tượng</InputLabel>
                  <Select
                    value={notificationData.recipients}
                    onChange={(e) => handleInputChange('recipients', e.target.value)}
                    label="Chọn đối tượng"
                  >
                    {recipientTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {notificationData.recipients === 'department' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Chọn khoa</InputLabel>
                    <Select
                      value={notificationData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      label="Chọn khoa"
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {notificationData.recipients === 'year' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Chọn năm học</InputLabel>
                    <Select
                      value={notificationData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      label="Chọn năm học"
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year.toString()}>
                          Năm {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <PeopleIcon color="action" />
                  <Typography variant="body2">
                    Ước tính: <strong>{getRecipientCount()}</strong> người nhận
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Send Method */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Phương thức gửi
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Chọn phương thức</InputLabel>
                  <Select
                    value={notificationData.sendMethod}
                    onChange={(e) => handleInputChange('sendMethod', e.target.value)}
                    label="Chọn phương thức"
                  >
                    {sendMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {method.icon}
                          {method.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thao tác
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreview}
                    disabled={!notificationData.title || !notificationData.content}
                  >
                    Xem trước
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={!notificationData.title || !notificationData.content}
                  >
                    Gửi thông báo
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
        <DialogTitle>
          Xem trước thông báo
        </DialogTitle>
        <DialogContent>
          <Card sx={{ mt: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h6">
                  {notificationData.title}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={notificationTypes.find(t => t.value === notificationData.type)?.label}
                    color={getTypeColor(notificationData.type) as any}
                    size="small"
                  />
                  <Chip
                    label={priorities.find(p => p.value === notificationData.priority)?.label}
                    color={getPriorityColor(notificationData.priority) as any}
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph>
                {notificationData.content}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" color="text.secondary">
                Gửi đến: {recipientTypes.find(r => r.value === notificationData.recipients)?.label} 
                ({getRecipientCount()} người) 
                qua {sendMethods.find(m => m.value === notificationData.sendMethod)?.label}
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Chỉnh sửa
          </Button>
          <Button variant="contained" onClick={handleSend}>
            Gửi ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendNotifications;