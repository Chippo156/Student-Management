import React from 'react';
import { Modal, Avatar, Tag, Divider, Row, Col, Descriptions, Timeline } from 'antd';
import { UserOutlined, BookOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

/**
 * StudentDetailModal - Modal hiển thị chi tiết thông tin sinh viên
 */
const StudentDetailModal = ({ open, onCancel, student }) => {
  const theme = useTheme();

  if (!student) return null;

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

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Đang học',
      1: 'Tạm nghỉ',
      2: 'Đã tốt nghiệp',
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'success',
      1: 'error',
      2: 'info',
    };
    return colorMap[status] || 'default';
  };

  const getGenderText = (gender) => {
    const genderMap = {
      1: 'Nam',
      2: 'Nữ',
      3: 'Khác',
    };
    return genderMap[gender] || 'Chưa cập nhật';
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
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.8)} 100%)`,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            color: '#fff',
            gap: 24,
          }}
        >
          <Avatar
            src={student.user?.avatarUrl}
            size={80}
            icon={<UserOutlined />}
            style={{
              background: '#fff',
              color: colors.primary,
              fontWeight: 700,
              fontSize: 36,
              border: '3px solid #fff',
              boxShadow: `0 2px 8px ${alpha(colors.primary, 0.3)}`,
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
              {student.user?.fullName || 'Chưa cập nhật'}
            </div>
            <div style={{ fontSize: 18, marginTop: 4 }}>
              MSSV: {student.mssv}
            </div>
            <div style={{ marginTop: 8 }}>
              <Tag
                color={getStatusColor(student.studentStatus)}
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 8,
                  padding: '2px 12px',
                }}
              >
                {getStatusText(student.studentStatus)}
              </Tag>
            </div>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Content */}
        <div style={{ padding: 32, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Thông tin cá nhân */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🧍 Thông tin cá nhân
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Họ và tên
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {student.user?.fullName || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Giới tính
                </Typography>
                <Typography variant="body1">
                  {getGenderText(student.user?.gender)}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày sinh
                </Typography>
                <Typography variant="body1">
                  {student.user?.dateOfBirth
                    ? dayjs(student.user.dateOfBirth).format('DD/MM/YYYY')
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
                    {student.user?.email || 'Chưa cập nhật'}
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
                    {student.user?.phone || 'Chưa cập nhật'}
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
                  {student.user?.address || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Địa chỉ tạm trú
                </Typography>
                <Typography variant="body1">
                  {student.user?.temporaryAddress || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Dân tộc
                </Typography>
                <Typography variant="body1">
                  {student.user?.ethnicity || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tôn giáo
                </Typography>
                <Typography variant="body1">
                  {student.user?.religion || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Quốc tịch
                </Typography>
                <Typography variant="body1">
                  {student.user?.nationality || 'Chưa cập nhật'}
                </Typography>
              </div>
            </Col>
          </Row>

          {/* Thông tin học tập */}
          <Divider orientation="left" style={{ color: colors.info }}>
            🎓 Thông tin học tập
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Lớp
                </Typography>
                <Chip
                  icon={<BookOutlined />}
                  label={student.class?.className || 'Chưa cập nhật'}
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
                  Chương trình đào tạo
                </Typography>
                <Typography variant="body1">
                  {student.class?.program?.programName || 'Chưa cập nhật'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.class?.program?.degreeLevel || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Khoa/Chuyên ngành
                </Typography>
                <Chip
                  label={student.class?.program?.department?.departmentName || 'Chưa cập nhật'}
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
                  Năm nhập học
                </Typography>
                <Tag color="blue">{student.yearOfAdmission || 'Chưa cập nhật'}</Tag>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Trạng thái sinh viên
                </Typography>
                <Tag color={getStatusColor(student.studentStatus)}>
                  {getStatusText(student.studentStatus)}
                </Tag>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày tạo tài khoản
                </Typography>
                <Typography variant="body1">
                  {student.user?.createdAt
                    ? dayjs(student.user.createdAt).format('DD/MM/YYYY HH:mm')
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
                  {student.user?.citizenIdCard || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày cấp
                </Typography>
                <Typography variant="body1">
                  {student.user?.issuedDate
                    ? dayjs(student.user.issuedDate).format('DD/MM/YYYY')
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
                  {student.user?.issuedPlace || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nơi sinh
                </Typography>
                <Typography variant="body1">
                  {student.user?.placeOfBirth || 'Chưa cập nhật'}
                </Typography>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailModal;