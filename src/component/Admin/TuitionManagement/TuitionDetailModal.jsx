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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { tuitionService } from '../../../service/tuitionService';

const TuitionDetailModal = ({ open, onClose, tuitionFeeId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [tuitionData, setTuitionData] = useState(null);

  useEffect(() => {
    if (open && tuitionFeeId) {
      loadTuitionDetail();
    }
  }, [open, tuitionFeeId]);

  const loadTuitionDetail = async () => {
    setLoading(true);
    try {
      const response = await tuitionService.getTuitionFeeDetail(tuitionFeeId);
      if (response?.data) {
        setTuitionData(response.data);
      }
    } catch (error) {
      console.error('Error loading tuition detail:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      1: 'Tiền mặt',
      2: 'Chuyển khoản',
      3: 'Thẻ tín dụng',
    };
    return methods[method] || 'Khác';
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

  if (!tuitionData && !loading) return null;

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
          <ReceiptIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Chi tiết học phí
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
            <InfoCard icon={SchoolIcon} title="Thông tin sinh viên">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    MSSV
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {tuitionData.mssv}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {tuitionData.studentName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lớp học
                  </Typography>
                  <Typography variant="body1">{tuitionData.className}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Học kỳ
                  </Typography>
                  <Typography variant="body1">
                    {tuitionData.semesterName}
                  </Typography>
                </Grid>
              </Grid>
            </InfoCard>

            {/* Thông tin học phí */}
            <InfoCard
              icon={MoneyIcon}
              title="Thông tin học phí"
              colorType="primary"
            >
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Tổng học phí
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(tuitionData.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Đã đóng
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="success.main"
                  >
                    {formatCurrency(tuitionData.paidAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Còn lại
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={
                      tuitionData.remainingAmount > 0 ? 'error.main' : 'inherit'
                    }
                  >
                    {formatCurrency(tuitionData.remainingAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={tuitionData.statusName}
                      color={getStatusColor(tuitionData.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Hạn đóng
                  </Typography>
                  <Typography
                    variant="body1"
                    color={tuitionData.isLate ? 'error.main' : 'inherit'}
                  >
                    {new Date(tuitionData.dueDate).toLocaleDateString('vi-VN')}
                    {tuitionData.isLate && ' (Trễ hạn)'}
                  </Typography>
                </Grid>
              </Grid>
            </InfoCard>

            {/* Chi tiết môn học */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Chi tiết môn học
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#1a237e' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                        Mã lớp học phần
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                        Tên môn
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Tín chỉ
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Đơn giá
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        Thành tiền
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tuitionData.details?.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.sectionCode}</TableCell>
                        <TableCell>{detail.itemName}</TableCell>
                        <TableCell align="center">{detail.credits}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(detail.unitPrice)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(detail.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Lịch sử thanh toán */}
            {tuitionData.payments && tuitionData.payments.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Lịch sử thanh toán ({tuitionData.paymentCount} lần)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#1a237e' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Ngày đóng
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Phương thức
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: 'white', fontWeight: 600 }}
                        >
                          Số tiền
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Người xử lý
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Ghi chú
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tuitionData.payments.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell>
                            {payment.paymentMethodName}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, color: 'success.main' }}
                          >
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.processedByName}</TableCell>
                          <TableCell>{payment.note || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
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

export default TuitionDetailModal;
