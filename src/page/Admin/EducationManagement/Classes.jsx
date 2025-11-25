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
  Tooltip,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Class as ClassIcon,
  School,
  People,
  CheckCircle,
  Search as SearchIcon,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import { exportClassesExcel } from '../../../until/exportClassesExcel';
import { classService } from '../../../service/classService';
import ClassDetailModal from '../../../component/Admin/ClassManagement/ClassDetailModal';
import ClassCreateModal from '../../../component/Admin/ClassManagement/ClassCreateModal';
import ClassEditModal from '../../../component/Admin/ClassManagement/ClassEditModal';
import AdviserAssignmentModal from '../../../component/Admin/ClassManagement/AdviserAssignmentModal';
import { message, Modal as AntModal } from 'antd';

const Classes = () => {
  const theme = useTheme();
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [adviserModalOpen, setAdviserModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Menu anchor for actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  // Load classes on mount and when pagination changes
  useEffect(() => {
    loadClasses();
  }, [page, rowsPerPage, searchTerm]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await classService.getAllClasses(
        page + 1,
        rowsPerPage,
        searchTerm
      );
      if (response) {
        setClasses(response.items || []);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
    const uniqueDepartments = new Set(classes.map((c) => c.departmentId)).size;
    return {
      total: totalCount,
      totalStudents: totalStudents,
      departments: uniqueDepartments,
    };
  }, [classes, totalCount]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleViewClass = (classData) => {
    setSelectedClass(classData);
    setDetailModalOpen(true);
  };

  const handleEditClass = (classData) => {
    setSelectedClass(classData);
    setEditModalOpen(true);
  };

  const handleAssignAdviser = (classData) => {
    setSelectedClass(classData);
    setAdviserModalOpen(true);
  };

  const handleDeleteClass = (classData) => {
    AntModal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa lớp học "${classData.className}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await classService.deleteClass(classData.classId);
        if (result) {
          loadClasses();
        }
      },
    });
  };

  const handleMenuOpen = (event, classData) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowForMenu(classData);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowForMenu(null);
  };

  const handleExportExcel = async () => {
    const filterInfo = searchTerm ? `Tìm kiếm: "${searchTerm}"` : '';
    const result = await exportClassesExcel(classes, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  if (loading && classes.length === 0) {
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
      field: 'classCode',
      headerName: 'Mã lớp',
      width: 100,
      renderCell: (classInfo) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {classInfo.classCode || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'className',
      headerName: 'Tên lớp',
      width: 180,
      renderCell: (classInfo) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {classInfo.className}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {classInfo.programName}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'facultyName',
      headerName: 'Khoa',
      width: 150,
      renderCell: (classInfo) => (
        <Chip
          label={classInfo.facultyName || 'N/A'}
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
      field: 'departmentName',
      headerName: 'Chuyên ngành',
      width: 150,
    },
    {
      field: 'degreeLevel',
      headerName: 'Trình độ',
      width: 100,
      align: 'center',
    },
    {
      field: 'adviserName',
      headerName: 'GVCN',
      width: 180,
      renderCell: (classInfo) => (
        <Typography
          variant="body2"
          sx={{
            color:
              classInfo.adviserName === 'Chưa phân công'
                ? theme.palette.warning.main
                : theme.palette.text.primary,
            fontStyle:
              classInfo.adviserName === 'Chưa phân công' ? 'italic' : 'normal',
          }}
        >
          {classInfo.adviserName || 'Chưa phân công'}
        </Typography>
      ),
    },
    {
      field: 'studentCount',
      headerName: 'Sĩ số',
      width: 80,
      align: 'center',
      renderCell: (classInfo) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: theme.palette.info.main,
          }}
        >
          {classInfo.studentCount || 0}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 80,
      align: 'center',
      renderCell: (classInfo) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, classInfo)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Lớp học"
        onRefresh={loadClasses}
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={classes.length === 0}
              color="success"
              sx={{ textTransform: 'none', px: 3 }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Thêm lớp học
            </Button>
          </Box>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<ClassIcon />}
            value={stats.total}
            label="Tổng lớp học"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<People />}
            value={stats.totalStudents}
            label="Tổng sinh viên"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<School />}
            value={stats.departments}
            label="Số chuyên ngành"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={totalCount}>
        <Grid item xs={12} md={10}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã lớp, tên lớp..."
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

      {/* Classes Table */}
      <DataTable
        columns={columns}
        rows={classes}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <ClassIcon
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy lớp học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có lớp học nào trong hệ thống'}
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
            handleViewClass(selectedRowForMenu);
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
            handleEditClass(selectedRowForMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleAssignAdviser(selectedRowForMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <PersonAddIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Phân công chủ nhiệm</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClass(selectedRowForMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <ClassDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        classData={selectedClass}
      />

      <ClassCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadClasses();
        }}
      />

      <ClassEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          loadClasses();
        }}
        classData={selectedClass}
      />

      <AdviserAssignmentModal
        open={adviserModalOpen}
        onClose={() => setAdviserModalOpen(false)}
        onSuccess={() => {
          loadClasses();
        }}
        classData={selectedClass}
      />
    </Box>
  );
};

export default Classes;
