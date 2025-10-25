import React, { useState } from "react";
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
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  AccountBox as AccountBoxIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

const StudentInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample data
  const studentInfos = [
    {
      id: "1",
      studentId: "SV2024001",
      fullName: "Nguyễn Văn An",
      email: "an.nguyen@student.university.edu.vn",
      phone: "0901234567",
      address: "Số 123, Đường ABC, Quận 1, TP.HCM",
      birthDate: "2003-05-15",
      gender: "Nam",
      idCard: "123456789012",
      department: "Công nghệ thông tin",
      major: "Kỹ thuật phần mềm",
      year: 3,
      class: "SE2022.1",
      advisor: "TS. Trần Văn Minh",
      status: "active",
      admissionDate: "2022-09-01",
      emergencyContact: {
        name: "Nguyễn Thị Lan",
        relationship: "Mẹ",
        phone: "0987654321",
      },
      academicInfo: {
        gpa: 3.2,
        totalCredits: 95,
        completedCourses: 25,
        currentSemester: "HK1 2024-2025",
      },
    },
    {
      id: "2",
      studentId: "SV2024002",
      fullName: "Trần Thị Bình",
      email: "binh.tran@student.university.edu.vn",
      phone: "0912345678",
      address: "Số 456, Đường XYZ, Quận 2, TP.HCM",
      birthDate: "2004-03-20",
      gender: "Nữ",
      idCard: "234567890123",
      department: "Kinh tế",
      major: "Quản trị kinh doanh",
      year: 2,
      class: "BA2023.1",
      advisor: "PGS. Lê Thị Hoa",
      status: "active",
      admissionDate: "2023-09-01",
      emergencyContact: {
        name: "Trần Văn Cường",
        relationship: "Bố",
        phone: "0976543210",
      },
      academicInfo: {
        gpa: 3.7,
        totalCredits: 65,
        completedCourses: 18,
        currentSemester: "HK1 2024-2025",
      },
    },
    {
      id: "3",
      studentId: "SV2024003",
      fullName: "Lê Văn Cường",
      email: "cuong.le@student.university.edu.vn",
      phone: "0923456789",
      address: "Số 789, Đường DEF, Quận 3, TP.HCM",
      birthDate: "2002-12-10",
      gender: "Nam",
      idCard: "345678901234",
      department: "Ngoại ngữ",
      major: "Tiếng Anh",
      year: 4,
      class: "EN2021.1",
      advisor: "ThS. Phạm Văn Đức",
      status: "active",
      admissionDate: "2021-09-01",
      emergencyContact: {
        name: "Lê Thị Mai",
        relationship: "Mẹ",
        phone: "0965432109",
      },
      academicInfo: {
        gpa: 3.9,
        totalCredits: 120,
        completedCourses: 35,
        currentSemester: "HK1 2024-2025",
      },
    },
  ];

  const departments = [
    "Công nghệ thông tin",
    "Kinh tế",
    "Ngoại ngữ",
    "Khoa học tự nhiên",
    "Kỹ thuật",
    "Y khoa",
  ];
  const years = [1, 2, 3, 4, 5];
  const statuses = [
    { value: "active", label: "Đang học" },
    { value: "inactive", label: "Tạm nghỉ" },
    { value: "graduated", label: "Đã tốt nghiệp" },
  ];

  const filteredInfos = studentInfos.filter((info) => {
    const matchesSearch =
      info.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || info.department === departmentFilter;
    const matchesStatus = !statusFilter || info.status === statusFilter;
    const matchesYear = !yearFilter || info.year.toString() === yearFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
  });

  const handleViewInfo = (info) => {
    setSelectedStudent(info);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "graduated":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return "success";
    if (gpa >= 2.5) return "warning";
    return "error";
  };

  return (
    <Box sx={{ p: 3, maxWidth: "100%", overflow: "hidden" }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <AccountBoxIcon />
        </Avatar>
        <Typography variant="h4" component="h1">
          Thông tin cá nhân sinh viên
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, mã SV, email..."
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
                setSearchTerm("");
                setDepartmentFilter("");
                setStatusFilter("");
                setYearFilter("");
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Student Info Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Khoa/Ngành</TableCell>
                <TableCell>Lớp</TableCell>
                <TableCell>GVHD</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInfos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((info) => (
                  <TableRow key={info.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {info.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {info.studentId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {info.department}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {info.major}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{info.class}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Năm {info.year}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{info.advisor}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{info.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {info.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(info.status)}
                        color={getStatusColor(info.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewInfo(info)}
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
          count={filteredInfos.length}
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

      {/* View Student Info Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Thông tin chi tiết: {selectedStudent?.fullName}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Thông tin cá nhân */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin cá nhân
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Họ và tên"
                          secondary={selectedStudent.fullName}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <CalendarTodayIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ngày sinh"
                          secondary={
                            selectedStudent.birthDate
                              ? new Date(
                                  selectedStudent.birthDate
                                ).toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"
                          }
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="CMND/CCCD"
                          secondary={selectedStudent.idCard || "Chưa cập nhật"}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Địa chỉ"
                          secondary={selectedStudent.address || "Chưa cập nhật"}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Thông tin liên hệ */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin liên hệ
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={selectedStudent.email}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Số điện thoại"
                          secondary={selectedStudent.phone || "Chưa cập nhật"}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Liên hệ khẩn cấp"
                          secondary={
                            selectedStudent.emergencyContact
                              ? `${selectedStudent.emergencyContact.name} (${selectedStudent.emergencyContact.relationship}) - ${selectedStudent.emergencyContact.phone}`
                              : "Chưa cập nhật"
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Thông tin học tập */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin học tập
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Mã sinh viên"
                          secondary={selectedStudent.studentId}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Khoa/Ngành"
                          secondary={`${selectedStudent.department} - ${selectedStudent.major}`}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Lớp/Khóa"
                          secondary={`${selectedStudent.class} - Năm ${selectedStudent.year}`}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Giảng viên hướng dẫn"
                          secondary={selectedStudent.advisor}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Thông tin học tập chi tiết */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Kết quả học tập
                    </Typography>
                    {selectedStudent.academicInfo && (
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="GPA"
                            secondary={
                              <Chip
                                label={selectedStudent.academicInfo.gpa.toFixed(
                                  2
                                )}
                                color={
                                  getGPAColor(
                                    selectedStudent.academicInfo.gpa
                                  )
                                }
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Tổng tín chỉ tích lũy"
                            secondary={`${selectedStudent.academicInfo.totalCredits} tín chỉ`}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Số môn đã hoàn thành"
                            secondary={`${selectedStudent.academicInfo.completedCourses} môn học`}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Học kỳ hiện tại"
                            secondary={
                              selectedStudent.academicInfo.currentSemester
                            }
                          />
                        </ListItem>
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentInfo;
