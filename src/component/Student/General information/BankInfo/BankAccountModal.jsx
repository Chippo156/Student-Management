import React from 'react';
import { Modal, Form, Input, Select, Alert, DatePicker, Spin } from 'antd';

const { Option } = Select;

const BankAccountModal = ({
  visible,
  onOk,
  onCancel,
  form,
  editingAccount,
  actionLoading,
  bankList,
  bankListLoading,
  selectedBank,
  handleBankChange,
  branchList,
  branchLoading,
}) => (
  <Modal
    title={
      editingAccount
        ? 'Chỉnh sửa tài khoản ngân hàng'
        : 'Thêm tài khoản ngân hàng'
    }
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    width={600}
    okText={editingAccount ? 'Cập nhật' : 'Thêm'}
    cancelText="Hủy"
    confirmLoading={actionLoading}
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
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
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
);

export default BankAccountModal;
