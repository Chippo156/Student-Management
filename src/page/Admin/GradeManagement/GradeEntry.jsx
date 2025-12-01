import React, { useState, useEffect, useMemo } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import gradeService from '../../../service/gradeService';
import { studentServices } from '../../../service/studentServices';

const GradeEntry = () => {
  const theme = useTheme();

  // State for single student view
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [editScore, setEditScore] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (search = '') => {
    setLoadingStudents(true);
    try {
      const result = await studentServices.getAllStudents(1, 50, search);
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

  const handleEditClick = (grade, assessment) => {
    setEditingGrade({ grade, assessment });
    setEditScore(assessment.score || '');
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingGrade || !editScore) return;

    const { grade, assessment } = editingGrade;
    const score = parseFloat(editScore);

    if (isNaN(score) || score < 0 || score > 10) {
      alert('Điểm phải từ 0 đến 10');
      return;
    }
    console.log('Student Data:', studentData);
    console.log('Selected Student:', selectedStudent);
    console.log('Assessment:', assessment);

    try {
      const gradeData = {
        studentId: selectedStudent.id,
        assessmentId: assessment.assessmentId,
        score,
      };

      console.log('Grade Data before update:', gradeData);

      const result = await gradeService.updateGrade(
        assessment.gradeId,
        gradeData
      );

      if (result) {
        // Refresh data
        if (selectedStudent?.mssv) {
          await handleSearch(selectedStudent.mssv);
        }
        setOpenEditDialog(false);
        setEditingGrade(null);
        setEditScore('');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancelEdit = () => {
    setOpenEditDialog(false);
    setEditingGrade(null);
    setEditScore('');
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

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
        >
          Nhập điểm sinh viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý điểm sinh viên theo cá nhân
        </Typography>
      </Box>

      {/* Single Student Search */}
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
            fetchStudents(value);
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

      {/* Single Student Results */}
      {studentData && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mã số sinh viên
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {studentData.mssv}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {studentData.studentName}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {studentData.semesterGrades?.map((semester) => (
            <Accordion
              key={semester.semesterId}
              defaultExpanded={
                semester.semesterId ===
                studentData.semesterGrades[0]?.semesterId
              }
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {semester.semesterName}
                  </Typography>
                  <Chip
                    label={`GPA: ${semester.semesterGPA10.toFixed(2)}`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={semester.semesterRank}
                    color={
                      semester.semesterRank === 'Giỏi'
                        ? 'success'
                        : semester.semesterRank === 'Khá'
                          ? 'info'
                          : 'default'
                    }
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {semester.courseGrades?.map((course) => (
                  <Box key={course.sectionId} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {course.courseCode} - {course.courseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.credits} tín chỉ
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={700}>
                          {course.finalScore.toFixed(2)}
                        </Typography>
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
                      </Box>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Loại điểm</TableCell>
                            <TableCell>Tên bài đánh giá</TableCell>
                            <TableCell align="center">Điểm</TableCell>
                            <TableCell align="center">Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {course.assessments?.map((assessment) => (
                            <React.Fragment key={assessment.assessmentId}>
                              {assessment.regularPointsDetails ? (
                                assessment.regularPointsDetails.map(
                                  (detail) => (
                                    <TableRow key={detail.gradeId}>
                                      <TableCell>
                                        {assessment.assessmentType}
                                      </TableCell>
                                      <TableCell>
                                        {detail.assessmentName}
                                      </TableCell>
                                      <TableCell align="center">
                                        <Chip
                                          label={detail.score.toFixed(1)}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={() =>
                                            handleEditClick(course, detail)
                                          }
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )
                              ) : (
                                <TableRow>
                                  <TableCell>
                                    {assessment.assessmentType}
                                  </TableCell>
                                  <TableCell>
                                    {assessment.assessmentName}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={assessment.score.toFixed(1)}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() =>
                                        handleEditClick(course, assessment)
                                      }
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}

      {!studentData && !loading && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chọn sinh viên để xem và chỉnh sửa điểm
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

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCancelEdit}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa điểm</DialogTitle>
        <DialogContent>
          {editingGrade && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bài đánh giá
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {editingGrade.assessment.assessmentName}
              </Typography>
              <TextField
                fullWidth
                label="Điểm số"
                type="number"
                value={editScore}
                onChange={(e) => setEditScore(e.target.value)}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                helperText="Nhập điểm từ 0 đến 10"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradeEntry;
