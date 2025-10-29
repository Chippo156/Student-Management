import axios from '../until/customize-axios';
import { message } from 'antd';

export const classService = {
  // Lấy danh sách lớp theo chuyên ngành cho dropdown
  getClassesDropdownByDepartment: async (departmentId) => {
    try {
      const response = await axios.get(
        `/api/Class/dropdown/department/${departmentId}`
      );
      if (response?.data?.success === false) {
        const errData = response?.data?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.data?.message || 'Lấy danh sách lớp thất bại'
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
            error.response.data.message || 'Lấy danh sách lớp thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách lớp thất bại');
      }
      return null;
    }
  },
};
