import React from 'react';
import { Modal, Avatar, Tag, Divider, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { genderOptions, accountStatusMap } from './constants';

/**
 * UserDetailModal - Modal hiển thị chi tiết thông tin user
 */
const UserDetailModal = ({ open, onCancel, user }) => {
  if (!user) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      centered
      title={null}
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ background: '#f4f8ff', borderRadius: 16 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 32,
            background: '#1677ff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            color: '#fff',
            gap: 24,
          }}
        >
          <Avatar
            src={user.avatarUrl}
            size={80}
            icon={<UserOutlined />}
            style={{
              background: '#fff',
              color: '#1677ff',
              fontWeight: 700,
              fontSize: 36,
              border: '3px solid #fff',
              boxShadow: '0 2px 8px #1677ff33',
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 26,
                wordBreak: 'break-word',
              }}
            >
              {user.fullName || user.username}
            </div>
            <Tag
              color={
                user.role?.roleName === 'Admin'
                  ? 'volcano'
                  : user.role?.roleName === 'Giảng viên'
                    ? 'geekblue'
                    : 'green'
              }
              style={{
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                marginTop: 8,
                padding: '2px 16px',
              }}
            >
              {user.role?.roleName}
            </Tag>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Content */}
        <div style={{ padding: 32, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Thông tin cá nhân */}
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            🧍 Thông tin cá nhân
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <b>Tên đăng nhập:</b>{' '}
                {user.username || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Họ và tên:</b>{' '}
                {user.fullName || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Giới tính:</b>{' '}
                {genderOptions.find((g) => g.value === user.gender)?.label || (
                  <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Ngày sinh:</b>{' '}
                {user.dateOfBirth ? (
                  dayjs(user.dateOfBirth).format('DD/MM/YYYY')
                ) : (
                  <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Email:</b>{' '}
                {user.email || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Số điện thoại:</b>{' '}
                {user.phone || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <b>Địa chỉ:</b>{' '}
                {user.address || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Địa chỉ tạm trú:</b>{' '}
                {user.temporaryAddress || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Nơi sinh:</b>{' '}
                {user.placeOfBirth || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Dân tộc:</b>{' '}
                {user.ethnicity || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Tôn giáo:</b>{' '}
                {user.religion || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Quốc tịch:</b>{' '}
                {user.nationality || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
            </Col>
          </Row>

          {/* Giấy tờ cá nhân */}
          <Divider orientation="left" style={{ color: '#1677ff' }}>
            🪪 Giấy tờ cá nhân
          </Divider>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <b>CCCD:</b>{' '}
                {user.citizenIdCard || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Ngày cấp:</b>{' '}
                {user.issuedDate ? (
                  dayjs(user.issuedDate).format('DD/MM/YYYY')
                ) : (
                  <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Nơi cấp:</b>{' '}
                {user.issuedPlace || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <b>Trạng thái tài khoản:</b>{' '}
                {(() => {
                  const info = accountStatusMap[user.accountStatus];
                  return info ? (
                    <Tag color={info.color}>{info.label}</Tag>
                  ) : (
                    <span style={{ color: '#aaa' }}>Chưa cập nhật</span>
                  );
                })()}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
