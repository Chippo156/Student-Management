import React, { useState } from 'react';
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Empty,
  Space,
  Typography,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Calendar,
  Badge,
  Progress,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TagsOutlined,
  FireOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const StudentNotes = () => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();

  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Nộp bài tập lớn môn Cấu trúc dữ liệu',
      content: 'Hoàn thành project về cây AVL và nộp qua email giảng viên',
      priority: 'high',
      dueDate: '2025-10-15',
      status: 'pending',
      createdAt: '2025-09-20',
    },
    {
      id: '2',
      title: 'Đăng ký học phần kỳ 2',
      content:
        'Chuẩn bị danh sách môn học cần đăng ký cho kỳ 2 năm học 2024-2025',
      priority: 'medium',
      dueDate: '2025-11-30',
      status: 'pending',
      createdAt: '2025-09-18',
    },
    {
      id: '3',
      title: 'Thi giữa kỳ môn Cơ sở dữ liệu',
      content: 'Ôn tập chương 1-5, chuẩn bị tài liệu ôn thi',
      priority: 'high',
      dueDate: '2025-10-25',
      status: 'completed',
      createdAt: '2025-09-15',
    },
  ]);

  const handleAdd = () => {
    setEditingNote(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    form.setFieldsValue({
      ...note,
      dueDate: dayjs(note.dueDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    message.success('Xóa ghi chú thành công!');
  };

  const handleToggleStatus = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              status: note.status === 'pending' ? 'completed' : 'pending',
            }
          : note
      )
    );
    message.success('Cập nhật trạng thái thành công!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newNote = {
        id: editingNote ? editingNote.id : Date.now().toString(),
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        status: editingNote ? editingNote.status : 'pending',
        createdAt: editingNote
          ? editingNote.createdAt
          : dayjs().format('YYYY-MM-DD'),
      };

      if (editingNote) {
        setNotes(
          notes.map((note) => (note.id === editingNote.id ? newNote : note))
        );
        message.success('Cập nhật ghi chú thành công!');
      } else {
        setNotes([...notes, newNote]);
        message.success('Thêm ghi chú thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  };

  const pendingNotes = notes.filter((note) => note.status === 'pending');
  const completedNotes = notes.filter((note) => note.status === 'completed');

  // Completion rate
  const completionRate = notes.length > 0
    ? Math.round((completedNotes.length / notes.length) * 100)
    : 0;

  // Mock productivity data
  const weeklyProductivity = [
    { day: 'T2', completed: 3 },
    { day: 'T3', completed: 2 },
    { day: 'T4', completed: 4 },
    { day: 'T5', completed: 1 },
    { day: 'T6', completed: 3 },
    { day: 'T7', completed: 0 },
    { day: 'CN', completed: 2 },
  ];

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      background: theme.palette.background.default,
    }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0, color: theme.palette.text.primary }}>
          <BellOutlined style={{ marginRight: 8, color: theme.palette.primary.main }} />
          Ghi chú nhắc nhở
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm ghi chú
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Đang chờ</span>}
              value={pendingNotes.length}
              prefix={<ClockCircleOutlined style={{ color: theme.palette.warning.main }} />}
              valueStyle={{ color: theme.palette.warning.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Đã hoàn thành</span>}
              value={completedNotes.length}
              prefix={<CheckCircleOutlined style={{ color: theme.palette.success.main }} />}
              valueStyle={{ color: theme.palette.success.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Ưu tiên cao</span>}
              value={
                notes.filter(
                  (note) =>
                    note.priority === 'high' && note.status === 'pending'
                ).length
              }
              prefix={<ExclamationCircleOutlined style={{ color: theme.palette.error.main }} />}
              valueStyle={{ color: theme.palette.error.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Tỷ lệ hoàn thành</span>}
              value={completionRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: theme.palette.secondary.main }} />}
              valueStyle={{ color: theme.palette.secondary.main }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {/* Pending Notes */}
          <Card
            bordered={false}
            title={
              <Space>
                <BellOutlined style={{ color: theme.palette.warning.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>
                  Ghi chú đang chờ ({pendingNotes.length})
                </Text>
              </Space>
            }
            style={{
              marginBottom: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {pendingNotes.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={pendingNotes}
                renderItem={(note) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(note)}
                      >
                        Sửa
                      </Button>,
                      <Button
                        type="link"
                        onClick={() => handleToggleStatus(note.id)}
                      >
                        Đánh dấu hoàn thành
                      </Button>,
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa ghi chú này?"
                        onConfirm={() => handleDelete(note.id)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          Xóa
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <span style={{ color: theme.palette.text.primary }}>{note.title}</span>
                          <Tag color={getPriorityColor(note.priority)}>
                            {getPriorityText(note.priority)}
                          </Tag>
                        </div>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text style={{ color: theme.palette.text.secondary }}>{note.content}</Text>
                          <Space>
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Hạn: {dayjs(note.dueDate).format('DD/MM/YYYY')}
                            </Text>
                            <Text type="secondary">
                              (còn {dayjs(note.dueDate).diff(dayjs(), 'day')} ngày)
                            </Text>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có ghi chú đang chờ" />
            )}
          </Card>

          {/* Completed Notes */}
          <Card
            bordered={false}
            title={
              <Space>
                <CheckCircleOutlined style={{ color: theme.palette.success.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>
                  Ghi chú đã hoàn thành ({completedNotes.length})
                </Text>
              </Space>
            }
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {completedNotes.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={completedNotes}
                renderItem={(note) => (
                  <List.Item
                    style={{ opacity: 0.7 }}
                    actions={[
                      <Button
                        type="link"
                        onClick={() => handleToggleStatus(note.id)}
                      >
                        Đánh dấu chưa hoàn thành
                      </Button>,
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa ghi chú này?"
                        onConfirm={() => handleDelete(note.id)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          Xóa
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <span style={{
                            textDecoration: 'line-through',
                            color: theme.palette.text.secondary,
                          }}>
                            {note.title}
                          </span>
                          <Tag color="green">Hoàn thành</Tag>
                        </div>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text style={{
                            textDecoration: 'line-through',
                            color: theme.palette.text.secondary,
                          }}>
                            {note.content}
                          </Text>
                          <Text type="secondary">
                            Hoàn thành: {dayjs(note.dueDate).format('DD/MM/YYYY')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Chưa cập nhật ghi chú nào được hoàn thành" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Weekly Productivity */}
          <Card
            bordered={false}
            title={
              <Space>
                <FireOutlined style={{ color: theme.palette.primary.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>
                  Năng suất tuần này
                </Text>
              </Space>
            }
            style={{
              marginBottom: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {weeklyProductivity.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: theme.palette.text.secondary }}>{item.day}</Text>
                    <Text strong style={{ color: theme.palette.text.primary }}>
                      {item.completed} ghi chú
                    </Text>
                  </div>
                  <Progress
                    percent={(item.completed / 5) * 100}
                    strokeColor={theme.palette.primary.main}
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
              <Divider style={{ margin: '8px 0' }} />
              <div style={{
                padding: 12,
                background: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 8,
                textAlign: 'center',
              }}>
                <Statistic
                  title={<span style={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                    Tổng hoàn thành tuần
                  </span>}
                  value={weeklyProductivity.reduce((sum, item) => sum + item.completed, 0)}
                  suffix="ghi chú"
                  valueStyle={{ color: theme.palette.primary.main, fontSize: 24 }}
                />
              </div>
            </Space>
          </Card>

          {/* Categories Overview */}
          <Card
            bordered={false}
            title={
              <Space>
                <TagsOutlined style={{ color: theme.palette.secondary.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>
                  Phân loại ghi chú
                </Text>
              </Space>
            }
            style={{
              marginBottom: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{
                padding: 12,
                background: alpha(theme.palette.error.main, 0.1),
                borderLeft: `4px solid ${theme.palette.error.main}`,
                borderRadius: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: theme.palette.text.primary }}>Ưu tiên cao</Text>
                  <Tag color="red">
                    {notes.filter(n => n.priority === 'high' && n.status === 'pending').length} ghi chú
                  </Tag>
                </div>
              </div>
              <div style={{
                padding: 12,
                background: alpha(theme.palette.warning.main, 0.1),
                borderLeft: `4px solid ${theme.palette.warning.main}`,
                borderRadius: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: theme.palette.text.primary }}>Ưu tiên trung bình</Text>
                  <Tag color="orange">
                    {notes.filter(n => n.priority === 'medium' && n.status === 'pending').length} ghi chú
                  </Tag>
                </div>
              </div>
              <div style={{
                padding: 12,
                background: alpha(theme.palette.info.main, 0.1),
                borderLeft: `4px solid ${theme.palette.info.main}`,
                borderRadius: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: theme.palette.text.primary }}>Ưu tiên thấp</Text>
                  <Tag color="blue">
                    {notes.filter(n => n.priority === 'low' && n.status === 'pending').length} ghi chú
                  </Tag>
                </div>
              </div>
            </Space>
          </Card>

          {/* Quick Add */}
          <Card
            bordered={false}
            title={
              <Space>
                <CalendarOutlined style={{ color: theme.palette.success.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>
                  Hành động nhanh
                </Text>
              </Space>
            }
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm ghi chú mới
              </Button>
              <Button
                block
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  if (pendingNotes.length > 0) {
                    handleToggleStatus(pendingNotes[0].id);
                  }
                }}
                disabled={pendingNotes.length === 0}
              >
                Hoàn thành ghi chú đầu tiên
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal
        title={editingNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingNote ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề ghi chú" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung chi tiết" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              rules={[
                { required: true, message: 'Vui lòng chọn mức độ ưu tiên!' },
              ]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn mức độ ưu tiên">
                <Option value="low">Thấp</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="high">Cao</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Hạn hoàn thành"
              rules={[
                { required: true, message: 'Vui lòng chọn hạn hoàn thành!' },
              ]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày hạn"
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentNotes;
