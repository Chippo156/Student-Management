import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { BellOutlined, RightOutlined } from '@ant-design/icons';

const StudentRemindCard = ({ colors }) => (
  <Card
    style={{
      background: colors.bgCard,
      color: colors.fg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
    }}
  >
    <Row align="middle" justify="space-between">
      <Col>
        <div style={{ color: colors.sub, fontSize: 13 }}>Nhắc nhở mới</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: colors.fg }}>0</div>
      </Col>
      <Col>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.bgSoftInfo,
          }}
        >
          <BellOutlined style={{ color: colors.info }} />
        </div>
      </Col>
    </Row>
    <Button type="link" style={{ padding: 0, marginTop: 8 }}>
      Xem chi tiết <RightOutlined />
    </Button>
  </Card>
);

export default StudentRemindCard;
