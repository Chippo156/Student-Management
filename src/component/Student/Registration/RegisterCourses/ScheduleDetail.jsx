import React, { forwardRef } from 'react';
import { Card, Table, Select, Button } from 'antd';
import {
  UnorderedListOutlined,
  CheckSquareOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { prepareScheduleData, scheduleRowClassName } from './helpers';

const ScheduleDetail = forwardRef((props, ref) => {
  const {
    theme,
    selectedSection,
    schedule,
    practiceGroups,
    selectedPracticeGroup,
    setSelectedPracticeGroup,
    handleEnroll,
    enrollButtonRef,
    practiceGroupSelectRef,
  } = props;
  if (!selectedSection) return null;

  const scheduleColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 50,
      align: 'center',
      render: (_, __, i) => i + 1,
    },
    { title: 'Nhóm', dataIndex: 'groupName', width: 110, align: 'center' },
    { title: 'Thứ', dataIndex: 'dayOfWeek', width: 100, align: 'center' },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      width: 160,
      align: 'center',
      render: (_, r) =>
        r.startTime && r.endTime
          ? `${r.startTime} - ${r.endTime}`
          : r.timeSlot || '',
    },
    { title: 'Phòng', dataIndex: 'room', width: 120, align: 'center' },
    { title: 'Loại', dataIndex: 'type', width: 120, align: 'center' },
    {
      title: 'Số lượng',
      dataIndex: 'currentCount',
      width: 110,
      align: 'center',
      render: (_, r) =>
        r.maxCapacity ? `${r.currentCount || 0}/${r.maxCapacity}` : '',
    },
  ];

  const dataSource = prepareScheduleData(
    schedule,
    practiceGroups,
    selectedPracticeGroup
  );

  return (
    <Card
      ref={ref}
      title={
        <span
          style={{
            color: theme.palette.warning.dark,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          <UnorderedListOutlined
            style={{ marginRight: 8, color: theme.palette.warning.dark }}
          />
          CHI TIẾT LỚP HỌC PHẦN
        </span>
      }
      style={{
        marginTop: 24,
        background: theme.palette.background.paper,
        borderColor: theme.palette.divider,
      }}
      extra={
        practiceGroups.length > 0 && (
          <div ref={practiceGroupSelectRef}>
            <Select
              style={{ minWidth: 220 }}
              value={selectedPracticeGroup}
              onChange={setSelectedPracticeGroup}
              placeholder="Chọn nhóm thực hành"
              suffixIcon={<DownOutlined />}
              options={practiceGroups.map((g) => ({
                value: g.practiceGroupId,
                label: `${g.groupName} (${g.currentCount}/${g.maxCapacity})`,
                disabled: !g.isAvailable,
              }))}
              allowClear
            />
          </div>
        )
      }
    >
      <Table
        columns={scheduleColumns}
        dataSource={dataSource}
        pagination={false}
        bordered
        locale={{ emptyText: 'Không có lịch học' }}
        scroll={{ x: 'max-content' }}
        size="middle"
        rowClassName={scheduleRowClassName}
        style={{ marginBottom: 16 }}
      />
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button
          ref={enrollButtonRef}
          type="primary"
          icon={<CheckSquareOutlined />}
          onClick={handleEnroll}
          disabled={
            !selectedSection ||
            (practiceGroups.length > 0 && !selectedPracticeGroup)
          }
        >
          Đăng ký môn học
        </Button>
      </div>
    </Card>
  );
});

export default ScheduleDetail;
