import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface ScheduleItem {
  id: string;
  title: string;
  type: 'class' | 'exam' | 'assignment' | 'meeting' | 'other';
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  subject: string;
}

const StudentSchedule: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [form] = Form.useForm();

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      title: 'Lớp Cấu trúc dữ liệu',
      type: 'class',
      date: '2025-10-14',
      time: '07:30 - 09:30',
      location: 'Phòng A101',
      description: 'Chương 5: Cây tìm kiếm nhị phân',
      status: 'upcoming',
      subject: 'IT2040',
    },
    {
      id: '2',
      title: 'Thi giữa kỳ Cơ sở dữ liệu',
      type: 'exam',
      date: '2025-10-15',
      time: '14:00 - 16:00',
      location: 'Phòng B205',
      description: 'Thi giữa kỳ chương 1-5',
      status: 'upcoming',
      subject: 'IT3090',
    },
    {
      id: '3',
      title: 'Nộp bài tập lớn',
      type: 'assignment',
      date: '2025-10-16',
      time: '23:59',
      location: 'Online',
      description: 'Project về cây AVL',
      status: 'upcoming',
      subject: 'IT2040',
    },
    {
      id: '4',
      title: 'Họp nhóm đồ án',
      type: 'meeting',
      date: '2025-10-12',
      time: '19:00 - 21:00',
      location: 'Thư viện Tạ Quang Bửu',
      description: 'Thảo luận thiết kế hệ thống',
      status: 'completed',
      subject: 'IT4995',
    },
  ]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      date: dayjs(item.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
    message.success('Xóa lịch thành công!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newItem: ScheduleItem = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        status: editingItem ? editingItem.status : 'upcoming',
      };

      if (editingItem) {
        setScheduleItems(scheduleItems.map(item => item.id === editingItem.id ? newItem : item));
        message.success('Cập nhật lịch thành công!');
      } else {
        setScheduleItems([...scheduleItems, newItem]);
        message.success('Thêm lịch thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'blue';
      case 'exam': return 'red';
      case 'assignment': return 'orange';
      case 'meeting': return 'green';
      case 'other': return 'purple';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'class': return 'Lớp học';
      case 'exam': return 'Thi cử';
      case 'assignment': return 'Bài tập';
      case 'meeting': return 'Họp';
      case 'other': return 'Khác';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'orange';
      case 'ongoing': return 'blue';
      case 'completed': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Sắp tới';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã hoàn thành';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date: string, record: ScheduleItem) => (
        <Space direction="vertical" size="small">
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary">{record.time}</Text>
        </Space>
      ),
      sorter: (a: ScheduleItem, b: ScheduleItem) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ScheduleItem) => (
        <Space direction="vertical" size="small">
          <Text strong>{title}</Text>
          <Text type="secondary">{record.subject}</Text>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
      filters: [
        { text: 'Lớp học', value: 'class' },
        { text: 'Thi cử', value: 'exam' },
        { text: 'Bài tập', value: 'assignment' },
        { text: 'Họp', value: 'meeting' },
        { text: 'Khác', value: 'other' },
      ],
      onFilter: (value: any, record: ScheduleItem) => record.type === value,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: 'Sắp tới', value: 'upcoming' },
        { text: 'Đang diễn ra', value: 'ongoing' },
        { text: 'Đã hoàn thành', value: 'completed' },
      ],
      onFilter: (value: any, record: ScheduleItem) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ScheduleItem) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const upcomingItems = scheduleItems.filter(item => item.status === 'upcoming');
  const todayItems = scheduleItems.filter(item => 
    dayjs(item.date).isSame(dayjs(), 'day') && item.status !== 'completed'
  );
  const completedItems = scheduleItems.filter(item => item.status === 'completed');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Lịch học tập</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm lịch
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={todayItems.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={upcomingItems.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={completedItems.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ tuần"
              value={Math.round((completedItems.length / scheduleItems.length) * 100)}
              suffix="%"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's Schedule */}
      {todayItems.length > 0 && (
        <Card 
          title={
            <span>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Lịch hôm nay ({todayItems.length})
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            {todayItems.map(item => (
              <Col span={8} key={item.id}>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.title}</Text>
                      <Tag color={getTypeColor(item.type)}>
                        {getTypeText(item.type)}
                      </Tag>
                    </div>
                    <Text type="secondary">{item.time}</Text>
                    <Text type="secondary">{item.location}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Schedule Table */}
      <Card title="Tất cả lịch trình">
        <Table
          columns={columns}
          dataSource={scheduleItems}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          locale={{ emptyText: <Empty description="Không có lịch trình nào" /> }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa lịch' : 'Thêm lịch mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề sự kiện" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="type"
              label="Loại sự kiện"
              rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn loại sự kiện">
                <Option value="class">Lớp học</Option>
                <Option value="exam">Thi cử</Option>
                <Option value="assignment">Bài tập</Option>
                <Option value="meeting">Họp</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="subject"
              label="Môn học"
              rules={[{ required: true, message: 'Vui lòng nhập mã môn!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Mã môn học (VD: IT2040)" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>

            <Form.Item
              name="time"
              label="Thời gian"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="VD: 07:30 - 09:30" />
            </Form.Item>
          </div>

          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
          >
            <Input placeholder="Nhập địa điểm" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentSchedule;