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
} from 'antd';
import academicProgramService from '../../../service/academicProgramService';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Thêm màu cho từng học kỳ
const semesterColors = [
  '#e6f7ff', // blue
  '#fffbe6', // yellow
  '#f6ffed', // green
  '#fff0f6', // pink
  '#f9f0ff', // purple
  '#f0f5ff', // light blue
  '#fff1f0', // red
  '#f0fff0', // mint
  '#f0f5ff', // light blue
  '#f6ffed', // green
];

const columns = [
  {
    title: 'STT',
    dataIndex: 'index',
    align: 'center',
    width: 60,
    render: (_, __, i) => (
      <span style={{ fontWeight: 600, color: '#1677ff' }}>{i + 1}</span>
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
          color: record.isRequired ? '#222' : '#0958d9',
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
      <span style={{ color: '#722ed1', fontWeight: 500 }}>{v}</span>
    ),
  },
  {
    title: 'Số TC',
    dataIndex: 'totalCredits',
    align: 'center',
    width: 70,
    render: (v) => (
      <span style={{ color: '#d4380d', fontWeight: 600 }}>{v}</span>
    ),
  },
  {
    title: 'Số tiết LT',
    dataIndex: 'creditsTheory',
    align: 'center',
    width: 90,
    render: (v) => <span style={{ color: '#389e0d' }}>{v}</span>,
  },
  {
    title: 'Số tiết TH',
    dataIndex: 'creditsLab',
    align: 'center',
    width: 90,
    render: (v) => <span style={{ color: '#13c2c2' }}>{v}</span>,
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
];

const CurriculumPage = () => {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurriculum = async () => {
      setLoading(true);
      const data = await academicProgramService.getMyProgramCurriculum();
      setCurriculum(data);
      setLoading(false);
    };
    fetchCurriculum();
  }, []);

  return (
    <Card
      style={{
        padding: 24,
        // background: 'linear-gradient(90deg, #e6f0ff 0%, #f9f0ff 100%)',
        borderRadius: 16,
        boxShadow: '0 2px 12px #e6e6e6',
      }}
    >
      <Title level={2} style={{ color: '#1677ff', fontWeight: 700 }}>
        Chương trình khung
      </Title>
      <Spin spinning={loading}>
        {curriculum ? (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col>
                <Text strong style={{ color: '#0050b3' }}>
                  Chương trình:
                </Text>{' '}
                {curriculum.programName}
              </Col>
              <Col>
                <Text strong style={{ color: '#0050b3' }}>
                  Khoa:
                </Text>{' '}
                {curriculum.facultyName}
              </Col>
              <Col>
                <Text strong style={{ color: '#0050b3' }}>
                  Ngành:
                </Text>{' '}
                {curriculum.departmentName}
              </Col>
              <Col>
                <Text strong style={{ color: '#0050b3' }}>
                  Bậc đào tạo:
                </Text>{' '}
                {curriculum.degreeLevel}
              </Col>
            </Row>
            <Collapse accordion>
              {curriculum.semesterCourses?.map((semester, idx) => (
                <Panel
                  header={
                    <span>
                      <b style={{ color: '#096dd9' }}>
                        {semester.semesterName}
                      </b>{' '}
                      &nbsp;
                      <Text type="secondary">
                        (Tổng số TC:{' '}
                        <span style={{ color: '#d4380d', fontWeight: 600 }}>
                          {semester.totalCredits}
                        </span>
                        , &nbsp;Bắt buộc:{' '}
                        <span style={{ color: '#389e0d', fontWeight: 600 }}>
                          {semester.requiredCredits}
                        </span>
                        , &nbsp;Tự chọn:{' '}
                        <span style={{ color: '#0958d9', fontWeight: 600 }}>
                          {semester.optionalCredits}
                        </span>
                        )
                      </Text>
                    </span>
                  }
                  key={semester.semesterNumber}
                  style={{
                    background: semesterColors[idx % semesterColors.length],
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
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
                    scroll={{ x: 900 }}
                    rowClassName={(_, i) =>
                      i % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                    }
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                    }}
                  />
                </Panel>
              ))}
            </Collapse>
            <div style={{ marginTop: 24 }}>
              <Row gutter={32}>
                <Col>
                  <Text strong style={{ color: '#d4380d' }}>
                    Tổng TC yêu cầu:{' '}
                  </Text>
                  <Text style={{ color: '#d4380d', fontWeight: 700 }}>
                    {curriculum.totalCreditsRequired}
                  </Text>
                </Col>
                <Col>
                  <Text strong style={{ color: '#389e0d' }}>
                    Tổng TC bắt buộc:{' '}
                  </Text>
                  <Text style={{ color: '#389e0d', fontWeight: 700 }}>
                    {curriculum.totalRequiredCredits}
                  </Text>
                </Col>
                <Col>
                  <Text strong style={{ color: '#0958d9' }}>
                    Tổng TC tự chọn:{' '}
                  </Text>
                  <Text style={{ color: '#0958d9', fontWeight: 700 }}>
                    {curriculum.totalOptionalCredits}
                  </Text>
                </Col>
              </Row>
            </div>
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              <b>Ghi chú:</b> <br />
              <Tag color="green" style={{ fontWeight: 500 }} /> Môn học/Học phần
              đã (hoặc đang) học &nbsp;
              <Tag color="red" style={{ fontWeight: 500 }} /> Môn học sinh viên
              chưa đăng ký học tập
            </Paragraph>
            <style>
              {`
                .table-row-light { background: #f6faff !important; }
                .table-row-dark { background: #fff !important; }
                .ant-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
                  background: #fff;
                  border-radius: 8px;
                }
              `}
            </style>
          </>
        ) : (
          <Paragraph>Không có dữ liệu chương trình khung.</Paragraph>
        )}
      </Spin>
    </Card>
  );
};

export default CurriculumPage;
