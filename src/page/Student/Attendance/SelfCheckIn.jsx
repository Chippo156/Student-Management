import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { studentServices } from '../../../service/studentServices';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const SelfCheckIn = () => {
  const theme = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchAvailableSessions();
    fetchCheckInHistory();
  }, []);

  const fetchAvailableSessions = async () => {
    setLoading(true);
    try {
      const data = await studentServices.getAvailableCheckInSessions();
      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckInHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await studentServices.getCheckInHistory();
      if (data) {
        // Sắp xếp theo thời gian mới nhất trước (giảm dần)
        const sortedData = [...data].sort(
          (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
        );
        setCheckInHistory(sortedData);
      }
    } catch (error) {
      console.error('Error fetching check-in history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenCheckInDialog = (session) => {
    // Validate: Chỉ cho điểm danh khi phiên đang mở
    if (!session.isCheckInActive) {
      return;
    }
    setSelectedSession(session);
    setCheckInCode('');
    setNote('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSession(null);
    setCheckInCode('');
    setNote('');
  };

  const handleCheckIn = async () => {
    if (!selectedSession) return;

    setSubmitting(true);
    try {
      const result = await studentServices.selfCheckIn(
        selectedSession.attendanceSessionId,
        checkInCode,
        note || null
      );

      if (result) {
        handleCloseDialog();
        // Refresh the lists
        await fetchAvailableSessions();
        await fetchCheckInHistory();
      }
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (session) => {
    if (session.hasCheckedIn) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Đã điểm danh"
          color="success"
          size="small"
        />
      );
    }

    if (session.isCheckInActive) {
      return (
        <Chip
          icon={<AccessTimeIcon />}
          label="Đang mở"
          color="primary"
          size="small"
        />
      );
    }

    if (session.minutesUntilStart > 0) {
      return (
        <Chip
          label={`Còn ${session.minutesUntilStart} phút`}
          color="warning"
          size="small"
        />
      );
    }

    return <Chip label="Đã đóng" color="default" size="small" />;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:mm
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    return dayjs(dateTimeString).format('DD/MM/YYYY HH:mm');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          <CheckCircleOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Điểm danh
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={showHistory ? 'outlined' : 'contained'}
            onClick={() => setShowHistory(!showHistory)}
            size="small"
          >
            {showHistory ? 'Phiên điểm danh' : 'Lịch sử'}
          </Button>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={() => {
                fetchAvailableSessions();
                fetchCheckInHistory();
              }}
              disabled={loading}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
                boxShadow: 1,
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {!showHistory ? (
        <>
          {/* Info Alert */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Bạn chỉ có thể điểm danh trong khung thời gian quy định. Hãy đảm
              bảo điểm danh đúng giờ để tránh bị ghi nhận là đi muộn hoặc vắng
              mặt.
            </Typography>
          </Alert>

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <ScheduleIcon
                  sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không có phiên điểm danh nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiện tại chưa có phiên điểm danh nào khả dụng cho bạn
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {sessions.map((session) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={session.attendanceSessionId}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      {/* Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                              mb: 0.5,
                            }}
                          >
                            {session.sessionName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {session.sectionCode}
                          </Typography>
                        </Box>
                        {getStatusChip(session)}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Course Info */}
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <SchoolIcon
                            sx={{
                              fontSize: 18,
                              mr: 1,
                              color: 'text.secondary',
                            }}
                          />
                          <Typography variant="body2">
                            <strong>{session.courseCode}</strong> -{' '}
                            {session.courseName}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <PersonIcon
                            sx={{
                              fontSize: 18,
                              mr: 1,
                              color: 'text.secondary',
                            }}
                          />
                          <Typography variant="body2">
                            GV: {session.lecturerName}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Time Info */}
                      <Box
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          p: 2,
                          borderRadius: 1,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <ScheduleIcon
                            sx={{ fontSize: 18, mr: 1, color: 'primary.main' }}
                          />
                          <Typography variant="body2">
                            <strong>Buổi học:</strong>{' '}
                            {formatTime(session.startTime)} -{' '}
                            {formatTime(session.endTime)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 18, mr: 1, color: 'success.main' }}
                          />
                          <Typography variant="body2">
                            <strong>Điểm danh:</strong>{' '}
                            {formatDateTime(session.selfCheckInStartTime)} -{' '}
                            {formatDateTime(session.selfCheckInEndTime)}
                          </Typography>
                        </Box>
                        {session.room && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <RoomIcon
                              sx={{
                                fontSize: 18,
                                mr: 1,
                                color: 'text.secondary',
                              }}
                            />
                            <Typography variant="body2">
                              <strong>Phòng:</strong> {session.room}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Check-in Status */}
                      {session.hasCheckedIn && session.checkedInAt && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            Đã điểm danh lúc:{' '}
                            {formatDateTime(session.checkedInAt)}
                          </Typography>
                        </Alert>
                      )}

                      {/* Action Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        color={session.hasCheckedIn ? 'success' : 'primary'}
                        disabled={
                          session.hasCheckedIn ||
                          !session.isCheckInActive ||
                          submitting
                        }
                        onClick={() => handleOpenCheckInDialog(session)}
                        startIcon={
                          session.hasCheckedIn ? (
                            <CheckCircleIcon />
                          ) : (
                            <CheckCircleOutlineIcon />
                          )
                        }
                      >
                        {session.hasCheckedIn
                          ? 'Đã điểm danh'
                          : session.isCheckInActive
                            ? 'Điểm danh ngay'
                            : 'Chưa đến giờ'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : null}

      {/* Check-in Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Xác nhận điểm danh</DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>{selectedSession.courseName}</strong>
                  <br />
                  Phiên: {selectedSession.sessionName}
                  <br />
                  Thời gian:{' '}
                  {formatDateTime(selectedSession.selfCheckInStartTime)} -{' '}
                  {formatDateTime(selectedSession.selfCheckInEndTime)}
                </Typography>
              </Alert>

              <TextField
                fullWidth
                label="Mã điểm danh (nếu có)"
                value={checkInCode}
                onChange={(e) => setCheckInCode(e.target.value)}
                placeholder="Nhập mã điểm danh do giảng viên cung cấp"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Ghi chú (tùy chọn)"
                multiline
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú của bạn..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleCheckIn}
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />
            }
          >
            {submitting ? 'Đang điểm danh...' : 'Xác nhận điểm danh'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-in History Section */}
      {showHistory && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Lịch sử điểm danh
          </Typography>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : checkInHistory.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <ScheduleIcon
                  sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Chưa có lịch sử điểm danh
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Môn học</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phiên</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkInHistory.map((history, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {history.courseName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {history.sessionName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(history.checkInTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={history.attendanceStatus}
                          size="small"
                          color={
                            history.attendanceStatus === 'Có mặt'
                              ? 'success'
                              : history.attendanceStatus === 'Đi muộn'
                                ? 'warning'
                                : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SelfCheckIn;
