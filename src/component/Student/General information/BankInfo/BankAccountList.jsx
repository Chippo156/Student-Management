import React from 'react';
import { List, Button, Tag, Space, Typography, Popconfirm } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  BankOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BankAccountList = ({ bankAccounts, onEdit, onSetDefault, onDelete }) => (
  <List
    itemLayout="vertical"
    dataSource={bankAccounts}
    renderItem={(account) => (
      <List.Item
        actions={[
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(account)}
          >
            Chỉnh sửa
          </Button>,
          !account.isDefault && (
            <Button type="link" onClick={() => onSetDefault(account.id)}>
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
              onConfirm={() => onDelete(account.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          ),
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={<BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
          title={
            <Space>
              <span>{account.bankCode || '123'}</span>
              {account.isDefault && <Tag color="gold">Mặc định</Tag>}
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
                <strong>Chủ tài khoản:</strong> {account.accountHolderName}
              </Text>
              <Text>
                <strong>Chi nhánh:</strong> {account.branch}
              </Text>
              <Space>
                <Text>
                  <strong>Trạng thái:</strong>
                </Text>
                <Tag
                  color={account.accountStatus === 1 ? 'green' : 'red'}
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
);

export default BankAccountList;
