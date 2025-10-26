import React from 'react';
import { Card, Row, Col, Descriptions, Tag, Typography } from 'antd';
import { CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const BankAccountDefaultCard = ({ defaultAccount }) => {
  if (!defaultAccount) return null;
  return (
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
                color={defaultAccount.accountStatus === 1 ? 'green' : 'red'}
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
  );
};

export default BankAccountDefaultCard;
