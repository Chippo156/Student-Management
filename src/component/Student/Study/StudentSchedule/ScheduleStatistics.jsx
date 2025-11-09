import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';

const ScheduleStatistics = ({
  todayItems,
  upcomingItems,
  completedItems,
  percentProgress,
  theme,
}) => (
  <Row
    id="student-schedule-stats-bar"
    gutter={[16, 16]}
    style={{ marginBottom: 20 }}
  >
    <Col xs={24} sm={12} lg={6}>
      <Card
        bordered={false}
        style={{
          background: theme.palette.primary.main,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Statistic
          title={<span style={{ color: '#fff', fontSize: 12 }}>Hôm nay</span>}
          value={todayItems.length}
          prefix={<CalendarOutlined style={{ color: '#fff', fontSize: 18 }} />}
          valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
          suffix={<span style={{ color: '#fff', fontSize: 13 }}>lịch</span>}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card
        bordered={false}
        style={{
          background: theme.palette.success.main,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Statistic
          title={<span style={{ color: '#fff', fontSize: 12 }}>Sắp tới</span>}
          value={upcomingItems.length}
          prefix={
            <ClockCircleOutlined style={{ color: '#fff', fontSize: 18 }} />
          }
          valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
          suffix={<span style={{ color: '#fff', fontSize: 13 }}>lịch</span>}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card
        bordered={false}
        style={{
          background: theme.palette.secondary.main,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Statistic
          title={
            <span style={{ color: '#fff', fontSize: 12 }}>Đã hoàn thành</span>
          }
          value={completedItems.length}
          prefix={
            <CheckCircleOutlined style={{ color: '#fff', fontSize: 18 }} />
          }
          valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
          suffix={<span style={{ color: '#fff', fontSize: 13 }}>lịch</span>}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card
        bordered={false}
        style={{
          background: theme.palette.warning.main,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Statistic
          title={
            <span style={{ color: '#fff', fontSize: 12 }}>Tiến độ tuần</span>
          }
          value={percentProgress}
          prefix={<FireOutlined style={{ color: '#fff', fontSize: 18 }} />}
          suffix={<span style={{ color: '#fff', fontSize: 13 }}>%</span>}
          valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
        />
        <Progress
          percent={percentProgress}
          strokeColor="#fff"
          trailColor="rgba(255,255,255,0.3)"
          showInfo={false}
          style={{ marginTop: 8 }}
        />
      </Card>
    </Col>
  </Row>
);

export default ScheduleStatistics;
