import { studentService, StudentInfo, StudentGrade, StudentSchedule, StudentBHYT, StudentGraduation } from '../service/studentService';

export class StudentController {
  // Get student information
  static async getStudentInfo(): Promise<StudentInfo> {
    try {
      return await studentService.getStudentInfo();
    } catch (error: any) {
      console.error('Get student info controller error:', error);
      throw error;
    }
  }

  // Update student information
  static async updateStudentInfo(data: Partial<StudentInfo>): Promise<any> {
    try {
      return await studentService.updateStudentInfo(data);
    } catch (error: any) {
      console.error('Update student info controller error:', error);
      throw error;
    }
  }

  // Get student grades
  static async getStudentGrades(semester?: string, academicYear?: string): Promise<StudentGrade[]> {
    try {
      return await studentService.getStudentGrades(semester, academicYear);
    } catch (error: any) {
      console.error('Get student grades controller error:', error);
      throw error;
    }
  }

  // Get grade by course
  static async getGradeByCourse(courseId: string): Promise<StudentGrade> {
    try {
      return await studentService.getGradeByCourse(courseId);
    } catch (error: any) {
      console.error('Get grade by course controller error:', error);
      throw error;
    }
  }

  // Get student GPA
  static async getStudentGPA(semester?: string, academicYear?: string): Promise<any> {
    try {
      return await studentService.getStudentGPA(semester, academicYear);
    } catch (error: any) {
      console.error('Get student GPA controller error:', error);
      throw error;
    }
  }

  // Get student schedule
  static async getStudentSchedule(semester?: string, academicYear?: string): Promise<StudentSchedule[]> {
    try {
      return await studentService.getStudentSchedule(semester, academicYear);
    } catch (error: any) {
      console.error('Get student schedule controller error:', error);
      throw error;
    }
  }

  // Get registered courses
  static async getRegisteredCourses(semester?: string, academicYear?: string): Promise<any> {
    try {
      return await studentService.getRegisteredCourses(semester, academicYear);
    } catch (error: any) {
      console.error('Get registered courses controller error:', error);
      throw error;
    }
  }

  // Register for course
  static async registerForCourse(courseId: string): Promise<any> {
    try {
      return await studentService.registerForCourse(courseId);
    } catch (error: any) {
      console.error('Register for course controller error:', error);
      throw error;
    }
  }

  // Unregister from course
  static async unregisterFromCourse(courseId: string): Promise<any> {
    try {
      return await studentService.unregisterFromCourse(courseId);
    } catch (error: any) {
      console.error('Unregister from course controller error:', error);
      throw error;
    }
  }

  // Get available courses for registration
  static async getAvailableCourses(semester?: string, academicYear?: string): Promise<any> {
    try {
      return await studentService.getAvailableCourses(semester, academicYear);
    } catch (error: any) {
      console.error('Get available courses controller error:', error);
      throw error;
    }
  }

  // Get student attendance
  static async getStudentAttendance(courseId?: string, semester?: string, academicYear?: string): Promise<any> {
    try {
      return await studentService.getStudentAttendance(courseId, semester, academicYear);
    } catch (error: any) {
      console.error('Get student attendance controller error:', error);
      throw error;
    }
  }

  // Get student BHYT information
  static async getStudentBHYT(): Promise<StudentBHYT> {
    try {
      return await studentService.getStudentBHYT();
    } catch (error: any) {
      console.error('Get student BHYT controller error:', error);
      throw error;
    }
  }

  // Update student BHYT information
  static async updateStudentBHYT(data: Partial<StudentBHYT>): Promise<any> {
    try {
      return await studentService.updateStudentBHYT(data);
    } catch (error: any) {
      console.error('Update student BHYT controller error:', error);
      throw error;
    }
  }

  // Get student graduation information
  static async getStudentGraduation(): Promise<StudentGraduation> {
    try {
      return await studentService.getStudentGraduation();
    } catch (error: any) {
      console.error('Get student graduation controller error:', error);
      throw error;
    }
  }

  // Check graduation eligibility
  static async checkGraduationEligibility(): Promise<any> {
    try {
      return await studentService.checkGraduationEligibility();
    } catch (error: any) {
      console.error('Check graduation eligibility controller error:', error);
      throw error;
    }
  }

  // Apply for graduation
  static async applyForGraduation(): Promise<any> {
    try {
      return await studentService.applyForGraduation();
    } catch (error: any) {
      console.error('Apply for graduation controller error:', error);
      throw error;
    }
  }

  // Get student transcript
  static async getStudentTranscript(): Promise<any> {
    try {
      return await studentService.getStudentTranscript();
    } catch (error: any) {
      console.error('Get student transcript controller error:', error);
      throw error;
    }
  }

