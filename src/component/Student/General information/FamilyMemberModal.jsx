import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Row, Col, Button, Checkbox } from 'antd';
import dayjs from 'dayjs';
import { externalBankService } from '../../../service/helperService';
import { RELATIONSHIP_TYPES, normalizeList } from './constants';

const { Option } = Select;

/**
 * FamilyMemberModal - Modal để thêm/sửa thông tin người thân
 */
const FamilyMemberModal = ({ open, onCancel, onSave, editingMember }) => {
  const [familyProvinces, setFamilyProvinces] = useState([]);
  const [familyDistricts, setFamilyDistricts] = useState([]);
  const [familyWards, setFamilyWards] = useState([]);
  const [selectedFamilyProvince, setSelectedFamilyProvince] = useState(null);
  const [selectedFamilyDistrict, setSelectedFamilyDistrict] = useState(null);

  // Load danh sách tỉnh khi mở modal
  useEffect(() => {
    if (open) {
      externalBankService.getProvinces().then((data) => {
        setFamilyProvinces(normalizeList(data));
      });
      setFamilyDistricts([]);
      setFamilyWards([]);
      setSelectedFamilyProvince(null);
      setSelectedFamilyDistrict(null);
    }
  }, [open]);

  const handleFamilyProvinceChange = async (provinceCode) => {
    setSelectedFamilyProvince(provinceCode);
    setSelectedFamilyDistrict(null);
    setFamilyWards([]);
    const districts = await externalBankService.getDistrictsByProvince(provinceCode);
    setFamilyDistricts(normalizeList(districts?.data || districts));
  };

  const handleFamilyDistrictChange = async (districtCode) => {
    setSelectedFamilyDistrict(districtCode);
    const wards = await externalBankService.getWardsByDistrict(districtCode);
    setFamilyWards(normalizeList(wards?.data || wards));
  };

  const handleFinish = (values) => {
    // Lấy tên tỉnh/huyện/xã từ code
    const provinceName =
      familyProvinces.find((p) => p.code === values.province)?.name || null;
    const districtName =
      familyDistricts.find((d) => d.code === values.district)?.name || null;
    const wardName = familyWards.find((w) => w.code === values.ward)?.name || null;

    const newValues = {
      ...values,
      id: editingMember?.id,
      dateOfBirth: values.dateOfBirth
        ? typeof values.dateOfBirth.format === 'function'
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : values.dateOfBirth
        : null,
      issuedDate: values.issuedDate
        ? typeof values.issuedDate.format === 'function'
          ? values.issuedDate.format('YYYY-MM-DD')
          : values.issuedDate
        : null,
      province: provinceName,
      district: districtName,
      ward: wardName,
    };

    onSave(newValues);
  };

  const initialValues = editingMember
    ? {
        ...editingMember,
        dateOfBirth: editingMember.dateOfBirth ? dayjs(editingMember.dateOfBirth) : null,
        issuedDate: editingMember.issuedDate ? dayjs(editingMember.issuedDate) : null,
      }
    : {
        relationshipType: 1,
        isGuardian: false,
        isDeceased: false,
        isHouseholder: false,
      };

  return (
    <Modal
      open={open}
      title={editingMember ? 'Sửa người thân' : 'Thêm người thân'}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại quan hệ"
              name="relationshipType"
              rules={[{ required: true, message: 'Vui lòng chọn loại quan hệ' }]}
            >
              <Select>
                {RELATIONSHIP_TYPES.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nghề nghiệp" name="occupation">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Nơi làm việc" name="workplace">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="CCCD" name="citizenIdCard">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Ngày cấp" name="issuedDate">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nơi cấp" name="issuedPlace">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Địa chỉ thường trú" name="permanentAddress">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Địa chỉ liên hệ" name="contactAddress">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isGuardian" valuePropName="checked">
              <Checkbox>Là người giám hộ</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isDeceased" valuePropName="checked">
              <Checkbox>Đã mất</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isHouseholder" valuePropName="checked">
              <Checkbox>Là chủ hộ</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Tỉnh/Thành" name="province">
              <Select
                showSearch
                placeholder="Chọn tỉnh/thành"
                value={selectedFamilyProvince}
                onChange={handleFamilyProvinceChange}
                allowClear
              >
                {familyProvinces.map((p) => (
                  <Option key={p.code} value={p.code}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Quận/Huyện" name="district">
              <Select
                showSearch
                placeholder="Chọn quận/huyện"
                value={selectedFamilyDistrict}
                onChange={handleFamilyDistrictChange}
                disabled={!selectedFamilyProvince}
                allowClear
              >
                {familyDistricts.map((d) => (
                  <Option key={d.code} value={d.code}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Xã/Phường" name="ward">
              <Select
                showSearch
                placeholder="Chọn xã/phường"
                disabled={!selectedFamilyDistrict}
                allowClear
              >
                {familyWards.map((w) => (
                  <Option key={w.code} value={w.code}>
                    {w.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Địa chỉ cụ thể" name="detailAddress">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default FamilyMemberModal;
