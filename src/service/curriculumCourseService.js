import axios from '../until/customize-axios';

const curriculumCourseService = {
  getCoursesByStudentDepartment: async (semesterId, filterType) => {
    try {
      const response = await axios.get(
        '/api/CurriculumCourse/GetCoursesByStudentDepartment',
        {
          params: {
            semesterId,
            filterType,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Get courses by student department failed'
      );
    }
  },
};

export default curriculumCourseService;