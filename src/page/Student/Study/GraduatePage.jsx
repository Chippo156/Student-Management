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
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const GraduatePage = () => {
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
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <TrophyOutlined style={{ marginRight: 8 }} />
        Tiến độ tốt nghiệp
      </Title>

      {/* Overall Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={overallProgress}
                size={120}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Title level={4} style={{ marginTop: 16 }}>
                Tiến độ tổng thể
              </Title>
            </div>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Yêu cầu hoàn thành"
                  value={completedRequirements}
                  suffix={`/ ${requirements.length}`}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Mục tiêu sắp tới"
                  value={upcomingMilestones}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
            <Alert
              message={
                overallProgress >= 80
                  ? 'Bạn đang trên đường hoàn thành tốt nghiệp!'
                  : 'Cần nỗ lực thêm để đạt yêu cầu tốt nghiệp'
              }
              type={overallProgress >= 80 ? 'success' : 'warning'}
              showIcon
              style={{ marginTop: 16 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Graduation Requirements */}
      <Card
        title={
          <span>
            <BookOutlined style={{ marginRight: 8 }} />
            Yêu cầu tốt nghiệp
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          {requirements.map((req) => (
            <Col span={12} key={req.id} style={{ marginBottom: 16 }}>
              <Card size="small">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text strong>{req.category}</Text>
                  <Tag color={getStatusColor(req.status)}>
                    {getStatusText(req.status)}
                  </Tag>
                </div>
                <Progress
                  percent={Math.round((req.completed / req.total) * 100)}
                  format={() => `${req.completed}/${req.total}`}
                  strokeColor={getStatusColor(req.status)}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {req.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Graduation Timeline */}
      <Card
        title={
          <span>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Lộ trình tốt nghiệp
          </span>
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
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <Text strong>{milestone.title}</Text>
                        <br />
                        <Text type="secondary">
                          {dayjs(milestone.date).format('DD/MM/YYYY')}
                          {milestone.status === 'upcoming' && (
                            <span>
                              {' '}
                              (còn {dayjs(milestone.date).diff(
                                dayjs(),
                                'day'
                              )}{' '}
                              ngày)
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
                    <Text style={{ marginTop: 8, display: 'block' }}>
                      {milestone.description}
                    </Text>
                    {milestone.documents.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FileTextOutlined /> Tài liệu cần chuẩn bị:
                        </Text>
                        <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
                          {milestone.documents.map((doc, index) => (
                            <li key={index}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
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
