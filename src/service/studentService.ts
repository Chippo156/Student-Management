import axios from "../until/customize-axios";
import { message } from "antd";

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
    const response = await axios.get("/api/v1/Student/info");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin sinh viên thất bại");
      throw new Error(response.message || "Get student info failed");
    }
    return response.data;
  },

  // Update student information
  updateStudentInfo: async (data: Partial<StudentInfo>): Promise<any> => {
    const response = await axios.put("/api/v1/Student/info", data);
    if (!response.success) {
      message.error(response.message || "Cập nhật thông tin sinh viên thất bại");
      throw new Error(response.message || "Update student info failed");
    }
    return response.data;
  },

  // Get student grades
  getStudentGrades: async (semester?: string, academicYear?: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/grades", { params });
    if (!response.success) {
      message.error(response.message || "Lấy điểm thất bại");
      throw new Error(response.message || "Get student grades failed");
    }
    return response.data;
  },

  // Get student schedule
  getStudentSchedule: async (semester?: string, academicYear?: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/schedule", { params });
    if (!response.success) {
      message.error(response.message || "Lấy lịch học thất bại");
      throw new Error(response.message || "Get student schedule failed");
    }
    return response.data;
  },

  // Get student notes
  getStudentNotes: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/notes");
    if (!response.success) {
      message.error(response.message || "Lấy ghi chú thất bại");
      throw new Error(response.message || "Get student notes failed");
    }
    return response.data;
  },

  // Create student note
  createStudentNote: async (data: Omit<StudentNote, 'noteId' | 'createdDate'>): Promise<any> => {
    const response = await axios.post("/api/v1/Student/notes", data);
    if (!response.success) {
      message.error(response.message || "Thêm ghi chú thất bại");
      throw new Error(response.message || "Create student note failed");
    }
    return response.data;
  },

  // Update student note
  updateStudentNote: async (noteId: string, data: Partial<StudentNote>): Promise<any> => {
    const response = await axios.put(`/api/v1/Student/notes/${noteId}`, data);
    if (!response.success) {
      message.error(response.message || "Cập nhật ghi chú thất bại");
      throw new Error(response.message || "Update student note failed");
    }
    return response.data;
  },

  // Delete student note
  deleteStudentNote: async (noteId: string): Promise<any> => {
    const response = await axios.delete(`/api/v1/Student/notes/${noteId}`);
    if (!response.success) {
      message.error(response.message || "Xóa ghi chú thất bại");
      throw new Error(response.message || "Delete student note failed");
    }
    return response.data;
  },

  // Get BHYT information
  getBHYTInfo: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/bhyt");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin BHYT thất bại");
      throw new Error(response.message || "Get BHYT info failed");
    }
    return response.data;
  },

  // Update BHYT information
  updateBHYTInfo: async (data: Partial<BHYTInfo>): Promise<any> => {
    const response = await axios.put("/api/v1/Student/bhyt", data);
    if (!response.success) {
      message.error(response.message || "Cập nhật BHYT thất bại");
      throw new Error(response.message || "Update BHYT info failed");
    }
    return response.data;
  },

  // Get graduation information
  getGraduationInfo: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/graduation");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin tốt nghiệp thất bại");
      throw new Error(response.message || "Get graduation info failed");
    }
    return response.data;
  },

  // Get transcript
  getTranscript: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/transcript");
    if (!response.success) {
      message.error(response.message || "Lấy bảng điểm thất bại");
      throw new Error(response.message || "Get transcript failed");
    }
    return response.data;
  },

  // Register for courses
  registerCourses: async (courseIds: string[]): Promise<any> => {
    const response = await axios.post("/api/v1/Student/register-courses", { courseIds });
    if (!response.success) {
      message.error(response.message || "Đăng ký môn học thất bại");
      throw new Error(response.message || "Register courses failed");
    }
    return response.data;
  },

  // Drop courses
  dropCourses: async (courseIds: string[]): Promise<any> => {
    const response = await axios.post("/api/v1/Student/drop-courses", { courseIds });
    if (!response.success) {
      message.error(response.message || "Hủy môn học thất bại");
      throw new Error(response.message || "Drop courses failed");
    }
    return response.data;
  },

  // Get available courses for registration
  getAvailableCourses: async (semester: string, academicYear: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/available-courses", { params });
    if (!response.success) {
      message.error(response.message || "Lấy môn học có thể đăng ký thất bại");
      throw new Error(response.message || "Get available courses failed");
    }
    return response.data;
  },

  // Get registered courses
  getRegisteredCourses: async (semester?: string, academicYear?: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/registered-courses", { params });
    if (!response.success) {
      message.error(response.message || "Lấy môn học đã đăng ký thất bại");
      throw new Error(response.message || "Get registered courses failed");
    }
    return response.data;
  },

  // Get grade by course
  getGradeByCourse: async (courseId: string): Promise<any> => {
    const response = await axios.get(`/api/v1/Student/grades/${courseId}`);
    if (!response.success) {
      message.error(response.message || "Lấy điểm môn học thất bại");
      throw new Error(response.message || "Get grade by course failed");
    }
    return response.data;
  },

  // Get student GPA
  getStudentGPA: async (semester?: string, academicYear?: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/gpa", { params });
    if (!response.success) {
      message.error(response.message || "Lấy GPA thất bại");
      throw new Error(response.message || "Get student GPA failed");
    }
    return response.data;
  },

  // Register for course
  registerForCourse: async (courseId: string): Promise<any> => {
    const response = await axios.post(`/api/v1/Student/courses/${courseId}/register`);
    if (!response.success) {
      message.error(response.message || "Đăng ký môn học thất bại");
      throw new Error(response.message || "Register for course failed");
    }
    return response.data;
  },

  // Unregister from course
  unregisterFromCourse: async (courseId: string): Promise<any> => {
    const response = await axios.delete(`/api/v1/Student/courses/${courseId}/register`);
    if (!response.success) {
      message.error(response.message || "Hủy đăng ký môn học thất bại");
      throw new Error(response.message || "Unregister from course failed");
    }
    return response.data;
  },

  // Get available courses for registration
  getAvailableCoursesForRegistration: async (semester?: string, academicYear?: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/courses/available", { params });
    if (!response.success) {
      message.error(response.message || "Lấy môn học có thể đăng ký thất bại");
      throw new Error(response.message || "Get available courses failed");
    }
    return response.data;
  },

  // Get student attendance
  getStudentAttendance: async (courseId?: string, semester?: string, academicYear?: string): Promise<any> => {
    const params = { courseId, semester, academicYear };
    const response = await axios.get("/api/v1/Student/attendance", { params });
    if (!response.success) {
      message.error(response.message || "Lấy điểm danh thất bại");
      throw new Error(response.message || "Get student attendance failed");
    }
    return response.data;
  },

  // Get student BHYT information
  getStudentBHYT: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/bhyt");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin BHYT thất bại");
      throw new Error(response.message || "Get student BHYT failed");
    }
    return response.data;
  },

  // Update student BHYT information
  updateStudentBHYT: async (data: Partial<BHYTInfo>): Promise<any> => {
    const response = await axios.put("/api/v1/Student/bhyt", data);
    if (!response.success) {
      message.error(response.message || "Cập nhật BHYT thất bại");
      throw new Error(response.message || "Update student BHYT failed");
    }
    return response.data;
  },

  // Get student graduation information
  getStudentGraduation: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/graduation");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin tốt nghiệp thất bại");
      throw new Error(response.message || "Get student graduation failed");
    }
    return response.data;
  },

  // Check graduation eligibility
  checkGraduationEligibility: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/graduation/eligibility");
    if (!response.success) {
      message.error(response.message || "Kiểm tra điều kiện tốt nghiệp thất bại");
      throw new Error(response.message || "Check graduation eligibility failed");
    }
    return response.data;
  },

  // Apply for graduation
  applyForGraduation: async (): Promise<any> => {
    const response = await axios.post("/api/v1/Student/graduation/apply");
    if (!response.success) {
      message.error(response.message || "Nộp đơn tốt nghiệp thất bại");
      throw new Error(response.message || "Apply for graduation failed");
    }
    return response.data;
  },

  // Get student transcript
  getStudentTranscript: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/transcript");
    if (!response.success) {
      message.error(response.message || "Lấy bảng điểm thất bại");
      throw new Error(response.message || "Get student transcript failed");
    }
    return response.data;
  },

  // Download student transcript
  downloadStudentTranscript: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/transcript/download", {
      responseType: 'blob'
    });
    if (!response.success) {
      message.error(response.message || "Tải bảng điểm thất bại");
      throw new Error(response.message || "Download student transcript failed");
    }
    return response.data;
  },

  // Get student financial information
  getStudentFinancial: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/financial");
    if (!response.success) {
      message.error(response.message || "Lấy thông tin tài chính thất bại");
      throw new Error(response.message || "Get student financial failed");
    }
    return response.data;
  },

  // Get tuition fees
  getTuitionFees: async (semester?: string, academicYear?: string): Promise<any> => {
    const params = { semester, academicYear };
    const response = await axios.get("/api/v1/Student/tuition-fees", { params });
    if (!response.success) {
      message.error(response.message || "Lấy học phí thất bại");
      throw new Error(response.message || "Get tuition fees failed");
    }
    return response.data;
  },

  // Pay tuition fees
  payTuitionFees: async (paymentData: any): Promise<any> => {
    const response = await axios.post("/api/v1/Student/tuition-fees/pay", paymentData);
    if (!response.success) {
      message.error(response.message || "Thanh toán học phí thất bại");
      throw new Error(response.message || "Pay tuition fees failed");
    }
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const response = await axios.get("/api/v1/Student/payment-history", { params });
    if (!response.success) {
      message.error(response.message || "Lấy lịch sử thanh toán thất bại");
      throw new Error(response.message || "Get payment history failed");
    }
    return response.data;
  },

  // Get student documents
  getStudentDocuments: async (): Promise<any> => {
    const response = await axios.get("/api/v1/Student/documents");
    if (!response.success) {
      message.error(response.message || "Lấy tài liệu thất bại");
      throw new Error(response.message || "Get student documents failed");
    }
    return response.data;
  },

  // Upload student document
  uploadStudentDocument: async (file: File, documentType: string, description?: string): Promise<any> => {
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
    if (!response.success) {
      message.error(response.message || "Tải lên tài liệu thất bại");
      throw new Error(response.message || "Upload student document failed");
    }
    return response.data;
  },

  // Delete student document
  deleteStudentDocument: async (documentId: string): Promise<any> => {
    const response = await axios.delete(`/api/v1/Student/documents/${documentId}`);
    if (!response.success) {
      message.error(response.message || "Xóa tài liệu thất bại");
      throw new Error(response.message || "Delete student document failed");
    }
    return response.data;
  },

  // Get student notifications
  getStudentNotifications: async (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<any> => {
    const response = await axios.get("/api/v1/Student/notifications", { params });
    if (!response.success) {
      message.error(response.message || "Lấy thông báo thất bại");
      throw new Error(response.message || "Get student notifications failed");
    }
    return response.data;
  },

  // Get course materials
  getCourseMaterials: async (courseId: string): Promise<any> => {
    const response = await axios.get(`/api/v1/Student/courses/${courseId}/materials`);
    if (!response.success) {
      message.error(response.message || "Lấy tài liệu môn học thất bại");
      throw new Error(response.message || "Get course materials failed");
    }
    return response.data;
  },

  // Download course material
  downloadCourseMaterial: async (courseId: string, materialId: string): Promise<any> => {
    const response = await axios.get(`/api/v1/Student/courses/${courseId}/materials/${materialId}/download`, {
      responseType: 'blob'
    });
    if (!response.success) {
      message.error(response.message || "Tải tài liệu môn học thất bại");
      throw new Error(response.message || "Download course material failed");
    }
    return response.data;
  },

  // Get student assignments
  getStudentAssignments: async (courseId?: string): Promise<any> => {
    const params = courseId ? { courseId } : {};
    const response = await axios.get("/api/v1/Student/assignments", { params });
    if (!response.success) {
      message.error(response.message || "Lấy bài tập thất bại");
      throw new Error(response.message || "Get student assignments failed");
    }
    return response.data;
  },

  // Submit assignment
  submitAssignment: async (assignmentId: string, file: File, note?: string): Promise<any> => {
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
    if (!response.success) {
      message.error(response.message || "Nộp bài tập thất bại");
      throw new Error(response.message || "Submit assignment failed");
    }
    return response.data;
  },

  // Get assignment submission
  getAssignmentSubmission: async (assignmentId: string): Promise<any> => {
    const response = await axios.get(`/api/v1/Student/assignments/${assignmentId}/submission`);
    if (!response.success) {
      message.error(response.message || "Lấy bài nộp thất bại");
      throw new Error(response.message || "Get assignment submission failed");
    }
    return response.data;
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
    const response = await axios.get("/api/v1/Admin/students", { params });
    if (!response.success) {
      message.error(response.message || "Lấy danh sách sinh viên thất bại");
      throw new Error(response.message || "Get all students failed");
    }
    return response.data;
  },

  // Get student by ID (Admin/Teacher)
  getStudentById: async (studentId: string): Promise<any> => {
    const response = await axios.get(`/api/v1/Admin/students/${studentId}`);
    if (!response.success) {
      message.error(response.message || "Lấy thông tin sinh viên thất bại");
      throw new Error(response.message || "Get student by id failed");
    }
    return response.data;
  },

  // Create student (Admin only)
  createStudent: async (studentData: any): Promise<any> => {
    const response = await axios.post("/api/v1/Admin/students", studentData);
    if (!response.success) {
      message.error(response.message || "Thêm sinh viên thất bại");
      throw new Error(response.message || "Create student failed");
    }
    return response.data;
  },

  // Update student (Admin only)
  updateStudent: async (studentId: string, studentData: any): Promise<any> => {
    const response = await axios.put(`/api/v1/Admin/students/${studentId}`, studentData);
    if (!response.success) {
      message.error(response.message || "Cập nhật sinh viên thất bại");
      throw new Error(response.message || "Update student failed");
    }
    return response.data;
  },

  // Delete student (Admin only)
  deleteStudent: async (studentId: string): Promise<any> => {
    const response = await axios.delete(`/api/v1/Admin/students/${studentId}`);
    if (!response.success) {
      message.error(response.message || "Xóa sinh viên thất bại");
      throw new Error(response.message || "Delete student failed");
    }
    return response.data;
  }
};
