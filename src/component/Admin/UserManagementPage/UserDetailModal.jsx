import React from 'react';
import {
  Dialog,
  DialogContent,
  Avatar,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { genderOptions, accountStatusMap } from './constants';

/**
 * UserDetailModal - Modal hiển thị chi tiết thông tin user với Material-UI
 */
const UserDetailModal = ({ open, onCancel, user }) => {
  const theme = useTheme();

  if (!user) return null;

  const InfoRow = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
        {value || <span style={{ color: theme.palette.text.disabled }}>Chưa cập nhật</span>}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          backgroundImage: 'none',
        }
      }}
    >
      {/* Header với gradient */}
      <Box
        sx={{
          background: theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`,
          px: 4,
          py: 3,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Avatar
          src={user.avatarUrl}
          sx={{
            width: 90,
            height: 90,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            fontSize: 40,
            fontWeight: 700,
            border: `4px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[4],
          }}
        >
          {!user.avatarUrl && <PersonIcon sx={{ fontSize: 50 }} />}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 1,
            }}
          >
            {user.fullName || user.username}
          </Typography>
          <Chip
            label={user.role?.roleName}
            sx={{
              bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.25)' : theme.palette.background.paper,
              color: theme.palette.mode === 'light' ? 'white' : theme.palette.text.primary,
              fontWeight: 600,
              fontSize: 14,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : theme.palette.divider}`,
            }}
          />
        </Box>
        <IconButton
          onClick={onCancel}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4, bgcolor: theme.palette.background.default }}>
        {/* Thông tin cá nhân */}
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box component="span" sx={{ fontSize: 24 }}>👤</Box>
              Thông tin cá nhân
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Tên đăng nhập" value={user.username} />
                <InfoRow label="Họ và tên" value={user.fullName} />
                <InfoRow
                  label="Giới tính"
                  value={genderOptions.find((g) => g.value === user.gender)?.label}
                />
                <InfoRow
                  label="Ngày sinh"
                  value={user.dateOfBirth ? dayjs(user.dateOfBirth).format('DD/MM/YYYY') : null}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Số điện thoại" value={user.phone} />
                <InfoRow label="Nơi sinh" value={user.placeOfBirth} />
                <InfoRow label="Quốc tịch" value={user.nationality} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Địa chỉ */}
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box component="span" sx={{ fontSize: 24 }}>🏠</Box>
              Thông tin địa chỉ
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Địa chỉ thường trú" value={user.address} />
                <InfoRow label="Dân tộc" value={user.ethnicity} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Địa chỉ tạm trú" value={user.temporaryAddress} />
                <InfoRow label="Tôn giáo" value={user.religion} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Giấy tờ cá nhân */}
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box component="span" sx={{ fontSize: 24 }}>🪪</Box>
              Giấy tờ cá nhân
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Số CCCD" value={user.citizenIdCard} />
                <InfoRow
                  label="Ngày cấp"
                  value={user.issuedDate ? dayjs(user.issuedDate).format('DD/MM/YYYY') : null}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Nơi cấp" value={user.issuedPlace} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
                    Trạng thái tài khoản
                  </Typography>
                  {(() => {
                    const info = accountStatusMap[user.accountStatus];
                    return info ? (
                      <Chip
                        label={info.label}
                        color={info.color === 'success' ? 'success' : 'error'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: theme.palette.text.disabled }}>
                        Chưa cập nhật
                      </Typography>
                    );
                  })()}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
