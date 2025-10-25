import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DbExplorer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - thay thế bằng API calls thực tế
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    // Mock data initialization
    const mockStudents = [
      {
        student_id: "SV001",
        full_name: "Nguyễn Văn A",
        email: "a.nguyen@email.com",
        phone: "0901234567",
        date_of_birth: new Date("2002-01-15"),
        gender: "Male",
        address: "123 Đường ABC, TP.HCM",
        enrollment_date: new Date("2021-09-01"),
        student_status: "Active",
        academic_year: "2021-2025",
        major_id: "CNTT",
        gpa: 3.45,
        total_credits: 85,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const mockCourses = [
      {
        course_id: "CS101",
        course_name: "Lập trình căn bản",
        credits: 3,
        description: "Môn học cơ bản về lập trình",
        semester: "1",
        academic_year: "2024-2025",
        instructor_id: "GV001",
        department_id: "CNTT",
        max_enrollment: 50,
        current_enrollment: 35,
        course_status: "Active",
        schedule: "Thứ 2, 4, 6 - 7:30-9:30",
        room: "A101",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    setStudents(mockStudents);
    setCourses(mockCourses);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (item) => {
    setSelectedItem(item || null);
    setEditMode(!!item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setEditMode(false);
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log("Save item:", selectedItem);
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    // TODO: Implement delete logic
    console.log("Delete item:", id);
  };

  const StudentTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>MSSV</TableCell>
            <TableCell>Họ tên</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>GPA</TableCell>
            <TableCell>Tín chỉ</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students
            .filter(
              (student) =>
                student.full_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                student.student_id
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )
            .map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.full_name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Chip
                    label={student.student_status}
                    color={
                      student.student_status === "Active"
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{student.gpa?.toFixed(2)}</TableCell>
                <TableCell>{student.total_credits}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(student)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(student.student_id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const CourseTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã môn</TableCell>
            <TableCell>Tên môn học</TableCell>
            <TableCell>Tín chỉ</TableCell>
            <TableCell>Học kỳ</TableCell>
            <TableCell>Phòng</TableCell>
            <TableCell>Sĩ số</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses
            .filter(
              (course) =>
                course.course_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                course.course_id
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )
            .map((course) => (
              <TableRow key={course.course_id}>
                <TableCell>{course.course_id}</TableCell>
                <TableCell>{course.course_name}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>{course.room}</TableCell>
                <TableCell>
                  {course.current_enrollment}/{course.max_enrollment}
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.course_status}
                    color={
                      course.course_status === "Active" ? "success" : "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(course)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(course.course_id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Database Explorer
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Công cụ quản lý cơ sở dữ liệu cho hệ thống quản lý sinh viên
      </Alert>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Tìm kiếm"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm mới
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Làm mới
          </Button>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Sinh viên" />
          <Tab label="Môn học" />
          <Tab label="Điểm số" />
          <Tab label="Đăng ký học phần" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <StudentTable />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CourseTable />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography>Bảng điểm số - Đang phát triển</Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography>Đăng ký học phần - Đang phát triển</Typography>
      </TabPanel>

      {/* Edit/Add Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Chỉnh sửa" : "Thêm mới"}{" "}
          {activeTab === 0
            ? "sinh viên"
            : activeTab === 1
            ? "môn học"
            : activeTab === 2
            ? "điểm số"
            : "đăng ký"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="MSSV" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Họ tên" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" type="email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Địa chỉ" multiline rows={2} />
                </Grid>
              </Grid>
            )}
            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mã môn học" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Tên môn học" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số tín chỉ" type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phòng học" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Mô tả" multiline rows={3} />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DbExplorer;
