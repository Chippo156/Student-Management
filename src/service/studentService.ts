import axios from "../until/customize-axios";

export interface StudentInfo {
  studentId: string;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: number;
  classId: string;
  className: string;
  majorId: number;
  majorName: string;
  enrollmentYear: number;
  academicYear: string;
  status: number;
}

export interface StudentGrade {
  subjectId: string;
  subjectName: string;
  credits: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  letterGrade: string;
  semester: string;
  academicYear: string;
}

export interface StudentSchedule {
  scheduleId: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  room: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  semester: string;
  academicYear: string;
}

export interface StudentNote {
  noteId: string;
  title: string;
  content: string;
  type: string;
  importance: number;
  createdDate: string;
  dueDate?: string;
}

export interface BHYTInfo {
  insuranceNumber: string;
  insuranceCode: string;
  validFrom: string;
  validTo: string;
  hospitalCode: string;
  hospitalName: string;
  status: number;
}

export interface StudentGraduation {
  graduationId: string;
  studentId: string;
  expectedGraduationDate: string;
  actualGraduationDate?: string;
  totalCreditsRequired: number;
  totalCreditsCompleted: number;
  gpaRequired: number;
  currentGPA: number;
  status: number;
  certificateNumber?: string;
  diplomaNumber?: string;
}

export const studentService = {
  // Get student information
  getStudentInfo: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/info");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student info failed');
    }
  },

  // Update student information
  updateStudentInfo: async (data: Partial<StudentInfo>): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/Student/info", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student info failed');
    }
  },

  // Get student grades
  getStudentGrades: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/grades", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student grades failed');
    }
  },

  // Get student schedule
  getStudentSchedule: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/schedule", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student schedule failed');
    }
  },

  // Get student notes
  getStudentNotes: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/notes");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student notes failed');
    }
  },

  // Create student note
  createStudentNote: async (data: Omit<StudentNote, 'noteId' | 'createdDate'>): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Student/notes", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create student note failed');
    }
  },

  // Update student note
  updateStudentNote: async (noteId: string, data: Partial<StudentNote>): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Student/notes/${noteId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student note failed');
    }
  },

  // Delete student note
  deleteStudentNote: async (noteId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Student/notes/${noteId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete student note failed');
    }
  },

  // Get BHYT information
  getBHYTInfo: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/bhyt");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get BHYT info failed');
    }
  },

  // Update BHYT information
  updateBHYTInfo: async (data: Partial<BHYTInfo>): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/Student/bhyt", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update BHYT info failed');
    }
  },

  // Get graduation information
  getGraduationInfo: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/graduation");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get graduation info failed');
    }
  },

  // Get transcript
  getTranscript: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/transcript");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get transcript failed');
    }
  },

  // Register for courses
  registerCourses: async (courseIds: string[]): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Student/register-courses", { courseIds });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Register courses failed');
    }
  },

  // Drop courses
  dropCourses: async (courseIds: string[]): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Student/drop-courses", { courseIds });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Drop courses failed');
    }
  },

  // Get available courses for registration
  getAvailableCourses: async (semester: string, academicYear: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/available-courses", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get available courses failed');
    }
  },

  // Get registered courses
  getRegisteredCourses: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/registered-courses", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get registered courses failed');
    }
  },

  // Get grade by course
  getGradeByCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Student/grades/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get grade by course failed');
    }
  },

  // Get student GPA
  getStudentGPA: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/gpa", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student GPA failed');
    }
  },

  // Register for course
  registerForCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Student/courses/${courseId}/register`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Register for course failed');
    }
  },

  // Unregister from course
  unregisterFromCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Student/courses/${courseId}/register`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Unregister from course failed');
    }
  },

  // Get available courses for registration
  getAvailableCoursesForRegistration: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/courses/available", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get available courses failed');
    }
  },

  // Get student attendance
  getStudentAttendance: async (courseId?: string, semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { courseId, semester, academicYear };
      const response = await axios.get("/api/v1/Student/attendance", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student attendance failed');
    }
  },

  // Get student BHYT information
  getStudentBHYT: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/bhyt");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student BHYT failed');
    }
  },

  // Update student BHYT information
  updateStudentBHYT: async (data: Partial<BHYTInfo>): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/Student/bhyt", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student BHYT failed');
    }
  },

  // Get student graduation information
  getStudentGraduation: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/graduation");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student graduation failed');
    }
  },

  // Check graduation eligibility
  checkGraduationEligibility: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/graduation/eligibility");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Check graduation eligibility failed');
    }
  },

  // Apply for graduation
  applyForGraduation: async (): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Student/graduation/apply");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Apply for graduation failed');
    }
  },

  // Get student transcript
  getStudentTranscript: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/transcript");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student transcript failed');
    }
  },

  // Download student transcript
  downloadStudentTranscript: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/transcript/download", {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Download student transcript failed');
    }
  },

  // Get student financial information
  getStudentFinancial: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/financial");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student financial failed');
    }
  },

  // Get tuition fees
  getTuitionFees: async (semester?: string, academicYear?: string): Promise<any> => {
    try {
      const params = { semester, academicYear };
      const response = await axios.get("/api/v1/Student/tuition-fees", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get tuition fees failed');
    }
  },

  // Pay tuition fees
  payTuitionFees: async (paymentData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Student/tuition-fees/pay", paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Pay tuition fees failed');
    }
  },

  // Get payment history
  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/payment-history", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get payment history failed');
    }
  },

  // Get student documents
  getStudentDocuments: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/documents");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student documents failed');
    }
  },

  // Upload student document
  uploadStudentDocument: async (file: File, documentType: string, description?: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post("/api/v1/Student/documents", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Upload student document failed');
    }
  },

  // Delete student document
  deleteStudentDocument: async (documentId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Student/documents/${documentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete student document failed');
    }
  },

  // Get student notifications
  getStudentNotifications: async (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Student/notifications", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student notifications failed');
    }
  },

  // Get course materials
  getCourseMaterials: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Student/courses/${courseId}/materials`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course materials failed');
    }
  },

  // Download course material
  downloadCourseMaterial: async (courseId: string, materialId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Student/courses/${courseId}/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Download course material failed');
    }
  },

  // Get student assignments
  getStudentAssignments: async (courseId?: string): Promise<any> => {
    try {
      const params = courseId ? { courseId } : {};
      const response = await axios.get("/api/v1/Student/assignments", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student assignments failed');
    }
  },

  // Submit assignment
  submitAssignment: async (assignmentId: string, file: File, note?: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (note) {
        formData.append('note', note);
      }

      const response = await axios.post(`/api/v1/Student/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Submit assignment failed');
    }
  },

  // Get assignment submission
  getAssignmentSubmission: async (assignmentId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Student/assignments/${assignmentId}/submission`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get assignment submission failed');
    }
  },

  // Admin functions for managing students
  // Get all students (Admin only)
  getAllStudents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    academicYear?: string;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/students", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all students failed');
    }
  },

  // Get student by ID (Admin/Teacher)
  getStudentById: async (studentId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/students/${studentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student by id failed');
    }
  },

  // Create student (Admin only)
  createStudent: async (studentData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/students", studentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create student failed');
    }
  },

  // Update student (Admin only)
  updateStudent: async (studentId: string, studentData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Admin/students/${studentId}`, studentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student failed');
    }
  },

  // Delete student (Admin only)
  deleteStudent: async (studentId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/students/${studentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete student failed');
    }
  }
};
