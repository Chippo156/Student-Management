import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import { Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useRegistration } from '../../../component/Student/Registration/RegisterCourses/useRegistration';
import SemesterFilter from '../../../component/Student/Registration/RegisterCourses/SemesterFilter';
import CoursesTable from '../../../component/Student/Registration/RegisterCourses/CoursesTable';
import SectionsTable from '../../../component/Student/Registration/RegisterCourses/SectionsTable';
import ScheduleDetail from '../../../component/Student/Registration/RegisterCourses/ScheduleDetail';
import EnrolledTable from '../../../component/Student/Registration/RegisterCourses/EnrolledTable';

const { Title } = Typography;

const RegisterCourses = () => {
  const theme = useTheme();
  const [showOnlyNonConflict, setShowOnlyNonConflict] = useState(false);

  const {
    semesters,
    semester,
    setSemester,
    registerType,
    setRegisterType,
    courses,
    sections,
    selectedCourse,
    selectedSection,
    schedule,
    loading,
    enrolledSections,
    practiceGroups,
    selectedPracticeGroup,
    setSelectedPracticeGroup,
    handleCourseSelect,
    handleSectionSelect,
    handleEnroll,
    handleDropEnrollment,
  } = useRegistration();

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: '100vh',
        p: 3,
        width: '100%',
      }}
    >
      <style>
        {`
        .ant-table-thead > tr > th {
          background: ${theme.palette.mode === 'dark' ? theme.palette.background.paper : alpha(theme.palette.primary.light, 0.15)} !important;
          color: ${theme.palette.text.primary} !important;
          font-weight: 600;
          text-align: center;
          border-color: ${theme.palette.divider} !important;
        }
        .ant-table-tbody > tr > td {
          border-color: ${theme.palette.divider} !important;
          color: ${theme.palette.text.primary} !important;
        }
        .table-row-light { background: ${theme.palette.background.paper}; }
        .table-row-dark { background: ${alpha(theme.palette.background.paper, 0.5)}; }
        .table-row-selected { background: ${alpha(theme.palette.warning.main, 0.15)} !important; }
        .schedule-row-lythuyet { background: ${alpha(theme.palette.primary.main, 0.1)} !important; }
        .schedule-row-thuchanh-active { background: ${alpha(theme.palette.warning.main, 0.12)} !important; }
        .schedule-row-thuchanh { background: ${theme.palette.background.paper} !important; }
        .ant-table { background: ${theme.palette.background.paper}; color: ${theme.palette.text.primary}; }
        .ant-select-selector { background: ${theme.palette.background.paper} !important; color: ${theme.palette.text.primary} !important; border-color: ${theme.palette.divider} !important; }
        .ant-radio-wrapper { color: ${theme.palette.text.primary}; }
        `}
      </style>
      <Card
        style={{
          borderRadius: 12,
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 2px 12px rgba(0,0,0,0.08)',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title
          level={3}
          style={{
            color: theme.palette.primary.main,
            textAlign: 'center',
            marginBottom: 28,
            fontWeight: 700,
          }}
        >
          ĐĂNG KÝ HỌC PHẦN
        </Title>

        <SemesterFilter
          theme={theme}
          semesters={semesters}
          semester={semester}
          setSemester={setSemester}
          registerType={registerType}
          setRegisterType={setRegisterType}
        />

        <CoursesTable
          theme={theme}
          courses={courses}
          selectedCourse={selectedCourse}
          handleCourseSelect={handleCourseSelect}
          loading={loading}
        />

        <SectionsTable
          theme={theme}
          sections={sections}
          selectedSection={selectedSection}
          handleSectionSelect={handleSectionSelect}
          loading={loading}
          selectedCourse={selectedCourse}
          showOnlyNonConflict={showOnlyNonConflict}
          setShowOnlyNonConflict={setShowOnlyNonConflict}
        />

        <ScheduleDetail
          theme={theme}
          selectedSection={selectedSection}
          schedule={schedule}
          practiceGroups={practiceGroups}
          selectedPracticeGroup={selectedPracticeGroup}
          setSelectedPracticeGroup={setSelectedPracticeGroup}
          handleEnroll={handleEnroll}
        />

        <EnrolledTable
          theme={theme}
          enrolledSections={enrolledSections}
          handleDropEnrollment={handleDropEnrollment}
          loading={loading}
        />
      </Card>
    </Box>
  );
};

export default RegisterCourses;
