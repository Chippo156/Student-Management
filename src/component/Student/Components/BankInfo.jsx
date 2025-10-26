import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Row,
  Col,
  Descriptions,
  Alert,
  Tag,
  List,
} from 'antd';
import {
  BankOutlined,
  CreditCardOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const BankInfo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form] = Form.useForm();

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: '1',
      bankName: 'Ngân hàng TMCP Công Thương Việt Nam',
      bankCode: 'VietinBank',
      accountNumber: '1234567890123',
      accountHolder: 'NGUYEN VAN A',
      branchName: 'Chi nhánh Hà Nội',
      accountType: 'savings',
      isDefault: true,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: '2',
      bankName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
      bankCode: 'BIDV',
      accountNumber: '9876543210987',
      accountHolder: 'NGUYEN VAN A',
      branchName: 'Chi nhánh Cầu Giấy',
      accountType: 'checking',
      isDefault: false,
      status: 'active',
      createdDate: '2024-02-20',
    },
  ]);

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    const accountToDelete = bankAccounts.find((acc) => acc.id === id);
    if (accountToDelete?.isDefault) {
      message.error('Không thể xóa tài khoản mặc định!');
      return;
    }
    setBankAccounts(bankAccounts.filter((account) => account.id !== id));
    message.success('Xóa tài khoản ngân hàng thành công!');
  };

  const handleSetDefault = (id) => {
    setBankAccounts(
      bankAccounts.map((account) => ({
        ...account,
        isDefault: account.id === id,
      }))
    );
    message.success('Đã đặt làm tài khoản mặc định!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newAccount = {
        id: editingAccount ? editingAccount.id : Date.now().toString(),
        ...values,
        accountHolder: values.accountHolder.toUpperCase(),
        isDefault: editingAccount
          ? editingAccount.isDefault
          : bankAccounts.length === 0,
        status: 'active',
        createdDate: editingAccount
          ? editingAccount.createdDate
          : new Date().toISOString().split('T')[0],
      };

      if (editingAccount) {
        setBankAccounts(
          bankAccounts.map((account) =>
            account.id === editingAccount.id ? newAccount : account
          )
        );
        message.success('Cập nhật thông tin ngân hàng thành công!');
      } else {
        setBankAccounts([...bankAccounts, newAccount]);
        message.success('Thêm tài khoản ngân hàng thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getAccountTypeText = (type) => {
    switch (type) {
      case 'savings':
        return 'Tiết kiệm';
      case 'checking':
        return 'Thanh toán';
      default:
        return type;
    }
  };

  const defaultAccount = bankAccounts.find((account) => account.isDefault);

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2}>
          <BankOutlined style={{ marginRight: 8 }} />
          Thông tin ngân hàng
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm tài khoản
        </Button>
      </div>

      {/* Security Notice */}
      <Alert
        message="Bảo mật thông tin"
        description="Thông tin tài khoản ngân hàng của bạn được mã hóa và bảo vệ theo tiêu chuẩn bảo mật cao nhất. Chỉ sử dụng cho mục đích học phí và các giao dịch học vụ."
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Default Account */}
      {defaultAccount && (
        <Card
          title={
            <span>
              <CreditCardOutlined style={{ marginRight: 8 }} />
              Tài khoản mặc định
            </span>
          }
          extra={<Tag color="gold">Mặc định</Tag>}
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ngân hàng">
                  {defaultAccount.bankName}
                </Descriptions.Item>
                <Descriptions.Item label="Mã ngân hàng">
                  {defaultAccount.bankCode}
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  <Text copyable={{ text: defaultAccount.accountNumber }}>
                    {defaultAccount.accountNumber}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chủ tài khoản">
                  {defaultAccount.accountHolder}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Chi nhánh">
                  {defaultAccount.branchName}
                </Descriptions.Item>
                <Descriptions.Item label="Loại tài khoản">
                  {getAccountTypeText(defaultAccount.accountType)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Hoạt động
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {defaultAccount.createdDate}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>
      )}

      {/* All Bank Accounts */}
      <Card
        title={
          <span>
            <BankOutlined style={{ marginRight: 8 }} />
            Danh sách tài khoản ({bankAccounts.length})
          </span>
        }
      >
        {bankAccounts.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={bankAccounts}
            renderItem={(account) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(account)}
                  >
                    Chỉnh sửa
                  </Button>,
                  !account.isDefault && (
                    <Button
                      type="link"
                      onClick={() => handleSetDefault(account.id)}
                    >
                      Đặt làm mặc định
                    </Button>
                  ),
                  !account.isDefault && (
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(account.id)}
                    >
                      Xóa
                    </Button>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  }
                  title={
                    <Space>
                      <span>{account.bankCode}</span>
                      {account.isDefault && <Tag color="gold">Mặc định</Tag>}
                      <Tag color="green">
                        {getAccountTypeText(account.accountType)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>
                        <strong>Ngân hàng:</strong> {account.bankName}
                      </Text>
                      <Text>
                        <strong>Số tài khoản:</strong>
                        <Text
                          copyable={{ text: account.accountNumber }}
                          style={{ marginLeft: 8 }}
                        >
                          {account.accountNumber}
                        </Text>
                      </Text>
                      <Text>
                        <strong>Chủ tài khoản:</strong> {account.accountHolder}
                      </Text>
                      <Text>
                        <strong>Chi nhánh:</strong> {account.branchName}
                      </Text>
                      <Space>
                        <Text>
                          <strong>Trạng thái:</strong>
                        </Text>
                        <Tag
                          color={account.status === 'active' ? 'green' : 'red'}
                          icon={<CheckCircleOutlined />}
                        >
                          {account.status === 'active'
                            ? 'Hoạt động'
                            : 'Không hoạt động'}
                        </Tag>
                        <Text type="secondary">
                          Tạo ngày: {account.createdDate}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <BankOutlined
              style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}
            />
            <Text type="secondary">Chưa cập nhật tài khoản ngân hàng nào</Text>
            <br />
            <Button
              type="primary"
              onClick={handleAdd}
              style={{ marginTop: 16 }}
            >
              Thêm tài khoản đầu tiên
            </Button>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={
          editingAccount
            ? 'Chỉnh sửa tài khoản ngân hàng'
            : 'Thêm tài khoản ngân hàng'
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingAccount ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Alert
          message="Lưu ý"
          description="Vui lòng kiểm tra kỹ thông tin tài khoản trước khi lưu. Thông tin sai có thể ảnh hưởng đến việc thanh toán học phí."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="bankCode"
              label="Mã ngân hàng"
              rules={[{ required: true, message: 'Vui lòng chọn ngân hàng!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn ngân hàng">
                <Option value="VietinBank">VietinBank</Option>
                <Option value="BIDV">BIDV</Option>
                <Option value="Vietcombank">Vietcombank</Option>
                <Option value="Agribank">Agribank</Option>
                <Option value="VPBank">VPBank</Option>
                <Option value="Techcombank">Techcombank</Option>
                <Option value="MBBank">MBBank</Option>
                <Option value="ACB">ACB</Option>
                <Option value="SHB">SHB</Option>
                <Option value="TPBank">TPBank</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="accountType"
              label="Loại tài khoản"
              rules={[
                { required: true, message: 'Vui lòng chọn loại tài khoản!' },
              ]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn loại">
                <Option value="savings">Tiết kiệm</Option>
                <Option value="checking">Thanh toán</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="bankName"
            label="Tên đầy đủ ngân hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên ngân hàng!' },
            ]}
          >
            <Input placeholder="VD: Ngân hàng TMCP Công Thương Việt Nam" />
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập số tài khoản!' },
              {
                pattern: /^\d{10,16}$/,
                message: 'Số tài khoản phải có 10-16 chữ số!',
              },
            ]}
          >
            <Input placeholder="Nhập số tài khoản (10-16 chữ số)" />
          </Form.Item>

          <Form.Item
            name="accountHolder"
            label="Chủ tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chủ tài khoản!' },
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản (VIẾT HOA)" />
          </Form.Item>

          <Form.Item
            name="branchName"
            label="Chi nhánh"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chi nhánh!' },
            ]}
          >
            <Input placeholder="VD: Chi nhánh Hà Nội" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BankInfo;
