import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Sample data
const sampleCourses = [
  {
    id: 1,
    courseCode: 'CS101',
    courseName: 'Lập trình cơ bản',
    credits: 3,
    department: 'CNTT',
    teacher: 'TS. Nguyễn Văn A',
    students: 45,
    status: 'active',
    semester: 'HK1 2023-2024',
    description: 'Môn học cơ bản về lập trình',
  },
  {
    id: 2,
    courseCode: 'CS102',
    courseName: 'Cấu trúc dữ liệu và giải thuật',
    credits: 4,
    department: 'CNTT',
    teacher: 'PGS. Trần Thị B',
    students: 38,
    status: 'active',
    semester: 'HK1 2023-2024',
    description: 'Học về cấu trúc dữ liệu và các giải thuật cơ bản',
  },
  {
    id: 3,
    courseCode: 'ENG201',
    courseName: 'Tiếng Anh chuyên ngành IT',
    credits: 2,
    department: 'Ngoại ngữ',
    teacher: 'ThS. Lê Văn C',
    students: 52,
    status: 'active',
    semester: 'HK1 2023-2024',
    description: 'Tiếng Anh chuyên ngành công nghệ thông tin',
  },
  {
    id: 4,
    courseCode: 'CS203',
    courseName: 'Cơ sở dữ liệu',
    credits: 3,
    department: 'CNTT',
    teacher: 'TS. Phạm Văn D',
    students: 0,
    status: 'draft',
    semester: 'HK2 2023-2024',
    description: 'Thiết kế và quản lý cơ sở dữ liệu',
  },
  {
    id: 5,
    courseCode: 'MATH101',
    courseName: 'Toán cao cấp A1',
    credits: 4,
    department: 'Toán học',
    teacher: 'PGS. Võ Thị E',
    students: 68,
    status: 'inactive',
    semester: 'HK1 2023-2024',
    description: 'Môn toán cao cấp cơ bản',
  },
];

const CourseManagement = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState(sampleCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] =
    (useState < 'create') | ('edit' > 'create');

  const colors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      background: theme.palette.background.default,
      paper: theme.palette.background.paper,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
    }),
    [theme]
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        filterDepartment === 'all' || course.department === filterDepartment;
      const matchesStatus =
        filterStatus === 'all' || course.status === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [courses, searchTerm, filterDepartment, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'inactive':
        return colors.error;
      case 'draft':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Ngừng hoạt động';
      case 'draft':
        return 'Bản nháp';
      default:
        return status;
    }
  };

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleEdit = () => {
    setDialogMode('edit');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedCourse) {
      setCourses(courses.filter((course) => course.id !== selectedCourse.id));
    }
    handleMenuClose();
  };

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedCourse(null);
    setOpenDialog(true);
  };

  const departments = ['CNTT', 'Kinh tế', 'Ngoại ngữ', 'Toán học', 'Vật lý'];

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: colors.text, mb: 1 }}
        >
          Quản lý môn học
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin môn học, giảng viên phụ trách và sinh viên đăng ký.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tổng môn học
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {courses.length}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                  }}
                >
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.success, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {courses.filter((c) => c.status === 'active').length}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                  }}
                >
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.info, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tổng sinh viên
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {courses.reduce((sum, course) => sum + course.students, 0)}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.info, 0.1),
                    color: colors.info,
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.paper} 0%, ${alpha(colors.warning, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Khoa/Phòng ban
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {departments.length}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: alpha(colors.warning, 0.1),
                    color: colors.warning,
                  }}
                >
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên môn học, mã môn, giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={filterDepartment}
                  label="Khoa"
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  borderRadius: 2,
                  height: 56,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Thêm môn học
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(colors.primary, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Mã môn học</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên môn học</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Giảng viên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tín chỉ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow
                  key={course.id}
                  sx={{
                    '&:hover': { backgroundColor: alpha(colors.primary, 0.02) },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.primary }}
                    >
                      {course.courseCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.courseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.semester}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.department}
                      size="small"
                      sx={{
                        backgroundColor: alpha(colors.info, 0.1),
                        color: colors.info,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{course.teacher}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.credits}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.students}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(course.status)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(
                          getStatusColor(course.status),
                          0.1
                        ),
                        color: getStatusColor(course.status),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Thêm tùy chọn">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, course)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: colors.error }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Xóa
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Thêm môn học mới' : 'Chỉnh sửa môn học'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã môn học"
                defaultValue={selectedCourse?.courseCode || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên môn học"
                defaultValue={selectedCourse?.courseName || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  defaultValue={selectedCourse?.department || ''}
                  label="Khoa"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số tín chỉ"
                type="number"
                defaultValue={selectedCourse?.credits || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giảng viên phụ trách"
                defaultValue={selectedCourse?.teacher || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  defaultValue={selectedCourse?.status || 'draft'}
                  label="Trạng thái"
                >
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                defaultValue={selectedCourse?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            {dialogMode === 'create' ? 'Thêm mới' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;
