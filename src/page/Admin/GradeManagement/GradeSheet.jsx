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
import { useDebounce } from '../../../hooks/useDebounce';

const GradeSheet = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchInput = useDebounce(searchInput, 500);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (debouncedSearchInput !== undefined) {
      fetchStudents(debouncedSearchInput);
    }
  }, [debouncedSearchInput]);

  const fetchStudents = async (search = '') => {
    setLoadingStudents(true);
    try {
      const result = await studentServices.getAllStudents(1, 50, search, {});
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

  const handleExportExcel = async () => {
    if (!studentData) {
      message.warning('Vui lòng chọn sinh viên trước khi xuất file');
      return;
    }

    const result = await exportStudentGradesExcel(studentData);
    if (result.success) {
      message.success('Xuất file Excel thành công');
    } else {
      message.error('Xuất file Excel thất bại');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 2, md: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
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
      <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) =>
            `${option.mssv} - ${option.user?.fullName || ''}`
          }
          value={selectedStudent}
          onChange={handleStudentChange}
          loading={loadingStudents}
          onInputChange={(event, value) => {
            setSearchInput(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn sinh viên"
              placeholder="Tìm theo MSSV hoặc tên..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon
                      sx={{ ml: 1, mr: -0.5, color: 'action.active' }}
                    />
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
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                  >
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
                        {studentData.semesterGrades?.[0]?.cumulativeGPA4.toFixed(
                          2
                        )}
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
          {studentData.semesterGrades?.map((semester) => {
            // ✅ Tính số cột động cho thường kỳ và thực hành
            const maxRegularCount = Math.max(
              ...semester.courseGrades.map(
                (course) =>
                  course.assessments?.find((a) => a.assessmentTypeId === 1)
                    ?.regularPointsDetails?.length || 0
              ),
              0
            );

            const maxPracticeCount = Math.max(
              ...semester.courseGrades.map(
                (course) =>
                  course.assessments?.filter((a) => a.assessmentTypeId === 2)
                    .length || 0
              ),
              0
            );
            return (
              <Paper
                key={semester.semesterId}
                sx={{ mb: 3, p: { xs: 2, sm: 2, md: 3 } }}
              >
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
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`GPA HK: ${semester.semesterGPA10.toFixed(2)}`}
                      color="primary"
                    />
                    <Chip
                      label={`GPA TL: ${semester.cumulativeGPA10.toFixed(2)}`}
                      color="secondary"
                    />
                    <Chip
                      label={semester.semesterRank}
                      color={getRankColor(semester.semesterRank)}
                    />
                  </Box>
                </Box>

                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        }}
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
                            TC
                          </Typography>
                        </TableCell>

                        {/* ✅ Cột thường kỳ động */}
                        {Array.from({ length: maxRegularCount }).map(
                          (_, idx) => (
                            <TableCell key={`tk-${idx}`} align="center">
                              <Typography variant="subtitle2" fontWeight={600}>
                                TK {idx + 1}
                              </Typography>
                            </TableCell>
                          )
                        )}

                        {/* ✅ Cột thực hành động */}
                        {Array.from({ length: maxPracticeCount }).map(
                          (_, idx) => (
                            <TableCell key={`th-${idx}`} align="center">
                              <Typography variant="subtitle2" fontWeight={600}>
                                TH {idx + 1}
                              </Typography>
                            </TableCell>
                          )
                        )}

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
                        // ✅ Extract điểm thường kỳ
                        const regularDetails =
                          course.assessments?.find(
                            (a) => a.assessmentTypeId === 1
                          )?.regularPointsDetails || [];

                        // ✅ Extract điểm thực hành
                        const practiceScores =
                          course.assessments
                            ?.filter((a) => a.assessmentTypeId === 2)
                            .map((a) => a.score) || [];

                        // ✅ Extract điểm giữa kỳ và cuối kỳ
                        const midtermScore = course.assessments?.find(
                          (a) => a.assessmentTypeId === 3
                        )?.score;

                        const finalScore = course.assessments?.find(
                          (a) => a.assessmentTypeId === 4
                        )?.score;

                        return (
                          <TableRow
                            key={`${course.sectionId}-${course.courseCode}`}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.02
                                ),
                              },
                            }}
                          >
                            <TableCell>{course.courseCode}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {course.courseName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {course.credits}
                            </TableCell>

                            {/* ✅ Render điểm thường kỳ động */}
                            {Array.from({ length: maxRegularCount }).map(
                              (_, idx) => (
                                <TableCell key={`tk-${idx}`} align="center">
                                  {regularDetails[idx]?.score !== undefined
                                    ? regularDetails[idx].score.toFixed(1)
                                    : '-'}
                                </TableCell>
                              )
                            )}

                            {/* ✅ Render điểm thực hành động */}
                            {Array.from({ length: maxPracticeCount }).map(
                              (_, idx) => (
                                <TableCell key={`th-${idx}`} align="center">
                                  {practiceScores[idx] !== undefined
                                    ? practiceScores[idx].toFixed(1)
                                    : '-'}
                                </TableCell>
                              )
                            )}

                            <TableCell align="center">
                              {midtermScore !== undefined
                                ? midtermScore.toFixed(1)
                                : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {finalScore !== undefined
                                ? finalScore.toFixed(1)
                                : '-'}
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
            );
          })}
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
