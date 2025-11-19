import axios from '../until/customize-axios';

const enrollmentService = {
  enrollInCourse: async (payload) => {
    try {
      const response = await axios.post(
        '/api/Enrollment/EnrollInCourse',
        payload
      );
      if (!response?.success) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(response?.message || 'Hủy học phần thất bại');
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(
          error.response.data.message || 'Drop enrollment failed'
        );
      }
      throw new Error(error.message || 'Drop enrollment failed');
    }
  },

  // Lấy danh sách đăng ký học phần theo học kỳ
  getEnrollmentBySemester: async (semesterId) => {
    try {
      const response = await axios.get(
        `/api/Enrollment/semester/${semesterId}`
      );
      if (!response?.success) {
        message.error('Lấy danh sách thất bại');
        throw new Error('Get enrollment by semester failed');
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(
          error.response.data.message || 'Drop enrollment failed'
        );
      }
      throw new Error(error.message || 'Drop enrollment failed');
    }
  },

  // Lấy danh sách đăng ký học phần theo học kỳ
  getEnrolledByStudent: async (semesterId) => {
    try {
      const response = await axios.get(
        `/api/Enrollment/semester/${semesterId}/student/GetEnrolledByStudent`
      );
      if (!response?.success) {
        message.error('Lấy danh sách đăng ký học phần theo học kỳ thất bại');
        throw new Error('Get enrollment by semester failed');
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(
          error.response.data.message || 'Drop enrollment failed'
        );
      }
      throw new Error(error.message || 'Drop enrollment failed');
    }
  },

  dropEnrollmentStudent: async (sectionId) => {
    try {
      const response = await axios.delete(
        `/api/Enrollment/DropEnrollmentStudent`,
        { params: { sectionId } }
      );
      if (!response?.success) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(response?.message || 'Hủy học phần thất bại');
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }
        throw new Error(
          error.response.data.message || 'Drop enrollment failed'
        );
      }
      throw new Error(error.message || 'Drop enrollment failed');
    }
  },
};

export default enrollmentService;
