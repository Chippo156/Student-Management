import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
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
  Fab,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const TuitionList = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample data
  const tuitionRecords = [
    {
      id: "1",
      studentId: "SV2024001",
      studentName: "Nguyễn Văn An",
      semester: "HK1 2024-2025",
      amount: 12000000,
      dueDate: "2024-10-15",
      paymentDate: "2024-09-20",
      status: "paid",
      method: "Chuyển khoản",
      note: "Đã thanh toán đúng hạn",
    },
    {
      id: "2",
      studentId: "SV2024002",
      studentName: "Trần Thị Bình",
      semester: "HK1 2024-2025",
      amount: 12000000,
      dueDate: "2024-10-15",
      status: "pending",
      note: "Chưa thanh toán",
    },
    {
      id: "3",
      studentId: "SV2024003",
      studentName: "Lê Văn Cường",
      semester: "HK1 2024-2025",
      amount: 12000000,
      dueDate: "2024-09-15",
      status: "overdue",
      note: "Quá hạn thanh toán",
    },
  ];

  const semesters = ["HK1 2024-2025", "HK2 2023-2024", "HK1 2023-2024"];
  const statuses = [
    { value: "paid", label: "Đã thanh toán", color: "success" },
    { value: "pending", label: "Chờ thanh toán", color: "warning" },
    { value: "overdue", label: "Quá hạn", color: "error" },
  ];

  const filteredRecords = tuitionRecords.filter((record) => {
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesSemester =
      !semesterFilter || record.semester === semesterFilter;
    return matchesStatus && matchesSemester;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircleIcon color="success" />;
      case "pending":
        return <WarningIcon color="warning" />;
      case "overdue":
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : "default";
  };

  const getStatusLabel = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "100%", overflow: "hidden" }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <PaymentIcon />
          </Avatar>
          <Typography variant="h4" component="h1">
            Danh sách học phí
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
            <FormControl fullWidth>
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                label="Học kỳ"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {semesters.map((semester) => (
                  <MenuItem key={semester} value={semester}>
                    {semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
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
        </Grid>
      </Paper>

      {/* Tuition Records Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Học kỳ</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Hạn thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {record.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{record.semester}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(record.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(record.dueDate).toLocaleDateString("vi-VN")}
                    </Typography>
                    {record.paymentDate && (
                      <Typography variant="caption" color="text.secondary">
                        Đã thanh toán:{" "}
                        {new Date(record.paymentDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(record.status)}
                      <Chip
                        label={getStatusLabel(record.status)}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRecord(record);
                        setViewDialogOpen(true);
                      }}
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
      </Paper>

      {/* View Record Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chi tiết học phí: {selectedRecord?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin học phí
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Mã sinh viên:</strong>{" "}
                        {selectedRecord.studentId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Học kỳ:</strong> {selectedRecord.semester}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Số tiền:</strong>{" "}
                        {formatCurrency(selectedRecord.amount)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Hạn thanh toán:</strong>{" "}
                        {new Date(selectedRecord.dueDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                      {selectedRecord.paymentDate && (
                        <Typography variant="body2">
                          <strong>Ngày thanh toán:</strong>{" "}
                          {new Date(
                            selectedRecord.paymentDate
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                      )}
                      {selectedRecord.method && (
                        <Typography variant="body2">
                          <strong>Phương thức:</strong> {selectedRecord.method}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>Ghi chú:</strong>{" "}
                        {selectedRecord.note || "Không có"}
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          label={getStatusLabel(selectedRecord.status)}
                          color={getStatusColor(selectedRecord.status)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          {selectedRecord?.status === "pending" && (
            <Button variant="contained" startIcon={<ReceiptIcon />}>
              Xác nhận thanh toán
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TuitionList;
