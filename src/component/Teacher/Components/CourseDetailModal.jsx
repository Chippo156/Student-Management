import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  Person as PersonIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import practiceService from '../../../service/practiceService';
import sectionService from '../../../service/sectionService';
import { exportSectionStudentsExcel } from '../../../until/exportSectionStudentsExcel';

const CourseDetailModal = ({ open, onClose, section }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [theoryStudents, setTheoryStudents] = useState([]);
  const [practiceStudents, setPracticeStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasPractice, setHasPractice] = useState(false);

  useEffect(() => {
    if (open && section) {
      fetchStudentData();
    }
  }, [open, section]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách sinh viên lý thuyết
      const theoryResponse = await sectionService.getSectionTheoryDetail(section.sectionId);
      setTheoryStudents(theoryResponse?.students || []);

      // Kiểm tra xem có lớp thực hành không
      const practiceGroups = await practiceService.getPracticeGroupsBySection(section.sectionId);
      if (practiceGroups && practiceGroups.length > 0) {
        setHasPractice(true);
        // Lấy sinh viên thực hành từ nhóm đầu tiên
        const firstGroupId = practiceGroups[0].practiceGroupId;
        const practiceResponse = await sectionService.getSectionPracticeDetail(
          section.sectionId,
          firstGroupId
        );
        setPracticeStudents(practiceResponse?.students || []);
      } else {
        setHasPractice(false);
        setPracticeStudents([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const exportToExcel = async () => {
    const students = tabValue === 0 ? theoryStudents : practiceStudents;
    const scheduleType = tabValue === 0 ? 'Lý thuyết' : 'Thực hành';

    await exportSectionStudentsExcel(section, students, scheduleType);
  };

  if (!section) return null;

  const students = tabValue === 0 ? theoryStudents : practiceStudents;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chi tiết lớp học phần
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {section.sectionCode} - {section.courseName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Course Information */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
            Thông tin lớp học phần
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ClassIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Mã lớp học phần
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {section.sectionCode}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ 
                bgcolor: alpha(theme.palette.success.main, 0.1), 
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PersonIcon sx={{ fontSize: 28, color: theme.palette.success.main }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Số sinh viên
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {section.enrolledCount}/{section.capacity}
                  <Chip 
                    label={`${Math.round((section.enrolledCount / section.capacity) * 100)}%`}
                    size="small"
                    color="success"
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                  />
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Mã môn học
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {section.courseCode}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Số tín chỉ
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {section.credits || 'N/A'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Học kỳ
              </Typography>
              <Chip 
                label={section.semesterName}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Trạng thái
              </Typography>
              <Chip
                label={
                  section.status === 0
                    ? 'Chưa bắt đầu'
                    : section.status === 1
                    ? 'Đang diễn ra'
                    : section.status === 2
                    ? 'Đã kết thúc'
                    : 'Đã hủy'
                }
                color={section.status === 1 ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Paper>

        {/* Student Statistics */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Thống kê sinh viên
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.08),
              borderRadius: 2,
              border: 1,
              borderColor: alpha(theme.palette.info.main, 0.2),
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Tổng sinh viên
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                {section.totalStudents || section.enrolledCount || 0}
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Nam
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                {section.maleStudents || 0}
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.secondary.main, 0.08),
              borderRadius: 2,
              border: 1,
              borderColor: alpha(theme.palette.secondary.main, 0.2),
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Nữ
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                {section.femaleStudents || 0}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs for Theory/Practice */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              icon={<ClassIcon />}
              iconPosition="start"
              label={`Lý thuyết (${theoryStudents.length})`}
            />
            {hasPractice && (
              <Tab
                icon={<PersonIcon />}
                iconPosition="start"
                label={`Thực hành (${practiceStudents.length})`}
              />
            )}
          </Tabs>
        </Box>

        {/* Export Button */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Danh sách sinh viên {tabValue === 0 ? 'lớp lý thuyết' : 'lớp thực hành'}
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
            disabled={loading || students.length === 0}
            size="small"
          >
            Xuất Excel
          </Button>
        </Box>

        {/* Student List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : students.length === 0 ? (
          <Alert severity="info">Chưa có sinh viên đăng ký lớp này</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>MSSV</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lớp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.mssv || student.studentId || index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.mssv || student.studentId}</TableCell>
                    <TableCell>{student.fullName || student.studentName}</TableCell>
                    <TableCell>{student.className || student.class}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.enrollmentStatus || student.status || 'Đang học'}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDetailModal;
