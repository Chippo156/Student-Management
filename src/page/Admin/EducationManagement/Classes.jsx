import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Fab,
} from '@mui/material';
import {
  Class as ClassIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Groups as GroupsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const Classes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample data
  const classes = [
    {
      id: '1',
      classCode: 'IT101',
      className: 'Lập trình cơ bản',
      department: 'Công nghệ thông tin',
      major: 'Kỹ thuật phần mềm',
      year: 1,
      semester: 'HK1 2024-2025',
      instructor: 'TS. Nguyễn Văn A',
      studentCount: 35,
      maxStudents: 40,
      schedule: 'Thứ 2, 4, 6 - 7:30-9:30',
      room: 'A101',
      status: 'active',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
    },
    {
      id: '2',
      classCode: 'BUS201',
      className: 'Quản trị học đại cương',
      department: 'Kinh tế',
      major: 'Quản trị kinh doanh',
      year: 2,
      semester: 'HK1 2024-2025',
      instructor: 'PGS. Trần Thị B',
      studentCount: 42,
      maxStudents: 45,
      schedule: 'Thứ 3, 5, 7 - 9:30-11:30',
      room: 'B203',
      status: 'active',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
    },
    {
      id: '3',
      classCode: 'ENG301',
      className: 'Tiếng Anh chuyên ngành',
      department: 'Ngoại ngữ',
      major: 'Tiếng Anh',
      year: 3,
      semester: 'HK1 2024-2025',
      instructor: 'ThS. Lê Văn C',
      studentCount: 28,
      maxStudents: 30,
      schedule: 'Thứ 2, 4 - 13:30-16:30',
      room: 'C105',
      status: 'active',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
    },
    {
      id: '4',
      classCode: 'MATH101',
      className: 'Toán cao cấp 1',
      department: 'Khoa học tự nhiên',
      major: 'Toán học',
      year: 1,
      semester: 'HK2 2023-2024',
      instructor: 'TS. Phạm Thị D',
      studentCount: 38,
      maxStudents: 40,
      schedule: 'Thứ 3, 6 - 7:30-10:30',
      room: 'D201',
      status: 'completed',
      startDate: '2024-02-01',
      endDate: '2024-05-30',
    },
  ];

  const departments = [
    'Công nghệ thông tin',
    'Kinh tế',
    'Ngoại ngữ',
    'Khoa học tự nhiên',
    'Kỹ thuật',
    'Y khoa',
  ];
  const years = [1, 2, 3, 4, 5];
  const statuses = [
    { value: 'active', label: 'Đang diễn ra' },
    { value: 'inactive', label: 'Tạm dừng' },
    { value: 'completed', label: 'Đã kết thúc' },
  ];

  const filteredClasses = classes.filter((classInfo) => {
    const matchesSearch =
      classInfo.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || classInfo.department === departmentFilter;
    const matchesStatus = !statusFilter || classInfo.status === statusFilter;
    const matchesYear = !yearFilter || classInfo.year.toString() === yearFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
  });

  const handleViewClass = (classInfo) => {
    setSelectedClass(classInfo);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getCapacityColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'error';
    if (ratio >= 0.7) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <ClassIcon />
          </Avatar>
          <Typography variant="h4" component="h1">
            Quản lý lớp học
          </Typography>
        </Box>
        <Fab color="primary" aria-label="add" size="medium">
          <AddIcon />
        </Fab>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm lớp học, mã lớp, giảng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Khoa</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Khoa"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Năm học</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Năm học"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    Năm {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
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
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
                setStatusFilter('');
                setYearFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Classes Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Lớp học</TableCell>
                <TableCell>Khoa/Ngành</TableCell>
                <TableCell>Giảng viên</TableCell>
                <TableCell>Sĩ số</TableCell>
                <TableCell>Lịch học</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClasses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((classInfo) => (
                  <TableRow key={classInfo.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {classInfo.className}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {classInfo.classCode} • {classInfo.semester}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {classInfo.department}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classInfo.major} - Năm {classInfo.year}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'secondary.main',
                          }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">
                          {classInfo.instructor}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <GroupsIcon color="action" />
                        <Chip
                          label={`${classInfo.studentCount}/${classInfo.maxStudents}`}
                          color={getCapacityColor(
                            classInfo.studentCount,
                            classInfo.maxStudents
                          )}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classInfo.schedule}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Phòng: {classInfo.room}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(classInfo.status)}
                        color={getStatusColor(classInfo.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewClass(classInfo)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredClasses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* View Class Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết lớp học: {selectedClass?.className}</DialogTitle>
        <DialogContent>
          {selectedClass && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin cơ bản
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Mã lớp"
                          secondary={selectedClass.classCode}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Tên lớp"
                          secondary={selectedClass.className}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Khoa/Ngành"
                          secondary={`${selectedClass.department} - ${selectedClass.major}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Học kỳ"
                          secondary={`${selectedClass.semester} - Năm ${selectedClass.year}`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin giảng dạy
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Giảng viên"
                          secondary={selectedClass.instructor}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Lịch học"
                          secondary={selectedClass.schedule}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Phòng học"
                          secondary={selectedClass.room}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Sĩ số"
                          secondary={`${selectedClass.studentCount}/${selectedClass.maxStudents} sinh viên`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thời gian
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Bắt đầu:</strong>{' '}
                          {new Date(selectedClass.startDate).toLocaleDateString(
                            'vi-VN'
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Kết thúc:</strong>{' '}
                          {new Date(selectedClass.endDate).toLocaleDateString(
                            'vi-VN'
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box mt={2}>
                      <Chip
                        label={getStatusLabel(selectedClass.status)}
                        color={getStatusColor(selectedClass.status)}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          <Button variant="outlined" startIcon={<ScheduleIcon />}>
            Xem lịch học
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classes;
