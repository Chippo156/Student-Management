import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const StudentManagement = () => {
  const [students, setStudents] = useState([
    {
      id: '2',
      studentCode: 'SV002',
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@student.edu.vn',
      phone: '0987654321',
      major: 'Kinh tế',
      year: 2022,
      gpa: 3.8,
      status: 'active',
      enrollmentDate: '2022-09-01',
    },
    {
      id: '3',
      studentCode: 'SV003',
      fullName: 'Lê Minh Cường',
      email: 'cuong.le@student.edu.vn',
      phone: '0369852147',
      major: 'Kỹ thuật máy',
      year: 2021,
      gpa: 3.2,
      status: 'graduated',
      enrollmentDate: '2021-09-01',
    },
    {
      id: '4',
      studentCode: 'SV004',
      fullName: 'Phạm Thu Dung',
      email: 'dung.pham@student.edu.vn',
      phone: '0147258369',
      major: 'Ngôn ngữ Anh',
      year: 2024,
      gpa: 3.9,
      status: 'active',
      enrollmentDate: '2024-09-01',
    },
    {
      id: '5',
      studentCode: 'SV005',
      fullName: 'Hoàng Văn Em',
      email: 'em.hoang@student.edu.vn',
      phone: '0258147963',
      major: 'Toán học',
      year: 2023,
      gpa: 3.7,
      status: 'inactive',
      enrollmentDate: '2023-09-01',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      ...student,
      enrollmentDate: dayjs(student.enrollmentDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setStudents(students.filter((student) => student.id !== id));
    message.success('Xóa sinh viên thành công!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newStudent = {
        id: editingStudent ? editingStudent.id : Date.now().toString(),
        ...values,
        enrollmentDate: values.enrollmentDate.format('YYYY-MM-DD'),
      };

      if (editingStudent) {
        setStudents(
          students.map((student) =>
            student.id === editingStudent.id ? newStudent : student
          )
        );
        message.success('Cập nhật sinh viên thành công!');
      } else {
        setStudents([...students, newStudent]);
        message.success('Thêm sinh viên thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingStudent(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingStudent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'graduated':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang học';
      case 'inactive':
        return 'Tạm nghỉ';
      case 'graduated':
        return 'Đã tốt nghiệp';
      default:
        return status;
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(searchText.toLowerCase()) ||
      student.major.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 100,
    },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', width: 180 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Chuyên ngành', dataIndex: 'major', key: 'major', width: 150 },
    { title: 'Năm học', dataIndex: 'year', key: 'year', width: 80 },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      width: 80,
      render: (gpa) => gpa.toFixed(1),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Ngày nhập học',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'action',
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
            description="Bạn có chắc chắn muốn xóa sinh viên này?"
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
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Input
            placeholder="Tìm kiếm sinh viên..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm sinh viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        pagination={{
          total: filteredStudents.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sinh viên`,
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
      />

      <Modal
        title={editingStudent ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        okText={editingStudent ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            year: new Date().getFullYear(),
            gpa: 0,
          }}
        >
          <Form.Item
            name="studentCode"
            label="Mã sinh viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}
          >
            <Input placeholder="Nhập mã sinh viên" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="major"
            label="Chuyên ngành"
            rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành!' }]}
          >
            <Input placeholder="Nhập chuyên ngành" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Năm học"
            rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
          >
            <Select placeholder="Chọn năm học">
              {[2021, 2022, 2023, 2024, 2025].map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="gpa"
            label="GPA"
            rules={[
              { required: true, message: 'Vui lòng nhập GPA!' },
              {
                validator: (_, value) =>
                  value >= 0 && value <= 4
                    ? Promise.resolve()
                    : Promise.reject('GPA phải từ 0 đến 4!'),
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Nhập GPA"
              step="0.1"
              min="0"
              max="4"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang học</Option>
              <Option value="inactive">Tạm nghỉ</Option>
              <Option value="graduated">Đã tốt nghiệp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="enrollmentDate"
            label="Ngày nhập học"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày nhập học!' },
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Chọn ngày nhập học"
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
