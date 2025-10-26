import React from 'react';
import { Card, Tag, Select } from 'antd';

const StudentClassList = ({
  semesterReport,
  semesters,
  selectedSemesterId,
  handleSemesterChange,
  colors,
  sectionTitleStyle,
}) => (
  <Card
    style={{
      background: colors.bgCard,
      color: colors.fg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      height: '100%',
    }}
    title={<span style={sectionTitleStyle}>Lớp học phần</span>}
    extra={
      <Select
        style={{ minWidth: 120 }}
        value={selectedSemesterId ?? undefined}
        onChange={handleSemesterChange}
        options={semesters.map((s) => ({
          value: s.semesterId,
          label: `${s.year} - ${s.term}`,
        }))}
        placeholder="Chọn học kỳ"
      />
    }
    styles={{
      header: {
        borderBottom: `1px solid ${colors.border}`,
      },
    }}
  >
    {semesterReport?.courses && semesterReport.courses.length > 0 ? (
      semesterReport.courses.map((course) => (
        <div
          key={course.courseId}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            marginBottom: 8,
            padding: 10,
          }}
        >
          <span style={{ color: colors.primary, fontWeight: 600 }}>
            {course.courseCode} - {course.courseName}
          </span>
          <Tag color="blue">{course.totalCredits} TC</Tag>
        </div>
      ))
    ) : (
      <div style={{ color: colors.sub, textAlign: 'center', padding: 12 }}>
        Không có lớp học phần
      </div>
    )}
  </Card>
);

export default StudentClassList;
