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
  Statistic,
  Timeline,
  Divider,
} from 'antd';
import {
  BankOutlined,
  CreditCardOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import { bankAccountService } from '../../../service/bankAccountService';
import { externalBankService } from '../../../service/helperService';
import dayjs from 'dayjs';
import BankAccountDefaultCard from '../../../component/Student/General information/BankInfo/BankAccountDefaultCard';
import BankAccountList from '../../../component/Student/General information/BankInfo/BankAccountList';
import BankAccountModal from '../../../component/Student/General information/BankInfo/BankAccountModal';

const { Title, Text } = Typography;
const { Option } = Select;

const BankInfo = () => {
  const theme = useTheme();
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

  // Mock data for transaction history
  const mockTransactions = [
    {
      id: 1,
      type: 'payment',
      amount: 5000000,
      description: 'Học phí học kỳ 1 năm 2024-2025',
      date: dayjs().subtract(5, 'day'),
      status: 'completed',
    },
    {
      id: 2,
      type: 'refund',
      amount: 500000,
      description: 'Hoàn tiền học phí - Hủy môn học',
      date: dayjs().subtract(15, 'day'),
      status: 'completed',
    },
    {
      id: 3,
      type: 'payment',
      amount: 200000,
      description: 'Lệ phí đăng ký thi lại',
      date: dayjs().subtract(30, 'day'),
      status: 'completed',
    },
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
          <BankOutlined style={{ marginRight: 8, color: theme.palette.primary.main }} />
          Thông tin ngân hàng
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm tài khoản
        </Button>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Tổng tài khoản</span>}
              value={bankAccounts.length || 0}
              prefix={<BankOutlined style={{ color: theme.palette.primary.main }} />}
              valueStyle={{ color: theme.palette.primary.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Tài khoản đã xác thực</span>}
              value={bankAccounts.filter(acc => acc.isDefault).length || 0}
              prefix={<CheckCircleOutlined style={{ color: theme.palette.success.main }} />}
              valueStyle={{ color: theme.palette.success.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Giao dịch tháng này</span>}
              value={mockTransactions.length}
              prefix={<HistoryOutlined style={{ color: theme.palette.secondary.main }} />}
              valueStyle={{ color: theme.palette.secondary.main }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Tổng chi phí</span>}
              value={5700}
              suffix="K VNĐ"
              prefix={<DollarOutlined style={{ color: theme.palette.warning.main }} />}
              valueStyle={{ color: theme.palette.warning.main }}
            />
          </Card>
        </Col>
      </Row>

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
          <BankAccountDefaultCard defaultAccount={defaultAccount} />

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
              <Card
                bordered={false}
                title={
                  <Space>
                    <BankOutlined style={{ color: theme.palette.primary.main }} />
                    <Text strong style={{ color: theme.palette.text.primary }}>
                      Danh sách tài khoản ({bankAccounts.length})
                    </Text>
                  </Space>
                }
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <BankAccountList
                  bankAccounts={bankAccounts}
                  onEdit={handleEdit}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Transaction History */}
              <Card
                bordered={false}
                title={
                  <Space>
                    <HistoryOutlined style={{ color: theme.palette.primary.main }} />
                    <Text strong style={{ color: theme.palette.text.primary }}>Lịch sử giao dịch</Text>
                  </Space>
                }
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
              >
                <Timeline
                  items={mockTransactions.map(transaction => ({
                    color: transaction.type === 'payment' ? theme.palette.error.main : theme.palette.success.main,
                    children: (
                      <div>
                        <Text strong style={{ color: theme.palette.text.primary, display: 'block' }}>
                          {transaction.type === 'payment' ? '- ' : '+ '}
                          {transaction.amount.toLocaleString('vi-VN')} VNĐ
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          {transaction.description}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          <ClockCircleOutlined /> {transaction.date.format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              </Card>

              {/* Payment Reminders */}
              <Card
                bordered={false}
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: theme.palette.warning.main }} />
                    <Text strong style={{ color: theme.palette.text.primary }}>Nhắc nhở thanh toán</Text>
                  </Space>
                }
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div style={{
                    padding: 12,
                    background: alpha(theme.palette.warning.main, 0.1),
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                    borderRadius: 4,
                  }}>
                    <Text strong style={{ color: theme.palette.text.primary, display: 'block' }}>
                      Học phí học kỳ 2
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Hạn: {dayjs().add(30, 'day').format('DD/MM/YYYY')}
                    </Text>
                    <br />
                    <Tag color="warning" style={{ marginTop: 8 }}>Còn 30 ngày</Tag>
                  </div>
                  <div style={{
                    padding: 12,
                    background: alpha(theme.palette.info.main, 0.1),
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                    borderRadius: 4,
                  }}>
                    <Text strong style={{ color: theme.palette.text.primary, display: 'block' }}>
                      Lệ phí thi cuối kỳ
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Hạn: {dayjs().add(45, 'day').format('DD/MM/YYYY')}
                    </Text>
                    <br />
                    <Tag color="blue" style={{ marginTop: 8 }}>Còn 45 ngày</Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <BankAccountModal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        form={form}
        editingAccount={editingAccount}
        actionLoading={actionLoading}
        bankList={bankList}
        bankListLoading={bankListLoading}
        selectedBank={selectedBank}
        handleBankChange={handleBankChange}
        branchList={branchList}
        branchLoading={branchLoading}
      />
    </div>
  );
};

export default BankInfo;
