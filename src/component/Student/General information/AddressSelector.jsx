import React, { useState, useEffect } from 'react';
import { Form, Select, Col } from 'antd';
import { externalBankService } from '../../../service/helperService';
import { normalizeList } from './constants';

const { Option } = Select;

/**
 * AddressSelector - Component chọn Tỉnh/Huyện/Xã
 *
 * @param {Object} props
 * @param {string} props.label - Label chung cho selector (vd: "Quê quán", "Nơi sinh")
 * @param {string} props.provinceField - Tên field của province trong form
 * @param {string} props.districtField - Tên field của district trong form
 * @param {string} props.wardField - Tên field của ward trong form
 * @param {Array} props.provinces - Danh sách tỉnh/thành
 * @param {Object} props.form - Form instance từ Ant Design
 * @param {number} props.colSpan - Span của mỗi column (default: 8)
 * @param {Object} props.initialValues - Giá trị khởi tạo {province, district, ward}
 */
const AddressSelector = ({
  label,
  provinceField,
  districtField,
  wardField,
  provinces = [],
  form,
  colSpan = 8,
  initialValues = {},
}) => {
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(initialValues.province || null);
  const [selectedDistrict, setSelectedDistrict] = useState(initialValues.district || null);

  // Load districts khi có initialValues.province
  useEffect(() => {
    if (initialValues.province) {
      externalBankService
        .getDistrictsByProvince(initialValues.province)
        .then((data) => {
          setDistricts(normalizeList(data?.data || data));
        });
    }
  }, [initialValues.province]);

  // Load wards khi có initialValues.district
  useEffect(() => {
    if (initialValues.district) {
      externalBankService
        .getWardsByDistrict(initialValues.district)
        .then((data) => {
          setWards(normalizeList(data?.data || data));
        });
    }
  }, [initialValues.district]);

  const handleProvinceChange = async (provinceCode) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict(null);
    form.setFieldsValue({ [districtField]: null, [wardField]: null });
    setWards([]);

    const districtsData = await externalBankService.getDistrictsByProvince(provinceCode);
    setDistricts(normalizeList(districtsData?.data || districtsData));
  };

  const handleDistrictChange = async (districtCode) => {
    setSelectedDistrict(districtCode);
    form.setFieldsValue({ [wardField]: null });

    const wardsData = await externalBankService.getWardsByDistrict(districtCode);
    setWards(normalizeList(wardsData?.data || wardsData));
  };

  return (
    <>
      <Col span={colSpan}>
        <Form.Item label={`${label} - Tỉnh/Thành phố`} name={provinceField}>
          <Select
            showSearch
            placeholder="Chọn tỉnh/thành"
            value={selectedProvince}
            onChange={handleProvinceChange}
            allowClear
          >
            {provinces.map((p) => (
              <Option key={p.code} value={p.code}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={colSpan}>
        <Form.Item label={`${label} - Huyện/Quận`} name={districtField}>
          <Select
            showSearch
            placeholder="Chọn quận/huyện"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!form.getFieldValue(provinceField)}
            allowClear
          >
            {districts.map((d) => (
              <Option key={d.code} value={d.code}>
                {d.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={colSpan}>
        <Form.Item label={`${label} - Xã/Phường`} name={wardField}>
          <Select
            showSearch
            placeholder="Chọn xã/phường"
            disabled={!form.getFieldValue(districtField)}
            allowClear
          >
            {wards.map((w) => (
              <Option key={w.code} value={w.code}>
                {w.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </>
  );
};

export default AddressSelector;
