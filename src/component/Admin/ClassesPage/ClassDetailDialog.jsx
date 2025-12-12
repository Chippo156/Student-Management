import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { getStatusColor, getStatusLabel } from './constants';

/**
 * ClassDetailDialog - Dialog hiển thị chi tiết lớp học
 */
const ClassDetailDialog = ({ open, onClose, classData }) => {
  if (!classData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết lớp học: {classData.className}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Thông tin cơ bản
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Mã lớp"
                      secondary={classData.classCode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Tên lớp"
                      secondary={classData.className}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Khoa/Ngành"
                      secondary={`${classData.department} - ${classData.major}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Học kỳ"
                      secondary={`${classData.semester} - Năm ${classData.year}`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Thông tin giảng dạy
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Giảng viên"
                      secondary={classData.instructor}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Lịch học"
                      secondary={classData.schedule}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phòng học"
                      secondary={classData.room}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Sĩ số"
                      secondary={`${classData.studentCount}/${classData.maxStudents} sinh viên`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Thời gian
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Bắt đầu:</strong>{' '}
                      {new Date(classData.startDate).toLocaleDateString(
                        'vi-VN'
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Kết thúc:</strong>{' '}
                      {new Date(classData.endDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Chip
                    label={getStatusLabel(classData.status)}
                    color={getStatusColor(classData.status)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="outlined" startIcon={<ScheduleIcon />}>
          Xem lịch học
        </Button>
        <Button variant="contained" startIcon={<EditIcon />}>
          Chỉnh sửa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassDetailDialog;
