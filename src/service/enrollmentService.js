import axios from '../until/customize-axios';

const enrollmentService = {
  enrollInCourse: async (payload) => {
    try {
      const response = await axios.post(
        '/api/Enrollment/EnrollInCourse',
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Enroll in course failed'
      );
    }
  },
};

export default enrollmentService;
