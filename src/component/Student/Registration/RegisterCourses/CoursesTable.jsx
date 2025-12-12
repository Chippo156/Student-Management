import React, { forwardRef } from 'react';
import { Table, Spin } from 'antd';
import { CheckSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import { tableRowClassName } from './helpers';

const CoursesTable = forwardRef(
  (
    {
      theme,
      courses,
      selectedCourse,
      handleCourseSelect,
      loading,
      currentSemesterNumber,
      curriculumData,
      suggestedCourseBadgeRef,
      prerequisiteColumnRef,
    },
    ref
  ) => {
    // Helper function to check if course is recommended for selected semester
    const isSuggestedCourse = (course) => {
      if (!curriculumData || !curriculumData.semesterCourses) return false;

      // Find the course in curriculum data
      for (const semesterData of curriculumData.semesterCourses) {
        const foundCourse = semesterData.courses.find(
          (c) => c.courseCode === course.courseCode
        );

        if (foundCourse) {
          // ONLY highlight required courses of the SELECTED semester that are not completed
          return (
            foundCourse.isRequired &&
            foundCourse.semesterSuggested === currentSemesterNumber &&
            !foundCourse.studentProgress?.isCompleted
          );
        }
      }

      return false;
    };

    // Find index of first suggested course for ref targeting
    const firstSuggestedIndex = courses.findIndex((course) =>
      isSuggestedCourse(course)
    );

    const courseColumns = [
      {
        title: 'STT',
        dataIndex: 'index',
        align: 'center',
        width: 50,
        render: (_, __, i) => i + 1,
      },
      { title: 'Mã HP', dataIndex: 'courseCode', align: 'center', width: 110 },
      {
        title: 'Tên môn học',
        dataIndex: 'courseName',
        width: 250,
        render: (text, record, index) => {
          const isSuggested = isSuggestedCourse(record);
          return (
            <span
              style={{
                fontWeight: isSuggested ? 600 : 400,
                color: isSuggested
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
              }}
            >
              {text}
              {isSuggested && (
                <span
                  ref={index === 0 ? suggestedCourseBadgeRef : null}
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: theme.palette.success.main,
                    fontWeight: 600,
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(76, 175, 80, 0.15)'
                      : 'rgba(76, 175, 80, 0.1)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  ★ Đề xuất HK{currentSemesterNumber}
                </span>
              )}
            </span>
          );
        },
      },
      { title: 'TC', dataIndex: 'totalCredits', align: 'center', width: 60 },
      {
        title: 'Bắt buộc',
        dataIndex: 'isRequired',
        align: 'center',
        width: 80,
        render: (v) =>
          v ? (
            <CheckSquareOutlined
              style={{ color: theme.palette.success.main, fontSize: 18 }}
            />
          ) : (
            <DeleteOutlined
              style={{ color: theme.palette.error.main, fontSize: 18 }}
            />
          ),
      },
      {
        title: (
          <span ref={prerequisiteColumnRef}>Học phần tiên quyết</span>
        ),
        dataIndex: 'prerequisites',
        width: 200,
        render: (arr) =>
          arr && arr.length
            ? arr.map((p) => `${p.courseCode} (${p.courseName})`).join(', ')
            : '',
      },
      {
        title: 'Ghi chú',
        dataIndex: 'registrationNote',
        width: 180,
        render: (v) => (
          <span style={{ color: theme.palette.error.main }}>{v}</span>
        ),
      },
    ];

    return (
      <div ref={ref}>
        <div
          style={{
            fontWeight: 600,
            color: theme.palette.warning.dark,
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ
        </div>
        <Spin spinning={loading}>
          <Table
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedCourse
                ? [selectedCourse.curriculumCourseId]
                : [],
              onChange: (_, rows) => handleCourseSelect(rows[0]),
              columnTitle: '',
            }}
            columns={courseColumns}
            dataSource={courses.map((c, i) => ({
              ...c,
              key: c.curriculumCourseId,
              index: i + 1,
            }))}
            pagination={false}
            bordered
            rowClassName={(r, i) =>
              tableRowClassName(r, i, selectedCourse, null)
            }
            onRow={(record, index) => ({
              ref: index === firstSuggestedIndex ? suggestedCourseBadgeRef : undefined,
            })}
            locale={{ emptyText: 'Không có môn học' }}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        </Spin>
      </div>
    );
  }
);

CoursesTable.displayName = 'CoursesTable';

export default CoursesTable;
