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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  School,
  MenuBook,
  Business,
  CheckCircle,
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
import academicProgramService from '../../../service/academicProgramService';
import { departmentService } from '../../../service/departmentService';
import * as XLSX from 'xlsx';
import { useDebounce } from '../../../hooks/useDebounce';

const Curriculum = () => {
  const theme = useTheme();
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDegree, setFilterDegree] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [page, rowsPerPage, debouncedSearchTerm, filterDegree, filterDepartment]); // ✅ Dùng debouncedSearchTerm

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartmentsDropdown();
      // Transform data to match dropdown structure
      const transformedData =
        data?.map((dept) => ({
          id: dept.departmentId,
          name: dept.departmentName,
        })) || [];
      setDepartments(transformedData);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const result = await academicProgramService.getAllPrograms({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        programName: debouncedSearchTerm, // ✅ Dùng debounced value
        degreeLevel: filterDegree || '',
        departmentId: filterDepartment || null, // ✅ Thêm filter theo departmentId
      });

      if (result) {
        setPrograms(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
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
    setFilterDegree('');
    setFilterDepartment('');
  };

  const degreeLevels = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ'];

  const stats = useMemo(() => {
    return {
      total: totalCount,
      undergraduate: programs.filter((p) => p.degreeLevel === 'Cử nhân').length,
      graduate: programs.filter((p) => p.degreeLevel === 'Thạc sĩ').length,
      departments: departments.length,
    };
  }, [programs, totalCount, departments]);

  const handleExportExcel = () => {
    const dataToExport = programs.map((program, index) => ({
      STT: index + 1,
      'Mã CTĐT': program.academicProgramId,
      'Tên chương trình': program.programName,
      'Bậc đào tạo': program.degreeLevel,
      'Chuyên ngành': program.departmentName,
      'Chuyên ngành quản lý': program.facultyName,
      'Tín chỉ': program.creditsRequired,
      'Trạng thái': program.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chương trình đào tạo');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 40 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 10 },
      { wch: 18 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(
      workbook,
      `Danh_sach_chuong_trinh_dao_tao_${new Date().getTime()}.xlsx`
    );
  };

  if (loading && programs.length === 0) {
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
      field: 'academicProgramId',
      headerName: 'Mã CTĐT',
      width: 120,
      renderCell: (program) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {program.academicProgramId}
        </Typography>
      ),
    },
    {
      field: 'programName',
      headerName: 'Tên chương trình',
      width: 280,
      renderCell: (program) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {program.programName}
        </Typography>
      ),
    },
    {
      field: 'degreeLevel',
      headerName: 'Bậc đào tạo',
      width: 130,
      renderCell: (program) => (
        <Chip
          label={program.degreeLevel}
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
      width: 200,
      renderCell: (program) => (
        <Box>
          <Typography variant="body2">{program.departmentName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {program.facultyName}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'creditsRequired',
      headerName: 'Tín chỉ',
      width: 100,
      align: 'center',
      renderCell: (program) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {program.creditsRequired}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Trạng thái',
      width: 160,
      renderCell: (program) => (
        <Chip
          label={program.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
          size="small"
          color={program.isActive ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      align: 'center',
      renderCell: () => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small">
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
  ];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Chương trình đào tạo"
        onRefresh={fetchPrograms}
        actions={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={programs.length === 0}
              color="success"
              sx={{
                textTransform: 'none',
                px: 3,
                width: { xs: '100%', sm: 'auto' },
              }}
              size="small"
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                textTransform: 'none',
                px: 3,
                width: { xs: '100%', sm: 'auto' },
              }}
              size="small"
            >
              Thêm chương trình
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
            label="Tổng chương trình"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<MenuBook />}
            value={stats.undergraduate}
            label="Đại học"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircle />}
            value={stats.graduate}
            label="Sau đại học"
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
      <FilterSection resultCount={programs.length}>
        <Grid item xs={12} sm={12} md={5} lg={4}>
          <TextField
            fullWidth
            placeholder="Tìm theo tên chương trình..."
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
            helperText={
              searchTerm !== debouncedSearchTerm && searchTerm ? (
                <span style={{ fontSize: '0.75rem' }}>Đang tìm kiếm...</span>
              ) : null
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2} lg={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Bậc đào tạo</InputLabel>
            <Select
              value={filterDegree || ''}
              label="Bậc đào tạo"
              onChange={(e) => setFilterDegree(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {degreeLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="department-select-label">Chuyên ngành</InputLabel>
            <Select
              labelId="department-select-label"
              value={filterDepartment || ''}
              label="Chuyên ngành"
              onChange={(e) => setFilterDepartment(e.target.value)}
              renderValue={(selected) => {
                if (!selected) {
                  return 'Tất cả';
                }
                const department = departments.find((d) => d.id === selected);
                return department ? department.name : selected;
              }}
            >
              <MenuItem value="">
                <em>Tất cả</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={2} lg={2}>
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

      {/* Programs Table */}
      <DataTable
        columns={columns}
        rows={programs}
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
              Không tìm thấy chương trình đào tạo nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có chương trình đào tạo nào trong hệ thống'}
            </Typography>
          </>
        }
      />
    </Box>
  );
};

export default Curriculum;
