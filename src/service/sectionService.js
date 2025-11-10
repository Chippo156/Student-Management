import axios from '../until/customize-axios';
import { message } from 'antd';

const sectionService = {
  getSectionsByCurriculumCourseAndSemester: async (
    curriculumCourseId,
    semesterId
  ) => {
    try {
      const response = await axios.get(
        `/api/Section/GetSectionsByCurriculumCourseAndSemester/${curriculumCourseId}/${semesterId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Get sections by curriculum course and semester failed'
      );
    }
  },

  getSectionScheduleWithRegistration: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Section/GetSectionScheduleWithRegistration/${sectionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Get section schedule with registration failed'
      );
    }
  },

  // New method for admin
  getAllSections: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        sectionCode = '',
        courseName = '',
        status = null,
        semesterId = null,
      } = params;

      const response = await axios.get('/api/Section/GetAllSection', {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          sectionCode,
          courseName,
          status,
          semesterId,
        },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách lớp học phần thất bại'
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
          message.error(error.response.data.message || 'Get sections failed');
        }
      } else {
        message.error(error.message || 'Get sections failed');
      }
      return null;
    }
  },

  // Create new section (Admin only)
  createSection: async (sectionData) => {
    try {
      const response = await axios.post('/api/Section/CreateSection', sectionData);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo lớp học phần thất bại');
        }
        return null;
      }
      message.success('Tạo lớp học phần thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Create section failed');
        }
      } else {
        message.error(error.message || 'Create section failed');
      }
      return null;
    }
  },
};

export default sectionService;