import React, { useState, useMemo } from "react";
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
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface ScheduleItem {
  id: string;
  title: string;
  type: "class" | "exam" | "assignment" | "meeting" | "other";
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  subject: string;
}

const periods = [
  { key: "morning", label: "Sáng" },
  { key: "afternoon", label: "Chiều" },
  { key: "evening", label: "Tối" },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "class":
      return "blue";
    case "exam":
      return "red";
    case "assignment":
      return "orange";
    case "meeting":
      return "green";
    case "other":
      return "purple";
    default:
      return "default";
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case "class":
      return "Lớp học";
    case "exam":
      return "Thi cử";
    case "assignment":
      return "Bài tập";
    case "meeting":
      return "Họp";
    case "other":
      return "Khác";
    default:
      return type;
  }
};

const StudentSchedule: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [form] = Form.useForm();

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: "1",
      title: "Lớp Cấu trúc dữ liệu",
      type: "class",
      date: "2025-10-14",
      time: "07:30 - 09:30",
      location: "Phòng A101",
      description: "Chương 5: Cây tìm kiếm nhị phân",
      status: "upcoming",
      subject: "IT2040",
    },
    {
      id: "2",
      title: "Thi giữa kỳ Cơ sở dữ liệu",
      type: "exam",
      date: "2025-10-15",
      time: "14:00 - 16:00",
      location: "Phòng B205",
      description: "Thi giữa kỳ chương 1-5",
      status: "upcoming",
      subject: "IT3090",
    },
    {
      id: "3",
      title: "Nộp bài tập lớn",
      type: "assignment",
      date: "2025-10-16",
      time: "23:59",
      location: "Online",
      description: "Project về cây AVL",
      status: "upcoming",
      subject: "IT2040",
    },
    {
      id: "4",
      title: "Họp nhóm đồ án",
      type: "meeting",
      date: "2025-10-12",
      time: "19:00 - 21:00",
      location: "Thư viện Tạ Quang Bửu",
      description: "Thảo luận thiết kế hệ thống",
      status: "completed",
      subject: "IT4995",
    },
  ]);

  // view states
  const [baseDate, setBaseDate] = useState(dayjs()); // any date inside the current week
  const [filterType, setFilterType] = useState<string>("all");

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
    setScheduleItems(scheduleItems.filter((item) => item.id !== id));
    message.success("Xóa lịch thành công!");
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newItem: ScheduleItem = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        status: editingItem ? editingItem.status : "upcoming",
      };

      if (editingItem) {
        setScheduleItems(
          scheduleItems.map((item) =>
            item.id === editingItem.id ? newItem : item
          )
        );
        message.success("Cập nhật lịch thành công!");
      } else {
        setScheduleItems([...scheduleItems, newItem]);
        message.success("Thêm lịch thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // statistics
  const upcomingItems = scheduleItems.filter(
    (item) => item.status === "upcoming"
  );
  const todayItems = scheduleItems.filter(
    (item) =>
      dayjs(item.date).isSame(dayjs(), "day") && item.status !== "completed"
  );
  const completedItems = scheduleItems.filter(
    (item) => item.status === "completed"
  );

  // week days (Mon - Sun)
  const weekDays = useMemo(() => {
    const start = baseDate.startOf("week"); // sunday
    const days: dayjs.Dayjs[] = [];
    for (let i = 1; i <= 7; i++) {
      days.push(start.add(i, "day"));
    }
    return days;
  }, [baseDate]);

  const getPeriodFromTime = (
    time: string
  ): "morning" | "afternoon" | "evening" => {
    if (!time) return "morning";
    // take first hour number
    const first = time.split("-")[0].trim();
    const hh = parseInt(first.split(":")[0], 10);
    if (isNaN(hh)) return "morning";
    if (hh < 12) return "morning";
    if (hh < 18) return "afternoon";
    return "evening";
  };

  const eventsByCell = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    scheduleItems.forEach((ev) => {
      if (filterType !== "all" && ev.type !== filterType) return;
      const period = getPeriodFromTime(ev.time);
      const key = `${ev.date}#${period}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [scheduleItems, filterType]);

  const goPrevWeek = () => setBaseDate(baseDate.subtract(1, "week"));
  const goNextWeek = () => setBaseDate(baseDate.add(1, "week"));

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2}>Lịch học, lịch thi theo tuần</Title>
          <Text type="secondary">
            Tuần: {weekDays[0].format("DD/MM/YYYY")} -{" "}
            {weekDays[6].format("DD/MM/YYYY")}
          </Text>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button icon={<LeftOutlined />} onClick={goPrevWeek} />
          <DatePicker
            picker="week"
            value={baseDate}
            onChange={(d) => d && setBaseDate(d)}
          />
          <Button icon={<RightOutlined />} onClick={goNextWeek} />

          <Select
            value={filterType}
            onChange={(v) => setFilterType(v)}
            style={{ width: 160 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="class">Lớp học</Option>
            <Option value="exam">Thi cử</Option>
            <Option value="assignment">Bài tập</Option>
            <Option value="meeting">Họp</Option>
            <Option value="other">Khác</Option>
          </Select>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm lịch
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={todayItems.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={upcomingItems.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={completedItems.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ tuần"
              value={
                scheduleItems.length
                  ? Math.round(
                      (completedItems.length / scheduleItems.length) * 100
                    )
                  : 0
              }
              suffix="%"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's schedule (kept) */}
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
            {todayItems.map((item) => (
              <Col span={8} key={item.id}>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
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

      {/* Weekly calendar */}
      <Card title="Lịch theo tuần" style={{ marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px repeat(7, minmax(160px, 1fr))",
              borderTop: "1px solid #f0f0f0",
              borderLeft: "1px solid #f0f0f0",
            }}
          >
            {/* header */}
            <div
              style={{
                borderRight: "1px solid #f0f0f0",
                borderBottom: "1px solid #f0f0f0",
                background: "#fafafa",
                padding: 12,
              }}
            >
              <Text strong>Ca học</Text>
            </div>
            {weekDays.map((d) => (
              <div
                key={d.format("YYYY-MM-DD")}
                style={{
                  borderRight: "1px solid #f0f0f0",
                  borderBottom: "1px solid #f0f0f0",
                  padding: 12,
                  textAlign: "center",
                }}
              >
                <Text strong>
                  {d.day() === 0 ? "Chủ nhật" : `Thứ ${d.day() + 1}`}
                </Text>
                <div>
                  <Text type="secondary">{d.format("DD/MM/YYYY")}</Text>
                </div>
              </div>
            ))}

            {/* rows for periods */}
            {periods.map((p) => (
              <React.Fragment key={p.key}>
                <div
                  style={{
                    borderRight: "1px solid #f0f0f0",
                    borderBottom: "1px solid #f0f0f0",
                    padding: 12,
                    background: "#fff8dc",
                  }}
                >
                  <Text strong>{p.label}</Text>
                </div>

                {weekDays.map((d) => {
                  const key = `${d.format("YYYY-MM-DD")}#${p.key}`;
                  const cellEvents = eventsByCell[key] || [];

                  return (
                    <div
                      key={key}
                      style={{
                        minHeight: 110,
                        borderRight: "1px solid #f0f0f0",
                        borderBottom: "1px solid #f0f0f0",
                        padding: 8,
                      }}
                    >
                      {cellEvents.length === 0 ? (
                        <div style={{ minHeight: 80 }} />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {cellEvents.map((ev) => (
                            <div
                              key={ev.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 8,
                                padding: 8,
                                borderRadius: 6,
                                background: "#ffffff",
                              }}
                            >
                              <div
                                style={{ flex: 1, cursor: "pointer" }}
                                onClick={() => handleEdit(ev)}
                              >
                                <Text strong style={{ display: "block" }}>
                                  {ev.title}
                                </Text>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {ev.time}
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {ev.location}
                                  </Text>
                                </div>
                              </div>
                              <div>
                                <Tag
                                  color={getTypeColor(ev.type)}
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  {getTypeText(ev.type)}
                                </Tag>
                                <div style={{ marginTop: 6 }}>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(ev)}
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    type="link"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(ev.id)}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* legend */}
        <div style={{ marginTop: 12 }}>
          <Space>
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 12,
                background: "#f0f0f0",
                border: "1px solid #ddd",
              }}
            />{" "}
            <Text>Lịch học lý thuyết</Text>
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 12,
                background: "#b7eb8f",
                border: "1px solid #ddd",
              }}
            />{" "}
            <Text>Lịch học thực hành</Text>
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 12,
                background: "#bae7ff",
                border: "1px solid #ddd",
              }}
            />{" "}
            <Text>Lịch học trực tuyến</Text>
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 12,
                background: "#fff7a8",
                border: "1px solid #ddd",
              }}
            />{" "}
            <Text>Lịch thi</Text>
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 12,
                background: "#ffa39e",
                border: "1px solid #ddd",
              }}
            />{" "}
            <Text>Lịch tạm ngưng</Text>
          </Space>
        </div>
      </Card>

      {/* Keep table view (optional) - removed to follow weekly requirement */}

      {/* Modal */}
      <Modal
        title={editingItem ? "Chỉnh sửa lịch" : "Thêm lịch mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingItem ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề sự kiện" />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="type"
              label="Loại sự kiện"
              rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
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
              rules={[{ required: true, message: "Vui lòng nhập mã môn!" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Mã môn học (VD: IT2040)" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: "100%" }} placeholder="Chọn ngày" />
            </Form.Item>

            <Form.Item
              name="time"
              label="Thời gian"
              rules={[{ required: true, message: "Vui lòng nhập thời gian!" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="VD: 07:30 - 09:30" />
            </Form.Item>
          </div>

          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: "Vui lòng nhập địa điểm!" }]}
          >
            <Input placeholder="Nhập địa điểm" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentSchedule;
