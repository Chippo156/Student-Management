import axios from "../until/customize-axios";

export interface Course {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  departmentId: number;
  departmentName: string;
  description: string;
  prerequisites: string[];
  maxStudents: number;
  currentStudents: number;
  semester: string;
  academicYear: string;
  status: number;
}

export interface CourseRegistration {
  registrationId: string;
  studentId: string;
  courseId: string;
  semester: string;
  academicYear: string;
  registrationDate: string;
  status: number;
}

export interface CourseMaterial {
  materialId: string;
  courseId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface CourseSchedule {
  scheduleId: string;
  courseId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: string;
  teacherName: string;
}

export const courseService = {
  // Get all courses
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    semester?: string;
    academicYear?: string;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Course", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all courses failed');
    }
  },

  // Get course by ID
  getCourseById: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course by id failed');
    }
  },

  // Create new course (Admin only)
  createCourse: async (courseData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Course", courseData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create course failed');
    }
  },

  // Update course (Admin only)
  updateCourse: async (courseId: string, courseData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Course/${courseId}`, courseData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update course failed');
    }
  },

  // Delete course (Admin only)
  deleteCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Course/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete course failed');
    }
  },

  // Get courses by department
  getCoursesByDepartment: async (departmentId: number, params?: {
    semester?: string;
    academicYear?: string;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/department/${departmentId}`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get courses by department failed');
    }
  },

  // Get available courses for registration
  getAvailableCourses: async (params?: {
    semester?: string;
    academicYear?: string;
    departmentId?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Course/available", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get available courses failed');
    }
  },

  // Register for course (Student only)
  registerForCourse: async (courseId: string, registrationData?: any): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Course/${courseId}/register`, registrationData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Register for course failed');
    }
  },

  // Unregister from course (Student only)
  unregisterFromCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Course/${courseId}/register`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Unregister from course failed');
    }
  },

  // Get registered courses for student
  getRegisteredCourses: async (params?: {
    semester?: string;
    academicYear?: string;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Course/registered", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get registered courses failed');
    }
  },

  // Get course schedule
  getCourseSchedule: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/schedule`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course schedule failed');
    }
  },

  // Get course materials
  getCourseMaterials: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/materials`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course materials failed');
    }
  },

  // Upload course material (Teacher only)
  uploadCourseMaterial: async (courseId: string, file: File, title: string, description?: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(`/api/v1/Course/${courseId}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Upload course material failed');
    }
  },

  // Delete course material (Teacher only)
  deleteCourseMaterial: async (courseId: string, materialId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Course/${courseId}/materials/${materialId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete course material failed');
    }
  },

  // Get students in course
  getStudentsInCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/students`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get students in course failed');
    }
  },

  // Get course prerequisites
  getCoursePrerequisites: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/prerequisites`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course prerequisites failed');
    }
  },

  // Check course prerequisites for student
  checkCoursePrerequisites: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/prerequisites/check`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Check course prerequisites failed');
    }
  },

  // Get course statistics
  getCourseStatistics: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/statistics`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course statistics failed');
    }
  },

  // Search courses
  searchCourses: async (query: string, filters?: {
    department?: number;
    credits?: number;
    semester?: string;
    academicYear?: string;
  }): Promise<any> => {
    try {
      const params = { query, ...filters };
      const response = await axios.get("/api/v1/Course/search", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Search courses failed');
    }
  },

  // Get course by code
  getCourseByCode: async (courseCode: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/code/${courseCode}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course by code failed');
    }
  },

  // Get course enrollments
  getCourseEnrollments: async (courseId: string, params?: {
    status?: number;
    semester?: string;
    academicYear?: string;
  }): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/enrollments`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course enrollments failed');
    }
  },

  // Bulk enroll students (Admin/Teacher)
  bulkEnrollStudents: async (courseId: string, studentIds: string[]): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Course/${courseId}/bulk-enroll`, { studentIds });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bulk enroll students failed');
    }
  },

  // Bulk unenroll students (Admin/Teacher)
  bulkUnenrollStudents: async (courseId: string, studentIds: string[]): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Course/${courseId}/bulk-unenroll`, { studentIds });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bulk unenroll students failed');
    }
  },

  // Legacy methods for backward compatibility
  getCourseStudents: async (courseId: string, params?: any): Promise<any> => {
    return courseService.getStudentsInCourse(courseId);
  },

  addStudentToCourse: async (courseId: string, studentId: string): Promise<any> => {
    return courseService.bulkEnrollStudents(courseId, [studentId]);
  },

  removeStudentFromCourse: async (courseId: string, studentId: string): Promise<any> => {
    return courseService.bulkUnenrollStudents(courseId, [studentId]);
  },

  getCourseLectures: async (courseId: string, params?: any): Promise<any> => {
    return courseService.getCourseSchedule(courseId);
  },

  createLecture: async (courseId: string, data: any): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Course/${courseId}/lectures`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create lecture failed');
    }
  },

  updateLecture: async (courseId: string, lectureId: string, data: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Course/${courseId}/lectures/${lectureId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update lecture failed');
    }
  },

  deleteLecture: async (courseId: string, lectureId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Course/${courseId}/lectures/${lectureId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete lecture failed');
    }
  },

  getCourseGrades: async (courseId: string, params?: any): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Course/${courseId}/grades`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course grades failed');
    }
  },

  updateStudentGrade: async (courseId: string, studentId: string, data: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Course/${courseId}/students/${studentId}/grades`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student grade failed');
    }
  }
};
