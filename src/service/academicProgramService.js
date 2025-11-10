import api from '../until/customize-axios';
import { message } from 'antd';

const academicProgramService = {
  // Get all courses
  getAllCourses: async (params) => {
    try {
      const response = await api.get('/api/v1/Course', { params });
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
      const response = await api.get(`/api/v1/Course/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course by id failed'
      );
    }
  },

  // Create new course (Admin only) - Updated
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/api/Course/CreateCourse', courseData);
      if (!response?.success) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          throw new Error(errData[0]);
        }   throw new Error(response?.message || 'Tạo môn học thất bại');    }
      }  }
      return null;      return response.data;
    } catch (error) {od for admin
      throw new Error(.data) {> {
        error.response?.data?.message || 'Create course failed'onst errData = error.response.data.data;
      );rray.isArray(errData) && errData.length > 0) {
    }or(errData[0]);pageNumber = 1,
  },
rror.response.data.message || 'Create course failed'); '',
  // New method for admin
  getAllPrograms: async (params = {}) => {or.message || 'Create course failed');   degreeLevel = '',
    try {;
      const {  },
        pageNumber = 1,
        pageSize = 10,e (Admin only)
        programName = '',courseData) => { PageNumber: pageNumber,
        departmentId = null,
        degreeLevel = '', await axios.put(
      } = params;/${courseId}`,d,

      const response = await api.get('/api/AcademicProgram/GetAllProgram', { },
        params: {urn response.data;  });
          PageNumber: pageNumber,    } catch (error) {
          PageSize: pageSize,ta?.message || 'Update course failed');= false) {
          programName,
          departmentId,
          degreeLevel,
        },se (Admin only)
      });ourseId) => {error(
'
      if (response?.success === false) {response = await axios.delete(`/api/v1/Course/${courseId}`);
        const errData = response?.data;urn response.data;
        if (Array.isArray(errData) && errData.length > 0) {{
          message.error(errData[0]);hrow new Error(error.response?.data?.message || 'Delete course failed');
        } else {
          message.error(
            response?.message || 'Lấy danh sách chương trình đào tạo thất bại'
          );onse && error.response.data) {
        }rams) => {.data;
        return null;
      }et( message.error(errData[0]);
      return response.data;/Course/department/${departmentId}`,
    } catch (error) {
      console.error('Error in getAllPrograms:', error);
      if (error.response && error.response.data) { response.data;
        const errData = error.response.data.data;ch (error) {
        if (Array.isArray(errData) && errData.length > 0) {w Error(else {
          message.error(errData[0]);led'   message.error(error.message || 'Get academic programs failed');
        } else {;  }
          message.error(null;
            error.response.data.message || 'Get academic programs failed'
          );
        }// Get available courses for registration
      } else {  getAvailableCourses: async (params) => {
        message.error(error.message || 'Get academic programs failed');axios.get('/api/v1/Course/available', { params });      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get available courses failed'      );    }  },  // Register for course (Student only)  registerForCourse: async (courseId, registrationData) => {    try {      const response = await axios.post(        `/api/v1/Course/${courseId}/register`,        registrationData      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Register for course failed'      );    }  },  // Unregister from course (Student only)  unregisterFromCourse: async (courseId) => {    try {      const response = await axios.delete(        `/api/v1/Course/${courseId}/register`      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Unregister from course failed'      );    }  },  // Get registered courses for student  getRegisteredCourses: async (params) => {    try {      const response = await axios.get('/api/v1/Course/registered', { params });      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get registered courses failed'      );    }  },  // Get course schedule  getCourseSchedule: async (courseId) => {    try {      const response = await axios.get(`/api/v1/Course/${courseId}/schedule`);      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get course schedule failed'      );    }  },  // Get course materials  getCourseMaterials: async (courseId) => {    try {      const response = await axios.get(`/api/v1/Course/${courseId}/materials`);      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get course materials failed'      );    }  },  // Upload course material (Teacher only)  uploadCourseMaterial: async (courseId, file, title, description) => {    try {      const formData = new FormData();      formData.append('file', file);      formData.append('title', title);      if (description) {        formData.append('description', description);      }      const response = await axios.post(        `/api/v1/Course/${courseId}/materials`,        formData,        {          headers: {            'Content-Type': 'multipart/form-data',          },        }      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Upload course material failed'      );    }  },  // Delete course material (Teacher only)  deleteCourseMaterial: async (courseId, materialId) => {    try {
      }      const response = await axios.delete(
      return null;        `/api/v1/Course/${courseId}/materials/${materialId}`
    }      );
  },      return response.data;
    } catch (error) {
  // Create new program (Admin only)      throw new Error(
  createProgram: async (programData) => {        error.response?.data?.message || 'Delete course material failed'
    try {      );
      const response = await api.post('/api/AcademicProgram/CreateProgram', programData);    }
  },
      if (response?.success === false) {
        const errData = response?.data;  // Get students in course
        if (Array.isArray(errData) && errData.length > 0) {  getStudentsInCourse: async (courseId) => {
          message.error(errData[0]);    try {
        } else {      const response = await axios.get(`/api/v1/Course/${courseId}/students`);
          message.error(response?.message || 'Tạo chương trình đào tạo thất bại');      return response.data;
        }    } catch (error) {
        return null;      throw new Error(
      }        error.response?.data?.message || 'Get students in course failed'
      message.success('Tạo chương trình đào tạo thành công!');      );
      return response.data;    }
    } catch (error) {  },
      if (error.response && error.response.data) {
        const errData = error.response.data.data;  // Get course prerequisites
        if (Array.isArray(errData) && errData.length > 0) {  getCoursePrerequisites: async (courseId) => {
          message.error(errData[0]);    try {
        } else {      const response = await axios.get(
          message.error(error.response.data.message || 'Create program failed');        `/api/v1/Course/${courseId}/prerequisites`
        }      );
      } else {      return response.data;
        message.error(error.message || 'Create program failed');    } catch (error) {
      }      throw new Error(
      return null;        error.response?.data?.message || 'Get course prerequisites failed'
    }      );
  },    }
};  },

export default academicProgramService;  // Check course prerequisites for student  checkCoursePrerequisites: async (courseId) => {    try {      const response = await axios.get(        `/api/v1/Course/${courseId}/prerequisites/check`      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Check course prerequisites failed'      );    }  },  // Get course statistics  getCourseStatistics: async (courseId) => {    try {      const response = await axios.get(`/api/v1/Course/${courseId}/statistics`);      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get course statistics failed'      );    }  },  // Search courses  searchCourses: async (query, filters) => {    try {      const params = { query, ...filters };      const response = await axios.get('/api/v1/Course/search', { params });      return response.data;    } catch (error) {      throw new Error(error.response?.data?.message || 'Search courses failed');    }  },  // Get course by code  getCourseByCode: async (courseCode) => {    try {      const response = await axios.get(`/api/v1/Course/code/${courseCode}`);      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get course by code failed'      );    }  },  // Get course enrollments  getCourseEnrollments: async (courseId, params) => {    try {      const response = await axios.get(        `/api/v1/Course/${courseId}/enrollments`,        { params }      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get course enrollments failed'      );    }  },  // Bulk enroll students (Admin/Teacher)  bulkEnrollStudents: async (courseId, studentIds) => {    try {      const response = await axios.post(        `/api/v1/Course/${courseId}/bulk-enroll`,        { studentIds }      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Bulk enroll students failed'      );    }  },  // Bulk unenroll students (Admin/Teacher)  bulkUnenrollStudents: async (courseId, studentIds) => {    try {      const response = await axios.post(        `/api/v1/Course/${courseId}/bulk-unenroll`,        { studentIds }      );      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Bulk unenroll students failed'      );    }  },  // Legacy methods for backward compatibility  getCourseStudents: async (courseId, params) => {    return courseService.getStudentsInCourse(courseId);  },  addStudentToCourse: async (courseId, studentId) => {    return courseService.bulkEnrollStudents(courseId, [studentId]);  },  removeStudentFromCourse: async (courseId, studentId) => {    return courseService.bulkUnenrollStudents(courseId, [studentId]);  },  getCourseLectures: async (courseId, params) => {    return courseService.getCourseSchedule(courseId);  },  createLecture: async (courseId, data) => {    try {      const response = await axios.post(        `/api/v1/Course/${courseId}/lectures`,        data      );      return response.data;    } catch (error) {      throw new Error(error.response?.data?.message || 'Create lecture failed');    }  },  updateLecture: async (courseId, lectureId, data) => {    try {      const response = await axios.put(        `/api/v1/Course/${courseId}/lectures/${lectureId}`,        data      );      return response.data;    } catch (error) {      throw new Error(error.response?.data?.message || 'Update lecture failed');    }  },  deleteLecture: async (courseId, lectureId) => {    try {      const response = await axios.delete(        `/api/v1/Course/${courseId}/lectures/${lectureId}`      );      return response.data;    } catch (error) {      throw new Error(error.response?.data?.message || 'Delete lecture failed');    }  },  getCourseGrades: async (courseId, params) => {    try {      const response = await axios.get(`/api/v1/Course/${courseId}/grades`, {        params,      });      return response.data;    } catch (error) {      throw new Error(        error.response?.data?.message || 'Get course grades failed'      );    }  },  updateStudentGrade: async (courseId, studentId, data) => {
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
