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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  FolderShared as FolderSharedIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  ContactMail as ContactMailIcon,
} from "@mui/icons-material";

// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Sample data
  const studentProfiles = [
    {
      id: "1",
      studentId: "SV2024001",
      fullName: "Nguyễn Văn An",
      email: "an.nguyen@student.university.edu.vn",
      phone: "0901234567",
      address: "Hà Nội",
      department: "Công nghệ thông tin",
      major: "Kỹ thuật phần mềm",
      year: 3,
      gpa: 3.2,
      status: "active",
      admissionDate: "2022-09-01",
      courses: ["Lập trình Java", "Cơ sở dữ liệu", "Mạng máy tính"],
      totalCredits: 95,
    },
    {
      id: "2",
      studentId: "SV2024002",
      fullName: "Trần Thị Bình",
      email: "binh.tran@student.university.edu.vn",
      phone: "0912345678",
      address: "TP.HCM",
      department: "Kinh tế",
      major: "Quản trị kinh doanh",
      year: 2,
      gpa: 3.7,
      status: "active",
      admissionDate: "2023-09-01",
      courses: ["Quản trị học", "Marketing", "Tài chính doanh nghiệp"],
      totalCredits: 65,
    },
    {
      id: "3",
      studentId: "SV2024003",
      fullName: "Lê Văn Cường",
      email: "cuong.le@student.university.edu.vn",
      phone: "0923456789",
      address: "Đà Nẵng",
      department: "Ngoại ngữ",
      major: "Tiếng Anh",
      year: 4,
      gpa: 3.9,
      status: "active",
      admissionDate: "2021-09-01",
      courses: ["Tiếng Anh chuyên ngành", "Dịch thuật", "Văn học Anh"],
      totalCredits: 120,
    },
    {
      id: "4",
      studentId: "SV2021001",
      fullName: "Phạm Thị Dung",
      email: "dung.pham@student.university.edu.vn",
      phone: "0934567890",
      address: "Cần Thơ",
      department: "Khoa học tự nhiên",
      major: "Toán học",
      year: 4,
      gpa: 3.5,
      status: "graduated",
      admissionDate: "2020-09-01",
      courses: ["Giải tích", "Đại số", "Thống kê"],
      totalCredits: 130,
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

  const filteredProfiles = studentProfiles.filter((profile) => {
    const matchesSearch =
      profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || profile.department === departmentFilter;
    const matchesStatus = !statusFilter || profile.status === statusFilter;
    const matchesYear = !yearFilter || profile.year.toString() === yearFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
  });

  const handleViewProfile = (profile) => {
    setSelectedStudent(profile);
    setViewDialogOpen(true);
    setTabValue(0);
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
          <FolderSharedIcon />
        </Avatar>
        <Typography variant="h4">Hồ sơ sinh viên</Typography>
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

      {/* Student Profiles Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Khoa/Ngành</TableCell>
                <TableCell>Năm học</TableCell>
                <TableCell>GPA</TableCell>
                <TableCell>Tín chỉ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProfiles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((profile) => (
                  <TableRow key={profile.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold">
                            {profile.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {profile.studentId} • {profile.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {profile.department}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {profile.major}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Năm ${profile.year}`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={profile.gpa.toFixed(1)}
                        color={getGPAColor(profile.gpa)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>{profile.totalCredits} tín chỉ</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(profile.status)}
                        color={getStatusColor(profile.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewProfile(profile)}
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
          count={filteredProfiles.length}
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

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Hồ sơ sinh viên: {selectedStudent?.fullName}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                >
                  <Tab label="Thông tin cơ bản" icon={<PersonIcon />} />
                  <Tab label="Học tập" icon={<SchoolIcon />} />
                  <Tab label="Điểm số" icon={<GradeIcon />} />
                  <Tab label="Liên hệ" icon={<ContactMailIcon />} />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thông tin cá nhân
                        </Typography>
                        <Typography>
                          <strong>Mã sinh viên:</strong>{" "}
                          {selectedStudent.studentId}
                        </Typography>
                        <Typography>
                          <strong>Họ tên:</strong> {selectedStudent.fullName}
                        </Typography>
                        <Typography>
                          <strong>Email:</strong> {selectedStudent.email}
                        </Typography>
                        <Typography>
                          <strong>Số điện thoại:</strong>{" "}
                          {selectedStudent.phone}
                        </Typography>
                        <Typography>
                          <strong>Địa chỉ:</strong> {selectedStudent.address}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thông tin học tập
                        </Typography>
                        <Typography>
                          <strong>Khoa:</strong> {selectedStudent.department}
                        </Typography>
                        <Typography>
                          <strong>Ngành:</strong> {selectedStudent.major}
                        </Typography>
                        <Typography>
                          <strong>Năm học:</strong> Năm {selectedStudent.year}
                        </Typography>
                        <Typography>
                          <strong>Ngày nhập học:</strong>{" "}
                          {new Date(
                            selectedStudent.admissionDate
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                        <Typography>
                          <strong>Trạng thái:</strong>{" "}
                          {getStatusLabel(selectedStudent.status)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Môn học đang theo học
                    </Typography>
                    <List>
                      {selectedStudent.courses.map((course, i) => (
                        <React.Fragment key={i}>
                          <ListItem>
                            <ListItemText
                              primary={course}
                              secondary={`Học kỳ ${
                                Math.floor(Math.random() * 2) + 1
                              } - Năm ${selectedStudent.year}`}
                            />
                          </ListItem>
                          {i < selectedStudent.courses.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thống kê điểm
                    </Typography>
                    <Typography>
                      <strong>GPA:</strong>{" "}
                      <Chip
                        label={selectedStudent.gpa.toFixed(1)}
                        color={getGPAColor(selectedStudent.gpa)}
                        size="small"
                      />
                    </Typography>
                    <Typography>
                      <strong>Tổng tín chỉ:</strong>{" "}
                      {selectedStudent.totalCredits}
                    </Typography>
                    <Typography>
                      <strong>Xếp loại:</strong>{" "}
                      {selectedStudent.gpa >= 3.5
                        ? "Giỏi"
                        : selectedStudent.gpa >= 2.5
                        ? "Khá"
                        : "Trung bình"}
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin liên hệ
                    </Typography>
                    <Typography>
                      <strong>Email cá nhân:</strong> {selectedStudent.email}
                    </Typography>
                    <Typography>
                      <strong>Số điện thoại:</strong> {selectedStudent.phone}
                    </Typography>
                    <Typography>
                      <strong>Địa chỉ:</strong> {selectedStudent.address}
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>
            </Box>
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

export default StudentProfiles;
