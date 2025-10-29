import React, { useEffect, useState } from 'react';
import { Card, Table, Progress, Typography, Row, Col, Statistic } from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import gradeService from '../../../service/gradeService';
import reportService from '../../../service/reportService';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const REGULAR_COLS = 5;
const PRACTICE_COLS = 3;

// Màu điểm chữ
const getGradeColor = (grade) => {
  switch (grade) {
    case 'A':
      return 'green';
    case 'B+':
    case 'A-':
      return 'blue';
    case 'B':
    case 'B-':
      return 'cyan';
    case 'C+':
    case 'C':
      return 'orange';
    case 'C-':
    case 'D+':
    case 'D':
      return 'gold';
    case 'F':
      return 'red';
    default:
      return '#222';
  }
};

// Màu xếp loại
const getRankColor = (rank) => {
  if (!rank) return '#aaa';
  if (rank.includes('Xuất sắc')) return '#722ed1';
  if (rank.includes('Giỏi')) return '#1890ff';
  if (rank.includes('Khá')) return '#52c41a';
  if (rank.includes('Trung bình')) return '#faad14';
  if (rank.includes('Yếu')) return '#ff4d4f';
  return '#aaa';
};

// Mapping xếp loại theo điểm tổng kết (10)
const getRankByScore = (score) => {
  if (score === '' || score === null || score === undefined) return '';
  const s = Number(score);
  if (s >= 8.5) return 'Giỏi';
  if (s >= 7.0) return 'Khá';
  if (s >= 5.5) return 'Trung bình';
  if (s >= 4.0) return 'Yếu';
  return 'Kém';
};

// Hàm kiểm tra ĐẠT: chỉ đạt nếu điểm tổng kết >= 5.5 (Trung bình trở lên)
const isPassed = (record) => {
  // Nếu API trả về passed thì ưu tiên, nếu không thì tự tính
  if (
    record.passed !== undefined &&
    record.passed !== null &&
    record.passed !== ''
  ) {
    return (
      record.passed === true || record.passed === 1 || record.passed === '1'
    );
  }
  // Tự tính theo điểm tổng kết
  const score = Number(record.finalScore);
  return !isNaN(score) && score >= 5.5;
};

