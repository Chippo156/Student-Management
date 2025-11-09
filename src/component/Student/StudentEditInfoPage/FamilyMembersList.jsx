import React, { useState } from 'react';
import { Button, Row, Col, Modal, message } from 'antd';
import FamilyMemberCard from './FamilyMemberCard';
import FamilyMemberModal from './FamilyMemberModal';

/**
 * FamilyMembersList - Danh sách người thân và quản lý CRUD
 */
const FamilyMembersList = ({ familyList, setFamilyList }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const handleAddFamily = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEditFamily = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDeleteFamily = (member) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa người thân này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        setFamilyList((prev) => prev.filter((f) => f !== member));
        message.success('Đã xóa người thân');
      },
    });
  };

  const handleSaveFamilyMember = (values) => {
    if (editingMember) {
      // Cập nhật
      setFamilyList((prev) =>
        prev.map((f) => (f === editingMember ? { ...editingMember, ...values } : f))
      );
      message.success('Đã cập nhật thông tin người thân');
    } else {
      // Thêm mới
      setFamilyList((prev) => [...prev, values]);
      message.success('Đã thêm người thân');
    }
    setShowModal(false);
  };

  return (
    <>
      <Button type="primary" onClick={handleAddFamily} style={{ marginBottom: 16 }}>
        Thêm người thân
      </Button>

      <Row gutter={[24, 24]}>
        {familyList.map((member, idx) => (
          <Col xs={24} md={24} key={member.id || idx}>
            <FamilyMemberCard
              member={member}
              onEdit={handleEditFamily}
              onDelete={handleDeleteFamily}
            />
          </Col>
        ))}
      </Row>

      <FamilyMemberModal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onSave={handleSaveFamilyMember}
        editingMember={editingMember}
      />
    </>
  );
};

export default FamilyMembersList;
