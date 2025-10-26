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
import BankAccountDefaultCard from '../../../component/Student/General information/BankInfo/BankAccountDefaultCard';
import BankAccountList from '../../../component/Student/General information/BankInfo/BankAccountList';
import BankAccountModal from '../../../component/Student/General information/BankInfo/BankAccountModal';

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
          <BankAccountDefaultCard defaultAccount={defaultAccount} />
          <Card
            title={
              <span>
                <BankOutlined style={{ marginRight: 8 }} />
                Danh sách tài khoản ({bankAccounts.length})
              </span>
            }
          >
            <BankAccountList
              bankAccounts={bankAccounts}
              onEdit={handleEdit}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          </Card>
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
