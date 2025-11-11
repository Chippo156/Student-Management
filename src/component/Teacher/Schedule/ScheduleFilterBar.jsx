import React from 'react';
import { Button, Space, Select } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  PrinterOutlined,
} from '@ant-design/icons';

const ScheduleFilterBar = ({
  filterType,
  handleFilterChange,
  baseDate,
  handleToday,
  handlePrint,
  goPrevWeek,
  goNextWeek,
  theme,
}) => {
  return (
    <div
      id="teacher-schedule-filter-bar"
      style={{
        marginBottom: 20,
        padding: 16,
        background: theme.palette.background.paper,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          <Select
            value={filterType}
            onChange={handleFilterChange}
            style={{ width: 200 }}
            options={[
              { label: 'Tất cả lịch', value: 'all' },
              { label: 'Lý thuyết', value: 'theory' },
              { label: 'Thực hành', value: 'practice' },
            ]}
          />
        </Space>
        <Space wrap>
          <Button icon={<LeftOutlined />} onClick={goPrevWeek}>
            Tuần trước
          </Button>
          <Button icon={<CalendarOutlined />} onClick={handleToday}>
            Hôm nay
          </Button>
          <Button icon={<RightOutlined />} onClick={goNextWeek}>
            Tuần sau
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In lịch
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default ScheduleFilterBar;
