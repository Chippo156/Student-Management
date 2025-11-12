import customizeAxios from '../until/customize-axios';
import { message } from 'antd';

export const lecturerService = {
  getAllLecturers: async (pageNumber, pageSize, search = '') => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      const response = await customizeAxios.get('/api/Lecturer/GetAllLecturers', { params });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách giảng viên thất bại'
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
            error.response.data.message || 'Lấy danh sách giảng viên thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách giảng viên thất bại');
      }
      return null;
    }
  },
};
