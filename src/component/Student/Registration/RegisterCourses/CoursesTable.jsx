import React, { forwardRef } from 'react';
import { Table, Spin } from 'antd';
import { CheckSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import { tableRowClassName } from './helpers';

const CoursesTable = forwardRef(({
  theme,
  courses,
  selectedCourse,
  handleCourseSelect,
  loading,
}, ref) => {
  const courseColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      render: (_, __, i) => i + 1,
    },
    { title: 'Mã HP', dataIndex: 'courseCode', align: 'center', width: 110 },
    { title: 'Tên môn học', dataIndex: 'courseName', width: 250 },
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
      title: 'Học phần tiên quyết',
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
          size="small"
          bordered
          rowClassName={(r, i) => tableRowClassName(r, i, selectedCourse, null)}
          locale={{ emptyText: 'Không có môn học' }}
          scroll={{ x: 1000 }}
        />
      </Spin>
    </div>
  );
});

CoursesTable.displayName = 'CoursesTable';

export default CoursesTable;
