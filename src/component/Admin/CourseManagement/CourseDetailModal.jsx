import React from 'react';
import { Modal, Avatar, Tag, Divider, Row, Col, Descriptions, Timeline } from 'antd';
import { BookOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * CourseDetailModal - Modal hiển thị chi tiết thông tin môn học
 */
const CourseDetailModal = ({ open, onCancel, course }) => {
  const theme = useTheme();

  if (!course) return null;

  const colors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    primaryLight: alpha(theme.palette.primary.main, 0.1),
    successLight: alpha(theme.palette.success.main, 0.1),
    warningLight: alpha(theme.palette.warning.main, 0.1),
    infoLight: alpha(theme.palette.info.main, 0.1),
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
            size={80}
            icon={<BookOutlined />}
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
              {course.courseCode}
            </div>
            <div style={{ fontSize: 18, marginTop: 4 }}>
              {course.courseName}
            </div>
            <div style={{ marginTop: 8 }}>
              <Tag
                color={course.isRequired ? 'success' : 'warning'}
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 8,
                  padding: '2px 12px',
                }}
              >
                {course.courseType}
              </Tag>
            </div>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Content */}
        <div style={{ padding: 32, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Thông tin chung */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            📚 Thông tin chung
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tên môn học
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {course.courseName || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Mã môn học
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.primary }}>
                  {course.courseCode || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Loại môn học
                </Typography>
                <Chip
                  label={course.courseType}
                  size="small"
                  color={course.isRequired ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Bắt buộc
                </Typography>
                <Tag color={course.isRequired ? 'green' : 'orange'}>
                  {course.isRequired ? 'Bắt buộc' : 'Tự chọn'}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Chương trình đào tạo
                </Typography>
                <Typography variant="body1">
                  {course.programName || 'Chưa cập nhật'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {course.degreeLevel || 'Chưa cập nhật'}
                </Typography>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Chuyên ngành/Khoa
                </Typography>
                <Chip
                  label={course.departmentName}
                  size="small"
                  sx={{
                    bgcolor: colors.primaryLight,
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Học kỳ đề xuất
                </Typography>
                <Tag color="blue">HK {course.semesterSuggested}</Tag>
              </div>
            </Col>
          </Row>

          {/* Thông tin tín chỉ */}
          <Divider orientation="left" style={{ color: colors.success }}>
            ⏱️ Thông tin tín chỉ
          </Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.successLight, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
                  {course.totalCredits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng tín chỉ
                </Typography>
              </Box>
            </Col>
            <Col span={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.primaryLight, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
                  {course.creditsTheory}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lý thuyết
                </Typography>
              </Box>
            </Col>
            <Col span={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.warningLight, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.warning }}>
                  {course.creditsLab}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thực hành
                </Typography>
              </Box>
            </Col>
            <Col span={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: colors.infoLight, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.info }}>
                  {course.creditsExercise || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bài tập
                </Typography>
              </Box>
            </Col>
          </Row>

          {/* Môn tiên quyết */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <>
              <Divider orientation="left" style={{ color: colors.warning }}>
                🔗 Môn tiên quyết
              </Divider>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {course.prerequisites.map((prereq, index) => (
                  <Tag
                    key={index}
                    color="processing"
                    style={{
                      fontSize: 14,
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    {prereq.courseCode} - {prereq.courseName}
                  </Tag>
                ))}
              </div>
            </>
          )}

          {/* Mô tả (nếu có) */}
          {course.description && (
            <>
              <Divider orientation="left" style={{ color: colors.info }}>
                📝 Mô tả môn học
              </Divider>
              <Typography variant="body2" color="text.secondary">
                {course.description}
              </Typography>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CourseDetailModal;