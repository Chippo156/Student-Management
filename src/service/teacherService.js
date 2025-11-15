import axios from '../until/customize-axios';

export const teacherService = {
  // Lấy thông tin giảng viên
  getTeacherInfo: async () => {
    try {
      const response = await axios.get('/api/v1/Teacher/info');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get teacher info failed'
      );
    }
  },

  // Cập nhật thông tin giảng viên
  updateTeacherInfo: async (data) => {
    try {
      const response = await axios.put('/api/v1/Teacher/info', data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update teacher info failed'
      );
    }
  },

  // Lấy danh sách môn học của giảng viên
  getTeacherCourses: async (semester, academicYear) => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get('/api/v1/Teacher/courses', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get teacher courses failed'
      );
    }
  },

  // Lấy thời khóa biểu giảng viên
  getTeacherSchedule: async (semester, academicYear) => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get('/api/v1/Teacher/schedule', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get teacher schedule failed'
      );
    }
  },

  // Lấy danh sách sinh viên trong khóa học
  getStudentsInCourse: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Teacher/courses/${courseId}/students`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get students in course failed'
      );
    }
  },

  // Lấy điểm sinh viên trong khóa học
  getStudentGrades: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Teacher/courses/${courseId}/grades`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get student grades failed'
      );
    }
  },

  // Cập nhật điểm sinh viên hàng loạt
  updateStudentGrades: async (courseId, grades) => {
    try {
      const response = await axios.put(
        `/api/v1/Teacher/courses/${courseId}/grades`,
        { grades }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update student grades failed'
      );
    }
  },

  // Cập nhật điểm cho một sinh viên
  updateStudentGrade: async (courseId, studentId, gradeData) => {
    try {
      const response = await axios.put(
        `/api/v1/Teacher/courses/${courseId}/students/${studentId}/grade`,
        gradeData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update student grade failed'
      );
    }
  },

  // Lấy tài liệu khóa học
  getCourseMaterials: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Teacher/courses/${courseId}/materials`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get course materials failed'
      );
    }
  },

  // Tải lên tài liệu khóa học
  uploadCourseMaterial: async (courseId, file, title, description) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) formData.append('description', description);

      const response = await axios.post(
        `/api/v1/Teacher/courses/${courseId}/materials`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Upload course material failed'
      );
    }
  },

  // Xóa tài liệu khóa học
  deleteCourseMaterial: async (courseId, materialId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Teacher/courses/${courseId}/materials/${materialId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Delete course material failed'
      );
    }
  },

  // Lấy danh sách điểm danh
  getAttendanceRecords: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Teacher/courses/${courseId}/attendance`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get attendance records failed'
      );
    }
  },

  // Ghi nhận điểm danh
  takeAttendance: async (courseId, date, attendanceData) => {
    try {
      const response = await axios.post(
        `/api/v1/Teacher/courses/${courseId}/attendance`,
        {
          date,
          attendanceData,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Take attendance failed'
      );
    }
  },

  // Tạo phiên điểm danh mới
  createAttendanceSession: async (sessionData) => {
    try {
      const response = await axios.post('/api/Attendance/CreateSession', sessionData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Create attendance session failed'
      );
    }
  },

  // Lấy danh sách phiên điểm danh của giảng viên
  getMySessions: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        sectionId = null,
        fromDate = null,
        toDate = null,
        scheduleTypeId = null, // null: Tất cả, 1: Lý thuyết, 2: Thực hành
      } = params;

      const response = await axios.get('/api/Attendance/MySessions', {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          sectionId,
          fromDate,
          toDate,
          scheduleTypeId,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get attendance sessions failed'
      );
    }
  },

  // Ghi nhận điểm danh hàng loạt
  recordAttendance: async (attendanceData) => {
    try {
      const response = await axios.post('/api/Attendance/RecordAttendance', attendanceData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Record attendance failed'
      );
    }
  },

  // Cập nhật điểm danh cho một sinh viên
  updateAttendance: async (attendanceId, updateData) => {
    try {
      const response = await axios.put(`/api/Attendance/UpdateAttendance/${attendanceId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update attendance failed'
      );
    }
  },

  // Lấy danh sách bài tập
  getAssignments: async (courseId) => {
    try {
      const response = await axios.get(
        `/api/v1/Teacher/courses/${courseId}/assignments`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get assignments failed'
      );
    }
  },

  // Tạo bài tập
  createAssignment: async (courseId, assignmentData) => {
    try {
      const response = await axios.post(
        `/api/v1/Teacher/courses/${courseId}/assignments`,
        assignmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Create assignment failed'
      );
    }
  },

  // Cập nhật bài tập
  updateAssignment: async (courseId, assignmentId, assignmentData) => {
    try {
      const response = await axios.put(
        `/api/v1/Teacher/courses/${courseId}/assignments/${assignmentId}`,
        assignmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update assignment failed'
      );
    }
  },

  // Xóa bài tập
  deleteAssignment: async (courseId, assignmentId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Teacher/courses/${courseId}/assignments/${assignmentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Delete assignment failed'
      );
    }
  },

  // Các chức năng của admin
  getAllTeachers: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/teachers', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get all teachers failed'
      );
    }
  },

  getTeacherById: async (teacherId) => {
    try {
      const response = await axios.get(`/api/v1/Admin/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get teacher by id failed'
      );
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await axios.post('/api/v1/Admin/teachers', teacherData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Create teacher failed');
    }
  },

  deleteTeacher: async (teacherId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Admin/teachers/${teacherId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Delete teacher failed');
    }
  },

  assignCourseToTeacher: async (teacherId, courseId, assignmentData) => {
    try {
      const response = await axios.post(
        `/api/v1/Admin/teachers/${teacherId}/courses/${courseId}`,
        assignmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Assign course to teacher failed'
      );
    }
  },

  removeCourseFromTeacher: async (teacherId, courseId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Admin/teachers/${teacherId}/courses/${courseId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Remove course from teacher failed'
      );
    }
  },
};
