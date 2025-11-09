import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';

/**
 * GraduateStatistics - Thống kê tổng quan tốt nghiệp
 */
const GraduateStatistics = ({
  overallProgress,
  completedRequirements,
  totalRequirements,
  upcomingMilestones,
  totalCompleted,
  totalRequired,
}) => {
  const theme = useTheme();

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Statistic
            title={<span style={{ color: theme.palette.text.secondary }}>Tiến độ tổng thể</span>}
            value={overallProgress}
            suffix="%"
            prefix={<TrophyOutlined style={{ color: theme.palette.primary.main }} />}
            valueStyle={{ color: theme.palette.primary.main }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Statistic
            title={
              <span style={{ color: theme.palette.text.secondary }}>Yêu cầu hoàn thành</span>
            }
            value={completedRequirements}
            suffix={`/ ${totalRequirements}`}
            prefix={<CheckCircleOutlined style={{ color: theme.palette.success.main }} />}
            valueStyle={{ color: theme.palette.success.main }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Statistic
            title={
              <span style={{ color: theme.palette.text.secondary }}>Mục tiêu sắp tới</span>
            }
            value={upcomingMilestones}
            prefix={<ClockCircleOutlined style={{ color: theme.palette.warning.main }} />}
            valueStyle={{ color: theme.palette.warning.main }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Statistic
            title={
              <span style={{ color: theme.palette.text.secondary }}>Tín chỉ tích lũy</span>
            }
            value={totalCompleted}
            suffix={`/ ${totalRequired}`}
            prefix={<StarOutlined style={{ color: theme.palette.secondary.main }} />}
            valueStyle={{ color: theme.palette.secondary.main }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default GraduateStatistics;
