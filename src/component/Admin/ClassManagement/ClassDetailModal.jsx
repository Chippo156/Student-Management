import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  LibraryBooks as LibraryBooksIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const ClassDetailModal = ({ open, onClose, classData }) => {
  const theme = useTheme();

  if (!classData) return null;

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
          bgcolor: cardColor.bg,
          boxShadow: 'none',
          border: `1px solid ${alpha(cardColor.color, 0.2)}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Icon sx={{ color: cardColor.color, mr: 1.5, fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{ color: cardColor.color, fontWeight: 600 }}
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ pl: 1 }}>{children}</Box>
        </CardContent>
      </Card>
    );
  };

  const StatBox = ({ label, value, colorType = 'primary' }) => {
    const getStatColor = () => {
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

    const statColor = getStatColor();

    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: statColor.bg,
          border: `1px solid ${alpha(statColor.color, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 4px 12px ${alpha(statColor.color, 0.15)}`,
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 1 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{ color: statColor.color, fontWeight: 700 }}
        >
          {value}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.dark,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SchoolIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Chi tiết Lớp học
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, pb: 3 }}>
        {/* Thông tin cơ bản */}
        <Grid
          container
          className="equal-height-cards"
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Grid item xs={12}>
            <InfoCard
              icon={SchoolIcon}
              title="Thông tin lớp học"
              colorType="primary"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên lớp
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {classData.className || 'N/A'}
                  </Typography>
                </Box>
                {classData.classCode && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mã lớp
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {classData.classCode}
                    </Typography>
                  </Box>
                )}
              </Box>
            </InfoCard>
          </Grid>
        </Grid>

        {/* Thông tin chương trình đào tạo */}
        <Grid
          container
          className="equal-height-cards"
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Grid item xs={12} md={6}>
            <InfoCard
              icon={LibraryBooksIcon}
              title="Chương trình đào tạo"
              colorType="success"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên chương trình
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {classData.programName || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trình độ
                  </Typography>
                  <Chip
                    label={classData.degreeLevel || 'N/A'}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.15),
                      color: theme.palette.success.main,
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tín chỉ yêu cầu
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {classData.requiredCredits || 0} tín chỉ
                  </Typography>
                </Box>
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard
              icon={AccountBalanceIcon}
              title="Khoa - Chuyên ngành"
              colorType="secondary"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Khoa
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {classData.facultyName || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Chuyên ngành
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {classData.departmentName || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </InfoCard>
          </Grid>
        </Grid>

        {/* Thông tin giảng viên và sinh viên */}
        <Divider sx={{ my: 3 }} />

        <Grid container className="equal-height-cards" spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard
              icon={PersonIcon}
              title="Giảng viên chủ nhiệm"
              colorType="warning"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {classData.adviserName || 'Chưa phân công'}
                  </Typography>
                </Box>
                {classData.adviserCode && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mã giảng viên
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {classData.adviserCode}
                    </Typography>
                  </Box>
                )}
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard
              icon={GroupIcon}
              title="Thống kê sinh viên"
              colorType="info"
            >
              <StatBox
                label="Tổng số sinh viên"
                value={classData.studentCount || 0}
                colorType="info"
              />
            </InfoCard>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailModal;
