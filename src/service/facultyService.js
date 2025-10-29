import axios from '../until/customize-axios';
import { message } from 'antd';

export const facultyService = {
  getFacultiesDropdown: async () => {
    try {
      const response = await axios.get('/api/Faculty/dropdown/Faculties');
      if (response?.data?.success === false) {
        const errData = response?.data?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.data?.message || 'Lấy danh sách khoa thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy danh sách khoa thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách khoa thất bại');
      }
      return null;
    }
  },
};
