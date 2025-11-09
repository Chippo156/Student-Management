import React from 'react';
import { Card, Row, Col, Progress, Alert, Typography } from 'antd';
import { useTheme, alpha } from '@mui/material/styles';

const { Title, Text } = Typography;

/**
 * GraduateOverview - Tổng quan tiến độ tốt nghiệp
 */
const GraduateOverview = ({ overallProgress, totalCompleted, totalRequired }) => {
  const theme = useTheme();

  return (
    <Card
      bordered={false}
      style={{
        marginBottom: 24,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              percent={overallProgress}
              size={140}
              strokeColor={{
                '0%': theme.palette.primary.main,
                '100%': theme.palette.success.main,
              }}
            />
            <Title level={4} style={{ marginTop: 16, color: theme.palette.text.primary }}>
              Tiến độ tổng thể
            </Title>
          </div>
        </Col>
        <Col xs={24} md={16}>
          <Alert
            message={
              overallProgress >= 80
                ? 'Bạn đang trên đường hoàn thành tốt nghiệp!'
                : 'Cần nỗ lực thêm để đạt yêu cầu tốt nghiệp'
            }
            description={
              overallProgress >= 80
                ? 'Chỉ còn vài bước nữa là bạn sẽ đạt đủ điều kiện tốt nghiệp. Hãy tiếp tục duy trì!'
                : 'Hãy tập trung hoàn thành các yêu cầu còn lại để đảm bảo đủ điều kiện tốt nghiệp đúng hạn.'
            }
            type={overallProgress >= 80 ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div
            style={{
              padding: 16,
              background: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 8,
            }}
          >
            <Text
              strong
              style={{ color: theme.palette.text.primary, display: 'block', marginBottom: 12 }}
            >
              Tổng quan tín chỉ
            </Text>
            <Progress
              percent={Math.round((totalCompleted / totalRequired) * 100)}
              strokeColor={{
                '0%': theme.palette.secondary.main,
                '100%': theme.palette.success.main,
              }}
              format={() => `${totalCompleted} / ${totalRequired}`}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Đã hoàn thành
                  </Text>
                  <Text strong style={{ fontSize: 18, color: theme.palette.success.main }}>
                    {totalCompleted}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Còn lại
                  </Text>
                  <Text strong style={{ fontSize: 18, color: theme.palette.warning.main }}>
                    {totalRequired - totalCompleted}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Tổng yêu cầu
                  </Text>
                  <Text strong style={{ fontSize: 18, color: theme.palette.primary.main }}>
                    {totalRequired}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default GraduateOverview;
