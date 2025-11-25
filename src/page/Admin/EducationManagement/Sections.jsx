import React, { useState, useMemo, useEffect } from 'react';
import { message } from 'antd';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  School,
  Group,
  Assignment,
  People,
  Search as SearchIcon,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import sectionService from '../../../service/sectionService';
import { semesterService } from '../../../service/semesterService';
import { exportSectionsExcel } from '../../../until/exportSectionsExcel';
import SectionDetailModal from '../../../component/Admin/SectionManagement/SectionDetailModal';
import SectionCreateModal from '../../../component/Admin/SectionManagement/SectionCreateModal';
import SectionEditModal from '../../../component/Admin/SectionManagement/SectionEditModal';

const Sections = () => {
  const theme = useTheme();
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const statusOptions = [
    { value: 0, label: 'Đang chuẩn bị', color: 'warning' },      // IsPreparing
    { value: 1, label: 'Đang mở đăng ký', color: 'info' },       // IsOpening
    { value: 2, label: 'Đã đóng', color: 'default' },            // IsClosed
    { value: 3, label: 'Đã hủy', color: 'error' },               // IsCancelled
    { value: 4, label: 'Đã hoàn thành', color: 'success' },      // IsCompleted
  ];

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await semesterService.getStudentSemesters();
        setSemesters(data || []);
      } catch (error) {
        console.error('Failed to fetch semesters:', error);
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchSections();
  }, [page, rowsPerPage, searchTerm, filterSemester, filterStatus]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const result = await sectionService.getAllSections({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        sectionCode: searchTerm,
        courseName: searchTerm,
        status: filterStatus !== '' ? filterStatus : null,
        semesterId: filterSemester || null,
      });

      if (result) {
        setSections(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterSemester('');
    setFilterStatus('');
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.label : 'Không xác định';
  };

  const stats = useMemo(() => {
    const totalCapacity = sections.reduce(
      (sum, s) => sum + (s.capacity || 0),
      0
    );
    const totalEnrolled = sections.reduce(
      (sum, s) => sum + (s.enrolledCount || 0),
      0
    );
    const avgEnrollment =
      sections.length > 0
        ? sections.reduce((sum, s) => sum + (s.enrollmentPercentage || 0), 0) /
          sections.length
        : 0;

    return {
      total: totalCount,
      capacity: totalCapacity,
      enrolled: totalEnrolled,
      avgEnrollment: Math.round(avgEnrollment),
    };
  }, [sections, totalCount]);

  const handleExportExcel = async () => {
    let filterInfo = '';
    if (searchTerm) filterInfo += `Tìm kiếm: "${searchTerm}"`;
    if (filterSemester) {
      const semester = semesters.find(s => s.semesterId === filterSemester);
      filterInfo += (filterInfo ? ', ' : '') + `Học kỳ: ${semester?.semesterName || ''}`;
    }
    if (filterStatus !== '') {
      const status = statusOptions.find(s => s.value === filterStatus);
      filterInfo += (filterInfo ? ', ' : '') + `Trạng thái: ${status?.label || ''}`;
    }

    const result = await exportSectionsExcel(sections, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  // Modal handlers
  const handleViewSection = async (section) => {
    setLoading(true);
    try {
      const detailData = await sectionService.getSectionById(section.sectionId);
      if (detailData) {
        setSelectedSection(detailData);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch section detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = async (section) => {
    setLoading(true);
    try {
      const detailData = await sectionService.getSectionById(section.sectionId);
      if (detailData) {
        setSelectedSection(detailData);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch section detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = () => {
    setCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setDetailModalOpen(false);
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSelectedSection(null);
  };

  const handleSaveSection = () => {
    fetchSections();
    handleCloseModals();
  };

  if (loading && sections.length === 0) {
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
      field: 'sectionCode',
      headerName: 'Mã LHP',
      width: 120,
      renderCell: (section) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {section.sectionCode}
        </Typography>
      ),
    },
    {
      field: 'courseName',
      headerName: 'Môn học',
      width: 220,
      renderCell: (section) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {section.courseName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {section.courseCode} ({section.totalCredits} TC)
          </Typography>
        </Box>
      ),
    },
    {
      field: 'lecturerName',
      headerName: 'Giảng viên',
      width: 180,
      renderCell: (section) => (
        <Box>
          <Typography variant="body2">{section.lecturerName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {section.lecturerEmail}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'className',
      headerName: 'Lớp dự kiến',
      width: 130,
      renderCell: (section) => (
        <Chip
          label={section.className}
          size="small"
          sx={{
            bgcolor:
              theme.palette.mode === 'light'
                ? theme.palette.primary.light + '30'
                : theme.palette.primary.dark + '40',
            color: theme.palette.primary.main,
          }}
        />
      ),
    },
    {
      field: 'semesterName',
      headerName: 'Học kỳ',
      width: 160,
      renderCell: (section) => (
        <Box>
          <Typography variant="body2">{section.semesterName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {section.startDate} - {section.endDate}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'enrolledCount',
      headerName: 'Sĩ số',
      width: 180,
      renderCell: (section) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {section.enrolledCount}/{section.capacity}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={section.enrollmentPercentage}
            sx={{
              height: 6,
              borderRadius: 3,
              mt: 0.5,
              backgroundColor: theme.palette.divider,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor:
                  section.enrollmentPercentage >= 80
                    ? theme.palette.success.main
                    : section.enrollmentPercentage >= 50
                      ? theme.palette.warning.main
                      : theme.palette.error.main,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {section.enrollmentPercentage.toFixed(1)}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      renderCell: (section) => (
        <Chip
          label={getStatusLabel(section.status)}
          size="small"
          color={getStatusColor(section.status)}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      align: 'center',
      renderCell: (section) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" onClick={() => handleViewSection(section)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditSection(section)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Lớp học phần"
        onRefresh={fetchSections}
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={sections.length === 0}
              color="success"
              sx={{ textTransform: 'none', px: 3 }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSection}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Thêm lớp học phần
            </Button>
          </Box>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<School />}
            value={stats.total}
            label="Tổng lớp học phần"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Group />}
            value={stats.capacity}
            label="Tổng sĩ số"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<People />}
            value={stats.enrolled}
            label="Đã đăng ký"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Assignment />}
            value={`${stats.avgEnrollment}%`}
            label="Tỷ lệ đăng ký TB"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={sections.length}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Tìm theo mã lớp, tên môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Học kỳ</InputLabel>
            <Select
              value={filterSemester}
              label="Học kỳ"
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {semesters.map((sem) => (
                <MenuItem key={sem.semesterId} value={sem.semesterId}>
                  {sem.year} - {sem.term}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              label="Trạng thái"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
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

      {/* Sections Table */}
      <DataTable
        columns={columns}
        rows={sections}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <School
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học phần nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có lớp học phần nào trong hệ thống'}
            </Typography>
          </>
        }
      />

      {/* Modals */}
      <SectionDetailModal
        open={detailModalOpen}
        onCancel={handleCloseModals}
        section={selectedSection}
      />

      <SectionCreateModal
        open={createModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveSection}
      />

      <SectionEditModal
        open={editModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveSection}
        section={selectedSection}
      />
    </Box>
  );
};

export default Sections;
