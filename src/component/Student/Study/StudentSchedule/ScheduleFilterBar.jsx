import React from 'react';
import { Card, Radio, DatePicker, Button, Space, Row, Col } from 'antd';
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
}) => {
  const isMobile = window.innerWidth < 600;
  const isTablet = window.innerWidth >= 600 && window.innerWidth < 960;

  return (
    <Card
      id="student-schedule-filter-bar"
      bordered={false}
      style={{
        marginBottom: 20,
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        background: theme.palette.background.paper,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Filter Type */}
        <Col xs={24} sm={24} md={14} lg={12}>
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
        </Col>

        {/* Date Navigation */}
        <Col xs={24} sm={24} md={10} lg={12}>
          <Space wrap style={{ width: '100%', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            <Button.Group>
              <Button icon={<LeftOutlined />} onClick={goPrevWeek} />
              <DatePicker
                value={baseDate}
                onChange={(d) => d && setBaseDate(dayjs(d))}
                format="DD/MM/YYYY"
                style={{ width: isMobile ? 140 : 150 }}
                allowClear={false}
              />
              <Button icon={<RightOutlined />} onClick={goNextWeek} />
            </Button.Group>

      <Space size={8} style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
        <Button onClick={handleToday} type="default">
          <CalendarOutlined /> Hiện tại
        </Button>
        <Button
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          type="secondary"
        >
          In lịch
        </Button>
        <Button icon={<LeftOutlined />} onClick={goPrevWeek} />
        <Button icon={<RightOutlined />} onClick={goNextWeek} />
      </Space>
    </div>
  </Card>
);

export default ScheduleFilterBar;
