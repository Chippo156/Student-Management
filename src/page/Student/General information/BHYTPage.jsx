import React, { useState } from 'react';
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Empty,
  Descriptions,
  Alert,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BHYTPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const [insuranceInfo] =
    useState <
    InsuranceInfo >
    {
      id: '1',
      cardNumber: 'HS4030012345678',
      holderName: 'Nguyễn Văn A',
      dateOfBirth: '2002-05-15',
      gender: 'male',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      phone: '0123456789',
      issueDate: '2024-01-01',
      expiryDate: '2025-12-31',
      issuedBy: 'BHXH TP.HCM',
      status: 'active',
      hospitalRegistered: 'Bệnh viện Đại học Y Dược TP.HCM',
      medicalHistory: [
        {
          id: '1',
          date: '2024-09-15',
          hospital: 'Bệnh viện Đại học Y Dược TP.HCM',
          diagnosis: 'Cảm cúm thông thường',
          treatment: 'Thuốc hạ sốt, kháng sinh',
          cost: 250000,
          covered: 200000,
          notes: 'Nghỉ ngơi 3 ngày',
        },
        {
          id: '2',
          date: '2024-08-20',
          hospital: 'Phòng khám Đa khoa Medlatec',
          diagnosis: 'Khám sức khỏe định kỳ',
          treatment: 'Xét nghiệm máu, đo huyết áp',
          cost: 180000,
          covered: 144000,
          notes: 'Sức khỏe tốt',
        },
        {
          id: '3',
          date: '2024-07-10',
          hospital: 'Bệnh viện Chợ Rẫy',
          diagnosis: 'Viêm họng cấp',
          treatment: 'Thuốc kháng viêm, xịt họng',
          cost: 320000,
          covered: 256000,
          notes: 'Tái khám sau 1 tuần',
        },
      ],
    };

  const [medicalHistory, setMedicalHistory] = useState(
    insuranceInfo.medicalHistory
  );

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setMedicalHistory(medicalHistory.filter((record) => record.id !== id));
    message.success('Xóa hồ sơ khám bệnh thành công!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newRecord = {
        id: editingRecord ? editingRecord.id : Date.now().toString(),
        ...values,
      };

      if (editingRecord) {
        setMedicalHistory(
          medicalHistory.map((record) =>
            record.id === editingRecord.id ? newRecord : record
          )
        );
        message.success('Cập nhật hồ sơ khám bệnh thành công!');
      } else {
        setMedicalHistory([...medicalHistory, newRecord]);
        message.success('Thêm hồ sơ khám bệnh thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'suspended':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Còn hiệu lực';
      case 'expired':
        return 'Hết hạn';
      case 'suspended':
        return 'Tạm dừng';
      default:
        return status;
    }
  };

  const totalCost = medicalHistory.reduce(
    (sum, record) => sum + record.cost,
    0
  );
  const totalCovered = medicalHistory.reduce(
    (sum, record) => sum + record.covered,
    0
  );
  const coverageRate = totalCost > 0 ? (totalCovered / totalCost) * 100 : 0;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <MedicineBoxOutlined style={{ marginRight: 8 }} />
        Thông tin BHYT
      </Title>

      {/* Insurance Card Info */}
      <Card
        title={
          <span>
            <IdcardOutlined style={{ marginRight: 8 }} />
            Thẻ BHYT
          </span>
        }
        style={{ marginBottom: 24 }}
        extra={
          <Tag
            color={getStatusColor(insuranceInfo.status)}
            icon={<CheckCircleOutlined />}
          >
            {getStatusText(insuranceInfo.status)}
          </Tag>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Số thẻ">
                {insuranceInfo.cardNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {insuranceInfo.holderName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {insuranceInfo.dateOfBirth}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {insuranceInfo.gender === 'male' ? 'Nam' : 'Nữ'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Ngày cấp">
                {insuranceInfo.issueDate}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                {insuranceInfo.expiryDate}
              </Descriptions.Item>
              <Descriptions.Item label="Nơi cấp">
                {insuranceInfo.issuedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Nơi ĐK KCB">
                {insuranceInfo.hospitalRegistered}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <PhoneOutlined />
            <Text>Số điện thoại: {insuranceInfo.phone}</Text>
          </Space>
          <Space>
            <EnvironmentOutlined />
            <Text>Địa chỉ: {insuranceInfo.address}</Text>
          </Space>
        </Space>

        {insuranceInfo.status === 'expired' && (
          <Alert
            message="Thẻ BHYT đã hết hạn"
            description="Vui lòng liên hệ cơ quan BHXH để gia hạn thẻ."
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng chi phí"
              value={totalCost}
              suffix="₫"
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="BHYT chi trả"
              value={totalCovered}
              suffix="₫"
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chi trả"
              value={coverageRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số lần khám"
              value={medicalHistory.length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Medical History */}
      <Card
        title={
          <span>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Lịch sử khám chữa bệnh
          </span>
        }
        extra={
          <Button type="primary" onClick={handleAdd}>
            Thêm hồ sơ
          </Button>
        }
      >
        {medicalHistory.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={medicalHistory.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )}
            renderItem={(record) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => handleEdit(record)}>
                    Chỉnh sửa
                  </Button>,
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDelete(record.id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{record.diagnosis}</Text>
                      <Tag color="blue">{record.date}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>
                        <strong>Bệnh viện:</strong> {record.hospital}
                      </Text>
                      <Text>
                        <strong>Điều trị:</strong> {record.treatment}
                      </Text>
                      <Space>
                        <Text>
                          <strong>Chi phí:</strong>{' '}
                          {record.cost.toLocaleString()}₫
                        </Text>
                        <Text type="success">
                          <strong>BHYT chi trả:</strong>{' '}
                          {record.covered.toLocaleString()}₫
                        </Text>
                        <Text type="secondary">
                          <strong>Tự trả:</strong>{' '}
                          {(record.cost - record.covered).toLocaleString()}₫
                        </Text>
                      </Space>
                      {record.notes && (
                        <Text type="secondary">
                          <strong>Ghi chú:</strong> {record.notes}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa cập nhật hồ sơ khám chữa bệnh nào" />
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={
          editingRecord ? 'Chỉnh sửa hồ sơ khám bệnh' : 'Thêm hồ sơ khám bệnh'
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingRecord ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="Ngày khám"
            rules={[{ required: true, message: 'Vui lòng nhập ngày khám!' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="hospital"
            label="Bệnh viện/Phòng khám"
            rules={[
              { required: true, message: 'Vui lòng nhập tên bệnh viện!' },
            ]}
          >
            <Input placeholder="Nhập tên bệnh viện hoặc phòng khám" />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="Chẩn đoán"
            rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán!' }]}
          >
            <Input placeholder="Nhập chẩn đoán bệnh" />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="Điều trị"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập phương pháp điều trị!',
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Nhập phương pháp điều trị" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="cost"
              label="Tổng chi phí (₫)"
              rules={[{ required: true, message: 'Vui lòng nhập chi phí!' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="covered"
              label="BHYT chi trả (₫)"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập số tiền BHYT chi trả!',
                },
              ]}
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BHYTPage;
