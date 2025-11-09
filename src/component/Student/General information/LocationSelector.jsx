import React from 'react';
import { Form, Select, Col } from 'antd';

const { Option } = Select;

/**
 * Component để chọn Tỉnh/Huyện/Xã
 */
const LocationSelector = ({
  label,
  provinceField,
  districtField,
  wardField,
  provinces,
  districts,
  wards,
  selectedProvince,
  selectedDistrict,
  onProvinceChange,
  onDistrictChange,
  form,
  colSpan = 8,
}) => {
  return (
    <>
      <Col span={colSpan}>
        <Form.Item label={`${label} - Tỉnh/Thành phố`} name={provinceField}>
          <Select
            showSearch
            placeholder="Chọn tỉnh/thành"
            value={selectedProvince}
            onChange={(value) => onProvinceChange(value, form, districtField, wardField)}
            allowClear
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
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
            onChange={(value) => onDistrictChange(value, form, wardField)}
            disabled={!form?.getFieldValue(provinceField)}
            allowClear
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
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
            disabled={!form?.getFieldValue(districtField)}
            allowClear
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
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

export default LocationSelector;
