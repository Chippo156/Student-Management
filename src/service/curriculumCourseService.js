import api from '../until/customize-axios';
import { message } from 'antd';

const curriculumCourseService = {
  // Existing method
  getCoursesByStudentDepartment: async (semesterId, filterType) => {
    try {
      const response = await api.get(
        '/api/CurriculumCourse/GetCoursesByStudentDepartment',
        {
          params: { semesterId, filterType },
        }
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(response?.message || 'Lấy danh sách môn học thất bại');
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(
          error.response.data.message ||
            'Get courses by student department failed'
        );
      }
      throw new Error(
        error.message || 'Get courses by student department failed'
      );
    }
  },

  // New method for admin
  getAllCurriculumCourses: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        courseCode = '',
        courseName = '',
        programId = null,
        departmentId = null,
      } = params;

      const response = await api.get(
        '/api/CurriculumCourse/GetAllCurriculumCourse',
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            courseCode,
            courseName,
            programId,
            departmentId,
          },
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy danh sách môn học thất bại');
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
            error.response.data.message || 'Get curriculum courses failed'
          );
        }
      } else {
        message.error(error.message || 'Get curriculum courses failed');
      }
      return null;
    }
  },
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/api/Course/CreateCourse', courseData);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo môn học thất bại');
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
          message.error(error.response.data.message || 'Tạo môn học thất bại');
        }
      } else {
        message.error(error.message || 'Tạo môn học thất bại');
      }
      return null;
    }
  },
};

export default curriculumCourseService;
