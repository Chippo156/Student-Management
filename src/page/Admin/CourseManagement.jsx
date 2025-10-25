import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Tag,
  DatePicker,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
// TypeScript ColumnsType import removed
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

// Course interface removed for JS/JSX conversion

function CourseManagement() {
  const [courses, setCourses] = useState([
    {
      id: "1",
      courseCode: "IT101",
      courseName: "Lập trình cơ bản",
      instructor: "TS. Nguyễn Văn A",
      credits: 3,
      department: "Công nghệ thông tin",
      semester: "HK1",
      year: 2025,
      currentStudents: 45,
      // Removed type annotations and interfaces
      startDate: "2025-09-01",
      endDate: "2025-12-15",
      description: "Khóa học về cấu trúc dữ liệu và các thuật toán cơ bản",
    },
    {
      id: "3",
      courseCode: "EC101",
      courseName: "Kinh tế vi mô",
      instructor: "ThS. Lê Minh C",
      credits: 3,
      department: "Kinh tế",
      semester: "HK2",
      year: 2024,
      maxStudents: 60,
      currentStudents: 60,
      status: "completed",
      startDate: "2024-02-01",
      endDate: "2024-05-15",
      description: "Khóa học về các nguyên lý cơ bản của kinh tế vi mô",
    },
    {
      id: "4",
      courseCode: "EN101",
      courseName: "Tiếng Anh giao tiếp",
      instructor: "Cô. Phạm Thu D",
      credits: 2,
      department: "Ngôn ngữ Anh",
      semester: "HK1",
      year: 2025,
      maxStudents: 30,
      currentStudents: 25,
      status: "active",
      startDate: "2025-09-01",
      endDate: "2025-12-15",
      description: "Khóa học phát triển kỹ năng giao tiếp tiếng Anh",
    },
    {
      id: "5",
      courseCode: "MA201",
      courseName: "Giải tích 2",
      instructor: "PGS. Hoàng Văn E",
      credits: 4,
      department: "Toán học",
      semester: "HK2",
      year: 2025,
      maxStudents: 45,
      currentStudents: 0,
      status: "inactive",
      startDate: "2025-02-01",
      endDate: "2025-05-15",
      description: "Khóa học nâng cao về giải tích toán học",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      ...course,
      startDate: dayjs(course.startDate),
      endDate: dayjs(course.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setCourses(courses.filter((course) => course.id !== id));
    message.success("Xóa khóa học thành công!");
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newCourse = {
        id: editingCourse ? editingCourse.id : Date.now().toString(),
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        currentStudents: editingCourse ? editingCourse.currentStudents : 0,
      };

      if (editingCourse) {
        setCourses(
          courses.map((course) =>
            course.id === editingCourse.id ? newCourse : course
          )
        );
        message.success("Cập nhật khóa học thành công!");
      } else {
        setCourses([...courses, newCourse]);
        message.success("Thêm khóa học thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingCourse(null);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCourse(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "orange";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang diễn ra";
      case "inactive":
        return "Chưa bắt đầu";
      case "completed":
        return "Đã kết thúc";
      default:
        return status;
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchText.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchText.toLowerCase()) ||
      course.department.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Mã MH",
      dataIndex: "courseCode",
      key: "courseCode",
      width: 100,
    },
    {
      title: "Tên môn học",
      dataIndex: "courseName",
      key: "courseName",
      width: 200,
    },
    {
      title: "Giảng viên",
      dataIndex: "instructor",
      key: "instructor",
      width: 150,
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
    },
    {
      title: "Khoa",
      dataIndex: "department",
      key: "department",
      width: 150,
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      width: 80,
      align: "center",
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      width: 80,
      align: "center",
    },
    {
      title: "SV đăng ký",
      key: "enrollment",
      width: 120,
      align: "center",
      render: (_, record) => (
        <span
          style={{
            color:
              record.currentStudents >= record.maxStudents
                ? "#ff4d4f"
                : "#52c41a",
          }}
        >
          {record.currentStudents}/{record.maxStudents}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
  render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 180,
  render: (_, record) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            đến {dayjs(record.endDate).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
  render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa khóa học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Input
            placeholder="Tìm kiếm khóa học..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm khóa học
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCourses}
        rowKey="id"
        pagination={{
          total: filteredCourses.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} khóa học`,
        }}
        scroll={{ x: 1600 }}
      />

      <Modal
        title={editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        okText={editingCourse ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "inactive",
            year: new Date().getFullYear(),
            credits: 3,
            maxStudents: 50,
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="courseCode"
              label="Mã môn học"
              rules={[{ required: true, message: "Vui lòng nhập mã môn học!" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập mã môn học" />
            </Form.Item>

            <Form.Item
              name="credits"
              label="Số tín chỉ"
              rules={[{ required: true, message: "Vui lòng nhập số tín chỉ!" }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                max={6}
                placeholder="Số tín chỉ"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="courseName"
            label="Tên môn học"
            rules={[{ required: true, message: "Vui lòng nhập tên môn học!" }]}
          >
            <Input placeholder="Nhập tên môn học" />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="instructor"
              label="Giảng viên"
              rules={[
                { required: true, message: "Vui lòng nhập tên giảng viên!" },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập tên giảng viên" />
            </Form.Item>

            <Form.Item
              name="department"
              label="Khoa"
              rules={[{ required: true, message: "Vui lòng nhập tên khoa!" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập tên khoa" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="semester"
              label="Học kỳ"
              rules={[{ required: true, message: "Vui lòng chọn học kỳ!" }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn học kỳ">
                <Option value="HK1">Học kỳ 1</Option>
                <Option value="HK2">Học kỳ 2</Option>
                <Option value="HK3">Học kỳ hè</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="year"
              label="Năm học"
              rules={[{ required: true, message: "Vui lòng chọn năm học!" }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn năm học">
                {[2023, 2024, 2025, 2026, 2027].map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="maxStudents"
              label="Số lượng sinh viên tối đa"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lượng sinh viên tối đa!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                max={200}
                placeholder="Số lượng tối đa"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Đang diễn ra</Option>
                <Option value="inactive">Chưa bắt đầu</Option>
                <Option value="completed">Đã kết thúc</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              ]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày bắt đầu"
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              ]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày kết thúc"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả khóa học" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
