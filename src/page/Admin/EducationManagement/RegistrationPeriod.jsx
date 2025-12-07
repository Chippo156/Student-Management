import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  CalendarMonth,
  School,
  Business,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Modal as AntModal } from 'antd';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import registrationPeriodService from '../../../service/registrationPeriodService';
import { departmentService } from '../../../service/departmentService';
import sectionService from '../../../service/sectionService';
import RegistrationPeriodCreateModal from '../../../component/Admin/RegistrationPeriodManagement/RegistrationPeriodCreateModal';
import RegistrationPeriodEditModal from '../../../component/Admin/RegistrationPeriodManagement/RegistrationPeriodEditModal';
import SearchableAutocomplete from '../../../component/Common/SearchableAutocomplete';
import dayjs from 'dayjs';

const RegistrationPeriod = () => {
  const theme = useTheme();
  const [periods, setPeriods] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterSemester, setFilterSemester] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Menu anchor for actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [page, rowsPerPage, filterDepartment, filterSemester, filterStatus]);

  const loadDropdownData = async () => {
    try {
      const [deptResponse, semResponse] = await Promise.all([
        departmentService.getDepartmentsDropdown(),
        sectionService.getSemesterDropdown(),
      ]);

      if (deptResponse) {
        const transformedDepts = deptResponse.map((dept) => ({
          id: dept.departmentId,
          name: dept.departmentName,
        }));
        setDepartments(transformedDepts);
      }

      if (semResponse) {
        // Transform semester data to {id, name} format for SearchableAutocomplete
        const transformedSemesters = semResponse.map((semester) => ({
          id: semester.id,
          name:
            semester.name ||
            `${semester.year || ''} - ${semester.term || ''}`.trim() ||
            `Học kỳ ${semester.id}`,
        }));
        setSemesters(transformedSemesters);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const response =
        await registrationPeriodService.getAllRegistrationPeriods({
          pageNumber: page + 1,
          pageSize: rowsPerPage,
          departmentId: filterDepartment?.id || null,
          semesterId: filterSemester?.id || null,
          isActive: filterStatus?.id ?? null, // Dùng ?? thay vì || để giữ giá trị false
        });
      if (response) {
        setPeriods(response.items || []);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Error loading registration periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const now = dayjs();
    const active = periods.filter(
      (p) => now.isAfter(dayjs(p.startDate)) && now.isBefore(dayjs(p.endDate))
    ).length;
    const upcoming = periods.filter((p) =>
      now.isBefore(dayjs(p.startDate))
    ).length;
    return {
      total: totalCount,
      active: active,
      upcoming: upcoming,
      departments: departments.length,
    };
  }, [periods, totalCount, departments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilterDepartment(null);
    setFilterSemester(null);
    setFilterStatus(null);
    setPage(0);
  };

  const handleEditPeriod = (period) => {
    setSelectedPeriod(period);
    setEditModalOpen(true);
  };

  const handleDeletePeriod = (period) => {
    AntModal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa khung thời gian đăng ký "${period.departmentName} - ${period.semesterName}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await registrationPeriodService.deleteRegistrationPeriod(
          period.registrationPeriodId
        );
        if (result) {
          loadPeriods();
        }
      },
    });
  };

  const handleMenuOpen = (event, period) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRowForMenu(period);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowForMenu(null);
  };

  const getStatusChip = (period) => {
    if (period.status === 'Active') {
      return <Chip label="Đang diễn ra" color="success" size="small" />;
    } else if (period.status === 'Upcoming') {
      return <Chip label="Sắp diễn ra" color="info" size="small" />;
    } else {
      return <Chip label="Đã kết thúc" color="default" size="small" />;
    }
  };

  const columns = [
    {
      field: 'departmentName',
      headerName: 'Chuyên ngành',
      width: 220,
      renderCell: (period) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {period.departmentName || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {period.facultyName}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'semesterName',
      headerName: 'Học kỳ',
      width: 150,
      renderCell: (period) => (
        <Chip
          label={period.semesterName || 'N/A'}
          size="small"
          sx={{
            bgcolor:
              theme.palette.mode === 'light'
                ? theme.palette.primary.light + '30'
                : theme.palette.primary.dark + '40',
            color: theme.palette.primary.main,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'startDate',
      headerName: 'Ngày bắt đầu',
      width: 130,
      align: 'center',
      renderCell: (period) => (
        <Typography variant="body2">
          {dayjs(period.startDate).format('DD/MM/YYYY')}
        </Typography>
      ),
    },
    {
      field: 'endDate',
      headerName: 'Ngày kết thúc',
      width: 130,
      align: 'center',
      renderCell: (period) => (
        <Typography variant="body2">
          {dayjs(period.endDate).format('DD/MM/YYYY')}
        </Typography>
      ),
    },
    {
      field: 'duration',
      headerName: 'Thời gian',
      width: 110,
      align: 'center',
      renderCell: (period) => (
        <Typography variant="body2" color="text.secondary">
          {period.duration || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      align: 'center',
      renderCell: (period) => getStatusChip(period),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      align: 'center',
      renderCell: (period) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditPeriod(period);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePeriod(period);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading && periods.length === 0) {
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

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Khung thời gian đăng ký học phần"
        onRefresh={loadPeriods}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              textTransform: 'none',
              px: 3,
              width: { xs: '100%', sm: 'auto' },
            }}
            size="small"
          >
            Thêm khung thời gian
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CalendarMonth />}
            value={stats.total}
            label="Tổng khung thời gian"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircle />}
            value={stats.active}
            label="Đang diễn ra"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<School />}
            value={stats.upcoming}
            label="Sắp diễn ra"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Business />}
            value={stats.departments}
            label="Chuyên ngành"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={periods.length}>
        <Grid item xs={12} sm={6} md={3}>
          <SearchableAutocomplete
            options={departments}
            placeholder="Tìm chuyên ngành..."
            value={filterDepartment}
            onChange={(newValue) => {
              setFilterDepartment(newValue);
              setPage(0);
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SearchableAutocomplete
            options={semesters}
            placeholder="Tìm học kỳ..."
            value={filterSemester}
            onChange={(newValue) => {
              setFilterSemester(newValue);
              setPage(0);
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SearchableAutocomplete
            options={[
              { id: '', name: 'Tất cả' },
              { id: true, name: 'Đang diễn ra' },
              { id: false, name: 'Đã kết thúc' },
            ]}
            placeholder="Tìm trạng thái..."
            value={filterStatus}
            onChange={(newValue) => {
              setFilterStatus(newValue);
              setPage(0);
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: '40px' }}
          >
            Đặt lại
          </Button>
        </Grid>
      </FilterSection>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={periods}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <CalendarMonth
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy khung thời gian đăng ký nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterDepartment || filterSemester || filterStatus
                ? 'Thử thay đổi bộ lọc'
                : 'Tạo khung thời gian đăng ký để quản lý việc đăng ký học phần'}
            </Typography>
          </>
        }
      />

      {/* Modals */}
      <RegistrationPeriodCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadPeriods();
          setCreateModalOpen(false);
        }}
      />

      <RegistrationPeriodEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          loadPeriods();
          setEditModalOpen(false);
        }}
        period={selectedPeriod}
      />
    </Box>
  );
};

export default RegistrationPeriod;
