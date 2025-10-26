import axios from '../until/customize-axios';

export const courseService = {
  // Get all courses
  getAllCourses: async (params) => {
    try {
      const response = await axios.get('/api/v1/Course', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get all courses failed'
      );
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course by id failed'
      );
    }
  },

  // Create new course (Admin only)
  createCourse: async (courseData) => {
    try {
      const response = await axios.post('/api/v1/Course', courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Create course failed');
    }
  },

  // Update course (Admin only)
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axios.put(
        `/api/v1/Course/${courseId}`,
        courseData
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update course failed');
    }
  },

  // Delete course (Admin only)
  deleteCourse: async (courseId) => {
    try {
      const response = await axios.delete(`/api/v1/Course/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Delete course failed');
    }
  },

  // Get courses by department
  getCoursesByDepartment: async (departmentId, params) => {
    try {
      const response = await axios.get(
        `/api/v1/Course/department/${departmentId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get courses by department failed'
      );
    }
  },

  // Get available courses for registration
  getAvailableCourses: async (params) => {
    try {
      const response = await axios.get('/api/v1/Course/available', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get available courses failed'
      );
    }
  },

  // Register for course (Student only)
  registerForCourse: async (courseId, registrationData) => {
    try {
      const response = await axios.post(
        `/api/v1/Course/${courseId}/register`,
        registrationData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Register for course failed'
      );
    }
  },

  // Unregister from course (Student only)
  unregisterFromCourse: async (courseId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Course/${courseId}/register`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Unregister from course failed'
      );
    }
  },

  // Get registered courses for student
  getRegisteredCourses: async (params) => {
    try {
      const response = await axios.get('/api/v1/Course/registered', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get registered courses failed'
      );
    }
  },

  // Get course schedule
  getCourseSchedule: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/schedule`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course schedule failed'
      );
    }
  },

  // Get course materials
  getCourseMaterials: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/materials`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course materials failed'
      );
    }
  },

  // Upload course material (Teacher only)
  uploadCourseMaterial: async (courseId, file, title, description) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(
        `/api/v1/Course/${courseId}/materials`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Upload course material failed'
      );
    }
  },

  // Delete course material (Teacher only)
  deleteCourseMaterial: async (courseId, materialId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Course/${courseId}/materials/${materialId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Delete course material failed'
      );
    }
  },

  // Get students in course
  getStudentsInCourse: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/students`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get students in course failed'
      );
    }
  },

  // Get course prerequisites
  getCoursePrerequisites: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Course/${courseId}/prerequisites`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course prerequisites failed'
      );
    }
  },

  // Check course prerequisites for student
  checkCoursePrerequisites: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Course/${courseId}/prerequisites/check`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Check course prerequisites failed'
      );
    }
  },

  // Get course statistics
  getCourseStatistics: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/statistics`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course statistics failed'
      );
    }
  },

  // Search courses
  searchCourses: async (query, filters) => {
    try {
      const params = { query, ...filters };
      const response = await axios.get('/api/v1/Course/search', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search courses failed');
    }
  },

  // Get course by code
  getCourseByCode: async (courseCode) => {
    try {
      const response = await axios.get(`/api/v1/Course/code/${courseCode}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course by code failed'
      );
    }
  },

  // Get course enrollments
  getCourseEnrollments: async (courseId, params) => {
    try {
      const response = await axios.get(
        `/api/v1/Course/${courseId}/enrollments`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course enrollments failed'
      );
    }
  },

  // Bulk enroll students (Admin/Teacher)
  bulkEnrollStudents: async (courseId, studentIds) => {
    try {
      const response = await axios.post(
        `/api/v1/Course/${courseId}/bulk-enroll`,
        { studentIds }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Bulk enroll students failed'
      );
    }
  },

  // Bulk unenroll students (Admin/Teacher)
  bulkUnenrollStudents: async (courseId, studentIds) => {
    try {
      const response = await axios.post(
        `/api/v1/Course/${courseId}/bulk-unenroll`,
        { studentIds }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Bulk unenroll students failed'
      );
    }
  },

  // Legacy methods for backward compatibility
  getCourseStudents: async (courseId, params) => {
    return courseService.getStudentsInCourse(courseId);
  },

  addStudentToCourse: async (courseId, studentId) => {
    return courseService.bulkEnrollStudents(courseId, [studentId]);
  },

  removeStudentFromCourse: async (courseId, studentId) => {
    return courseService.bulkUnenrollStudents(courseId, [studentId]);
  },

  getCourseLectures: async (courseId, params) => {
    return courseService.getCourseSchedule(courseId);
  },

  createLecture: async (courseId, data) => {
    try {
      const response = await axios.post(
        `/api/v1/Course/${courseId}/lectures`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Create lecture failed');
    }
  },

  updateLecture: async (courseId, lectureId, data) => {
    try {
      const response = await axios.put(
        `/api/v1/Course/${courseId}/lectures/${lectureId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update lecture failed');
    }
  },

  deleteLecture: async (courseId, lectureId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Course/${courseId}/lectures/${lectureId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Delete lecture failed');
    }
  },

  getCourseGrades: async (courseId, params) => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/grades`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course grades failed'
      );
    }
  },

  updateStudentGrade: async (courseId, studentId, data) => {
    try {
      const response = await axios.put(
        `/api/v1/Course/${courseId}/students/${studentId}/grades`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update student grade failed'
      );
    }
  },
};
