import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Room as RoomIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import SectionScheduleTab from './SectionScheduleTab';
import { studentServices } from '../../../service/studentServices';

const SectionDetailModal = ({ open, onCancel, section }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Reset students when section changes
  useEffect(() => {
    setStudents([]);
    setActiveTab(0);
  }, [section?.sectionId]);

  // Fetch students when tab 3 is active
  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab === 2 && section?.sectionId && students.length === 0) {
        setLoadingStudents(true);
        try {
          const result = await studentServices.getStudentsWithSection(
            section.sectionId,
            1,
            1000,
            ''
          );
          if (result && result.items) {
            setStudents(result.items);
          }
        } catch (error) {
          console.error('Failed to fetch students:', error);
        } finally {
          setLoadingStudents(false);
        }
      }
    };

    fetchStudents();
  }, [activeTab, section?.sectionId, students.length]);

  if (!section) return null;

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: // IsPreparing
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.main,
        };
      case 1: // IsOpening
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
        };
      case 2: // IsClosed
        return {
          bg: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[700],
        };
      case 3: // IsCancelled
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
        };
      case 4: // IsCompleted
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
        };
      default:
        return {
          bg: theme.palette.action.hover,
          color: theme.palette.text.secondary,
        };
    }
  };

  const statusInfo = getStatusColor(section.status);
  const enrollmentPercentage =
    (section.enrolledCount / section.capacity) * 100 || 0;

  const InfoCard = ({ icon: Icon, title, children, colorType = 'primary' }) => {
    const getCardColor = () => {
      switch (colorType) {
        case 'primary':
          return {
            bg: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
          };
        case 'success':
          return {
            bg: alpha(theme.palette.success.main, 0.08),
            color: theme.palette.success.main,
          };
        case 'secondary':
          return {
            bg: alpha(theme.palette.secondary.main, 0.08),
            color: theme.palette.secondary.main,
          };
        case 'warning':
          return {
            bg: alpha(theme.palette.warning.main, 0.08),
            color: theme.palette.warning.main,
          };
        case 'info':
          return {
            bg: alpha(theme.palette.info.main, 0.08),
            color: theme.palette.info.main,
          };
        default:
          return {
            bg: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
          };
      }
    };

    const cardColor = getCardColor();

    return (
      <Card
        sx={{
          height: '100%',
          boxShadow: 2,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            bgcolor: cardColor.bg,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: cardColor.color, fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: cardColor.color, fontSize: '1.1rem' }}
          >
            {title}
          </Typography>
        </Box>
        <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
      </Card>
    );
  };

  const InfoRow = ({ label, value, bold = false }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.3, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: bold ? 600 : 400, fontSize: '0.95rem' }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  );

  const StatBox = ({ value, label, colorType = 'primary' }) => {
    const getStatColor = () => {
      switch (colorType) {
        case 'primary':
          return {
            bg: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          };
        case 'success':
          return {
            bg: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
          };
        case 'warning':
          return {
            bg: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.main,
          };
        case 'secondary':
          return {
            bg: alpha(theme.palette.secondary.main, 0.1),
            color: theme.palette.secondary.main,
          };
        default:
          return {
            bg: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          };
      }
    };

    const statColor = getStatColor();
    console.log(activeTab);
    return (
      <Box
        sx={{
          textAlign: 'center',
          p: 2,
          bgcolor: statColor.bg,
          borderRadius: 2,
          boxShadow: 1,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: statColor.color, mb: 0.5 }}
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
          py: 2.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {section.sectionCode}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Chi tiết lớp học phần
            </Typography>
          </Box>
          <IconButton onClick={onCancel} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Header Status */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid
              container
              className="equal-height-cards"
              spacing={3}
              alignItems="center"
            >
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Chip
                    label={section.statusName}
                    sx={{
                      bgcolor: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      px: 1.5,
                      py: 2.5,
                    }}
                  />
                  {section.isActive && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Đang hoạt động"
                      color="success"
                      sx={{ fontWeight: 600, py: 2.5 }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Tỷ lệ đăng ký
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color:
                          enrollmentPercentage >= 80
                            ? '#388e3c'
                            : enrollmentPercentage >= 50
                              ? '#f57c00'
                              : '#d32f2f',
                      }}
                    >
                      {enrollmentPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(enrollmentPercentage, 100)}
                    sx={{
                      height: 10,
                      borderRadius: 1,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor:
                          enrollmentPercentage >= 80
                            ? '#4caf50'
                            : enrollmentPercentage >= 50
                              ? '#ff9800'
                              : '#f44336',
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, fontWeight: 500 }}
                  >
                    {section.enrolledCount}/{section.capacity} sinh viên
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Thông tin chung" />
          <Tab label="Lịch học" />
          <Tab label="Sinh viên" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <Grid container className="equal-height-cards" spacing={3}>
              {/* Thông tin môn học */}
              <Grid item xs={12} md={6}>
                <InfoCard icon={SchoolIcon} title="Môn học" colorType="primary">
                  <InfoRow label="Mã môn học" value={section.courseCode} bold />
                  <InfoRow
                    label="Tên môn học"
                    value={section.courseName}
                    bold
                  />
                  <Grid
                    container
                    className="equal-height-cards"
                    spacing={2}
                    sx={{ mt: 0.5 }}
                  >
                    <Grid item xs={4}>
                      <InfoRow
                        label="Lý thuyết"
                        value={`${section.creditsTheory} TC`}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <InfoRow
                        label="Thực hành"
                        value={`${section.creditsLab} TC`}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <InfoRow
                        label="Tổng"
                        value={`${section.totalCredits} TC`}
                      />
                    </Grid>
                  </Grid>
                </InfoCard>
              </Grid>

              {/* Thông tin giảng viên */}
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={PersonIcon}
                  title="Giảng viên"
                  colorType="success"
                >
                  <InfoRow
                    label="Họ và tên"
                    value={section.lecturerName || 'Chưa phân công'}
                    bold
                  />
                  <InfoRow
                    label="Email"
                    value={section.lecturerEmail || 'N/A'}
                  />
                  <InfoRow label="Khoa" value={section.facultyName} />
                  <InfoRow
                    label="Chuyên ngành"
                    value={section.departmentName}
                  />
                </InfoCard>
              </Grid>

              {/* Lớp và học kỳ */}
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={ClassIcon}
                  title="Lớp & Học kỳ"
                  colorType="secondary"
                >
                  <InfoRow
                    label="Lớp"
                    value={`${section.className} (${section.classCode})`}
                    bold
                  />
                  <InfoRow label="Học kỳ" value={section.semesterName} bold />
                  <Grid
                    container
                    className="equal-height-cards"
                    spacing={2}
                    sx={{ mt: 0.5 }}
                  >
                    <Grid item xs={6}>
                      <InfoRow
                        label="Năm học"
                        value={
                          section.semesterName?.split(' - ')[0] ||
                          section.year ||
                          'N/A'
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Kỳ"
                        value={
                          section.semesterName?.split(' - ')[1] ||
                          section.term ||
                          'N/A'
                        }
                      />
                    </Grid>
                  </Grid>
                </InfoCard>
              </Grid>

              {/* Thời gian */}
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={CalendarIcon}
                  title="Thời gian"
                  colorType="warning"
                >
                  <Grid container className="equal-height-cards" spacing={2}>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Ngày bắt đầu"
                        value={formatDate(section.startDate)}
                        bold
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Ngày kết thúc"
                        value={formatDate(section.endDate)}
                        bold
                      />
                    </Grid>
                  </Grid>
                </InfoCard>
              </Grid>

              {/* Thông tin sinh viên */}
              <Grid item xs={12}>
                <InfoCard
                  icon={GroupIcon}
                  title="Thông tin sinh viên"
                  colorType="info"
                >
                  <Grid container className="equal-height-cards" spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatBox
                        value={section.capacity}
                        label="Sức chứa"
                        colorType="primary"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatBox
                        value={section.enrolledCount}
                        label="Đã đăng ký"
                        colorType="success"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatBox
                        value={section.availableSlots}
                        label="Còn trống"
                        colorType="warning"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatBox
                        value={
                          section.hasPracticeGroups
                            ? section.practiceGroupCount
                            : 0
                        }
                        label="Nhóm thực hành"
                        colorType="secondary"
                      />
                    </Grid>
                  </Grid>
                </InfoCard>
              </Grid>

              {/* Thông tin khác */}
              <Grid item xs={12}>
                <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimerIcon
                        sx={{ color: 'text.secondary', fontSize: 20 }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        Ngày tạo: {formatDate(section.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <SectionScheduleTab
              sectionId={section.sectionId}
              section={section}
            />
          )}

          {activeTab === 2 && (
            <Box>
              {loadingStudents ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : students.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor:
                            theme.palette.mode === 'light'
                              ? theme.palette.grey[100]
                              : theme.palette.primary.main,
                        }}
                      >
                        <TableCell
                          sx={{
                            color:
                              theme.palette.mode === 'light'
                                ? theme.palette.text.primary
                                : 'white',
                            fontWeight: 700,
                          }}
                        >
                          STT
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.mode === 'light'
                                ? theme.palette.text.primary
                                : 'white',
                            fontWeight: 700,
                          }}
                        >
                          Mã SV
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.mode === 'light'
                                ? theme.palette.text.primary
                                : 'white',
                            fontWeight: 700,
                          }}
                        >
                          Họ và tên
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.mode === 'light'
                                ? theme.palette.text.primary
                                : 'white',
                            fontWeight: 700,
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.mode === 'light'
                                ? theme.palette.text.primary
                                : 'white',
                            fontWeight: 700,
                          }}
                        >
                          Giới tính
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.mode === 'light'
                                ? theme.palette.text.primary
                                : 'white',
                            fontWeight: 700,
                          }}
                        >
                          Ngày sinh
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow
                          key={student.studentId || index}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '&:nth-of-type(odd)': {
                              bgcolor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {student.mssv}
                          </TableCell>
                          <TableCell>{student.fullName}</TableCell>
                          <TableCell>{student.email || 'N/A'}</TableCell>
                          <TableCell>{student.gender || 'N/A'}</TableCell>
                          <TableCell>
                            {student.dateOfBirth
                              ? formatDate(student.dateOfBirth)
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <GroupIcon
                    sx={{
                      fontSize: 60,
                      color: theme.palette.text.disabled,
                      mb: 2,
                    }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    Chưa có sinh viên đăng ký lớp học phần này
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onCancel}
          variant="contained"
          size="large"
          sx={{ px: 4, textTransform: 'none', fontWeight: 600 }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SectionDetailModal;
