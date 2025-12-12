import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { tuitionService } from '../../../service/tuitionService';

const StudentTuitionSummaryModal = ({ open, onClose, mssv }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (open && mssv) {
      loadSummary();
    }
  }, [open, mssv]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await tuitionService.getStudentTuitionSummary(mssv);
      if (response?.data) {
        setSummaryData(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 3:
        return 'success';
      case 2:
        return 'warning';
      case 1:
        return 'error';
      default:
        return 'default';
    }
  };

  const InfoCard = ({ icon: Icon, title, children, colorType = 'primary' }) => {
    const getCardColor = () => {
      switch (colorType) {
        case 'primary':
          return {
            bg: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
          };
        case 'success':
          return {
            bg: alpha(theme.palette.success.main, 0.08),
            color: theme.palette.success.main,
          };
        case 'warning':
          return {
            bg: alpha(theme.palette.warning.main, 0.08),
            color: theme.palette.warning.main,
          };
        case 'error':
          return {
            bg: alpha(theme.palette.error.main, 0.08),
            color: theme.palette.error.main,
          };
        default:
          return {
            bg: alpha(theme.palette.grey[500], 0.08),
            color: theme.palette.grey[700],
          };
      }
    };

    const cardColor = getCardColor();

    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: cardColor.bg,
          border: `1px solid ${alpha(cardColor.color, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Icon sx={{ fontSize: 24, color: cardColor.color }} />
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {children}
      </Box>
    );
  };

  const StatBox = ({ label, value, colorType = 'primary' }) => {
    const colors = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
    };

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ color: colors[colorType] }}
        >
          {value}
        </Typography>
      </Box>
    );
  };

  if (!summaryData && !loading) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.dark,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssessmentIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Tổng kết học phí sinh viên
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Thông tin sinh viên */}
            <InfoCard icon={PersonIcon} title="Thông tin sinh viên">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    MSSV
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {summaryData.mssv}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {summaryData.studentName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lớp học
                  </Typography>
                  <Typography variant="body1">
                    {summaryData.className}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Chương trình
                  </Typography>
                  <Typography variant="body1">
                    {summaryData.programName}
                  </Typography>
                </Grid>
              </Grid>
            </InfoCard>

            {/* Tổng quan học phí */}
            <InfoCard
              icon={MoneyIcon}
              title="Tổng quan học phí toàn khóa"
              colorType="primary"
            >
              <Grid container className="equal-height-cards" spacing={3}>
                <Grid item xs={3}>
                  <StatBox
                    label="Tổng học phí"
                    value={formatCurrency(summaryData.totalTuitionAllSemesters)}
                    colorType="primary"
                  />
                </Grid>
                <Grid item xs={3}>
                  <StatBox
                    label="Đã đóng"
                    value={formatCurrency(summaryData.totalPaidAllSemesters)}
                    colorType="success"
                  />
                </Grid>
                <Grid item xs={3}>
                  <StatBox
                    label="Còn lại"
                    value={formatCurrency(
                      summaryData.totalRemainingAllSemesters
                    )}
                    colorType={
                      summaryData.totalRemainingAllSemesters > 0
                        ? 'error'
                        : 'success'
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <StatBox
                    label="HK có nợ"
                    value={summaryData.totalSemestersWithDebt}
                    colorType="warning"
                  />
                </Grid>
              </Grid>
            </InfoCard>

            {/* Cảnh báo */}
            {summaryData.totalOverdueSemesters > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <WarningIcon sx={{ color: theme.palette.error.main }} />
                <Typography color="error.main" fontWeight={600}>
                  Sinh viên có {summaryData.totalOverdueSemesters} học kỳ trễ
                  hạn đóng học phí
                </Typography>
              </Box>
            )}

            {/* Chi tiết theo học kỳ */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Chi tiết theo học kỳ
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#1a237e' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                        Học kỳ
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Tổng học phí
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Đã đóng
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Còn lại
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                        Hạn đóng
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryData.semesterTuitions?.map((semester, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {semester.semesterName}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(semester.totalAmount)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: 'success.main', fontWeight: 600 }}
                        >
                          {formatCurrency(semester.paidAmount)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              semester.remainingAmount > 0
                                ? 'error.main'
                                : 'inherit',
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(semester.remainingAmount)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              semester.status === 3
                                ? 'Đã đóng đủ'
                                : semester.status === 2
                                  ? 'Đã đóng 1 phần'
                                  : 'Chưa đóng'
                            }
                            color={getStatusColor(semester.status)}
                            size="small"
                            icon={
                              semester.status === 3 ? (
                                <CheckCircleIcon />
                              ) : semester.isOverdue ? (
                                <WarningIcon />
                              ) : null
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              color: semester.isOverdue
                                ? 'error.main'
                                : 'text.secondary',
                            }}
                          >
                            {new Date(semester.dueDate).toLocaleDateString(
                              'vi-VN'
                            )}
                            {semester.isOverdue && ' (Trễ hạn)'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentTuitionSummaryModal;
