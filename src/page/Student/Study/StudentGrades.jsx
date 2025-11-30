import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import gradeService from '../../../service/gradeService';
import reportService from '../../../service/reportService';
import { mapCourseGrades } from '../../../component/Student/Study/StudentGrades/utils';
import { getGradeColumns } from '../../../component/Student/Study/StudentGrades/GradeColumns';
import GradeStatistics from '../../../component/Student/Study/StudentGrades/GradeStatistics';
import GradeTable from '../../../component/Student/Study/StudentGrades/GradeTable';

const { Title } = Typography;

const StudentGrades = () => {
  const theme = useTheme();
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

  // Generate table data from semester grades
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

  const columns = getGradeColumns(theme);

  return (
    <div
      style={{
        padding:
          window.innerWidth < 600 ? 16 : window.innerWidth < 960 ? 16 : 24,
        background: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <style>
        {`
          .student-grades .ant-card {
            background: ${theme.palette.background.paper} !important;
            border-color: ${theme.palette.divider} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .student-grades .ant-statistic-title {
            color: ${theme.palette.text.secondary} !important;
          }
          .student-grades .ant-progress {
            color: ${theme.palette.text.primary} !important;
          }
        `}
      </style>
      <div className="student-grades">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Title
            level={2}
            style={{
              color: theme.palette.text.primary,
              fontSize:
                window.innerWidth < 600
                  ? '1.5rem'
                  : window.innerWidth < 960
                    ? '1.75rem'
                    : '2rem',
            }}
          >
            <BookOutlined
              style={{ marginRight: 8, color: theme.palette.primary.main }}
            />
            Kết quả học tập
          </Title>
        </div>

        <GradeStatistics summary={summary} user={user} theme={theme} />

        <GradeTable columns={columns} dataSource={tableData} theme={theme} />
      </div>
    </div>
  );
};

export default StudentGrades;
