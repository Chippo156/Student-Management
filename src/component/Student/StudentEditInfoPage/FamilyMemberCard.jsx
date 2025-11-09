import React from 'react';
import { Card, Button, Descriptions } from 'antd';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { RELATIONSHIP_TYPES } from './constants';

/**
 * FamilyMemberCard - Card hiển thị thông tin 1 người thân
 */
const FamilyMemberCard = ({ member, onEdit, onDelete }) => {
  const theme = useTheme();

  const relationshipLabel =
    RELATIONSHIP_TYPES.find((t) => t.value === member.relationshipType)?.label ||
    member.relationshipTypeName ||
    'Người thân';

  return (
    <Card
      type="inner"
      title={relationshipLabel}
      headStyle={{
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
      extra={
        <>
          <Button size="small" onClick={() => onEdit(member)}>
            Sửa
          </Button>
          <Button
            size="small"
            danger
            onClick={() => onDelete(member)}
            style={{ marginLeft: 8 }}
          >
            Xóa
          </Button>
        </>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Họ tên">
          {member.fullName || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="SĐT">
          {member.phone || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {member.dateOfBirth ? (
            dayjs(member.dateOfBirth).format('DD/MM/YYYY')
          ) : (
            <span style={{ color: '#999' }}>Chưa cập nhật</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {member.email || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Nghề nghiệp">
          {member.occupation || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Nơi làm việc">
          {member.workplace || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="CCCD">
          {member.citizenIdCard || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cấp">
          {member.issuedDate ? (
            dayjs(member.issuedDate).format('DD/MM/YYYY')
          ) : (
            <span style={{ color: '#999' }}>Chưa cập nhật</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Nơi cấp" span={2}>
          {member.issuedPlace || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ thường trú" span={2}>
          {member.permanentAddress || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ cụ thể" span={2}>
          {member.fullAddress ||
            member.detailAddress || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Là người giám hộ">
          {member.isGuardian === true ? (
            'Có'
          ) : member.isGuardian === false ? (
            'Không'
          ) : (
            <span style={{ color: '#999' }}>Chưa cập nhật</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Đã mất">
          {member.isDeceased === true ? (
            'Có'
          ) : member.isDeceased === false ? (
            'Không'
          ) : (
            <span style={{ color: '#999' }}>Chưa cập nhật</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Chủ hộ">
          {member.isHouseholder === true ? (
            'Có'
          ) : member.isHouseholder === false ? (
            'Không'
          ) : (
            <span style={{ color: '#999' }}>Chưa cập nhật</span>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default FamilyMemberCard;
