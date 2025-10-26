import React, { useState, useEffect } from 'react';
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
  Spin,
  DatePicker,
  Popconfirm,
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
import { bankAccountService } from '../../../service/bankAccountService';
import { externalBankService } from '../../../service/helperService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const BankInfo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form] = Form.useForm();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho danh sách ngân hàng từ API ngoài
  const [bankList, setBankList] = useState([]);
  const [bankListLoading, setBankListLoading] = useState(false);

  // State cho chi nhánh
  const [branchList, setBranchList] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  // State cho ngân hàng đã chọn
  const [selectedBank, setSelectedBank] = useState(null);

  // State cho hiệu ứng loading của nút OK trong modal
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch danh sách ngân hàng từ helperService
  useEffect(() => {
    const fetchBanks = async () => {
      setBankListLoading(true);
      try {
        const banks = await externalBankService.getBanks();
        setBankList(banks);
      } catch {
        message.error('Không thể lấy danh sách ngân hàng!');
      }
      setBankListLoading(false);
    };
    fetchBanks();
  }, []);

  // Fetch bank accounts from API
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await bankAccountService.getUserBankAccounts();
      let accounts = Array.isArray(res) ? res : [];
      // Sắp xếp tài khoản mặc định lên đầu
      accounts = accounts.sort(
        (a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
      );
      setBankAccounts(accounts);
    } catch (err) {
      message.error('Không thể lấy danh sách tài khoản ngân hàng!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Khi chọn ngân hàng thì tự động fill tên đầy đủ ngân hàng, mã, logo, và gọi API lấy chi nhánh nếu có
  const handleBankChange = async (bankCode) => {
    const selected = bankList.find((b) => b.code === bankCode);
    setSelectedBank(selected);
    form.setFieldsValue({
      bankName: selected ? selected.name : '',
      bankCode: selected ? selected.code : '',
    });

    // Gọi API lấy chi nhánh nếu có (ví dụ: https://api.vietqr.io/v2/banks/{bankCode}/branches)
    setBranchList([]);
    if (bankCode) {
      setBranchLoading(true);
      try {
        // Giả sử có API này, nếu không có thì bỏ đoạn này đi
        // const res = await fetch(`https://api.vietqr.io/v2/banks/${bankCode}/branches`);
        // const data = await res.json();
        // setBranchList(Array.isArray(data.data) ? data.data : []);
        // Hiện tại không có API public, nên để user nhập tay
        setBranchList([]);
      } catch {
        setBranchList([]);
      }
      setBranchLoading(false);
    }
  };

  // Hàm format date về yyyy-MM-dd
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOk = async () => {
    setActionLoading(true);
    try {
      const values = await form.validateFields();
      let bankName = values.bankName;
      if (!bankName && bankList.length > 0) {
        const selected = bankList.find((b) => b.code === values.bankCode);
        bankName = selected ? selected.name : '';
      }
      // Format lại ngày về yyyy-MM-dd
      let dateCreateAccount = values.dateCreateAccount
        ? values.dateCreateAccount.format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

      let payload = {
        accountNumber: values.accountNumber,
        bankName: bankName,
        bankCode: values.bankCode,
        branch: values.branch,
        dateCreateAccount: dateCreateAccount,
        accountHolderName: values.accountHolderName,
        isDefault: true,
      };

      let res;
      if (editingAccount) {
        res = await bankAccountService.updateBankAccount(
          editingAccount.id,
          payload
        );
        if (res) {
          await fetchAccounts();
          message.success('Cập nhật tài khoản ngân hàng thành công!');
        }
      } else {
        res = await bankAccountService.createBankAccount(payload);
        if (res) {
          await fetchAccounts();
          message.success('Thêm tài khoản ngân hàng thành công!');
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      setSelectedBank(null);
      setBranchList([]);
    } catch (error) {
      // Validation failed
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalVisible(true);
    setSelectedBank(null);
    setBranchList([]);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    form.setFieldsValue({
      ...account,
      dateCreateAccount: account.dateCreateAccount
        ? dayjs(account.dateCreateAccount)
        : null,
    });
    setIsModalVisible(true);
    const selected = bankList.find((b) => b.code === account.bankCode);
    setSelectedBank(selected);
    // Nếu có API chi nhánh thì gọi ở đây
  };

  const handleDelete = async (id) => {
    const accountToDelete = bankAccounts.find((acc) => acc.id === id);
    if (accountToDelete?.isDefault) {
      message.error('Không thể xóa tài khoản mặc định!');
      return;
    }
    try {
      setLoading(true);
      await bankAccountService.deleteBankAccount(id);
      await fetchAccounts();
      message.success('Xóa tài khoản ngân hàng thành công!');
    } catch (error) {
      message.error(error.message || 'Xóa tài khoản thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await bankAccountService.setBankAccountDefault(id);
      await fetchAccounts();
      message.success('Đã đặt làm tài khoản mặc định!');
    } catch {
      message.error('Không thể đặt làm mặc định!');
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

      <Alert
        message="Bảo mật thông tin"
        description="Thông tin tài khoản ngân hàng của bạn được mã hóa và bảo vệ theo tiêu chuẩn bảo mật cao nhất. Chỉ sử dụng cho mục đích học phí và các giao dịch học vụ."
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <Spin style={{ width: '100%', margin: '48px 0' }} />
      ) : (
        <>
          {defaultAccount && (
            <Card
              title={
                <span>
                  <CreditCardOutlined style={{ marginRight: 8 }} />
                  Tài khoản mặc định
                </span>
              }
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
                      {defaultAccount.accountHolderName}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Chi nhánh">
                      {defaultAccount.branch}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={
                          defaultAccount.accountStatus === 1 ? 'green' : 'red'
                        }
                        icon={<CheckCircleOutlined />}
                      >
                        {defaultAccount.accountStatus === 1
                          ? 'Hoạt động'
                          : 'Không hoạt động'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {defaultAccount.dateCreateAccount}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          )}

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
                        <Popconfirm
                          title="Bạn có chắc chắn muốn xóa tài khoản này?"
                          description="Thao tác này không thể hoàn tác."
                          okText="Xóa"
                          okType="danger"
                          cancelText="Hủy"
                          onConfirm={() => handleDelete(account.id)}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                          </Button>
                        </Popconfirm>
                      ),
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        <BankOutlined
                          style={{ fontSize: 24, color: '#1890ff' }}
                        />
                      }
                      title={
                        <Space>
                          <span>{account.bankCode || '123'}</span>
                          {account.isDefault && (
                            <Tag color="gold">Mặc định</Tag>
                          )}
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
                            <strong>Chủ tài khoản:</strong>{' '}
                            {account.accountHolderName}
                          </Text>
                          <Text>
                            <strong>Chi nhánh:</strong> {account.branch}
                          </Text>
                          <Space>
                            <Text>
                              <strong>Trạng thái:</strong>
                            </Text>
                            <Tag
                              color={
                                account.accountStatus === 1 ? 'green' : 'red'
                              }
                              icon={<CheckCircleOutlined />}
                            >
                              {account.accountStatus === 1
                                ? 'Hoạt động'
                                : 'Không hoạt động'}
                            </Tag>
                            <Text type="secondary">
                              Tạo ngày: {account.dateCreateAccount}
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
                <Text type="secondary">
                  Chưa cập nhật tài khoản ngân hàng nào
                </Text>
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
        </>
      )}

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
        confirmLoading={actionLoading} // <-- loading hiệu ứng cho nút OK
      >
        {actionLoading && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Spin tip="Đang xử lý..." size="large" />
          </div>
        )}
        <Alert
          message="Lưu ý"
          description="Vui lòng kiểm tra kỹ thông tin tài khoản trước khi lưu. Thông tin sai có thể ảnh hưởng đến việc thanh toán học phí."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="bankCode"
            label="Ngân hàng"
            rules={[
              { required: true, message: 'Vui lòng chọn ngân hàng!' },
              {
                pattern: /^[A-Z0-9]{2,10}$/,
                message: 'Mã ngân hàng không hợp lệ!',
              },
            ]}
          >
            <Select
              placeholder="Chọn ngân hàng"
              loading={bankListLoading}
              showSearch
              optionFilterProp="children"
              onChange={handleBankChange}
              filterOption={(input, option) =>
                (option?.children ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={form.getFieldValue('bankCode')}
            >
              {bankList.map((bank) => (
                <Option key={bank.code} value={bank.code}>
                  <img
                    src={bank.logo}
                    alt={bank.shortName}
                    style={{
                      width: 24,
                      height: 24,
                      objectFit: 'contain',
                      marginRight: 8,
                      verticalAlign: 'middle',
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>{bank.shortName}</span>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Hiển thị logo, tên đầy đủ, mã ngân hàng khi đã chọn */}
          {selectedBank && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <img
                src={selectedBank.logo}
                alt={selectedBank.shortName}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: 'contain',
                  marginRight: 12,
                }}
              />
              <div>
                <div>
                  <b>{selectedBank.name}</b>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Mã ngân hàng: </span>
                  <b>{selectedBank.code}</b>
                </div>
              </div>
            </div>
          )}
          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập số tài khoản!' },
              {
                pattern: /^\d{8,20}$/,
                message: 'Số tài khoản phải có 8-20 chữ số!',
              },
            ]}
          >
            <Input placeholder="Nhập số tài khoản (8-20 chữ số)" />
          </Form.Item>

          <Form.Item
            name="accountHolderName"
            label="Chủ tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chủ tài khoản!' },
              {
                pattern: /^[A-ZÀ-Ỹ\s]{3,50}$/,
                message: 'Tên chủ tài khoản phải viết hoa, 3-50 ký tự!',
              },
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản (VIẾT HOA)" />
          </Form.Item>

          {/* Nếu có API chi nhánh thì dùng Select, không thì Input */}
          {branchList.length > 0 ? (
            <Form.Item
              name="branch"
              label="Chi nhánh"
              rules={[{ required: true, message: 'Vui lòng chọn chi nhánh!' }]}
            >
              <Select
                placeholder="Chọn chi nhánh"
                loading={branchLoading}
                showSearch
                optionFilterProp="children"
              >
                {branchList.map((branch) => (
                  <Option key={branch.code || branch.name} value={branch.name}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="branch"
              label="Chi nhánh"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chi nhánh!' },
                {
                  pattern: /^.{3,100}$/,
                  message: 'Tên chi nhánh từ 3-100 ký tự!',
                },
              ]}
            >
              <Input placeholder="VD: Chi nhánh Hà Nội" />
            </Form.Item>
          )}
          <Form.Item
            name="dateCreateAccount"
            label="Ngày cấp tài khoản"
            rules={[{ required: true, message: 'Vui lòng chọn ngày cấp!' }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              placeholder="Chọn ngày cấp tài khoản"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BankInfo;
