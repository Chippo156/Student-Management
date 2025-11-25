import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Spin,
  Collapse,
  Table,
  Tag,
  Row,
  Col,
  Tooltip,
  Statistic,
  Progress,
  Space,
  Divider,
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import academicProgramService from '../../../service/academicProgramService';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Theme-aware column definitions
const getColumns = (theme) => [
  {
    title: 'STT',
    dataIndex: 'index',
    align: 'center',
    width: 60,
    render: (_, __, i) => (
      <span style={{ fontWeight: 600, color: theme.palette.primary.main }}>
        {i + 1}
      </span>
    ),
  },
  {
    title: 'Tên môn học/Học phần',
    dataIndex: 'courseName',
    width: 220,
    render: (text, record) => (
      <span
        style={{
          fontWeight: 500,
          color: record.isRequired
            ? theme.palette.text.primary
            : theme.palette.primary.main,
        }}
      >
        {text}
        {record.isRequired ? null : (
          <Tag color="blue" style={{ marginLeft: 8 }}>
            Tự chọn
          </Tag>
        )}
      </span>
    ),
  },
  {
    title: 'Mã học phần',
    dataIndex: 'courseCode',
    align: 'center',
    width: 120,
    render: (v) => (
      <span style={{ color: theme.palette.secondary.main, fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: 'Số TC',
    dataIndex: 'totalCredits',
    align: 'center',
    width: 70,
    render: (v) => (
      <span style={{ color: theme.palette.warning.main, fontWeight: 600 }}>
        {v}
      </span>
    ),
  },
  {
    title: 'Số tiết LT',
    dataIndex: 'creditsTheory',
    align: 'center',
    width: 90,
    render: (v) => (
      <span style={{ color: theme.palette.success.main }}>{v}</span>
    ),
  },
  {
    title: 'Số tiết TH',
    dataIndex: 'creditsLab',
    align: 'center',
    width: 90,
    render: (v) => (
      <span style={{ color: theme.palette.secondary.light }}>{v}</span>
    ),
  },
  {
    title: 'Loại',
    dataIndex: 'courseType',
    align: 'center',
    width: 100,
    render: (v) =>
      v === 'Bắt buộc' ? (
        <Tag color="green" style={{ fontWeight: 500 }}>
          Bắt buộc
        </Tag>
      ) : (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          Tự chọn
        </Tag>
      ),
  },
  {
    title: <Tooltip title="Học phần tiên quyết">Tiên quyết</Tooltip>,
    dataIndex: 'prerequisites',
    width: 180,
    render: (arr) =>
      arr && arr.length ? (
        arr.map((p) => (
          <Tag
            color={p.isCompleted ? 'green' : 'red'}
            key={p.courseId}
            style={{ fontWeight: 500 }}
          >
            {p.courseCode}
          </Tag>
        ))
      ) : (
        <Text type="secondary">-</Text>
      ),
  },
  {
    title: <Tooltip title="Trạng thái học tập">Tình Trạng</Tooltip>,
    dataIndex: 'studentProgress',
    align: 'center',
    width: 100,
    render: (progress) => {
      if (!progress || !progress.hasTaken) {
        return <Tag color="default" style={{ fontSize: '11px' }}>Chưa học</Tag>;
      }

      if (progress.isCompleted) {
        return <Tag color="success" style={{ fontSize: '11px' }}>Đã đạt</Tag>;
      } else {
        return <Tag color="warning" style={{ fontSize: '11px' }}>Chưa đạt</Tag>;
      }
    },
  },
  {
    title: <Tooltip title="Điểm cuối kỳ">Điểm CK</Tooltip>,
    dataIndex: 'studentProgress',
    align: 'center',
    width: 70,
    render: (progress) => {
      if (!progress || !progress.hasTaken) {
        return <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>;
      }
      return (
        <span style={{ fontWeight: 600, color: theme.palette.primary.main, fontSize: '12px' }}>
          {progress.finalScore?.toFixed(1) || '0.0'}
        </span>
      );
    },
  },
  {
    title: <Tooltip title="Điểm chữ">Điểm chữ</Tooltip>,
    dataIndex: 'studentProgress',
    align: 'center',
    width: 70,
    render: (progress) => {
      if (!progress || !progress.hasTaken) {
        return <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>;
      }
      const colorMap = {
        'A+': '#52c41a',
        'A': '#52c41a',
        'B+': '#1890ff',
        'B': '#1890ff',
        'C+': '#faad14',
        'C': '#faad14',
        'D+': '#ff7a45',
        'D': '#ff7a45',
        'F': '#ff4d4f',
      };
      return (
        <span
          style={{
            fontWeight: 600,
            color: colorMap[progress.gradeLetter] || theme.palette.text.primary,
            fontSize: '12px'
          }}
        >
          {progress.gradeLetter || '-'}
        </span>
      );
    },
  },
  {
    title: <Tooltip title="Học kỳ đã học">Học kỳ</Tooltip>,
    dataIndex: 'studentProgress',
    align: 'center',
    width: 120,
    render: (progress) => {
      if (!progress || !progress.hasTaken) {
        return <Text type="secondary" style={{ fontSize: '11px' }}>-</Text>;
      }

      // Xử lý hiển thị học kỳ, chỉ hiển thị một khi có trùng lặp
      let semesterDisplay = progress.semesterTaken;
      if (semesterDisplay && semesterDisplay.includes(' | Đang học: ')) {
        const parts = semesterDisplay.split(' | Đang học: ');
        if (parts[0] === parts[1]) {
          semesterDisplay = parts[0]; // Chỉ hiển thị một phần khi trùng nhau
        }
      }

      return (
        <Text style={{ fontSize: '10px', maxWidth: '120px', display: 'block', wordBreak: 'break-all' }}>
          {semesterDisplay}
        </Text>
      );
    },
  },
];

const CurriculumPage = () => {
  const theme = useTheme();
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const columns = getColumns(theme);

  useEffect(() => {
    const fetchCurriculum = async () => {
      setLoading(true);
      const data = await academicProgramService.getMyProgramCurriculum();
      setCurriculum(data);
      setLoading(false);
    };
    fetchCurriculum();
  }, []);

  // Use actual student data from API response
  const completedCredits = curriculum
    ? curriculum.studentTotalCompletedCredits
    : 0;
  const completionRate = curriculum
    ? curriculum.studentCompletionRate
    : 0;

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <style>
        {`
          .curriculum-page .ant-card {
            background: ${theme.palette.background.paper} !important;
            border-color: ${theme.palette.divider} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .curriculum-page .ant-statistic-title {
            color: ${theme.palette.text.secondary} !important;
          }
          .curriculum-page .ant-divider {
            border-color: ${theme.palette.divider} !important;
          }
          .curriculum-page .ant-tag {
            border-color: ${theme.palette.divider} !important;
          }
        `}
      </style>
      <div className="curriculum-page">
      <Title
        level={2}
        style={{
          color: theme.palette.primary.main,
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        <BookOutlined style={{ marginRight: 8 }} />
        Chương trình khung
      </Title>
      <Spin spinning={loading}>
        {curriculum ? (
          <>
            {/* Quick Stats */}
         <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: theme.palette.text.secondary }}>
                        Tổng TC yêu cầu
                      </span>
                    }
                    value={curriculum.totalCreditsRequired}
                    prefix={
                      <BookOutlined
                        style={{ color: theme.palette.primary.main }}
                      />
                    }
                    valueStyle={{ color: theme.palette.primary.main }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: theme.palette.text.secondary }}>
                        TC đã hoàn thành
                      </span>
                    }
                    value={completedCredits}
                    prefix={
                      <CheckCircleOutlined
                        style={{ color: theme.palette.success.main }}
                      />
                    }
                    valueStyle={{ color: theme.palette.success.main }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: theme.palette.text.secondary }}>
                        TC còn lại
                      </span>
                    }
                    value={
                      curriculum.totalCreditsRequired - completedCredits
                    }
                    prefix={
                      <ClockCircleOutlined
                        style={{ color: theme.palette.warning.main }}
                      />
                    }
                    valueStyle={{ color: theme.palette.warning.main }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: theme.palette.text.secondary }}>
                        Tiến độ
                      </span>
                    }
                    value={completionRate}
                    suffix="%"
                    prefix={
                      <TrophyOutlined
                        style={{ color: theme.palette.secondary.main }}
                      />
                    }
                    valueStyle={{ color: theme.palette.secondary.main }}
                  />
                </Card>
              </Col>
            </Row>


            {/* Student Progress Details */}
            <Card
              bordered={false}
              style={{
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Space>
                    <Text strong style={{ color: theme.palette.primary.main }}>
                      Chương trình:
                    </Text>
                    <Text style={{ color: theme.palette.text.primary }}>
                      {curriculum.programName}
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Space>
                    <Text strong style={{ color: theme.palette.primary.main }}>
                      Khoa:
                    </Text>
                    <Text style={{ color: theme.palette.text.primary }}>
                      {curriculum.facultyName}
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Space>
                    <Text strong style={{ color: theme.palette.primary.main }}>
                      Ngành:
                    </Text>
                    <Text style={{ color: theme.palette.text.primary }}>
                      {curriculum.departmentName}
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Space>
                    <Text strong style={{ color: theme.palette.primary.main }}>
                      Bậc đào tạo:
                    </Text>
                    <Text style={{ color: theme.palette.text.primary }}>
                      {curriculum.degreeLevel}
                    </Text>
                  </Space>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="TC Bắt buộc đã đạt"
                    value={curriculum.studentCompletedRequiredCredits}
                    suffix={`/${curriculum.totalRequiredCredits}`}
                    valueStyle={{ color: theme.palette.success.main }}
                  />
                  <Progress
                    percent={Math.round((curriculum.studentCompletedRequiredCredits / curriculum.totalRequiredCredits) * 100)}
                    strokeColor={theme.palette.success.main}
                    showInfo={false}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="TC Tự chọn đã đạt"
                    value={curriculum.studentCompletedOptionalCredits}
                    suffix={`/${curriculum.totalOptionalCredits}`}
                    valueStyle={{ color: theme.palette.secondary.main }}
                  />
                  <Progress
                    percent={Math.round((curriculum.studentCompletedOptionalCredits / curriculum.totalOptionalCredits) * 100)}
                    strokeColor={theme.palette.secondary.main}
                    showInfo={false}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Môn học đã hoàn thành"
                    value={curriculum.studentCompletedRequiredCourses + curriculum.studentCompletedOptionalCourses}
                    suffix={`/${curriculum.requiredCourseCount + curriculum.optionalCourseCount}`}
                    valueStyle={{ color: theme.palette.primary.main }}
                  />
                  <Progress
                    percent={Math.round(((curriculum.studentCompletedRequiredCourses + curriculum.studentCompletedOptionalCourses) / (curriculum.requiredCourseCount + curriculum.optionalCourseCount)) * 100)}
                    strokeColor={theme.palette.primary.main}
                    showInfo={false}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </Col>
              </Row>
              <Divider />
              <div>
                <Text
                  strong
                  style={{
                    color: theme.palette.text.secondary,
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Tiến độ hoàn thành tổng thể
                </Text>
                <Progress
                  percent={completionRate}
                  strokeColor={{
                    '0%': theme.palette.primary.main,
                    '100%': theme.palette.success.main,
                  }}
                  status="active"
                  // format={(percent) => `${percent}% (${completedCredits}/${curriculum.totalCreditsRequired} TC)`}
                />
              </div>
            </Card>
            <style>
              {`
                .curriculum-collapse {
                  background: transparent !important;
                  border: none !important;
                }
                .curriculum-collapse .ant-collapse-header {
                  color: ${theme.palette.text.primary} !important;
                  background: ${alpha(theme.palette.primary.main, 0.05)} !important;
                  border: 1px solid ${alpha(theme.palette.primary.main, 0.1)} !important;
                  border-radius: 8px !important;
                }
                .curriculum-collapse .ant-collapse-content {
                  background: ${theme.palette.background.paper} !important;
                  border: none !important;
                }
                .ant-table {
                  background: ${theme.palette.background.paper} !important;
                  color: ${theme.palette.text.primary} !important;
                }
                .ant-table-thead > tr > th {
                  background: ${alpha(theme.palette.primary.main, 0.08)} !important;
                  color: ${theme.palette.text.primary} !important;
                  border-color: ${theme.palette.divider} !important;
                }
                .ant-table-tbody > tr > td {
                  border-color: ${theme.palette.divider} !important;
                }
              `}
            </style>
            <Collapse
              accordion
              className="curriculum-collapse"
            >
              {curriculum.semesterCourses?.map((semester) => (
                <Panel
                  header={
                    <span>
                      <b style={{ color: theme.palette.primary.main }}>
                        {semester.semesterName}
                      </b>{' '}
                      &nbsp;
                      <Text type="secondary">
                        (Tổng số TC:{' '}
                        <span
                          style={{
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          {semester.totalCredits}
                        </span>
                        , &nbsp;Bắt buộc:{' '}
                        <span
                          style={{
                            color: theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        >
                          {semester.requiredCredits}
                        </span>
                        , &nbsp;Tự chọn:{' '}
                        <span
                          style={{
                            color: theme.palette.secondary.main,
                            fontWeight: 600,
                          }}
                        >
                          {semester.optionalCredits}
                        </span>
                        )
                      </Text>
                    </span>
                  }
                  key={semester.semesterNumber}
                >
                  <Table
                    columns={columns}
                    dataSource={semester.courses.map((c, i) => ({
                      ...c,
                      key: c.curriculumCourseId,
                      index: i + 1,
                    }))}
                    pagination={false}
                    size="small"
                    bordered
                    scroll={{ x: 1000 }}
                  />
                </Panel>
              ))}
            </Collapse>

            {/* Summary Card */}
            <Card
              bordered={false}
              title={
                <Text strong style={{ color: theme.palette.text.primary }}>
                  Tổng kết chương trình
                </Text>
              }
              style={{
                marginTop: 24,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div
                    style={{
                      padding: 16,
                      background: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: theme.palette.primary.main,
                        display: 'block',
                        fontSize: 14,
                      }}
                    >
                      Tổng TC yêu cầu
                    </Text>
                    <Text
                      style={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        fontSize: 28,
                      }}
                    >
                      {curriculum.totalCreditsRequired}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div
                    style={{
                      padding: 16,
                      background: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: theme.palette.success.main,
                        display: 'block',
                        fontSize: 14,
                      }}
                    >
                      Tổng TC bắt buộc
                    </Text>
                    <Text
                      style={{
                        color: theme.palette.success.main,
                        fontWeight: 700,
                        fontSize: 28,
                      }}
                    >
                      {curriculum.totalRequiredCredits}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div
                    style={{
                      padding: 16,
                      background: alpha(theme.palette.secondary.main, 0.1),
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: theme.palette.secondary.main,
                        display: 'block',
                        fontSize: 14,
                      }}
                    >
                      Tổng TC tự chọn
                    </Text>
                    <Text
                      style={{
                        color: theme.palette.secondary.main,
                        fontWeight: 700,
                        fontSize: 28,
                      }}
                    >
                      {curriculum.totalOptionalCredits}
                    </Text>
                  </div>
                </Col>
              </Row>
              <Divider />
              <Paragraph type="secondary">
                <b>Ghi chú:</b> <br />
                <Tag color="green" style={{ fontWeight: 500 }}>Đã đạt</Tag> Môn học đã hoàn thành &nbsp;
                <Tag color="warning" style={{ fontWeight: 500 }}>Chưa đạt</Tag> Môn học đã học nhưng không đạt yêu cầu &nbsp;
                <Tag color="default" style={{ fontWeight: 500 }}>Chưa học</Tag> Môn học chưa đăng ký học tập
                <br /><br />
                <b>Trạng thái học tập:</b> Hiển thị tiến độ học tập thực tế của sinh viên bao gồm điểm số, điểm chữ và học kỳ đã hoàn thành.
              </Paragraph>
            </Card>
          </>
        ) : (
          <Card
            bordered={false}
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Paragraph style={{ color: theme.palette.text.secondary }}>
              Không có dữ liệu chương trình khung.
            </Paragraph>
          </Card>
        )}
      </Spin>
      </div>
    </div>
  );
};

export default CurriculumPage;
