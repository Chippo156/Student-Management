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

  // Get all curriculum courses (for admin)
  getAllCurriculumCourses: async (params = {}) => {
    try {
      const { pageNumber = 1, pageSize = 10, search } = params;

      const response = await api.get(
        '/api/CurriculumCourse/GetCoursesWithPrograms',
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            search,
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

  // Create course
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

  updateCurriculumCourse: async (courseData) => {
    try {
      const response = await api.put(
        `/api/Course/Update/${courseData.curriculumCourseId}`,
        {
          courseName: courseData.courseName,
          courseCode: courseData.courseCode,
          totalCredits: courseData.totalCredits,
          creditsTheory: courseData.creditsTheory,
          creditsLab: courseData.creditsLab,
          isRequired: courseData.isRequired,
          semesterSuggested: courseData.semesterSuggested,
          programId: courseData.academicProgramId,
          departmentId: courseData.departmentId,
          description: courseData.description || null,
          prerequisites: courseData.prerequisites || [],
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Cập nhật môn học thất bại');
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Update course error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Cập nhật môn học thất bại'
          );
        }
      } else {
        message.error(error.message || 'Cập nhật môn học thất bại');
      }
      return null;
    }
  },

  // ✅ Delete curriculum course (nếu cần)
  deleteCurriculumCourse: async (curriculumCourseId) => {
    try {
      const response = await api.delete(
        `/api/CurriculumCourse/DeleteCourse/${curriculumCourseId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Xóa môn học thất bại');
        }
        return null;
      }

      message.success('Xóa môn học thành công!');
      return response.data;
    } catch (error) {
      console.error('❌ Delete course error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Xóa môn học thất bại');
        }
      } else {
        message.error(error.message || 'Xóa môn học thất bại');
      }
      return null;
    }
  },
};

export default curriculumCourseService;
