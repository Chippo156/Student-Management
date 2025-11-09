import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Empty,
  Timeline,
  Progress,
  Alert,
  Space,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
  PlusOutlined,
  FireOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const GraduatePage = () => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form] = Form.useForm();

  const [requirements] = useState([
    {
      id: '1',
      category: 'Tín chỉ bắt buộc',
      requirement: 'Tín chỉ các môn bắt buộc',
      completed: 95,
      total: 100,
      status: 'in-progress',
      description: 'Còn thiếu 5 tín chỉ môn bắt buộc',
    },
    {
      id: '2',
      category: 'Tín chỉ tự chọn',
      requirement: 'Tín chỉ các môn tự chọn',
      completed: 25,
      total: 30,
      status: 'in-progress',
      description: 'Còn thiếu 5 tín chỉ môn tự chọn',
    },
    {
      id: '3',
      category: 'Ngoại ngữ',
      requirement: 'Chứng chỉ Tiếng Anh B1',
      completed: 1,
      total: 1,
      status: 'completed',
      description: 'Đã có chứng chỉ TOEIC 650',
    },
    {
      id: '4',
      category: 'Giáo dục thể chất',
      requirement: 'Hoàn thành môn GDTC',
      completed: 4,
      total: 4,
      status: 'completed',
      description: 'Đã hoàn thành đủ 4 môn GDTC',
    },
    {
      id: '5',
      category: 'Khóa luận',
      requirement: 'Khóa luận tốt nghiệp',
      completed: 0,
      total: 1,
      status: 'not-started',
      description: 'Chưa đăng ký khóa luận',
    },
    {
      id: '6',
      category: 'Thực tập',
      requirement: 'Thực tập tốt nghiệp',
      completed: 0,
      total: 1,
      status: 'not-started',
      description: 'Chưa thực hiện thực tập',
    },
  ]);

  const [milestones, setMilestones] = useState([
    {
      id: '1',
      title: 'Nộp hồ sơ xét tốt nghiệp',
      date: '2025-03-15',
      status: 'upcoming',
      description: 'Nộp hồ sơ xét tốt nghiệp tại phòng đào tạo',
      documents: [
        'Đơn xin xét tốt nghiệp',
        'Bản sao bằng tốt nghiệp THPT',
        'Chứng chỉ ngoại ngữ',
      ],
    },
    {
      id: '2',
      title: 'Đăng ký khóa luận tốt nghiệp',
      date: '2025-02-01',
      status: 'upcoming',
      description: 'Đăng ký đề tài và giảng viên hướng dẫn',
      documents: ['Đơn đăng ký khóa luận', 'Đề cương khóa luận'],
    },
    {
      id: '3',
      title: 'Hoàn thành học phần cuối kỳ',
      date: '2025-01-20',
      status: 'upcoming',
      description: 'Hoàn thành các môn học còn lại',
      documents: [],
    },
    {
      id: '4',
      title: 'Đăng ký học kỳ 2 năm 4',
      date: '2024-12-15',
      status: 'completed',
      description: 'Đã đăng ký thành công 18 tín chỉ',
      documents: ['Phiếu đăng ký học phần'],
    },
  ]);

  const handleAddMilestone = () => {
    setEditingMilestone(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    form.setFieldsValue({
      ...milestone,
      date: dayjs(milestone.date),
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newMilestone = {
        id: editingMilestone ? editingMilestone.id : Date.now().toString(),
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        documents: values.documents
          ? values.documents.split(',').map((doc) => doc.trim())
          : [],
      };

      if (editingMilestone) {
        setMilestones(
          milestones.map((milestone) =>
            milestone.id === editingMilestone.id ? newMilestone : milestone
          )
        );
        message.success('Cập nhật mục tiêu thành công!');
      } else {
        setMilestones([...milestones, newMilestone]);
        message.success('Thêm mục tiêu thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'blue';
      case 'not-started':
        return 'orange';
      case 'upcoming':
        return 'blue';
      case 'overdue':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'not-started':
        return 'Chưa bắt đầu';
      case 'upcoming':
        return 'Sắp tới';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const totalCompleted = requirements.reduce(
    (sum, req) => sum + req.completed,
    0
  );
  const totalRequired = requirements.reduce((sum, req) => sum + req.total, 0);
  const overallProgress = Math.round((totalCompleted / totalRequired) * 100);

  const completedRequirements = requirements.filter(
    (req) => req.status === 'completed'
  ).length;
  const upcomingMilestones = milestones.filter(
    (milestone) => milestone.status === 'upcoming'
  ).length;

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      background: theme.palette.background.default,
    }}>
      <Title level={2} style={{ color: theme.palette.primary.main, marginBottom: 24 }}>
        <TrophyOutlined style={{ marginRight: 8 }} />
        Tiến độ tốt nghiệp
      </Title>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Yêu cầu hoàn thành</span>}
              value={completedRequirements}
              suffix={`/ ${requirements.length}`}
              prefix={<CheckCircleOutlined style={{ color: theme.palette.success.main }} />}
              valueStyle={{ color: theme.palette.success.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Mục tiêu sắp tới</span>}
              value={upcomingMilestones}
              prefix={<ClockCircleOutlined style={{ color: theme.palette.warning.main }} />}
              valueStyle={{ color: theme.palette.warning.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Tín chỉ tích lũy</span>}
              value={totalCompleted}
              suffix={`/ ${totalRequired}`}
              prefix={<StarOutlined style={{ color: theme.palette.secondary.main }} />}
              valueStyle={{ color: theme.palette.secondary.main }}
            />
          </Card>
        </Col>
      </Row>

      {/* Overall Progress */}
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
            <div style={{
              padding: 16,
              background: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 8,
            }}>
              <Text strong style={{ color: theme.palette.text.primary, display: 'block', marginBottom: 12 }}>
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
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Đã hoàn thành</Text>
                    <Text strong style={{ fontSize: 18, color: theme.palette.success.main }}>{totalCompleted}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Còn lại</Text>
                    <Text strong style={{ fontSize: 18, color: theme.palette.warning.main }}>
                      {totalRequired - totalCompleted}
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tổng yêu cầu</Text>
                    <Text strong style={{ fontSize: 18, color: theme.palette.primary.main }}>{totalRequired}</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Graduation Requirements */}
      <Card
        bordered={false}
        title={
          <Space>
            <BookOutlined style={{ color: theme.palette.primary.main }} />
            <Text strong style={{ color: theme.palette.text.primary }}>Yêu cầu tốt nghiệp</Text>
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
              <div style={{
                padding: 16,
                background: alpha(
                  req.status === 'completed' ? theme.palette.success.main :
                  req.status === 'in-progress' ? theme.palette.primary.main :
                  theme.palette.warning.main,
                  0.05
                ),
                border: `1px solid ${alpha(
                  req.status === 'completed' ? theme.palette.success.main :
                  req.status === 'in-progress' ? theme.palette.primary.main :
                  theme.palette.warning.main,
                  0.2
                )}`,
                borderRadius: 8,
              }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text strong style={{ color: theme.palette.text.primary }}>{req.category}</Text>
                  <Tag color={getStatusColor(req.status)}>
                    {getStatusText(req.status)}
                  </Tag>
                </div>
                <Progress
                  percent={Math.round((req.completed / req.total) * 100)}
                  format={() => `${req.completed}/${req.total}`}
                  strokeColor={
                    req.status === 'completed' ? theme.palette.success.main :
                    req.status === 'in-progress' ? theme.palette.primary.main :
                    theme.palette.warning.main
                  }
                />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                  {req.description}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Graduation Timeline */}
      <Card
        bordered={false}
        title={
          <Space>
            <CalendarOutlined style={{ color: theme.palette.primary.main }} />
            <Text strong style={{ color: theme.palette.text.primary }}>Lộ trình tốt nghiệp</Text>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMilestone}
          >
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
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
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
                  <div style={{
                    padding: 16,
                    background: alpha(
                      milestone.status === 'completed' ? theme.palette.success.main :
                      milestone.status === 'upcoming' ? theme.palette.primary.main :
                      theme.palette.warning.main,
                      0.05
                    ),
                    border: `1px solid ${alpha(
                      milestone.status === 'completed' ? theme.palette.success.main :
                      milestone.status === 'upcoming' ? theme.palette.primary.main :
                      theme.palette.warning.main,
                      0.2
                    )}`,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <Text strong style={{ color: theme.palette.text.primary, display: 'block' }}>
                          {milestone.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          <CalendarOutlined /> {dayjs(milestone.date).format('DD/MM/YYYY')}
                          {milestone.status === 'upcoming' && (
                            <span style={{ color: theme.palette.warning.main, fontWeight: 500 }}>
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
                          onClick={() => handleEditMilestone(milestone)}
                        >
                          Chỉnh sửa
                        </Button>
                      </div>
                    </div>
                    <Text style={{ marginTop: 8, display: 'block', color: theme.palette.text.secondary }}>
                      {milestone.description}
                    </Text>
                    {milestone.documents.length > 0 && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: alpha(theme.palette.info.main, 0.05),
                        borderRadius: 4,
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                          <FileTextOutlined /> Tài liệu cần chuẩn bị:
                        </Text>
                        <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: theme.palette.text.secondary }}>
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
          <Empty description="Chưa cập nhật mục tiêu nào được thiết lập" />
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingMilestone ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingMilestone ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề mục tiêu" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="date"
              label="Ngày hạn"
              rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày hạn"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="upcoming">Sắp tới</Option>
                <Option value="completed">Đã hoàn thành</Option>
                <Option value="overdue">Quá hạn</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Form.Item name="documents" label="Tài liệu cần chuẩn bị">
            <Input.TextArea
              rows={2}
              placeholder="Nhập các tài liệu cần chuẩn bị, cách nhau bằng dấu phẩy"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GraduatePage;
