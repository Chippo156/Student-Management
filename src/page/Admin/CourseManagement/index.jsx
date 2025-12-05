import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  MenuBook,
  Assignment,
  Category,
  School,
  Search as SearchIcon,
  FileDownload,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  PageHeader,
  StatsCard,
  DataTable,
  FilterSection,
} from '../../../component/Common';
import curriculumCourseService from '../../../service/curriculumCourseService';
import academicProgramService from '../../../service/academicProgramService';
import { departmentService } from '../../../service/departmentService';
import { exportCoursesExcel } from '../../../until/exportCoursesExcel';
import { message } from 'antd';
import CourseDetailModal from '../../../component/Admin/CourseManagement/CourseDetailModal';
import CourseEditModal from '../../../component/Admin/CourseManagement/CourseEditModal';
import CourseCreateModal from '../../../component/Admin/CourseManagement/CourseCreateModal';
import SearchableAutocomplete from '../../../component/Common/SearchableAutocomplete';
import { useDebounce } from '../../../hooks/useDebounce';

const CourseManagement = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterCourseType, setFilterCourseType] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Course type options for filter
  const courseTypeOptions = [
    { id: null, name: 'Tất cả loại môn học' },
    { id: 'required', name: 'Bắt buộc' },
    { id: 'elective', name: 'Tự chọn' }
  ];

  // Fetch programs for filter
  useEffect(() => {
    const fetchPrograms = async () => {
      const result = await academicProgramService.getAllPrograms({
        pageSize: 100,
      });
      if (result) {
        const transformedPrograms = [
          { id: null, name: 'Tất cả chương trình' },
          ...(result.items?.map(prog => ({
            id: prog.academicProgramId,
            name: prog.programName
          })) || [])
        ];
        setPrograms(transformedPrograms);
      } else {
        setPrograms([{ id: null, name: 'Tất cả chương trình' }]);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await departmentService.getDepartmentsDropdown();
      if (result && Array.isArray(result)) {
        const transformedDepts = [
          { id: null, name: 'Tất cả chuyên ngành' },
          ...result.map(dept => ({
            id: dept.departmentId,
            name: dept.departmentName
          }))
        ];
        setDepartments(transformedDepts);
      } else {
        setDepartments([{ id: null, name: 'Tất cả chuyên ngành' }]);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch courses khi debounced search term thay đổi
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, [
    page,
    rowsPerPage,
    debouncedSearchTerm,
    filterProgram,
    filterDepartment,
    filterCourseType,
  ]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await curriculumCourseService.getAllCurriculumCourses({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        courseCode: debouncedSearchTerm, // ✅ Dùng debounced value
        courseName: debouncedSearchTerm, // ✅ Dùng debounced value
        programId: filterProgram?.id || null,
        departmentId: filterDepartment?.id || null,
      });

      if (result) {
        setCourses(result.items || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCourseType =
        !filterCourseType?.id ||
        (filterCourseType.id === 'required' && course.isRequired) ||
        (filterCourseType.id === 'elective' && !course.isRequired);
      return matchesCourseType;
    });
  }, [courses, filterCourseType]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterProgram(null);
    setFilterDepartment(null);
    setFilterCourseType(null);
    setPage(0);
  };

  const handleExportExcel = async () => {
    let filterInfo = '';
    if (searchTerm) filterInfo += `Tìm kiếm: "${searchTerm}"`;
    if (filterProgram && filterProgram.id !== null) {
      filterInfo += (filterInfo ? ', ' : '') + `Chương trình: ${filterProgram.name}`;
    }
    if (filterDepartment) {
      filterInfo += (filterInfo ? ', ' : '') + `Chuyên ngành: ${filterDepartment.name}`;
    }
    if (filterCourseType && filterCourseType.id !== null) {
      filterInfo += (filterInfo ? ', ' : '') + `Loại: ${filterCourseType.name}`;
    }

    const result = await exportCoursesExcel(filteredCourses, filterInfo);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  // Modal handlers
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setDetailModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  const handleCreateCourse = () => {
    setCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setDetailModalOpen(false);
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSaveCourse = (savedCourse) => {
    fetchCourses();
    handleCloseModals();
  };

  const stats = useMemo(() => {
    const uniqueDepts = new Set(
      courses.map((c) => c.department?.departmentId).filter(Boolean)
    ).size;
    return {
      total: totalCount,
      required: courses.filter((c) => c.isRequired).length,
      elective: courses.filter((c) => !c.isRequired).length,
      departments: uniqueDepts,
    };
  }, [courses, totalCount]);

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: '100vh' }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Môn học"
        onRefresh={fetchCourses}
        actions={
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={filteredCourses.length === 0}
              color="success"
              sx={{ textTransform: 'none', px: 3, width: { xs: '100%', sm: 'auto' } }}
              size="small"
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCourse}
              sx={{ textTransform: 'none', px: 3, width: { xs: '100%', sm: 'auto' } }}
              size="small"
            >
              Thêm môn học
            </Button>
          </Box>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<MenuBook />}
            value={stats.total}
            label="Tổng môn học"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Assignment />}
            value={stats.required}
            label="Môn bắt buộc"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Category />}
            value={stats.elective}
            label="Môn tự chọn"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<School />}
            value={stats.departments}
            label="Chuyên ngành"
            color="info"
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={filteredCourses.length}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <TextField
            fullWidth
            placeholder="Tìm theo mã môn học, tên môn học..."
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
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SearchableAutocomplete
            options={programs}
            placeholder="Tìm chương trình..."
            value={filterProgram}
            onChange={(value) => {
              setFilterProgram(value);
              setPage(0);
            }}
            disableClearable={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SearchableAutocomplete
            options={departments}
            placeholder="Tìm chuyên ngành..."
            value={filterDepartment}
            onChange={(value) => {
              setFilterDepartment(value);
              setPage(0);
            }}
            disableClearable={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SearchableAutocomplete
            options={courseTypeOptions}
            placeholder="Tìm loại môn học..."
            value={filterCourseType}
            onChange={(value) => {
              setFilterCourseType(value);
              setPage(0);
            }}
            disableClearable={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: '40px' }}
            size="small"
          >
            Đặt lại
          </Button>
        </Grid>
      </FilterSection>

      {/* Courses Table */}
      <DataTable
        columns={[
          {
            field: 'courseCode',
            headerName: 'Mã môn học',
            width: 120,
            renderCell: (course) => (
              <Typography
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                {course.courseCode}
              </Typography>
            ),
          },
          {
            field: 'courseName',
            headerName: 'Tên môn học',
            width: 220,
            renderCell: (course) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {course.courseName}
                </Typography>
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    Tiên quyết:{' '}
                    {course.prerequisites.map((p) => p.courseCode).join(', ')}
                  </Typography>
                )}
              </Box>
            ),
          },
          {
            field: 'programName',
            headerName: 'Chương trình',
            width: 180,
            renderCell: (course) => (
              <Box>
                <Typography variant="body2">{course.programName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {course.degreeLevel}
                </Typography>
              </Box>
            ),
          },
          {
            field: 'departmentName',
            headerName: 'Chuyên ngành',
            width: 160,
            renderCell: (course) => (
              <Chip
                label={course.departmentName}
                size="small"
                sx={{
                  bgcolor: theme.palette.primary.light + '30',
                  color: theme.palette.primary.main,
                }}
              />
            ),
          },
          {
            field: 'totalCredits',
            headerName: 'Tín chỉ',
            width: 140,
            renderCell: (course) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {course.totalCredits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  LT: {course.creditsTheory} | TH: {course.creditsLab}
                </Typography>
              </Box>
            ),
          },
          {
            field: 'semesterSuggested',
            headerName: 'Học kỳ',
            width: 100,
            align: 'center',
            renderCell: (course) => (
              <Typography variant="body2">
                HK {course.semesterSuggested}
              </Typography>
            ),
          },
          {
            field: 'courseType',
            headerName: 'Loại',
            width: 130,
            align: 'center',
            renderCell: (course) => (
              <Chip
                label={course.courseType}
                size="small"
                color={course.isRequired ? 'success' : 'warning'}
                sx={{ fontWeight: 600 }}
              />
            ),
          },
          {
            field: 'actions',
            headerName: 'Thao tác',
            width: 120,
            align: 'center',
            renderCell: (course) => (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={() => handleViewCourse(course)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Chỉnh sửa">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditCourse(course)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ]}
        rows={filteredCourses}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyState={
          <>
            <MenuBook
              sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy môn học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có môn học nào trong hệ thống'}
            </Typography>
          </>
        }
      />

      {/* Modals */}
      <CourseDetailModal
        open={detailModalOpen}
        onCancel={handleCloseModals}
        course={selectedCourse}
      />

      <CourseEditModal
        open={editModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveCourse}
        course={selectedCourse}
        loading={modalLoading}
      />

      <CourseCreateModal
        open={createModalOpen}
        onCancel={handleCloseModals}
        onSave={handleSaveCourse}
        loading={modalLoading}
      />
    </Box>
  );
};

export default CourseManagement;
