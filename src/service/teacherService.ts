import axios from "../until/customize-axios";

export interface TeacherInfo {
  teacherId: string;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: number;
  departmentId: number;
  departmentName: string;
  position: string;
  degree: string;
  specialization: string;
  status: number;
}

export interface TeacherCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  semester: string;
  academicYear: string;
  classSize: number;
  maxSize: number;
  room: string;
  schedule: string;
}

export interface TeacherSchedule {
  scheduleId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  academicYear: string;
  classSize: number;
}

export interface StudentGradeInput {
  studentId: string;
  courseId: string;
  midtermScore?: number;
  finalScore?: number;
  attendanceScore?: number;
  assignmentScore?: number;
}

export const teacherService = {
  // Get teacher information
  getTeacherInfo: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Teacher/info");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get teacher info failed');
    }
  },

  // Update teacher information
  updateTeacherInfo: async (data: Partial<TeacherInfo>): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/Teacher/info", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update teacher info failed');
    }
  },

  // Get teacher courses
  getTeacherCourses: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Teacher/courses", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get teacher courses failed');
    }
  },

  // Get teacher schedule
  getTeacherSchedule: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Teacher/schedule", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get teacher schedule failed');
    }
  },

  // Get students in course
  getStudentsInCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Teacher/courses/${courseId}/students`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get students in course failed');
    }
  },

  // Get student grades in course
  getStudentGrades: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Teacher/courses/${courseId}/grades`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student grades failed');
    }
  },

  // Update student grades
  updateStudentGrades: async (courseId: string, grades: StudentGradeInput[]): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Teacher/courses/${courseId}/grades`, { grades });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student grades failed');
    }
  },

  // Update single student grade
  updateStudentGrade: async (courseId: string, studentId: string, gradeData: StudentGradeInput): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Teacher/courses/${courseId}/students/${studentId}/grade`, gradeData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student grade failed');
    }
  },

  // Get course materials
  getCourseMaterials: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Teacher/courses/${courseId}/materials`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course materials failed');
    }
  },

  // Upload course material
  uploadCourseMaterial: async (courseId: string, file: File, title: string, description?: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(`/api/v1/Teacher/courses/${courseId}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Upload course material failed');
    }
  },

  // Delete course material
  deleteCourseMaterial: async (courseId: string, materialId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Teacher/courses/${courseId}/materials/${materialId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete course material failed');
    }
  },

  // Get attendance records
  getAttendanceRecords: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Teacher/courses/${courseId}/attendance`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get attendance records failed');
    }
  },

  // Take attendance
  takeAttendance: async (courseId: string, date: string, attendanceData: any[]): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Teacher/courses/${courseId}/attendance`, {
        date,
        attendanceData
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Take attendance failed');
    }
  },

  // Get assignments
  getAssignments: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Teacher/courses/${courseId}/assignments`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get assignments failed');
    }
  },

  // Create assignment
  createAssignment: async (courseId: string, assignmentData: any): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Teacher/courses/${courseId}/assignments`, assignmentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create assignment failed');
    }
  },

  // Update assignment
  updateAssignment: async (courseId: string, assignmentId: string, assignmentData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Teacher/courses/${courseId}/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update assignment failed');
    }
  },

  // Delete assignment
  deleteAssignment: async (courseId: string, assignmentId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Teacher/courses/${courseId}/assignments/${assignmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete assignment failed');
    }
  },

  // Admin functions for managing teachers
  getAllTeachers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/teachers", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all teachers failed');
    }
  },

  getTeacherById: async (teacherId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/teachers/${teacherId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get teacher by id failed');
    }
  },

  createTeacher: async (teacherData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/teachers", teacherData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create teacher failed');
    }
  },

  deleteTeacher: async (teacherId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/teachers/${teacherId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete teacher failed');
    }
  },

  assignCourseToTeacher: async (teacherId: string, courseId: string, assignmentData: any): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Admin/teachers/${teacherId}/courses/${courseId}`, assignmentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Assign course to teacher failed');
    }
  },

  removeCourseFromTeacher: async (teacherId: string, courseId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/teachers/${teacherId}/courses/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Remove course from teacher failed');
    }
  }
};
