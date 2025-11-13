import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  Chip,
  Button,
  Grow,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  School,
  Business,
  Email,
  Phone,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TeacherProfileCard = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const colors = useMemo(() => ({
    white: theme.palette.common.white,
    bgGradientStart: theme.palette.primary.main,
    bgGradientEnd: theme.palette.secondary.main,
    bgWhiteAlpha: alpha(theme.palette.common.white, 0.2),
    bgDividerAlpha: alpha(theme.palette.common.white, 0.3),
  }), [theme]);

  const fullName = user?.user?.fullName || user?.fullName || user?.username;
  const academicTitle = user?.academicTitle;
  const position = user?.position;
  const department = user?.departmentName;
  const faculty = user?.facultyName;
  const email = user?.user?.email || user?.email;
  const phone = user?.user?.phone || user?.phone;

  return (
    <Grow in={true} timeout={600}>
      <Paper
        sx={{
          p: 3,
          height: '100%',
          background: `linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
          color: colors.white,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              bgcolor: colors.white,
              color: colors.bgGradientStart,
              fontSize: 40,
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {fullName?.charAt(0).toUpperCase()}
          </Avatar>

          <Typography variant="h6" fontWeight="bold" align="center">
            {academicTitle} {fullName}
          </Typography>

          <Chip
            label={position}
            size="small"
            sx={{
              mt: 1,
              bgcolor: colors.bgWhiteAlpha,
              color: colors.white,
            }}
          />

          <Divider sx={{ width: '100%', my: 2, bgcolor: colors.bgDividerAlpha }} />

          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Business sx={{ mr: 1, fontSize: 20 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Khoa/Bộ môn
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {department}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <School sx={{ mr: 1, fontSize: 20 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Khoa
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {faculty}
                </Typography>
              </Box>
            </Box>

            {email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Email sx={{ mr: 1, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Email
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {email}
                  </Typography>
                </Box>
              </Box>
            )}

            {phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Số điện thoại
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {phone}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<Settings />}
            onClick={() => navigate('/teacher/settings')}
            sx={{
              mt: 2,
              bgcolor: colors.white,
              color: colors.bgGradientStart,
              '&:hover': {
                bgcolor: alpha(colors.white, 0.9),
              },
            }}
          >
            Cài đặt tài khoản
          </Button>
        </Box>
      </Paper>
    </Grow>
  );
};

export default TeacherProfileCard;
