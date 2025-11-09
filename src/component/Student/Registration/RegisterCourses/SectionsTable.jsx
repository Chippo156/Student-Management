import React from 'react';
import { Table, Radio, Checkbox, Spin } from 'antd';
import { tableRowClassName } from './helpers';

const SectionsTable = ({
  theme,
  sections,
  selectedSection,
  handleSectionSelect,
  loading,
  selectedCourse,
  showOnlyNonConflict,
  setShowOnlyNonConflict,
}) => {
  const sectionColumns = [
    {
      title: '',
      dataIndex: 'radio',
      align: 'center',
      width: 15,
      render: (_, record) => (
        <Radio
          checked={selectedSection?.sectionId === record.sectionId}
          onChange={() => handleSectionSelect(record)}
        />
      ),
    },
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 15,
      render: (_, __, i) => i + 1,
    },
    { title: 'Mã LHP', dataIndex: 'sectionId', align: 'center', width: 30 },
    {
      title: 'Tên môn học',
      dataIndex: 'courseName',
      align: 'center',
      width: 100,
    },
    {
      title: 'Lớp dự kiến',
      dataIndex: 'className',
      align: 'center',
      width: 40,
    },
    { title: 'Giảng viên', dataIndex: 'lecturerName', width: 80 },
    {
      title: 'Sĩ số tối đa',
      dataIndex: 'maxCapacity',
      align: 'center',
      width: 30,
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'currentEnrollment',
      align: 'center',
      width: 30,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isRegistrationOpen',
      align: 'center',
      width: 50,
      render: (v) => (
        <span style={{ color: v ? 'green' : 'red', fontWeight: 500 }}>
          {v ? 'Mở đăng ký' : 'Đã khóa'}
        </span>
      ),
    },
  ];

  return selectedCourse ? (
    <>
      <div
        style={{
          fontWeight: 600,
          color: theme.palette.warning.dark,
          fontSize: 16,
          margin: '24px 0 8px',
        }}
      >
        LỚP HỌC PHẦN CHỜ ĐĂNG KÝ
        <Checkbox
          style={{
            marginLeft: 24,
            color: theme.palette.error.main,
            fontWeight: 500,
          }}
          checked={showOnlyNonConflict}
          onChange={(e) => setShowOnlyNonConflict(e.target.checked)}
        >
          HIỆN THỊ LỚP HỌC PHẦN KHÔNG TRÙNG LỊCH
        </Checkbox>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={sectionColumns}
          dataSource={sections.map((s, i) => ({
            ...s,
            key: s.sectionId,
            index: i + 1,
          }))}
          pagination={false}
          size="small"
          bordered
          rowClassName={(r, i) =>
            tableRowClassName(r, i, null, selectedSection)
          }
          locale={{ emptyText: 'Chưa có lớp học phần cho môn này' }}
          scroll={{ x: 1000 }}
        />
      </Spin>
    </>
  ) : null;
};

export default SectionsTable;
