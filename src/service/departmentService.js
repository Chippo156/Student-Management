import axios from '../until/customize-axios';
import { message } from 'antd';

export const departmentService = {
  // Lấy tất cả chuyên ngành cho dropdown
  getDepartmentsDropdown: async () => {
    try {
      const response = await axios.get('/api/Department/dropdown');
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách chuyên ngành thất bại'
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
            error.response.data.message || 'Lấy danh sách chuyên ngành thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách chuyên ngành thất bại');
      }
      return null;
    }
  },

  // Lấy danh sách chuyên ngành (bộ môn) theo khoa cho dropdown
  getDepartmentsDropdownByFaculty: async (facultyId) => {
    try {
      const response = await axios.get(
        `/api/Department/dropdown/faculty/${facultyId}`
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách chuyên ngành thất bại'
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
            error.response.data.message || 'Lấy danh sách chuyên ngành thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách chuyên ngành thất bại');
      }
      return null;
    }
  },
};
