import React, { useState } from "react";
import { message } from "antd";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Trophy as TrophyIcon,
} from "@mui/icons-material";
import { PageHeader, StatsCard, DataTable, FilterSection } from "../../../component/Common";

function GradeManagement() {
  const theme = useTheme();
  const [grades, setGrades] = useState([
    {
      id: "1",
      studentId: "1",
      studentCode: "SV001",
      studentName: "Nguyễn Văn An",
      courseId: "1",
      courseCode: "IT101",
      courseName: "Lập trình cơ bản",
      credits: 3,
      midtermScore: 8.5,
      finalScore: 7.8,
      assignmentScore: 9.0,
      totalScore: 8.3,
      letterGrade: "B+",
      gpa: 3.3,
      semester: "HK1",
      year: 2025,
      status: "passed",
    },
    {
      id: "2",
      studentId: "2",
      studentCode: "SV002",
      studentName: "Trần Thị Bình",
      courseId: "1",
      courseCode: "IT101",
      courseName: "Lập trình cơ bản",
      credits: 3,
      midtermScore: 9.2,
      finalScore: 8.8,
      assignmentScore: 9.5,
      totalScore: 9.1,
      letterGrade: "A",
      gpa: 4.0,
      semester: "HK1",
      year: 2025,
      status: "passed",
    },
    {
      id: "3",
      studentId: "1",
      studentCode: "SV001",
      studentName: "Nguyễn Văn An",
      courseId: "2",
      courseCode: "IT201",
      courseName: "Cấu trúc dữ liệu và giải thuật",
      credits: 4,
      midtermScore: 7.0,
      finalScore: 6.5,
      assignmentScore: 7.5,
      totalScore: 6.9,
      letterGrade: "C+",
      gpa: 2.3,
      semester: "HK1",
      year: 2025,
      status: "passed",
    },
    {
      id: "4",
      studentId: "3",
      studentCode: "SV003",
      studentName: "Lê Minh Cường",
      courseId: "3",
      courseCode: "EC101",
      courseName: "Kinh tế vi mô",
      credits: 3,
      midtermScore: 5.5,
      finalScore: 4.8,
      assignmentScore: 6.0,
      totalScore: 5.3,
      letterGrade: "D",
      gpa: 1.0,
      semester: "HK2",
      year: 2024,
      status: "failed",
    },
    {
      id: "5",
      studentId: "4",
      studentCode: "SV004",
      studentName: "Phạm Thu Dung",
      courseId: "4",
      courseCode: "EN101",
      courseName: "Tiếng Anh giao tiếp",
      credits: 2,
      midtermScore: 9.5,
      finalScore: 9.2,
      assignmentScore: 9.8,
      totalScore: 9.4,
      letterGrade: "A+",
      gpa: 4.0,
      semester: "HK1",
      year: 2025,
      status: "passed",
    },
    {
      id: "6",
      studentId: "5",
      studentCode: "SV005",
      studentName: "Hoàng Văn Em",
      courseId: "5",
      courseCode: "MA201",
      courseName: "Giải tích 2",
      credits: 4,
      midtermScore: 0,
      finalScore: 0,
      assignmentScore: 0,
      totalScore: 0,
      letterGrade: "F",
      gpa: 0,
      semester: "HK2",
      year: 2025,
      status: "pending",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({});

  const calculateTotalScore = (midterm, final, assignment) => {
    return Math.round((midterm * 0.3 + final * 0.5 + assignment * 0.2) * 10) / 10;
  };

  const getLetterGrade = (score) => {
    if (score >= 9.0) return "A+";
    if (score >= 8.5) return "A";
    if (score >= 8.0) return "B+";
    if (score >= 7.0) return "B";
    if (score >= 6.5) return "C+";
    if (score >= 5.5) return "C";
    if (score >= 5.0) return "D+";
    if (score >= 4.0) return "D";
    return "F";
  };

  const getGPA = (letterGrade) => {
    const gradePoints = {
      "A+": 4.0,
      "A": 4.0,
      "B+": 3.5,
      "B": 3.0,
      "C+": 2.5,
      "C": 2.0,
      "D+": 1.5,
      "D": 1.0,
      "F": 0.0,
    };
    return gradePoints[letterGrade] || 0.0;
  };

  const handleAdd = () => {
    setEditingGrade(null);
    setFormData({
      midtermScore: 0,
      finalScore: 0,
      assignmentScore: 0,
      year: new Date().getFullYear(),
    });
    setIsModalVisible(true);
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData(grade);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setGrades(grades.filter((grade) => grade.id !== id));
    message.success("Xóa điểm số thành công!");
  };

  const handleSave = () => {
    const totalScore = calculateTotalScore(
      formData.midtermScore || 0,
      formData.finalScore || 0,
      formData.assignmentScore || 0
    );
    const letterGrade = getLetterGrade(totalScore);
    const gpa = getGPA(letterGrade);

    const newGrade = {
      id: editingGrade ? editingGrade.id : Date.now().toString(),
      ...formData,
      totalScore,
      letterGrade,
      gpa,
      status: totalScore >= 5.0 ? "passed" : totalScore > 0 ? "failed" : "pending",
    };

    if (editingGrade) {
      setGrades(grades.map((grade) => (grade.id === editingGrade.id ? newGrade : grade)));
      message.success("Cập nhật điểm số thành công!");
    } else {
      setGrades([...grades, newGrade]);
      message.success("Thêm điểm số thành công!");
    }

    setIsModalVisible(false);
    setFormData({});
    setEditingGrade(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({});
    setEditingGrade(null);
  };

  const getGradeColor = (letterGrade) => {
    if (letterGrade === "A+" || letterGrade === "A") return theme.palette.success.main;
    if (letterGrade === "B+" || letterGrade === "B") return theme.palette.primary.main;
    if (letterGrade === "C+" || letterGrade === "C") return theme.palette.warning.main;
    if (letterGrade === "D+" || letterGrade === "D") return theme.palette.info.main;
    return theme.palette.error.main;
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      passed: { label: "Đậu", color: "success" },
      failed: { label: "Rớt", color: "error" },
      pending: { label: "Chưa cập nhật điểm", color: "warning" },
    };
    const config = statusConfig[status] || { label: status, color: "default" };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const filteredGrades = grades.filter(
    (grade) =>
      grade.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.courseCode.toLowerCase().includes(searchText.toLowerCase())
  );

  // Statistics
  const totalGrades = grades.length;
  const passedGrades = grades.filter((g) => g.status === "passed").length;
  const failedGrades = grades.filter((g) => g.status === "failed").length;
  const averageGPA =
    grades.length > 0
      ? Math.round((grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length) * 100) / 100
      : 0;

  const columns = [
    {
      field: "studentCode",
      headerName: "Mã SV",
      width: 100,
    },
    {
      field: "studentName",
      headerName: "Tên sinh viên",
      width: 150,
    },
    {
      field: "courseCode",
      headerName: "Mã MH",
      width: 100,
    },
    {
      field: "courseName",
      headerName: "Tên môn học",
      width: 180,
    },
    {
      field: "credits",
      headerName: "Tín chỉ",
      width: 80,
      align: "center",
      renderCell: (grade) => (grade.credits > 0 ? grade.credits.toFixed(1) : "-"),
    },
    {
      field: "midtermScore",
      headerName: "Điểm GK",
      width: 90,
      align: "center",
      renderCell: (grade) => (grade.midtermScore > 0 ? grade.midtermScore.toFixed(1) : "-"),
    },
    {
      field: "finalScore",
      headerName: "Điểm CK",
      width: 90,
      align: "center",
      renderCell: (grade) => (grade.finalScore > 0 ? grade.finalScore.toFixed(1) : "-"),
    },
    {
      field: "assignmentScore",
      headerName: "Điểm BT",
      width: 90,
      align: "center",
      renderCell: (grade) => (grade.assignmentScore > 0 ? grade.assignmentScore.toFixed(1) : "-"),
    },
    {
      field: "totalScore",
      headerName: "Điểm TB",
      width: 90,
      align: "center",
      renderCell: (grade) => (
        <Typography
          sx={{
            fontWeight: "bold",
            color: grade.totalScore >= 5.0 ? theme.palette.success.main : theme.palette.error.main,
          }}
        >
          {grade.totalScore > 0 ? grade.totalScore.toFixed(1) : "-"}
        </Typography>
      ),
    },
    {
      field: "letterGrade",
      headerName: "Điểm chữ",
      width: 90,
      align: "center",
      renderCell: (grade) => (
        <Chip
          label={grade.letterGrade}
          sx={{ fontWeight: "bold", bgcolor: getGradeColor(grade.letterGrade), color: "white" }}
        />
      ),
    },
    {
      field: "gpa",
      headerName: "GPA",
      width: 80,
      align: "center",
      renderCell: (grade) => grade.gpa.toFixed(1),
    },
    {
      field: "semester_year",
      headerName: "Học kỳ",
      width: 100,
      align: "center",
      renderCell: (grade) => `${grade.semester}/${grade.year}`,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 110,
      renderCell: (grade) => getStatusChip(grade.status),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 120,
      align: "center",
      renderCell: (grade) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" color="primary" onClick={() => handleEdit(grade)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={() => handleDelete(grade.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 }, minHeight: "100vh" }}>
      {/* Header */}
      <PageHeader
        title="Quản lý Điểm số"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ textTransform: "none", px: 3 }}
          >
            Thêm điểm số
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<TrophyIcon />} value={totalGrades} label="Tổng số điểm" color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<TrophyIcon />} value={passedGrades} label="Số điểm đậu" color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard icon={<TrophyIcon />} value={failedGrades} label="Số điểm rớt" color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrophyIcon />}
            value={averageGPA.toFixed(2)}
            label="GPA trung bình"
            color={averageGPA >= 3.0 ? "success" : "error"}
          />
        </Grid>
      </Grid>

      {/* Filter Section */}
      <FilterSection resultCount={filteredGrades.length}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên sinh viên, mã môn học..."
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
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setSearchText("")}
            sx={{ height: "40px" }}
          >
            Đặt lại
          </Button>
        </Grid>
      </FilterSection>

      {/* Grades Table */}
      <DataTable
        columns={columns}
        rows={filteredGrades}
        page={0}
        rowsPerPage={10}
        totalCount={filteredGrades.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        emptyState={
          <>
            <TrophyIcon sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy điểm số nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText ? "Thử thay đổi từ khóa tìm kiếm" : "Chưa có điểm số nào trong hệ thống"}
            </Typography>
          </>
        }
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isModalVisible} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGrade ? "Chỉnh sửa điểm số" : "Thêm điểm số mới"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã sinh viên"
                value={formData.studentCode || ""}
                onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên sinh viên"
                value={formData.studentName || ""}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã môn học"
                value={formData.courseCode || ""}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên môn học"
                value={formData.courseName || ""}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Tín chỉ"
                value={formData.credits || 0}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Học kỳ</InputLabel>
                <Select
                  value={formData.semester || "HK1"}
                  label="Học kỳ"
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  <MenuItem value="HK1">Học kỳ 1</MenuItem>
                  <MenuItem value="HK2">Học kỳ 2</MenuItem>
                  <MenuItem value="HK3">Học kỳ hè</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Điểm giữa kỳ"
                value={formData.midtermScore || 0}
                onChange={(e) => setFormData({ ...formData, midtermScore: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Điểm cuối kỳ"
                value={formData.finalScore || 0}
                onChange={(e) => setFormData({ ...formData, finalScore: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Điểm bài tập"
                value={formData.assignmentScore || 0}
                onChange={(e) => setFormData({ ...formData, assignmentScore: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {editingGrade ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GradeManagement;
