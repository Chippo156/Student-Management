import React, { forwardRef } from 'react';
import { Card, Table, Switch, Empty, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SectionsTable = forwardRef((props, ref) => {
  const {
    theme,
    sections,
    selectedSection,
    handleSectionSelect,
    loading,
    selectedCourse,
    showOnlyNonConflict,
    setShowOnlyNonConflict,
  } = props;
  console.log(selectedCourse);
  // ✅ Luôn render Card (nhưng ẩn nếu chưa chọn môn)
  const displaySections = showOnlyNonConflict
    ? sections.filter((s) => !s.hasConflict)
    : sections;

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'sectionCode',
      key: 'sectionCode',
      align: 'center',
      width: 120,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturerName',
      align: 'center',
      key: 'lecturerName',
      width: 200,
    },
    {
      title: 'Thời gian',
      key: 'schedule',
      align: 'center',
      width: 200,
      render: (_, record) => {
        try {
          const startDate = record.startDate
            ? format(new Date(record.startDate), 'dd/MM/yyyy', { locale: vi })
            : '';
          const endDate = record.endDate
            ? format(new Date(record.endDate), 'dd/MM/yyyy', { locale: vi })
            : '';
          return (
            <span>
              {startDate} - {endDate}
            </span>
          );
        } catch {
          return (
            <span>
              {record.startDate} - {record.endDate}
            </span>
          );
        }
      },
    },
    {
      title: 'Sĩ số',
      key: 'capacity',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span>
          {record.currentEnrollment}/{record.maxCapacity}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (record.hasConflict) {
          return (
            <span style={{ color: theme.palette.error.main }}>
              ⚠️ Trùng lịch
            </span>
          );
        }
        if (record.currentCapacity >= record.maxCapacity) {
          return (
            <span style={{ color: theme.palette.error.main }}>❌ Đã đầy</span>
          );
        }
        return (
          <span style={{ color: theme.palette.success.main }}>✅ Còn chỗ</span>
        );
      },
    },
  ];
  return (
    <Card
      ref={ref} // ✅ Forward ref
      title={
        <Space
          align="center"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>
            <BookOutlined style={{ marginRight: 8 }} />
            Danh sách lớp học phần
          </span>
          {/* <Space>
            <span style={{ fontSize: 14, fontWeight: 400 }}>
              Chỉ hiển thị lớp không trùng lịch:
            </span>
            <Switch
              checked={showOnlyNonConflict}
              onChange={setShowOnlyNonConflict}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
          </Space> */}
        </Space>
      }
      style={{
        marginTop: 24,
        borderRadius: 8,
        background: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        // ✅ Ẩn khi chưa chọn môn, NHƯNG VẪN render (để Tour tìm thấy)
        visibility: selectedCourse ? 'visible' : 'hidden',
        height: selectedCourse ? 'auto' : 0,
        overflow: 'hidden',
      }}
      className="register-courses-sections-table" // ✅ Thêm class để debug
    >
      <Table
        columns={columns}
        dataSource={displaySections}
        rowKey="sectionId"
        loading={loading}
        pagination={false}
        size="middle"
        onRow={(record) => ({
          onClick: () => handleSectionSelect(record),
          style: {
            cursor: 'pointer',
            background:
              selectedSection?.sectionId === record.sectionId
                ? alpha(theme.palette.warning.main, 0.15)
                : undefined,
          },
        })}
        locale={{
          emptyText: (
            <Empty
              description="Không có lớp học phần nào phù hợp"
              style={{ color: theme.palette.text.secondary }}
            />
          ),
        }}
      />
    </Card>
  );
});

SectionsTable.displayName = 'SectionsTable';

export default SectionsTable;
