import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Button,
  Avatar,
  Tooltip,
  Tag,
  message,
  Popconfirm,
  Table,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  FlagOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import { accountStatusMap } from '../../../component/Admin/UserManagementPage/constants';
import UserFilterBar from '../../../component/Admin/UserManagementPage/UserFilterBar';
import UserDetailModal from '../../../component/Admin/UserManagementPage/UserDetailModal';
import UserEditModal from '../../../component/Admin/UserManagementPage/UserEditModal';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getAllUsers(pageNumber, pageSize);
    if (res) {
      setUsers(res.items || []);
      setTotalCount(res.totalCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [pageNumber, pageSize]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole !== 'all') {
      filtered = filtered.filter(
        (user) => user.role?.roleName?.toLowerCase() === filterRole
      );
    }
    return filtered;
  }, [users, searchTerm, filterRole]);

  const handleTableChange = (pagination) => {
    setPageNumber(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Handle edit save
  const handleEditSave = async (payload) => {
    setEditLoading(true);
    const res = await userService.updateUserWithRole(selectedUser.userId, payload);
    setEditLoading(false);
    if (res) {
      message.success('Cập nhật người dùng thành công!');
      setOpenEdit(false);
      fetchUsers();
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={record.avatarUrl}
            icon={<UserOutlined />}
            style={{ marginRight: 8, background: '#e6f4ff', color: '#1677ff' }}
            size={44}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {record.fullName || record.username}
            </div>
            <div style={{ color: '#888', fontSize: 12 }}>{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'roleName'],
      key: 'role',
      render: (roleName) => (
        <Tag
          color={
            roleName === 'Admin'
              ? 'volcano'
              : roleName === 'Giảng viên'
                ? 'geekblue'
                : 'green'
          }
          style={{
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 8,
            padding: '2px 12px',
          }}
        >
          {roleName}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <span>
          <MailOutlined style={{ color: '#1677ff' }} />{' '}
          {email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <span>
          <PhoneOutlined style={{ color: '#1677ff' }} />{' '}
          {phone || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <span>
          <HomeOutlined style={{ color: '#1677ff' }} />{' '}
          {address || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
      render: (nationality) => (
        <span>
          <FlagOutlined style={{ color: '#1677ff' }} />{' '}
          {nationality || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      align: 'center',
      render: (status) => {
        const info = accountStatusMap[status] || {
          label: 'Không xác định',
          color: 'default',
        };
        return (
          <Tag
            color={info.color}
            style={{
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 8,
              padding: '2px 12px',
            }}
          >
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="link"
              style={{ color: '#1677ff' }}
              onClick={() => {
                setSelectedUser(record);
                setOpenDetail(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="link"
              style={{ color: '#faad14' }}
              onClick={() => {
                setSelectedUser(record);
                setOpenEdit(true);
              }}
            />
          </Tooltip>
          {record.accountStatus === 1 ? (
            <Popconfirm
              title="Vô hiệu hóa tài khoản này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={async () => {
                const res = await userService.deactivateUser(record.userId);
                if (res) {
                  message.success('Đã vô hiệu hóa tài khoản!');
                  await fetchUsers();
                } else {
                  message.error('Vô hiệu hóa thất bại!');
                }
              }}
            >
              <Button
                icon={<LockOutlined />}
                size="small"
                type="link"
                style={{ color: '#ff4d4f' }}
              />
            </Popconfirm>
          ) : record.accountStatus === 2 || record.accountStatus === 3 ? (
            <Popconfirm
              title="Mở lại tài khoản này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={async () => {
                const res = await userService.reactivateUser(record.userId);
                if (res) {
                  message.success('Đã mở lại tài khoản!');
                  await fetchUsers();
                } else {
                  message.error('Mở lại tài khoản thất bại!');
                }
              }}
            >
              <Button
                icon={<UnlockOutlined />}
                size="small"
                type="link"
                style={{ color: '#52c41a' }}
              />
            </Popconfirm>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f5f7fa' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Quản lý người dùng</h2>
        <div style={{ color: '#888' }}>
          Quản lý thông tin người dùng, phân quyền và trạng thái hoạt động.
        </div>
      </div>

      <UserFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        onAddUser={() => navigate('/admin/create-user')}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      <UserDetailModal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        user={selectedUser}
      />

      <UserEditModal
        open={openEdit}
        onCancel={() => setOpenEdit(false)}
        onSave={handleEditSave}
        user={selectedUser}
        loading={editLoading}
      />
    </div>
  );
};

export default UserManagement;
