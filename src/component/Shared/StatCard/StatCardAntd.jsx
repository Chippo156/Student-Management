import React from 'react';
import { Card, Space, Typography, Avatar } from 'antd';

const { Title, Text } = Typography;

/**
 * Reusable Statistics Card Component for Ant Design pages
 * @param {Object} props
 * @param {string} props.label - Label for the statistic
 * @param {number|string} props.value - Value to display
 * @param {React.Component} props.icon - Icon component from @ant-design/icons
 * @param {string} props.color - Color in hex format (e.g., '#1677ff')
 * @param {string} props.bgColor - Background color in hex format
 */
const StatCardAntd = ({
  label,
  value,
  icon: IconComponent,
  color = '#1677ff',
  bgColor = '#e6f4ff',
}) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        border: `1px solid ${color}20`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: 24,
        },
      }}
    >
      <Space direction="horizontal" size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            {label}
          </Text>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Title>
        </div>
        <Avatar
          size={64}
          style={{
            backgroundColor: bgColor,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          icon={IconComponent && <IconComponent style={{ fontSize: 32 }} />}
        />
      </Space>
    </Card>
  );
};

export default StatCardAntd;
