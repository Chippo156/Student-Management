import axios from '../until/customize-axios';
import { message } from 'antd';

const gradaService = {
  getMyAllGrades: async () => {
    try {
      const response = await axios.get('/api/Grade/GetMyAllGrades');
      return response.data;
    } catch (error) {
      message.error(error.response?.data?.message || 'Get all grades failed');
      return null;
    }
  },

  getAllGradesByStudent: async (studentId, sectionId) => {
    try {
      const response = await axios.get(
        `/api/Grade/GetAllGradesByStudent/student/${studentId}/section/${sectionId}`
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy điểm sinh viên thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy điểm sinh viên thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy điểm sinh viên thất bại');
      }
      return null;
    }
  },

  getAllStudentGradesBySection: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Grade/GetAllStudentGrades/section/${sectionId}`
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy điểm lớp học phần thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching student grades:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy điểm lớp học phần thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy điểm lớp học phần thất bại');
      }
      return null;
    }
  },

  createBulkGrades: async (assessmentId, studentGrades) => {
    try {
      const response = await axios.post('/api/Grade/CreateBulkGrades', {
        assessmentId,
        studentGrades,
      });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo điểm hàng loạt thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error creating bulk grades:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Tạo điểm hàng loạt thất bại'
          );
        }
      } else {
        message.error(error.message || 'Tạo điểm hàng loạt thất bại');
      }
      return null;
    }
  },
};

export default gradaService;
