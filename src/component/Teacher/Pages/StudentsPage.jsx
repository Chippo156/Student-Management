import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  People,
  School,
  CheckCircle,
  Search as SearchIcon,
  FileDownload,
  FilterList,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import sectionService from '../../../service/sectionService';
import { studentServices } from '../../../service/studentServices';
import { exportSectionStudentsExcel } from '../../../until/exportSectionStudentsExcel';
import DataTable from '../../Common/DataTable';
import SearchableAutocomplete from '../../Common/SearchableAutocomplete';
const StudentsPage = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      textPrimary: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
      bgWhite: theme.palette.background.paper,
      bgLightBlue: alpha(theme.palette.primary.main, 0.1),
      bgLightPurple: alpha(theme.palette.secondary.main, 0.1),
      bgLightGreen: alpha(theme.palette.success.main, 0.1),
      iconBlue: theme.palette.primary.main,
      iconPurple: theme.palette.secondary.main,
      iconGreen: theme.palette.success.main,
      hoverBgBlue: alpha(theme.palette.primary.main, 0.04),
    }),
    [theme]
  );

  useEffect(() => {
    const fetchSections = async () => {
      try {
        // Fetch sections for lecturer
        const sectionsResponse = await sectionService.getSectionsByLecturer({
          pageNumber: 1,
          pageSize: 100, // Get all sections
        });
        const sectionsData = sectionsResponse?.items || [];
        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    if (lecturerId) {
      fetchSections();
    }
  }, [lecturerId]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        if (selectedSection === 'all') {
          // Fetch students from all sections
          const allStudents = [];
          for (const section of sections) {
            try {
              const studentsResponse =
                await studentServices.getStudentsWithSection(
                  section.sectionId,
                  1,
                  100, // Get all students from this section
                  searchText
                );
              const studentsData = studentsResponse?.items || [];
              studentsData.forEach((student) => {
                allStudents.push({
                  ...student,
                  sectionId: section.sectionId,
                  sectionCode: section.sectionCode,
                  courseName: section.courseName,
                  courseCode: section.courseCode,
                });
              });
            } catch (error) {
              console.error(
                `Error fetching students for section ${section.sectionId}:`,
                error
              );
            }
          }
          setStudents(allStudents);
          setPagination((prev) => ({ ...prev, total: allStudents.length }));
        } else {
          // Fetch students for selected section
          const studentsResponse = await studentServices.getStudentsWithSection(
            selectedSection,
            pagination.current,
            pagination.pageSize,
            searchText
          );
          const studentsData = studentsResponse?.items || [];
          const selectedSectionData = sections.find(
            (s) => s.sectionId === selectedSection
          );

          const enrichedStudents = studentsData.map((student) => ({
            ...student,
            sectionId: selectedSection,
            sectionCode: selectedSectionData?.sectionCode,
            courseName: selectedSectionData?.courseName,
            courseCode: selectedSectionData?.courseCode,
          }));

          setStudents(enrichedStudents);
          setPagination((prev) => ({
            ...prev,
            total: studentsResponse?.totalCount || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sections.length > 0) {
      fetchStudents();
    }
  }, [
    selectedSection,
    sections,
    searchText,
    pagination.current,
    pagination.pageSize,
  ]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleExportExcel = async () => {
    if (students.length === 0) {
      return;
    }

    // Get section info
    const section = sections.find((s) => s.sectionId === selectedSection);

    // Prepare section data
    const sectionData = {
      sectionCode: section?.sectionCode || section?.displayName || '',
      courseName: section?.courseName || '',
      courseCode: section?.courseCode || '',
      semesterName: section?.semesterName || '',
    };

    // Export using utility
    const result = await exportSectionStudentsExcel(
      sectionData,
      students,
      'Lý thuyết'
    );

    if (!result.success) {
      console.error('Export failed:', result.error);
    }
  };

  const handleRefresh = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    // Trigger refetch by updating dependencies
  };

  // Calculate statistics
  const totalStudents = students.length;
  const uniqueStudents = new Set(students.map((s) => s.studentId)).size;
  const activeSections = sections.filter((s) => s.status === 1).length;

  // DataTable columns
  const columns = [
    {
      field: 'mssv',
      headerName: 'MSSV',
      width: 120,
      align: 'center',
      renderCell: (row) => <span style={{ fontWeight: 600 }}>{row.mssv}</span>,
    },
    {
      field: 'fullName',
      headerName: 'Họ và tên',
      width: 200,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {row.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          <span>{row.fullName}</span>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
    },
    {
      field: 'className',
      headerName: 'Lớp',
      width: 120,
    },
    {
      field: 'course',
      headerName: 'Môn học',
      width: 250,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.courseName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Chip label={row.courseCode} size="small" color="primary" />
            <Chip label={row.sectionCode} size="small" color="success" />
          </Box>
        </Box>
      ),
    },
    {
      field: 'practiceGroupName',
      headerName: 'Nhóm thực hành',
      width: 150,
    },
    {
      field: 'enrollmentStatus',
      headerName: 'Trạng thái ĐK',
      width: 120,
      align: 'center',
      renderCell: (row) => {
        const isRegistered = row.enrollmentStatus === 'Đã đăng ký';
        return (
          <Chip
            label={row.enrollmentStatus}
            size="small"
            color={isRegistered ? 'success' : 'default'}
          />
        );
      },
    },
    {
      field: 'action',
      headerName: 'Thao tác',
      width: 150,
      align: 'center',
      renderCell: (row) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={() => handleViewDetails(row)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Fade in={true} timeout={600}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: colors.primary }}
          >
            Quản lý Sinh viên
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: colors.bgWhite,
                  '&:hover': { bgcolor: colors.hoverBgBlue },
                  boxShadow: 1,
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              disabled={students.length === 0}
              sx={{
                bgcolor: colors.success,
                '&:hover': { bgcolor: colors.iconGreen },
                textTransform: 'none',
                px: 3,
                boxShadow: 2,
              }}
            >
              Xuất Excel
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Grid container className="equal-height-cards" spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                bgcolor: colors.bgLightBlue,
                boxShadow: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
              }}
            >
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', py: 3 }}
              >
                <People sx={{ fontSize: 50, mr: 2, color: colors.iconBlue }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: colors.iconBlue }}
                  >
                    {uniqueStudents}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary }}
                  >
                    Tổng sinh viên
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                bgcolor: colors.bgLightPurple,
                boxShadow: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
              }}
            >
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', py: 3 }}
              >
                <School
                  sx={{ fontSize: 50, mr: 2, color: colors.iconPurple }}
                />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      mb: 0.5,
                      color: colors.iconPurple,
                    }}
                  >
                    {totalStudents}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary }}
                  >
                    Lượt đăng ký
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                bgcolor: colors.bgLightGreen,
                boxShadow: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
              }}
            >
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', py: 3 }}
              >
                <CheckCircle
                  sx={{ fontSize: 50, mr: 2, color: colors.iconGreen }}
                />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      mb: 0.5,
                      color: colors.iconGreen,
                    }}
                  >
                    {activeSections}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary }}
                  >
                    Lớp đang dạy
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1, color: colors.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Bộ lọc tìm kiếm
              </Typography>
            </Box>
            <Grid container className="equal-height-cards" spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo MSSV, tên, email..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
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
              <Grid item xs={12} md={4}>
                <SearchableAutocomplete
                  options={[
                    { sectionId: 'all', courseName: 'Tất cả lớp học phần', sectionCode: '' },
                    ...sections,
                  ]}
                  value={
                    selectedSection === 'all'
                      ? { sectionId: 'all', courseName: 'Tất cả lớp học phần', sectionCode: '' }
                      : sections.find((s) => s.sectionId === selectedSection) || null
                  }
                  onChange={(newValue) => {
                    setSelectedSection(newValue?.sectionId || 'all');
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  getOptionLabel={(option) =>
                    option.sectionId === 'all'
                      ? option.courseName
                      : `${option.courseName} (${option.sectionCode})`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.sectionId === value?.sectionId
                  }
                  label="Lớp học phần"
                  placeholder="Chọn lớp học phần"
                  size="small"
                  showSearchIcon={false}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchText('');
                    setSelectedSection('all');
                  }}
                  sx={{ height: '40px' }}
                >
                  Đặt lại
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tìm thấy: <strong>{students.length}</strong> sinh viên
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Students Table */}
      <Fade in={true} timeout={1200}>
        <Box>
          {loading ? (
            <Card sx={{ p: 6, textAlign: 'center' }}>
              <Typography>Đang tải dữ liệu...</Typography>
            </Card>
          ) : (
            <DataTable
              columns={columns}
              rows={students}
              page={pagination.current - 1}
              rowsPerPage={pagination.pageSize}
              totalCount={pagination.total}
              onPageChange={(_, newPage) => {
                setPagination((prev) => ({
                  ...prev,
                  current: newPage + 1,
                }));
              }}
              onRowsPerPageChange={(e) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: parseInt(e.target.value, 10),
                  current: 1,
                }));
              }}
              emptyState={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Không tìm thấy sinh viên
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vui lòng thử lại với bộ lọc khác
                  </Typography>
                </Box>
              }
            />
          )}
        </Box>
      </Fade>

      {/* Student Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Thông tin chi tiết sinh viên
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Grid container className="equal-height-cards" spacing={3}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}>
                  {selectedStudent.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {selectedStudent.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  MSSV: {selectedStudent.mssv}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.phone || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Lớp:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.className}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Môn học:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.courseName} ({selectedStudent.courseCode})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Lớp học phần:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.sectionCode}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nhóm thực hành:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.practiceGroupName || 'Chưa có nhóm'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái đăng ký:
                </Typography>
                <Chip
                  label={selectedStudent.enrollmentStatus}
                  color={
                    selectedStudent.enrollmentStatus === 'Đã đăng ký'
                      ? 'success'
                      : 'default'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Điểm cuối kỳ:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedStudent.finalScore || 'Chưa có'}{' '}
                  {selectedStudent.gradeLetter &&
                    `(${selectedStudent.gradeLetter})`}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsPage;
