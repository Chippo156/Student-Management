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
};
