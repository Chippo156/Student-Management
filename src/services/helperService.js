import axios from 'axios';

const BASE_URL = 'https://api.vietqr.io/v2/banks';

export const externalBankService = {
  getBanks: async () => {
    try {
      const res = await axios.get(BASE_URL);
      if (res.data && res.data.data) {
        return res.data.data; // danh sách ngân hàng
      }
      return [];
    } catch (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
  },
  getProvinces: async () => {
    try {
      const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  // Lấy danh sách quận/huyện theo mã tỉnh/thành phố
  getDistrictsByProvince: async (provinceId) => {
    try {
      const res = await axios.get(
        `https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`
      );
      return res.data?.data || []; // Sửa ở đây: trả về mảng quận/huyện
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },

  // Lấy danh sách xã/phường theo mã quận/huyện
  getWardsByDistrict: async (districtId) => {
    try {
      const res = await axios.get(
        `https://esgoo.net/api-tinhthanh/3/${districtId}.htm`
      );
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  },
};
