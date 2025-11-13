import React from 'react';
import { Modal, Avatar, Tag, Divider, Row, Col } from 'antd';
import { UserOutlined, BookOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

/**
 * TeacherDetailModal - Modal hiển thị chi tiết thông tin giảng viên
 */
const TeacherDetailModal = ({ open, onCancel, lecturer }) => {
  const theme = useTheme();

  if (!lecturer) return null;

  const colors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    error: theme.palette.error.main,
    primaryLight: alpha(theme.palette.primary.main, 0.1),
    successLight: alpha(theme.palette.success.main, 0.1),
    warningLight: alpha(theme.palette.warning.main, 0.1),
    infoLight: alpha(theme.palette.info.main, 0.1),
    errorLight: alpha(theme.palette.error.main, 0.1),
  };

  const getGenderText = (gender) => {
    const genderMap = {
      1: 'Nam',
      2: 'Nữ',
      3: 'Khác',
    };
    return genderMap[gender] || 'Chưa cập nhật';
  };

  const getGenderColor = (gender) => {
    const colorMap = {
      1: 'blue',
      2: 'pink',
      3: 'default',
    };
    return colorMap[gender] || 'default';
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      centered
      title={null}
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ borderRadius: 16 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 32,
            background: `linear-gradient(135deg, ${colors.success} 0%, ${alpha(colors.success, 0.8)} 100%)`,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            color: '#fff',
            gap: 24,
          }}
        >
          <Avatar
            src={lecturer.user?.avatarUrl}
            size={80}
            icon={<UserOutlined />}
            style={{
              background: '#fff',
              color: colors.success,
              fontWeight: 700,
              fontSize: 36,
              border: '3px solid #fff',
              boxShadow: `0 2px 8px ${alpha(colors.success, 0.3)}`,
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 26,
                wordBreak: 'break-word',
              }}
            >
              {lecturer.user?.fullName || 'Chưa cập nhật'}
            </div>
            <div style={{ fontSize: 18, marginTop: 4 }}>
              {lecturer.academicTitle && `${lecturer.academicTitle} - `}
              {lecturer.position || 'Giảng viên'}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Tag
                color="geekblue"
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 8,
                  padding: '2px 12px',
                }}
              >
                Giảng viên
              </Tag>
              {lecturer.position && (
                <Tag
                  color="gold"
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '2px 12px',
                  }}
                >
                  {lecturer.position}
                </Tag>
              )}
            </div>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Content */}
        <div style={{ padding: 32, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Thông tin cá nhân */}
          <Divider orientation="left" style={{ color: colors.success }}>
            👨‍🏫 Thông tin cá nhân
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Họ và tên
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {lecturer.user?.fullName || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Giới tính
                </Typography>
                <Tag color={getGenderColor(lecturer.user?.gender)}>
                  {getGenderText(lecturer.user?.gender)}
                </Tag>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày sinh
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.dateOfBirth
                    ? dayjs(lecturer.user.dateOfBirth).format('DD/MM/YYYY')
                    : 'Chưa cập nhật'
                  }
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MailOutlined style={{ color: colors.primary }} />
                  <Typography variant="body1">
                    {lecturer.user?.email || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Số điện thoại
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneOutlined style={{ color: colors.success }} />
                  <Typography variant="body1">
                    {lecturer.user?.phone || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Địa chỉ
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.address || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Địa chỉ tạm trú
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.temporaryAddress || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Dân tộc
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.ethnicity || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tôn giáo
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.religion || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Quốc tịch
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.nationality || 'Chưa cập nhật'}
                </Typography>
              </div>
            </Col>
          </Row>

          {/* Thông tin công tác */}
          <Divider orientation="left" style={{ color: colors.info }}>
            💼 Thông tin công tác
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Học hàm
                </Typography>
                <Chip
                  label={lecturer.academicTitle || 'Chưa cập nhật'}
                  size="small"
                  sx={{
                    bgcolor: colors.infoLight,
                    color: colors.info,
                    fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Chức vụ
                </Typography>
                <Chip
                  label={lecturer.position || 'Giảng viên'}
                  size="small"
                  sx={{
                    bgcolor: colors.warningLight,
                    color: colors.warning,
                    fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Khoa/Phòng ban
                </Typography>
                <Chip
                  icon={<BookOutlined />}
                  label={lecturer.department?.departmentName || 'Chưa cập nhật'}
                  size="small"
                  sx={{
                    bgcolor: colors.primaryLight,
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày bắt đầu công tác
                </Typography>
                <Typography variant="body1">
                  {lecturer.joiningDate
                    ? dayjs(lecturer.joiningDate).format('DD/MM/YYYY')
                    : 'Chưa cập nhật'
                  }
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Trạng thái tài khoản
                </Typography>
                <Tag color="green">
                  {lecturer.user?.accountStatus === 1 ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày tạo tài khoản
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.createdAt
                    ? dayjs(lecturer.user.createdAt).format('DD/MM/YYYY HH:mm')
                    : 'Chưa cập nhật'
                  }
                </Typography>
              </div>
            </Col>
          </Row>

          {/* Giấy tờ cá nhân */}
          <Divider orientation="left" style={{ color: colors.warning }}>
            🪪 Giấy tờ cá nhân
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Số CCCD
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.citizenIdCard || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày cấp
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.issuedDate
                    ? dayjs(lecturer.user.issuedDate).format('DD/MM/YYYY')
                    : 'Chưa cập nhật'
                  }
                </Typography>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nơi cấp
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.issuedPlace || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nơi sinh
                </Typography>
                <Typography variant="body1">
                  {lecturer.user?.placeOfBirth || 'Chưa cập nhật'}
                </Typography>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default TeacherDetailModal;