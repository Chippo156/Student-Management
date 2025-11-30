import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FileDownload,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import * as XLSX from 'xlsx';
import { tuitionService } from '../../../service/tuitionService';
import TuitionDetailModal from '../../../component/Admin/TuitionManagement/TuitionDetailModal';
import StudentTuitionSummaryModal from '../../../component/Admin/TuitionManagement/StudentTuitionSummaryModal';
import { useDebounce } from '../../../hooks/useDebounce';

const TuitionFees = () => {
  const theme = useTheme();
  const [tuitions, setTuitions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState('');

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState(null);
  const [selectedMSSV, setSelectedMSSV] = useState('');

  // Menu anchor for actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  useEffect(() => {
    loadTuitions();
  }, [page, rowsPerPage, debouncedSearchTerm, statusFilter, overdueFilter]); // ✅ Dùng debouncedSearchTerm

  const loadTuitions = async () => {
    setLoading(true);
    try {
      const response = await tuitionService.getAllTuitionFees(
        page + 1,
        rowsPerPage,
        debouncedSearchTerm, // ✅ Dùng debounced value
        null,
        statusFilter,
        overdueFilter
      );

      if (response?.data) {
        setTuitions(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error loading tuitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalAmount = tuitions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPaid = tuitions.reduce((sum, t) => sum + t.paidAmount, 0);
    const totalRemaining = tuitions.reduce(
      (sum, t) => sum + t.remainingAmount,
      0
    );
    const overdueCount = tuitions.filter((t) => t.isLate).length;

    return {
      totalAmount,
      totalPaid,
      totalRemaining,
      overdueCount,
    };
  }, [tuitions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setOverdueFilter('');
    setPage(0);
  };

  const handleViewDetail = (tuition) => {
    setSelectedTuition(tuition);
    setDetailModalOpen(true);
  };

  const handleViewSummary = (tuition) => {
    setSelectedMSSV(tuition.mssv);
    setSummaryModalOpen(true);
  };

  const handleMenuOpen = (event, tuition) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowForMenu(tuition);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowForMenu(null);
  };

  const handleExportExcel = () => {
    const exportData = tuitions.map((tuition, index) => ({
      STT: index + 1,
      MSSV: tuition.mssv,
      'Họ tên': tuition.studentName,
      'Lớp học': tuition.className,
      'Học kỳ': tuition.semesterName,
      'Tổng học phí': tuition.totalAmount,
      'Đã đóng': tuition.paidAmount,
      'Còn lại': tuition.remainingAmount,
      'Trạng thái': tuition.statusName,
      'Hạn đóng': new Date(tuition.dueDate).toLocaleDateString('vi-VN'),
      'Trễ hạn': tuition.isLate ? 'Có' : 'Không',
      'Số lần đóng': tuition.paymentCount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học phí');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Danh_sach_hoc_phi_${new Date().getTime()}.xlsx`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 3: // Đã đóng đủ
        return 'success';
      case 2: // Đã đóng 1 phần
        return 'warning';
      case 1: // Chưa đóng
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading && tuitions.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    {
      field: 'mssv',
      headerName: 'MSSV',
      width: 120,
      renderCell: (tuition) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {tuition.mssv}
        </Typography>
      ),
    },
    {
      field: 'studentName',
      headerName: 'Sinh viên',
      width: 180,
      renderCell: (tuition) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {tuition.studentName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {tuition.className}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'semesterName',
      headerName: 'Học kỳ',
      width: 130,
    },
    {
      field: 'totalAmount',
      headerName: 'Tổng học phí',
      width: 140,
      align: 'right',
      renderCell: (tuition) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatCurrency(tuition.totalAmount)}
        </Typography>
      ),
    },
    {
      field: 'paidAmount',
      headerName: 'Đã đóng',
      width: 140,
      align: 'right',
      renderCell: (tuition) => (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.success.main, fontWeight: 600 }}
        >
          {formatCurrency(tuition.paidAmount)}
        </Typography>
      ),
    },
    {
      field: 'remainingAmount',
      headerName: 'Còn lại',
      width: 140,
      align: 'right',
      renderCell: (tuition) => (
        <Typography
          variant="body2"
          sx={{
            color:
              tuition.remainingAmount > 0
                ? theme.palette.error.main
                : theme.palette.text.secondary,
            fontWeight: 600,
          }}
        >
          {formatCurrency(tuition.remainingAmount)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      renderCell: (tuition) => (
        <Chip
          label={tuition.statusName}
          color={getStatusColor(tuition.status)}
          size="small"
          icon={
            tuition.status === 3 ? (
              <CheckCircleIcon />
            ) : tuition.isLate ? (
              <WarningIcon />
            ) : null
          }
        />
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Hạn đóng',
      width: 110,
      renderCell: (tuition) => (
        <Typography
          variant="caption"
          sx={{
            color: tuition.isLate
              ? theme.palette.error.main
              : theme.palette.text.secondary,
          }}
        >
          {new Date(tuition.dueDate).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 80,
      align: 'center',
      renderCell: (tuition) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, tuition)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Học phí"
        onRefresh={loadTuitions}
        actions={
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            disabled={tuitions.length === 0}
            color="success"
            sx={{ textTransform: 'none', px: 3, width: { xs: '100%', sm: 'auto' } }}
            size="small"
          >
            Xuất Excel
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<MoneyIcon />}
            value={formatCurrency(stats.totalAmount)}
            label="Tổng học phí"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircleIcon />}
            value={formatCurrency(stats.totalPaid)}
            label="Đã thu"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUp />}
            value={formatCurrency(stats.totalRemaining)}
            label="Còn lại"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<WarningIcon />}
            value={stats.overdueCount}
            label="Trễ hạn"
            color="error"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={totalCount}>
        <Grid item xs={12} sm={12} md={4} lg={4}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo MSSV, tên sinh viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText={
              searchTerm !== debouncedSearchTerm && searchTerm ? (
                <span style={{ fontSize: '0.75rem' }}>Đang tìm kiếm...</span>
              ) : null
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">Chưa đóng</MenuItem>
              <MenuItem value="2">Đã đóng 1 phần</MenuItem>
              <MenuItem value="3">Đã đóng đủ</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
          <FormControl fullWidth>
            <InputLabel>Trễ hạn</InputLabel>
            <Select
              value={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.value)}
              label="Trễ hạn"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Có</MenuItem>
              <MenuItem value="false">Không</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={2} lg={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: '56px' }}
          >
            Đặt lại
          </Button>
        </Grid>
      </FilterSection>

      {/* Tuition Table */}
      <DataTable
        columns={columns}
        rows={tuitions}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <ReceiptIcon
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy học phí nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có học phí nào trong hệ thống'}
            </Typography>
          </>
        }
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleViewDetail(selectedRowForMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleViewSummary(selectedRowForMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Tổng kết sinh viên</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <TuitionDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        tuitionFeeId={selectedTuition?.tuitionFeeId}
      />

      <StudentTuitionSummaryModal
        open={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        mssv={selectedMSSV}
      />
    </Box>
  );
};

export default TuitionFees;