// Cột Table
const columns = [
  {
    title: 'STT',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center',
    fixed: 'left',
  },
  {
    title: 'Mã lớp học phần',
    dataIndex: 'courseCode',
    key: 'courseCode',
    width: 180,
    fixed: 'left',
  },
  {
    title: 'Tên môn học/học phần',
    dataIndex: 'courseName',
    key: 'courseName',
    width: 240,
    fixed: 'left',
  },
  {
    title: 'Số tín chỉ',
    dataIndex: 'credits',
    key: 'credits',
    width: 80,
    align: 'center',
    fixed: 'left',
  },
  {
    title: 'Giữa kỳ',
    dataIndex: 'midterm',
    key: 'midterm',
    width: 80,
    align: 'center',
  },
  ...Array.from({ length: REGULAR_COLS }).map((_, i) => ({
    title: `Thường kỳ ${i + 1}`,
    dataIndex: `regular${i + 1}`,
    key: `regular${i + 1}`,
    width: 80,
    align: 'center',
  })),
  ...Array.from({ length: PRACTICE_COLS }).map((_, i) => ({
    title: `Thực hành ${i + 1}`,
    dataIndex: `practice${i + 1}`,
    key: `practice${i + 1}`,
    width: 80,
    align: 'center',
  })),
  {
    title: 'Cuối kỳ',
    dataIndex: 'final',
    key: 'final',
    width: 80,
    align: 'center',
  },
  {
    title: 'Điểm tổng kết',
    dataIndex: 'finalScore',
    key: 'finalScore',
    width: 100,
    align: 'center',
  },
  {
    title: 'Thang điểm 4',
    dataIndex: 'gpa4',
    key: 'gpa4',
    width: 90,
    align: 'center',
  },
  {
    title: 'Điểm chữ',
    dataIndex: 'gradeLetter',
    key: 'gradeLetter',
    width: 80,
    align: 'center',
    render: (value) => (
      <span
        style={{
          color: getGradeColor(value),
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    ),
  },
  {
    title: 'Xếp loại',
    dataIndex: 'rank',
    key: 'rank',
    width: 90,
    align: 'center',
    render: (value, record) => {
      // Nếu có rank từ API thì dùng, nếu không thì mapping theo điểm tổng kết
      const rank = value || getRankByScore(record.finalScore);
      return (
        <span
          style={{
            color: getRankColor(rank),
            fontWeight: 600,
          }}
        >
          {rank}
        </span>
      );
    },
  },
  {
    title: 'Ghi chú',
    dataIndex: 'note',
    key: 'note',
    width: 120,
    align: 'center',
  },
  { title: 'TBQT', dataIndex: 'tbqt', key: 'tbqt', width: 70, align: 'center' },
  {
    title: 'Đạt',
    dataIndex: 'passed',
    key: 'passed',
    width: 60,
    align: 'center',
    render: (value, record) =>
      isPassed(record) ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" />
      ) : (
        <CloseCircleTwoTone twoToneColor="#ff4d4f" />
      ),
  },
];

const mapCourseGrades = (courseGrades) =>
  (courseGrades || []).map((course, idx) => {
    let midterm = '';
    let final = '';
    let regulars = [];
    let practices = [];
    (course.assessments || []).forEach((a) => {
      if (a.assessmentTypeId === 3) midterm = a.score ?? ''; // Giữa kỳ
      if (a.assessmentTypeId === 4) final = a.score ?? ''; // Cuối kỳ
      if (a.assessmentTypeId === 1 && Array.isArray(a.regularPointsDetails))
        regulars = a.regularPointsDetails.map((r) => r.score ?? '');
      if (a.assessmentTypeId === 2 && Array.isArray(a.regularPointsDetails))
        practices = a.regularPointsDetails.map((r) => r.score ?? '');
    });
    while (regulars.length < REGULAR_COLS) regulars.push('');
    while (practices.length < PRACTICE_COLS) practices.push('');
    return {
      key: course.sectionId,
      index: idx + 1,
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      credits: course.credits ?? '',
      midterm,
      final,
      finalScore: course.finalScore ?? '',
      gradeLetter: course.gradeLetter || '',
      gpa4: course.gpa4 ?? '',
      rank: course.rank || '',
      note: course.note || '',
      tbqt: course.tbqt || '',
      passed: course.passed ?? '',
      ...Object.fromEntries(regulars.map((v, i) => [`regular${i + 1}`, v])),
      ...Object.fromEntries(practices.map((v, i) => [`practice${i + 1}`, v])),
    };
  });

const StudentGrades = () => {
  const user = useSelector((state) => state.user.account);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [gradeData, setGradeData] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await reportService.getAcademicSummaryBySemester(0);
        if (res.success) setSummary(res.data);
      } catch (e) {
        setSummary(null);
      }
      setLoadingSummary(false);
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoadingGrades(true);
      const res = await gradeService.getMyAllGrades();
      if (res) setGradeData(res);
      setLoadingGrades(false);
    };
    fetchGrades();
  }, []);

  const semesters = gradeData?.semesterGrades || [];
  let tableData = [];

  semesters.forEach((semester) => {
    tableData.push({
      isGroup: true,
      key: `group-${semester.semesterId}`,
      semesterName: semester.semesterName,
      semesterGPA10: semester.semesterGPA10,
    });

    const courses = mapCourseGrades(semester.courseGrades).map((c) => ({
      ...c,
      semesterId: semester.semesterId,
    }));
    tableData = tableData.concat(courses);

    const col1Rows = [
      {
        colLabel: 'Điểm trung bình học kỳ hệ 10',
        colValue: semester.semesterGPA10,
      },
      {
        colLabel: 'Điểm trung bình tích lũy',
        colValue: semester.cumulativeGPA10,
      },
      {
        colLabel: 'Tổng số tín chỉ đã đăng ký',
        colValue: semester.totalCreditsRegistered,
      },
      {
        colLabel: 'Tổng số tín chỉ đạt',
        colValue: semester.totalCreditsEarned,
      },
      {
        colLabel: 'Xếp loại học lực tích lũy',
        colValue: semester.cumulativeRank,
      },
    ];

    const col2Rows = [
      {
        colLabel: 'Điểm trung bình học kỳ hệ 4',
        colValue: semester.semesterGPA4,
      },
      {
        colLabel: 'Điểm trung bình tích lũy (hệ 4)',
        colValue: semester.cumulativeGPA4,
      },
      {
        colLabel: 'Tổng số tín chỉ tích lũy',
        colValue: semester.totalCreditsEarned,
      },
      {
        colLabel: 'Tổng số tín chỉ nợ tính đến hiện tại',
        colValue: semester.totalCreditsDebt,
      },
      { colLabel: 'Xếp loại học lực học kỳ', colValue: semester.semesterRank },
    ];

    for (let i = 0; i < col1Rows.length; i++) {
      tableData.push({
        key: `summary-${semester.semesterId}-${i}`,
        isSummary: true,
        col1Label: col1Rows[i].colLabel,
        col1Value: col1Rows[i].colValue,
        col2Label: col2Rows[i].colLabel,
        col2Value: col2Rows[i].colValue,
      });
    }
  });

  // Custom render
  const mergedColumns = columns.map((col, idx) => ({
    ...col,
    onCell: (record) => {
      if (record.isGroup)
        return {
          style: { background: '#f6faff', fontWeight: 600, border: 'none' },
        };
      if (record.isSummary)
        return { style: { background: '#f8fafd', fontWeight: 500 } };
      return {};
    },
    render: (value, record) => {
      // === Nhóm học kỳ (chiếm full width)
      if (record.isGroup && col.dataIndex === 'index') {
        return {
          children: (
            <div
              style={{
                width: '100%',
                textAlign: 'left',
                color: '#1677ff',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {record.semesterName}
              <span
                style={{ marginLeft: 16, color: '#722ed1', fontWeight: 500 }}
              >
                GPA: {record.semesterGPA10 ?? ''}
              </span>
            </div>
          ),
          props: { colSpan: columns.length },
        };
      }
      if (record.isGroup) return { children: null, props: { colSpan: 0 } };

      // === Summary chia 2 cột lớn
      if (record.isSummary) {
        if (col.dataIndex === 'index')
          return {
            children: `${record.col1Label}: ${record.col1Value ?? ''}`,
            props: { colSpan: 2 },
          };
        if (col.dataIndex === 'courseCode')
          return { children: null, props: { colSpan: 0 } };

        if (col.dataIndex === 'courseName')
          return {
            children: `${record.col2Label}: ${record.col2Value ?? ''}`,
            props: { colSpan: 2 },
          };
        if (col.dataIndex === 'credits')
          return { children: null, props: { colSpan: 0 } };

        return '';
      }

      return col.render ? col.render(value, record) : value;
    },
  }));

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2}>
          <BookOutlined style={{ marginRight: 8 }} />
          Kết quả học tập
        </Title>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={{ minHeight: 140 }} loading={!summary}>
            <Statistic
              title="GPA tích lũy"
              value={summary?.gpa ?? 0}
              precision={2}
              prefix={<TrophyOutlined />}
              valueStyle={{
                color:
                  summary?.gpa >= 3.0
                    ? '#52c41a'
                    : summary?.gpa >= 2.0
                      ? '#faad14'
                      : '#ff4d4f',
              }}
            />
            <Progress
              percent={Math.min((summary?.gpa / 4) * 100, 100)}
              strokeColor={
                summary?.gpa >= 3.0
                  ? '#52c41a'
                  : summary?.gpa >= 2.0
                    ? '#faad14'
                    : '#ff4d4f'
              }
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ minHeight: 140 }} loading={!summary}>
            <Statistic
              title="Tín chỉ tích lũy"
              value={summary?.completedCredits ?? 0}
              suffix={summary ? `/ ${user.totalCreditsRequired}` : ''}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ minHeight: 140 }} loading={!summary}>
            <Statistic
              title="Môn học rớt"
              value={summary?.failedCourses?.length ?? 0}
              prefix={<WarningOutlined />}
              valueStyle={{
                color:
                  (summary?.failedCourses?.length ?? 0) > 0
                    ? '#ff4d4f'
                    : '#52c41a',
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ minHeight: 140 }} loading={!summary}>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={summary?.completionRate ?? 0}
              suffix="%"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ width: '100%', overflowX: 'auto', background: '#fff' }}>
        <Table
          columns={mergedColumns}
          dataSource={tableData}
          pagination={false}
          bordered
          rowKey="key"
          scroll={{ x: 'max-content' }}
          style={{ maxWidth: 1200 }}
        />
      </div>
    </div>
  );
};

export default StudentGrades;
