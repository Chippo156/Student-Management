import axios from '../until/customize-axios';
import { message } from 'antd';

export const adviserAssignmentService = {
  // Gán giảng viên làm chủ nhiệm lớp
  assignLecturerToClass: async (lecturerId, classId) => {
    try {
      const response = await axios.post(
        '/api/AdviserAssignment/AssignLecturerToClass',
        null,
        {
          params: { lecturerId, classId }
        }
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Gán quyền chủ nhiệm thất bại'
          );
        }
        return null;
      }
      message.success('Gán quyền chủ nhiệm thành công!');
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Gán quyền chủ nhiệm thất bại'
          );
        }
      } else {
        message.error(error.message || 'Gán quyền chủ nhiệm thất bại');
      }
      return null;
    }
  },
};
