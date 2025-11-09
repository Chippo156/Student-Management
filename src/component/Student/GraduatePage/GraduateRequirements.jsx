import React from 'react';
import { Card, Row, Col, Progress, Tag, Typography, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import { getStatusColor, getStatusText } from './constants';

const { Text } = Typography;

/**
 * GraduateRequirements - Danh sách yêu cầu tốt nghiệp
 */
const GraduateRequirements = ({ requirements }) => {
  const theme = useTheme();

  return (
    <Card
      bordered={false}
      title={
        <Space>
          <BookOutlined style={{ color: theme.palette.primary.main }} />
          <Text strong style={{ color: theme.palette.text.primary }}>
            Yêu cầu tốt nghiệp
          </Text>
        </Space>
      }
      style={{
        marginBottom: 24,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Row gutter={[16, 16]}>
        {requirements.map((req) => (
          <Col xs={24} md={12} key={req.id}>
            <div
              style={{
                padding: 16,
                background: alpha(
                  req.status === 'completed'
                    ? theme.palette.success.main
                    : req.status === 'in-progress'
                      ? theme.palette.primary.main
                      : theme.palette.warning.main,
                  0.05
                ),
                border: `1px solid ${alpha(
                  req.status === 'completed'
                    ? theme.palette.success.main
                    : req.status === 'in-progress'
                      ? theme.palette.primary.main
                      : theme.palette.warning.main,
                  0.2
                )}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text strong style={{ color: theme.palette.text.primary }}>
                  {req.category}
                </Text>
                <Tag color={getStatusColor(req.status)}>{getStatusText(req.status)}</Tag>
              </div>
              <Progress
                percent={Math.round((req.completed / req.total) * 100)}
                format={() => `${req.completed}/${req.total}`}
                strokeColor={
                  req.status === 'completed'
                    ? theme.palette.success.main
                    : req.status === 'in-progress'
                      ? theme.palette.primary.main
                      : theme.palette.warning.main
                }
              />
              <Text
                type="secondary"
                style={{ fontSize: 12, marginTop: 8, display: 'block' }}
              >
                {req.description}
              </Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default GraduateRequirements;
