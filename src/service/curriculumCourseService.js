import axios from '../until/customize-axios';

const curriculumCourseService = {
  getCoursesByStudentDepartment: async (semesterId, filterType) => {
    try {
      const response = await axios.get(
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
};

export default curriculumCourseService;
