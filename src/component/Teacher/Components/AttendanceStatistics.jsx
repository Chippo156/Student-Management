import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle,
  Cancel,
  Schedule,
  FileDownload,
} from '@mui/icons-material';
import attendanceService from '../../../service/attendanceService';
import { exportAttendanceAllStatisticsExcel } from '../../../until/exportAttendanceStatisticsExcel';

const AttendanceStatistics = ({ sectionId, sectionName }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [statisticsData, setStatisticsData] = useState(null);
  const [error, setError] = useState(null);

  const colors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  useEffect(() => {
    if (sectionId) {
      fetchStatistics();
    }
  }, [sectionId]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendanceStatistics(sectionId);
      if (data) {
        setStatisticsData(data);
      } else {
        setError('Không thể tải dữ liệu thống kê');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thống kê điểm danh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const exportData = await attendanceService.exportAttendanceData(sectionId);
      if (exportData) {
        // Use the new export function that works directly with API response
        const result = await exportAttendanceAllStatisticsExcel(exportData);

        if (!result.success) {
          setError(`Lỗi khi xuất Excel: ${result.error || 'Lỗi không xác định'}`);
        }
      } else {
        setError('Không thể lấy dữ liệu xuất từ server');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi không xác định khi xuất Excel';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statisticsData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!statisticsData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Chưa có dữ liệu thống kê điểm danh
      </Alert>
    );
  }

  // Extract data from API response
  const totalStudents = statisticsData.totalStudents || 0;
  const totalSessions = statisticsData.totalSessions || 0;
  const overallAttendanceRate = statisticsData.overallAttendanceRate || 0;
  const studentAttendances = statisticsData.studentAttendanceDetails || [];

  // Calculate overall statistics
  const totalPresentCount = studentAttendances.reduce(
    (sum, s) => sum + (s.presentCount || 0),
    0
  );
  const totalAbsentCount = studentAttendances.reduce(
    (sum, s) => sum + (s.absentCount || 0),
    0
  );
  const totalLateCount = studentAttendances.reduce(
    (sum, s) => sum + (s.lateCount || 0),
    0
  );
  const totalExcusedCount = studentAttendances.reduce(
    (sum, s) => sum + (s.excusedCount || 0),
    0
  );
  const totalLeftEarlyCount = studentAttendances.reduce(
    (sum, s) => sum + (s.leftEarlyCount || 0),
    0
  );

  // Pie chart data - simplified to remove Đi muộn and Về sớm
  const pieData = [
    { name: 'Có mặt', value: totalPresentCount, color: colors.success },
    { name: 'Không phép', value: totalAbsentCount, color: colors.error },
    { name: 'Có phép', value: totalExcusedCount, color: colors.info },
  ].filter((item) => item.value > 0);

  // Bar chart data - top 10 students by absence count
  const barData = studentAttendances
    .map((student) => ({
      name:
        student.studentName?.split(' ').slice(-2).join(' ') ||
        student.mssv,
      absentCount: student.absentCount || 0,
      presentCount: student.presentCount || 0,
      attendanceRate: parseFloat(student.attendanceRate?.toFixed(1) || 0),
    }))
    .sort((a, b) => b.absentCount - a.absentCount)
    .slice(0, 10);

  return (
    <Box>
      {/* Header with Export Button */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Thống kê điểm danh - {sectionName || statisticsData.courseName}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownload />}
          onClick={handleExport}
          disabled={loading}
        >
          Xuất Excel
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(colors.primary, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: colors.primary, mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Tổng số buổi
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(colors.success, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: colors.success, mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Tỷ lệ có mặt
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {overallAttendanceRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(colors.error, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Cancel sx={{ color: colors.error, mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Tổng không phép
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalAbsentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(colors.info, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: colors.info, mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Tổng có phép
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalExcusedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
              </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Phân bổ trạng thái điểm danh
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Top 10 sinh viên vắng nhiều nhất
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="absentCount" fill={colors.error} name="Số buổi vắng" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Student Statistics Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Chi tiết điểm danh sinh viên ({totalStudents} sinh viên)
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã SV</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lớp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Có mặt
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Không phép
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Có phép
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Tỷ lệ có mặt
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Tỷ lệ không phép
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentAttendances?.map((student, index) => {
                  // Calculate absent rate
                  const absentRate = totalSessions > 0
                    ? ((student.absentCount || 0) / totalSessions * 100)
                    : 0;

                  return (
                    <TableRow key={student.studentId || index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.mssv}</TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={student.presentCount || 0}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={student.absentCount || 0}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={student.excusedCount || 0}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={student.attendanceRate || 0}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(colors.success, 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: colors.success,
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 45 }}>
                            {student.attendanceRate?.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={absentRate}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(colors.error, 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: colors.error,
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 45 }}>
                            {absentRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceStatistics;
