import React from 'react';
import { Card, Button, Tag, Typography, Space, Timeline, Empty } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { getStatusColor, getStatusText } from './constants';

const { Text } = Typography;

/**
 * GraduateTimeline - Lộ trình tốt nghiệp
 */
const GraduateTimeline = ({ milestones, onAddMilestone, onEditMilestone }) => {
  const theme = useTheme();

  return (
    <Card
      bordered={false}
      title={
        <Space>
          <CalendarOutlined style={{ color: theme.palette.primary.main }} />
          <Text strong style={{ color: theme.palette.text.primary }}>
            Lộ trình tốt nghiệp
          </Text>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddMilestone}>
          Thêm mục tiêu
        </Button>
      }
      style={{
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {milestones.length > 0 ? (
        <Timeline>
          {milestones
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((milestone) => (
              <Timeline.Item
                key={milestone.id}
                color={getStatusColor(milestone.status)}
                dot={
                  milestone.status === 'completed' ? (
                    <CheckCircleOutlined style={{ fontSize: '16px' }} />
                  ) : (
                    <ClockCircleOutlined style={{ fontSize: '16px' }} />
                  )
                }
              >
                <div
                  style={{
                    padding: 16,
                    background: alpha(
                      milestone.status === 'completed'
                        ? theme.palette.success.main
                        : milestone.status === 'upcoming'
                          ? theme.palette.primary.main
                          : theme.palette.warning.main,
                      0.05
                    ),
                    border: `1px solid ${alpha(
                      milestone.status === 'completed'
                        ? theme.palette.success.main
                        : milestone.status === 'upcoming'
                          ? theme.palette.primary.main
                          : theme.palette.warning.main,
                      0.2
                    )}`,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <Text
                        strong
                        style={{ color: theme.palette.text.primary, display: 'block' }}
                      >
                        {milestone.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <CalendarOutlined /> {dayjs(milestone.date).format('DD/MM/YYYY')}
                        {milestone.status === 'upcoming' && (
                          <span
                            style={{ color: theme.palette.warning.main, fontWeight: 500 }}
                          >
                            {' '}
                            (còn {dayjs(milestone.date).diff(dayjs(), 'day')} ngày)
                          </span>
                        )}
                      </Text>
                    </div>
                    <div>
                      <Tag color={getStatusColor(milestone.status)}>
                        {getStatusText(milestone.status)}
                      </Tag>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => onEditMilestone(milestone)}
                      >
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                  <Text
                    style={{
                      marginTop: 8,
                      display: 'block',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {milestone.description}
                  </Text>
                  {milestone.documents.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: alpha(theme.palette.info.main, 0.05),
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: 'block', marginBottom: 4 }}
                      >
                        <FileTextOutlined /> Tài liệu cần chuẩn bị:
                      </Text>
                      <ul
                        style={{
                          margin: '4px 0 0 16px',
                          fontSize: 12,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {milestone.documents.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
        </Timeline>
      ) : (
        <Empty description="Chưa có mục tiêu nào được thiết lập" />
      )}
    </Card>
  );
};

export default GraduateTimeline;
