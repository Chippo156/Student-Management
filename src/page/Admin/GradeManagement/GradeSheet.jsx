import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { message } from 'antd';
import gradeService from '../../../service/gradeService';
import { studentServices } from '../../../service/studentServices';
import { exportStudentGradesExcel } from '../../../until/exportStudentGradesExcel';

const GradeSheet = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const result = await studentServices.getAllStudents(1, 1000);
      if (result?.items) {
        setStudents(result.items);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentChange = async (event, value) => {
    setSelectedStudent(value);
    if (value?.mssv) {
      await handleSearch(value.mssv);
    } else {
      setStudentData(null);
    }
  };

  const handleSearch = async (mssv) => {
    if (!mssv) return;

    setLoading(true);
    try {
      const result = await gradeService.getAllGradesByStudentCode(mssv);
      if (result) {
        setStudentData(result);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (gradeLetter) => {
    switch (gradeLetter) {
      case 'A':
        return theme.palette.success.main;
      case 'B+':
      case 'B':
        return theme.palette.info.main;
      case 'C+':
      case 'C':
        return theme.palette.warning.main;
      case 'D+':
      case 'D':
        return theme.palette.error.light;
      case 'F':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Giỏi':
        return 'success';
      case 'Khá':
        return 'info';
      case 'Trung bình':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleExportExcel = () => {
    if (!studentData) {
      message.warning('Vui lòng chọn sinh viên trước khi xuất file');
      return;
    }

    const result = exportStudentGradesExcel(studentData);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bảng điểm sinh viên
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem bảng điểm chi tiết của sinh viên theo từng học kỳ
          </Typography>
        </Box>
        {studentData && (
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            sx={{ height: 'fit-content' }}
          >
            Xuất Excel
          </Button>
        )}
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) =>
            `${option.mssv} - ${option.user?.fullName || ''}`
          }
          value={selectedStudent}
          onChange={handleStudentChange}
          loading={loadingStudents}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn sinh viên"
              placeholder="Tìm theo MSSV hoặc tên..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {loadingStudents ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1">{option.mssv}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.user?.fullName || ''}
                </Typography>
              </Box>
            </li>
          )}
        />
      </Paper>

      {/* Student Info & Overall Stats */}
      {studentData && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Thông tin sinh viên
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã số sinh viên
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {studentData.mssv}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {studentData.studentName}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Tổng quan học tập
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        GPA tích lũy (10)
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary">
                        {studentData.semesterGrades?.[0]?.cumulativeGPA10.toFixed(
                          2
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        GPA tích lũy (4)
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary">
                        {studentData.semesterGrades?.[0]?.cumulativeGPA4.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tín chỉ tích lũy
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {studentData.semesterGrades?.[0]?.totalCreditsEarned} TC
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Xếp loại
                      </Typography>
                      <Chip
                        label={studentData.semesterGrades?.[0]?.cumulativeRank}
                        color={getRankColor(
                          studentData.semesterGrades?.[0]?.cumulativeRank
                        )}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Semester Grades Table */}
          {studentData.semesterGrades?.map((semester) => (
            <Paper key={semester.semesterId} sx={{ mb: 3, p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {semester.semesterName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {semester.year} - {semester.term}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`GPA HK: ${semester.semesterGPA10.toFixed(2)}`}
                    color="primary"
                  />
                  <Chip
                    label={`GPA TL: ${semester.cumulativeGPA10.toFixed(2)}`}
                    color="secondary"
                  />
                  <Chip label={semester.semesterRank} color={getRankColor(semester.semesterRank)} />
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Mã HP
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Tên học phần
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Tín chỉ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Thường kỳ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Thực hành
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Giữa kỳ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Cuối kỳ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Điểm TK
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Điểm chữ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {semester.courseGrades?.map((course) => {
                      // Extract scores by type
                      const regularScore =
                        course.assessments?.find(
                          (a) => a.assessmentTypeId === 1
                        )?.regularPointsDetails?.reduce(
                          (sum, detail) => sum + detail.score,
                          0
                        ) /
                          course.assessments?.find(
                            (a) => a.assessmentTypeId === 1
                          )?.regularPointsDetails?.length || 0;

                      const practiceScores = course.assessments
                        ?.filter((a) => a.assessmentTypeId === 2)
                        .map((a) => a.score);
                      const practiceScore =
                        practiceScores?.length > 0
                          ? practiceScores.reduce((sum, s) => sum + s, 0) /
                            practiceScores.length
                          : null;

                      const midtermScore = course.assessments?.find(
                        (a) => a.assessmentTypeId === 3
                      )?.score;

                      const finalScore = course.assessments?.find(
                        (a) => a.assessmentTypeId === 4
                      )?.score;

                      return (
                        <TableRow
                          key={course.sectionId}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                            },
                          }}
                        >
                          <TableCell>{course.courseCode}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {course.courseName}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{course.credits}</TableCell>
                          <TableCell align="center">
                            {regularScore > 0 ? regularScore.toFixed(1) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {practiceScore ? practiceScore.toFixed(1) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {midtermScore ? midtermScore.toFixed(1) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {finalScore ? finalScore.toFixed(1) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="subtitle2" fontWeight={600}>
                              {course.finalScore.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={course.gradeLetter}
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  getGradeColor(course.gradeLetter),
                                  0.2
                                ),
                                color: getGradeColor(course.gradeLetter),
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Semester Summary */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 1,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Tín chỉ đăng ký
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {semester.totalCreditsRegistered} TC
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Tín chỉ đạt
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {semester.totalCreditsEarned} TC
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      GPA học kỳ (4)
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {semester.semesterGPA4.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      GPA tích lũy (4)
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {semester.cumulativeGPA4.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          ))}
        </>
      )}

      {/* Empty State */}
      {!studentData && !loading && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chọn sinh viên để xem bảng điểm
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Sử dụng dropdown phía trên để tìm kiếm sinh viên
          </Typography>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default GradeSheet;
