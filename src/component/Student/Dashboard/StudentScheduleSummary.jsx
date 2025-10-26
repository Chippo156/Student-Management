import React from 'react';
import { Card, Row, Col } from 'antd';
import { CalendarOutlined, ReadOutlined } from '@ant-design/icons';

const StudentScheduleSummary = ({ scheduleCount, colors, loading }) => (
  <Row gutter={[16, 16]}>
    <Col span={12}>
      <Card
        style={{
          background: colors.bgCard,
          color: colors.fg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          textAlign: 'center',
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            margin: '0 auto 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.bgSoftSuccess,
          }}
        >
          <CalendarOutlined style={{ color: colors.success }} />
        </div>
        <div style={{ color: colors.sub, marginBottom: 4 }}>Lịch học</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {loading ? '...' : scheduleCount.countScheduleOfWeek}
        </div>
      </Card>
    </Col>
    <Col span={12}>
      <Card
        style={{
          background: colors.bgCard,
          color: colors.fg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          textAlign: 'center',
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            margin: '0 auto 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.bgSoftWarning,
          }}
        >
          <ReadOutlined style={{ color: colors.warning }} />
        </div>
        <div style={{ color: colors.sub, marginBottom: 4 }}>Lịch thi</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {loading ? '...' : scheduleCount.countTestOfWeek}
        </div>
      </Card>
    </Col>
  </Row>
);

export default StudentScheduleSummary;
