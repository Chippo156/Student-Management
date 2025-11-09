import React from 'react';
import { Card, Radio, DatePicker, Button, Space } from 'antd';
import {
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  PrinterOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const ScheduleFilterBar = ({
  filterType,
  handleFilterChange,
  baseDate,
  setBaseDate,
  handleToday,
  handlePrint,
  goPrevWeek,
  goNextWeek,
  theme,
}) => (
  <Card
    id="student-schedule-filter-bar"
    bordered={false}
    style={{
      marginBottom: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      background: theme.palette.background.paper,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <Radio.Group
        value={filterType}
        onChange={(e) => handleFilterChange(e.target.value)}
        buttonStyle="solid"
      >
        <Radio.Button value="all">
          <CalendarOutlined /> Tất cả
        </Radio.Button>
        <Radio.Button value="class">
          <BookOutlined /> Lý thuyết
        </Radio.Button>
        <Radio.Button value="assignment">
          <FileTextOutlined /> Thực hành
        </Radio.Button>
        <Radio.Button value="exam">
          <TrophyOutlined /> Thi
        </Radio.Button>
      </Radio.Group>

      <DatePicker
        value={baseDate}
        onChange={(d) => d && setBaseDate(dayjs(d))}
        format="DD/MM/YYYY"
        style={{ minWidth: 140 }}
        allowClear={false}
      />

      <Space size={8} style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
        <Button onClick={handleToday} type="default">
          <CalendarOutlined /> Hiện tại
        </Button>
        <Button icon={<PrinterOutlined />} onClick={handlePrint} type="primary">
          In lịch
        </Button>
        <Button icon={<LeftOutlined />} onClick={goPrevWeek} />
        <Button icon={<RightOutlined />} onClick={goNextWeek} />
      </Space>
    </div>
  </Card>
);

export default ScheduleFilterBar;
