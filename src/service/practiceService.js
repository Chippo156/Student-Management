import axios from '../until/customize-axios';
import { message } from 'antd';

const practiceService = {
  // Lấy danh sách nhóm thực hành theo sectionId
  getPracticeGroupsBySection: async (sectionId) => {
    try {
      const response = await axios.get(`/api/PracticeGroup/section/${sectionId}`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy danh sách nhóm thực hành thất bại');
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
          message.error(error.response.data.message || 'Lấy danh sách nhóm thực hành thất bại');
        }
      } else {
        message.error(error.message || 'Lấy danh sách nhóm thực hành thất bại');
      }
      return null;
    }
  },
};

export default practiceService;
