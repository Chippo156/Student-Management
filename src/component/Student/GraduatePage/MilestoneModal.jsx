import React from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';

const { Option } = Select;

/**
 * MilestoneModal - Modal thêm/sửa mục tiêu
 */
const MilestoneModal = ({ open, onCancel, onOk, form, isEditing }) => {
  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={600}
      okText={isEditing ? 'Cập nhật' : 'Thêm'}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề mục tiêu" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="date"
            label="Ngày hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày hạn" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="upcoming">Sắp tới</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="overdue">Quá hạn</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
        </Form.Item>

        <Form.Item name="documents" label="Tài liệu cần chuẩn bị">
          <Input.TextArea
            rows={2}
            placeholder="Nhập các tài liệu cần chuẩn bị, cách nhau bằng dấu phẩy"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MilestoneModal;
