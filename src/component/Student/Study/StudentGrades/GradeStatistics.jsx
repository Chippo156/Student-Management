import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
  TrophyOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

const GradeStatistics = ({ summary, user, theme }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
      <Card
        style={{
          minHeight: 140,
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
        }}
        loading={!summary}
      >
        <Statistic
          title={
            <span style={{ color: theme.palette.text.secondary }}>
              GPA tích lũy
            </span>
          }
          value={summary?.gpa ?? 0}
          precision={2}
          prefix={
            <TrophyOutlined style={{ color: theme.palette.warning.main }} />
          }
          valueStyle={{
            color:
              summary?.gpa >= 3.0
                ? theme.palette.success.main
                : summary?.gpa >= 2.0
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
          }}
        />
        <Progress
          percent={Math.min((summary?.gpa / 4) * 100, 100)}
          strokeColor={
            summary?.gpa >= 3.0
              ? theme.palette.success.main
              : summary?.gpa >= 2.0
                ? theme.palette.warning.main
                : theme.palette.error.main
          }
          showInfo={false}
          size="small"
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
      <Card
        style={{
          minHeight: 140,
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
        }}
        loading={!summary}
      >
        <Statistic
          title={
            <span style={{ color: theme.palette.text.secondary }}>
              Tín chỉ tích lũy
            </span>
          }
          value={summary?.completedCredits ?? 0}
          suffix={summary ? `/ ${user.totalCreditsRequired}` : ''}
          prefix={
            <CheckCircleOutlined
              style={{ color: theme.palette.primary.main }}
            />
          }
          valueStyle={{ color: theme.palette.primary.main }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
      <Card
        style={{
          minHeight: 140,
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
        }}
        loading={!summary}
      >
        <Statistic
          title={
            <span style={{ color: theme.palette.text.secondary }}>
              Môn học rớt
            </span>
          }
          value={summary?.failedCourses?.length ?? 0}
          prefix={
            <WarningOutlined style={{ color: theme.palette.warning.main }} />
          }
          valueStyle={{
            color:
              (summary?.failedCourses?.length ?? 0) > 0
                ? theme.palette.error.main
                : theme.palette.success.main,
          }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
      <Card
        style={{
          minHeight: 140,
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
        }}
        loading={!summary}
      >
        <Statistic
          title={
            <span style={{ color: theme.palette.text.secondary }}>
              Tỷ lệ hoàn thành
            </span>
          }
          value={summary?.completionRate ?? 0}
          suffix="%"
          prefix={
            <LineChartOutlined
              style={{ color: theme.palette.secondary.main }}
            />
          }
          valueStyle={{ color: theme.palette.secondary.main }}
        />
      </Card>
    </Col>
  </Row>
);

export default GradeStatistics;
