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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

const StudentNotes: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form] = Form.useForm();

  const [notes, setNotes] = useState<Note[]>([
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
      content: 'Chuẩn bị danh sách môn học cần đăng ký cho kỳ 2 năm học 2024-2025',
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

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    form.setFieldsValue({
      ...note,
      dueDate: dayjs(note.dueDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    message.success('Xóa ghi chú thành công!');
  };

  const handleToggleStatus = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, status: note.status === 'pending' ? 'completed' : 'pending' }
        : note
    ));
    message.success('Cập nhật trạng thái thành công!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newNote: Note = {
        id: editingNote ? editingNote.id : Date.now().toString(),
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        status: editingNote ? editingNote.status : 'pending',
        createdAt: editingNote ? editingNote.createdAt : dayjs().format('YYYY-MM-DD'),
      };

      if (editingNote) {
        setNotes(notes.map(note => note.id === editingNote.id ? newNote : note));
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const pendingNotes = notes.filter(note => note.status === 'pending');
  const completedNotes = notes.filter(note => note.status === 'completed');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Ghi chú nhắc nhở</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm ghi chú
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đang chờ"
              value={pendingNotes.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={completedNotes.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ưu tiên cao"
              value={notes.filter(note => note.priority === 'high' && note.status === 'pending').length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pending Notes */}
      <Card 
        title={
          <span>
            <BellOutlined style={{ marginRight: 8 }} />
            Ghi chú đang chờ ({pendingNotes.length})
          </span>
        }
        style={{ marginBottom: 24 }}
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
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{note.title}</span>
                      <Tag color={getPriorityColor(note.priority)}>
                        {getPriorityText(note.priority)}
                      </Tag>
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>{note.content}</Text>
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
        title={
          <span>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            Ghi chú đã hoàn thành ({completedNotes.length})
          </span>
        }
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
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ textDecoration: 'line-through' }}>{note.title}</span>
                      <Tag color="green">Hoàn thành</Tag>
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text style={{ textDecoration: 'line-through' }}>{note.content}</Text>
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
          <Empty description="Chưa có ghi chú nào được hoàn thành" />
        )}
      </Card>

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
              rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
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
              rules={[{ required: true, message: 'Vui lòng chọn hạn hoàn thành!' }]}
              style={{ flex: 1 }}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày hạn"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentNotes;