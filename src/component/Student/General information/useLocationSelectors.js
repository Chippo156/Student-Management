import { useState } from 'react';
import { externalBankService } from '../../../service/helperService';

// Chuẩn hóa dữ liệu {id, name} => {code, name}
const normalizeList = (arr) =>
  Array.isArray(arr)
    ? arr.map((item) => ({
        code: item.id,
        name: item.name,
      }))
    : [];

/**
 * Custom hook để quản lý việc chọn Tỉnh/Huyện/Xã
 * @returns {Object} - Trả về state và handlers cho province, district, ward
 */
export const useLocationSelectors = () => {
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const handleProvinceChange = async (provinceCode, form, districtField, wardField) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict(null);

    if (form) {
      form.setFieldsValue({
        [districtField]: null,
        [wardField]: null
      });
    }

    setWards([]);

    if (provinceCode) {
      const districtsData = await externalBankService.getDistrictsByProvince(provinceCode);
      setDistricts(normalizeList(districtsData?.data || districtsData));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (districtCode, form, wardField) => {
    setSelectedDistrict(districtCode);

    if (form) {
      form.setFieldsValue({ [wardField]: null });
    }

    if (districtCode) {
      const wardsData = await externalBankService.getWardsByDistrict(districtCode);
      setWards(normalizeList(wardsData?.data || wardsData));
    } else {
      setWards([]);
    }
  };

  const loadInitialData = async (provinceCode, districtCode) => {
    if (provinceCode) {
      setSelectedProvince(provinceCode);
      const districtsData = await externalBankService.getDistrictsByProvince(provinceCode);
      setDistricts(normalizeList(districtsData?.data || districtsData));
    }

    if (districtCode) {
      setSelectedDistrict(districtCode);
      const wardsData = await externalBankService.getWardsByDistrict(districtCode);
      setWards(normalizeList(wardsData?.data || wardsData));
    }
  };

  const reset = () => {
    setDistricts([]);
    setWards([]);
    setSelectedProvince(null);
    setSelectedDistrict(null);
  };

  return {
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    handleProvinceChange,
    handleDistrictChange,
    loadInitialData,
    reset,
  };
};
