import React from 'react';
import { Card, Input, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * UserFilterBar - Thanh tìm kiếm và lọc user
 */
const UserFilterBar = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  onAddUser,
}) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Input.Search
          allowClear
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 260 }}
        />
        <Select
          value={filterRole}
          onChange={(value) => setFilterRole(value)}
          style={{ width: 180 }}
          placeholder="Vai trò"
        >
          <Option value="all">Tất cả vai trò</Option>
          <Option value="admin">Quản trị viên</Option>
          <Option value="giảng viên">Giảng viên</Option>
          <Option value="sinh viên">Sinh viên</Option>
        </Select>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddUser}>
            Thêm mới
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserFilterBar;
