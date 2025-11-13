import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Payment as PaymentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { PageHeader, StatsCard, DataTable, FilterSection } from '../../../component/Common';

const TuitionList = () => {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample data
  const tuitionRecords = [
    {
      id: '1',
      studentId: 'SV2024001',
      studentName: 'Nguyễn Văn An',
      semester: 'HK1 2024-2025',
      amount: 12000000,
      dueDate: '2024-10-15',
      paymentDate: '2024-09-20',
      status: 'paid',
      method: 'Chuyển khoản',
      note: 'Đã thanh toán đúng hạn',
    },
    {
      id: '2',
      studentId: 'SV2024002',
      studentName: 'Trần Thị Bình',
      semester: 'HK1 2024-2025',
      amount: 12000000,
      dueDate: '2024-10-15',
      status: 'pending',
      note: 'Chưa thanh toán',
    },
    {
      id: '3',
      studentId: 'SV2024003',
      studentName: 'Lê Văn Cường',
      semester: 'HK1 2024-2025',
      amount: 12000000,
      dueDate: '2024-09-15',
      status: 'overdue',
      note: 'Quá hạn thanh toán',
    },
  ];

  const semesters = ['HK1 2024-2025', 'HK2 2023-2024', 'HK1 2023-2024'];
  const statuses = [
    { value: 'paid', label: 'Đã thanh toán', color: 'success' },
    { value: 'pending', label: 'Chờ thanh toán', color: 'warning' },
    { value: 'overdue', label: 'Quá hạn', color: 'error' },
  ];

  const filteredRecords = tuitionRecords.filter((record) => {
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesSemester =
      !semesterFilter || record.semester === semesterFilter;
    return matchesStatus && matchesSemester;
  });

  const getStatusColor = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };

  const getStatusLabel = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Statistics
  const stats = useMemo(() => {
    const paidCount = tuitionRecords.filter((r) => r.status === 'paid').length;
    const pendingCount = tuitionRecords.filter((r) => r.status === 'pending').length;
    const overdueCount = tuitionRecords.filter((r) => r.status === 'overdue').length;
    const totalAmount = tuitionRecords.reduce((sum, r) => sum + r.amount, 0);

    return {
      total: tuitionRecords.length,
      paid: paidCount,
      pending: pendingCount,
      overdue: overdueCount,
      totalAmount,
    };
  }, [tuitionRecords]);

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Học phí"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Thêm học phí
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<PaymentIcon />} value={stats.total} label="Tổng bản ghi" color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<PaymentIcon />} value={stats.paid} label="Đã thanh toán" color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<PaymentIcon />} value={stats.pending} label="Chờ thanh toán" color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<PaymentIcon />} value={stats.overdue} label="Quá hạn" color="error" />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={filteredRecords.length}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Học kỳ</InputLabel>
            <Select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              label="Học kỳ"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {semesters.map((semester) => (
                <MenuItem key={semester} value={semester}>
                  {semester}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </FilterSection>

      {/* Tuition Records Table */}
      <DataTable
        columns={[
          {
            field: 'studentName',
            headerName: 'Sinh viên',
            width: 200,
            renderCell: (record) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {record.studentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {record.studentId}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            field: 'semester',
            headerName: 'Học kỳ',
            width: 150,
          },
          {
            field: 'amount',
            headerName: 'Số tiền',
            width: 150,
            renderCell: (record) => (
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(record.amount)}
              </Typography>
            ),
          },
          {
            field: 'dueDate',
            headerName: 'Hạn thanh toán',
            width: 180,
            renderCell: (record) => (
              <Box>
                <Typography variant="body2">
                  {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                </Typography>
                {record.paymentDate && (
                  <Typography variant="caption" color="text.secondary">
                    Đã thanh toán: {new Date(record.paymentDate).toLocaleDateString('vi-VN')}
                  </Typography>
                )}
              </Box>
            ),
          },
          {
            field: 'status',
            headerName: 'Trạng thái',
            width: 140,
            renderCell: (record) => (
              <Chip
                label={getStatusLabel(record.status)}
                color={getStatusColor(record.status)}
                size="small"
              />
            ),
          },
          {
            field: 'actions',
            headerName: 'Thao tác',
            width: 120,
            align: 'center',
            renderCell: (record) => (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedRecord(record);
                      setViewDialogOpen(true);
                    }}
                    color="primary"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Chỉnh sửa">
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ]}
        rows={filteredRecords}
        page={0}
        rowsPerPage={10}
        totalCount={filteredRecords.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        emptyState={
          <>
            <PaymentIcon sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy bản ghi học phí nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chưa có dữ liệu học phí trong hệ thống
            </Typography>
          </>
        }
      />

      {/* View Record Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chi tiết học phí: {selectedRecord?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin học phí
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Mã sinh viên:</strong>{' '}
                        {selectedRecord.studentId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Học kỳ:</strong> {selectedRecord.semester}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Số tiền:</strong>{' '}
                        {formatCurrency(selectedRecord.amount)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Hạn thanh toán:</strong>{' '}
                        {new Date(selectedRecord.dueDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </Typography>
                      {selectedRecord.paymentDate && (
                        <Typography variant="body2">
                          <strong>Ngày thanh toán:</strong>{' '}
                          {new Date(
                            selectedRecord.paymentDate
                          ).toLocaleDateString('vi-VN')}
                        </Typography>
                      )}
                      {selectedRecord.method && (
                        <Typography variant="body2">
                          <strong>Phương thức:</strong> {selectedRecord.method}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>Ghi chú:</strong>{' '}
                        {selectedRecord.note || 'Không có'}
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          label={getStatusLabel(selectedRecord.status)}
                          color={getStatusColor(selectedRecord.status)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          {selectedRecord?.status === 'pending' && (
            <Button variant="contained" startIcon={<ReceiptIcon />}>
              Xác nhận thanh toán
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TuitionList;