  // Download student transcript
  static async downloadStudentTranscript(): Promise<any> {
    try {
      return await studentService.downloadStudentTranscript();
    } catch (error: any) {
      console.error('Download student transcript controller error:', error);
      throw error;
    }
  }

  // Get student financial information
  static async getStudentFinancial(): Promise<any> {
    try {
      return await studentService.getStudentFinancial();
    } catch (error: any) {
      console.error('Get student financial controller error:', error);
      throw error;
    }
  }

  // Get tuition fees
  static async getTuitionFees(semester?: string, academicYear?: string): Promise<any> {
    try {
      return await studentService.getTuitionFees(semester, academicYear);
    } catch (error: any) {
      console.error('Get tuition fees controller error:', error);
      throw error;
    }
  }

  // Pay tuition fees
  static async payTuitionFees(paymentData: any): Promise<any> {
    try {
      return await studentService.payTuitionFees(paymentData);
    } catch (error: any) {
      console.error('Pay tuition fees controller error:', error);
      throw error;
    }
  }

  // Get payment history
  static async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      return await studentService.getPaymentHistory(params);
    } catch (error: any) {
      console.error('Get payment history controller error:', error);
      throw error;
    }
  }

  // Get student documents
  static async getStudentDocuments(): Promise<any> {
    try {
      return await studentService.getStudentDocuments();
    } catch (error: any) {
      console.error('Get student documents controller error:', error);
      throw error;
    }
  }

  // Upload student document
  static async uploadStudentDocument(file: File, documentType: string, description?: string): Promise<any> {
    try {
      return await studentService.uploadStudentDocument(file, documentType, description);
    } catch (error: any) {
      console.error('Upload student document controller error:', error);
      throw error;
    }
  }

  // Delete student document
  static async deleteStudentDocument(documentId: string): Promise<any> {
    try {
      return await studentService.deleteStudentDocument(documentId);
    } catch (error: any) {
      console.error('Delete student document controller error:', error);
      throw error;
    }
  }

  // Get student notifications
  static async getStudentNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<any> {
    try {
      return await studentService.getStudentNotifications(params);
    } catch (error: any) {
      console.error('Get student notifications controller error:', error);
      throw error;
    }
  }

  // Get course materials
  static async getCourseMaterials(courseId: string): Promise<any> {
    try {
      return await studentService.getCourseMaterials(courseId);
    } catch (error: any) {
      console.error('Get course materials controller error:', error);
      throw error;
    }
  }

  // Download course material
  static async downloadCourseMaterial(courseId: string, materialId: string): Promise<any> {
    try {
      return await studentService.downloadCourseMaterial(courseId, materialId);
    } catch (error: any) {
      console.error('Download course material controller error:', error);
      throw error;
    }
  }

  // Get student assignments
  static async getStudentAssignments(courseId?: string): Promise<any> {
    try {
      return await studentService.getStudentAssignments(courseId);
    } catch (error: any) {
      console.error('Get student assignments controller error:', error);
      throw error;
    }
  }

  // Submit assignment
  static async submitAssignment(assignmentId: string, file: File, note?: string): Promise<any> {
    try {
      return await studentService.submitAssignment(assignmentId, file, note);
    } catch (error: any) {
      console.error('Submit assignment controller error:', error);
      throw error;
    }
  }

  // Get assignment submission
  static async getAssignmentSubmission(assignmentId: string): Promise<any> {
    try {
      return await studentService.getAssignmentSubmission(assignmentId);
    } catch (error: any) {
      console.error('Get assignment submission controller error:', error);
      throw error;
    }
  }

  // Admin functions for managing students
  // Get all students (Admin only)
  static async getAllStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    academicYear?: string;
    status?: number;
  }): Promise<any> {
    try {
      return await studentService.getAllStudents(params);
    } catch (error: any) {
      console.error('Get all students controller error:', error);
      throw error;
    }
  }

  // Get student by ID (Admin/Teacher)
  static async getStudentById(studentId: string): Promise<any> {
    try {
      return await studentService.getStudentById(studentId);
    } catch (error: any) {
      console.error('Get student by id controller error:', error);
      throw error;
    }
  }

  // Create student (Admin only)
  static async createStudent(studentData: any): Promise<any> {
    try {
      return await studentService.createStudent(studentData);
    } catch (error: any) {
      console.error('Create student controller error:', error);
      throw error;
    }
  }

  // Update student (Admin only)
  static async updateStudent(studentId: string, studentData: any): Promise<any> {
    try {
      return await studentService.updateStudent(studentId, studentData);
    } catch (error: any) {
      console.error('Update student controller error:', error);
      throw error;
    }
  }

  // Delete student (Admin only)
  static async deleteStudent(studentId: string): Promise<any> {
    try {
      return await studentService.deleteStudent(studentId);
    } catch (error: any) {
      console.error('Delete student controller error:', error);
      throw error;
    }
  }
}