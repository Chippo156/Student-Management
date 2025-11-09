import React from 'react';
import { Card, Space, Typography } from 'antd';
import { alpha } from '@mui/material/styles';

const { Text } = Typography;

const ScheduleLegend = ({ theme }) => (
  <Card
    className="schedule-legend"
    bordered={false}
    style={{
      marginTop: 16,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      background: theme.palette.background.paper,
    }}
  >
    <Space size={20} wrap>
      <Space size={8}>
        <div
          style={{
            width: 20,
            height: 14,
            background: alpha(theme.palette.primary.main, 0.1),
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 3,
          }}
        />
        <Text style={{ fontSize: 13, color: theme.palette.text.primary }}>
          Lý thuyết
        </Text>
      </Space>
      <Space size={8}>
        <div
          style={{
            width: 20,
            height: 14,
            background: alpha(theme.palette.success.main, 0.1),
            border: `2px solid ${theme.palette.success.main}`,
            borderRadius: 3,
          }}
        />
        <Text style={{ fontSize: 13, color: theme.palette.text.primary }}>
          Thực hành
        </Text>
      </Space>
      <Space size={8}>
        <div
          style={{
            width: 20,
            height: 14,
            background: alpha(theme.palette.warning.main, 0.1),
            border: `2px solid ${theme.palette.warning.main}`,
            borderRadius: 3,
          }}
        />
        <Text style={{ fontSize: 13, color: theme.palette.text.primary }}>
          Lịch thi
        </Text>
      </Space>
    </Space>
  </Card>
);

export default ScheduleLegend;
