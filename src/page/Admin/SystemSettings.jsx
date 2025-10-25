import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  Upload,
  message,
  Divider,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Tabs,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  LockOutlined,
  NotificationOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SystemSettings = () => {
  const [config, setConfig] = useState({
    systemName: "Hệ thống quản lý sinh viên",
    systemLogo: "",
    mainColor: "#1890ff",
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",

    academicYear: "2024-2025",
    semesterSystem: "2-semester",
    gradeScale: "10-point",
    minPassingGrade: 5.0,
    maxCreditsPerSemester: 24,

    emailNotifications: true,
    smsNotifications: false,
    systemAnnouncements: true,
    gradeNotifications: true,

    passwordPolicy: "medium",
    sessionTimeout: 30,
    twoFactorAuth: false,

    maintenanceMode: false,
    backupFrequency: "daily",
    logRetention: 30,
  });

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      setConfig({ ...config, ...values });
      message.success("Cài đặt hệ thống đã được lưu thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu cài đặt!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info("Đã khôi phục về cài đặt gốc");
  };

  const uploadProps = {
    name: "file",
    action: "/api/upload",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} tải lên thành công`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <SettingOutlined style={{ marginRight: 8 }} />
            Cài đặt hệ thống
          </Title>
          <Text type="secondary">
            Quản lý các cài đặt chung của hệ thống quản lý sinh viên
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onFinish={handleSave}
        >
          <Tabs defaultActiveKey="general" type="card">
            {/* Tab 1 - Cài đặt chung */}
            <TabPane
              tab={
                <span>
                  <UserOutlined /> Cài đặt chung
                </span>
              }
              key="general"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="systemName"
                    label="Tên hệ thống"
                    rules={[{ required: true, message: "Vui lòng nhập tên hệ thống!" }]}
                  >
                    <Input placeholder="Nhập tên hệ thống" />
                  </Form.Item>

                  <Form.Item
                    name="language"
                    label="Ngôn ngữ"
                    rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
                  >
                    <Select placeholder="Chọn ngôn ngữ">
                      <Option value="vi">Tiếng Việt</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="timezone"
                    label="Múi giờ"
                    rules={[{ required: true, message: "Vui lòng chọn múi giờ!" }]}
                  >
                    <Select placeholder="Chọn múi giờ">
                      <Option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</Option>
                      <Option value="Asia/Bangkok">Bangkok (UTC+7)</Option>
                      <Option value="Asia/Shanghai">Shanghai (UTC+8)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="mainColor" label="Màu chủ đạo">
                    <Input type="color" />
                  </Form.Item>

                  <Form.Item name="systemLogo" label="Logo hệ thống">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>Tải lên logo</Button>
                    </Upload>
                  </Form.Item>

                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <Avatar size={64} icon={<UserOutlined />} />
                    <div style={{ marginTop: 8 }}>
                      <Text>Logo hiện tại</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </TabPane>

            {/* Tab 2 - Học vụ */}
            <TabPane
              tab={
                <span>
                  <DatabaseOutlined /> Cài đặt học vụ
                </span>
              }
              key="academic"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="academicYear"
                    label="Năm học"
                    rules={[{ required: true, message: "Vui lòng nhập năm học!" }]}
                  >
                    <Input placeholder="Ví dụ: 2024-2025" />
                  </Form.Item>

                  <Form.Item
                    name="semesterSystem"
                    label="Hệ thống học kỳ"
                    rules={[{ required: true, message: "Vui lòng chọn hệ thống học kỳ!" }]}
                  >
                    <Select placeholder="Chọn hệ thống học kỳ">
                      <Option value="2-semester">2 học kỳ chính + hè</Option>
                      <Option value="3-semester">3 học kỳ</Option>
                      <Option value="4-quarter">4 quý</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="gradeScale"
                    label="Thang điểm"
                    rules={[{ required: true, message: "Vui lòng chọn thang điểm!" }]}
                  >
                    <Select placeholder="Chọn thang điểm">
                      <Option value="10-point">Thang điểm 10</Option>
                      <Option value="4-point">Thang điểm 4</Option>
                      <Option value="100-point">Thang điểm 100</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="minPassingGrade"
                    label="Điểm đậu tối thiểu"
                    rules={[{ required: true, message: "Vui lòng nhập điểm đậu tối thiểu!" }]}
                  >
                    <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    name="maxCreditsPerSemester"
                    label="Tín chỉ tối đa mỗi học kỳ"
                    rules={[{ required: true, message: "Vui lòng nhập số tín chỉ tối đa!" }]}
                  >
                    <InputNumber min={10} max={50} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Tab 3 - Thông báo */}
            <TabPane
              tab={
                <span>
                  <NotificationOutlined /> Thông báo
                </span>
              }
              key="notifications"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="Cài đặt thông báo" size="small">
                    <Form.Item name="emailNotifications" label="Thông báo qua Email" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="smsNotifications" label="Thông báo qua SMS" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="systemAnnouncements" label="Thông báo hệ thống" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="gradeNotifications" label="Thông báo điểm số" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Cấu hình email" size="small">
                    <Form.Item name="smtpServer" label="SMTP Server">
                      <Input placeholder="smtp.gmail.com" />
                    </Form.Item>
                    <Form.Item name="smtpPort" label="SMTP Port">
                      <InputNumber style={{ width: "100%" }} placeholder="587" />
                    </Form.Item>
                    <Form.Item name="emailUsername" label="Email Username">
                      <Input placeholder="admin@school.edu.vn" />
                    </Form.Item>
                    <Form.Item name="emailPassword" label="Email Password">
                      <Input.Password placeholder="Mật khẩu email" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Tab 4 - Bảo mật */}
            <TabPane
              tab={
                <span>
                  <SecurityScanOutlined /> Bảo mật
                </span>
              }
              key="security"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="Chính sách mật khẩu" size="small">
                    <Form.Item
                      name="passwordPolicy"
                      label="Độ mạnh mật khẩu"
                      rules={[{ required: true, message: "Vui lòng chọn độ mạnh mật khẩu!" }]}
                    >
                      <Select placeholder="Chọn độ mạnh mật khẩu">
                        <Option value="weak">Yếu (6+ ký tự)</Option>
                        <Option value="medium">Trung bình (8+ ký tự, chữ và số)</Option>
                        <Option value="strong">Mạnh (12+ ký tự, chữ, số, ký tự đặc biệt)</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="sessionTimeout"
                      label="Thời gian hết phiên (phút)"
                      rules={[{ required: true, message: "Vui lòng nhập thời gian hết phiên!" }]}
                    >
                      <InputNumber min={5} max={1440} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="twoFactorAuth" label="Xác thực 2 bước" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Cài đặt bảo trì" size="small">
                    <Form.Item name="maintenanceMode" label="Chế độ bảo trì" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      name="backupFrequency"
                      label="Tần suất sao lưu"
                      rules={[{ required: true, message: "Vui lòng chọn tần suất sao lưu!" }]}
                    >
                      <Select placeholder="Chọn tần suất sao lưu">
                        <Option value="hourly">Mỗi giờ</Option>
                        <Option value="daily">Hàng ngày</Option>
                        <Option value="weekly">Hàng tuần</Option>
                        <Option value="monthly">Hàng tháng</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="logRetention"
                      label="Thời gian lưu log (ngày)"
                      rules={[{ required: true, message: "Vui lòng nhập thời gian lưu log!" }]}
                    >
                      <InputNumber min={1} max={365} style={{ width: "100%" }} />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Tab 5 - Thông tin hệ thống */}
            <TabPane
              tab={
                <span>
                  <LockOutlined /> Thông tin hệ thống
                </span>
              }
              key="about"
            >
              <Card>
                <Row gutter={24}>
                  <Col span={12}>
                    <Text strong>Tên hệ thống:</Text>
                    <div>{config.systemName}</div>
                    <Text strong>Phiên bản:</Text>
                    <div>v1.0.0</div>
                    <Text strong>Ngày phát hành:</Text>
                    <div>27/09/2025</div>
                    <Text strong>Nhà phát triển:</Text>
                    <div>Đại học XYZ</div>
                  </Col>
                  <Col span={12}>
                    <Text strong>Số lượng sinh viên:</Text>
                    <div>1,250 sinh viên</div>
                    <Text strong>Số lượng môn học:</Text>
                    <div>325 môn học</div>
                    <Text strong>Dung lượng database:</Text>
                    <div>2.5 GB</div>
                    <Text strong>Lần sao lưu cuối:</Text>
                    <div>27/09/2025 02:00 AM</div>
                  </Col>
                </Row>

                <Divider />
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary">
                    © 2025 Hệ thống quản lý sinh viên. Tất cả quyền được bảo lưu.
                  </Text>
                </div>
              </Card>
            </TabPane>
          </Tabs>

          <Divider />
          <div style={{ textAlign: "center" }}>
            <Space>
              <Button onClick={handleReset}>Khôi phục mặc định</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu cài đặt
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;
